import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { RsvpInput } from "./rsvp-schema";

const ENV = {
  AIRTABLE_PAT: "pat_test",
  AIRTABLE_BASE_ID: "app_test",
  AIRTABLE_INVITEES_TABLE: "Invitees",
  AIRTABLE_RSVPS_TABLE: "RSVPs",
};

beforeEach(() => {
  for (const [k, v] of Object.entries(ENV)) {
    process.env[k] = v;
  }
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.resetModules();
});

function mockFetchSequence(responses: Array<{ status?: number; body: unknown }>) {
  const fetchMock = vi.fn();
  for (const r of responses) {
    const status = r.status ?? 200;
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify(r.body), {
        status,
        headers: { "content-type": "application/json" },
      })
    );
  }
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

const validPayload: RsvpInput = {
  code: "AB12CD",
  attending: "yes",
  attendees: ["Jane Smith", "John Smith"],
  dietaries: ["vegetarian", ""],
  songRequests: "",
  website: "",
};

describe("getInviteeByCode", () => {
  it("returns the invitee when the code matches", async () => {
    const fetchMock = mockFetchSequence([
      {
        body: {
          records: [
            {
              id: "rec_invitee_1",
              fields: { Code: "AB12CD", Household: "The Smiths", "Max party size": 2 },
            },
          ],
        },
      },
    ]);

    const { getInviteeByCode } = await import("./airtable");
    const result = await getInviteeByCode("AB12CD");

    expect(result).toEqual({
      id: "rec_invitee_1",
      code: "AB12CD",
      household: "The Smiths",
      maxPartySize: 2,
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain("Invitees");
    expect(url).toContain("filterByFormula");
  });

  it("returns null when no record matches", async () => {
    mockFetchSequence([{ body: { records: [] } }]);
    const { getInviteeByCode } = await import("./airtable");
    expect(await getInviteeByCode("ZZ99ZZ")).toBeNull();
  });

  it("throws when Airtable returns a non-2xx", async () => {
    mockFetchSequence([{ status: 500, body: { error: "boom" } }]);
    const { getInviteeByCode } = await import("./airtable");
    await expect(getInviteeByCode("AB12CD")).rejects.toThrow(/Airtable 500/);
  });
});

describe("upsertRsvpForInvitee", () => {
  it("creates a new RSVP when none exists for the invitee", async () => {
    const fetchMock = mockFetchSequence([
      { body: { records: [] } }, // findRsvpByInviteeId
      { body: { id: "rec_rsvp_new", fields: {} } }, // POST
    ]);

    const { upsertRsvpForInvitee } = await import("./airtable");
    const result = await upsertRsvpForInvitee("rec_invitee_1", validPayload);

    expect(result).toEqual({ recordId: "rec_rsvp_new", mode: "created" });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const postInit = fetchMock.mock.calls[1][1] as RequestInit;
    expect(postInit.method).toBe("POST");
    const sentBody = JSON.parse(postInit.body as string);
    const sentFields = sentBody.fields;
    expect(sentFields["Attendee names"]).toBe("Jane Smith\nJohn Smith");
    expect(sentFields["Party size"]).toBe(2);
    // Dietary becomes a per-attendee block, only listing those with requirements.
    expect(sentFields["Dietary"]).toBe("Jane Smith: vegetarian");
    expect(sentFields).not.toHaveProperty("Additional guests");
    // typecast lets Airtable auto-create the Song requests column on first write.
    expect(sentBody.typecast).toBe(true);
  });

  it("writes Party size 0 when declining", async () => {
    const fetchMock = mockFetchSequence([
      { body: { records: [] } },
      { body: { id: "rec_rsvp_new", fields: {} } },
    ]);

    const { upsertRsvpForInvitee } = await import("./airtable");
    await upsertRsvpForInvitee("rec_invitee_1", {
      ...validPayload,
      attending: "no",
      attendees: [],
      dietaries: [],
    });

    const sentFields = JSON.parse(
      (fetchMock.mock.calls[1][1] as RequestInit).body as string
    ).fields;
    expect(sentFields["Attending"]).toBe(false);
    expect(sentFields["Party size"]).toBe(0);
    expect(sentFields["Attendee names"]).toBe("");
  });

  it("updates the existing RSVP when one is linked to the invitee", async () => {
    const fetchMock = mockFetchSequence([
      { body: { records: [{ id: "rec_rsvp_existing", fields: {} }] } },
      { body: { id: "rec_rsvp_existing", fields: {} } },
    ]);

    const { upsertRsvpForInvitee } = await import("./airtable");
    const result = await upsertRsvpForInvitee("rec_invitee_1", validPayload);

    expect(result).toEqual({ recordId: "rec_rsvp_existing", mode: "updated" });
    const patchCall = fetchMock.mock.calls[1];
    expect((patchCall[1] as RequestInit).method).toBe("PATCH");
    expect(patchCall[0]).toContain("/rec_rsvp_existing");
  });

  it("throws when the write fails", async () => {
    mockFetchSequence([
      { body: { records: [] } },
      { status: 502, body: { error: "down" } },
    ]);

    const { upsertRsvpForInvitee } = await import("./airtable");
    await expect(upsertRsvpForInvitee("rec_invitee_1", validPayload)).rejects.toThrow(
      /Airtable 502/
    );
  });
});

describe("getExistingRsvpByCode", () => {
  it("returns the parsed RSVP when one exists for the code", async () => {
    const fetchMock = mockFetchSequence([
      {
        body: {
          records: [
            {
              id: "rec_rsvp_1",
              fields: {
                Attending: true,
                "Attendee names": "Jane Smith\nJohn Smith",
                Dietary: "Jane Smith: vegetarian",
                "Song requests": "Dancing Queen",
              },
            },
          ],
        },
      },
    ]);

    const { getExistingRsvpByCode } = await import("./airtable");
    const result = await getExistingRsvpByCode("AB12CD");

    expect(result).toEqual({
      recordId: "rec_rsvp_1",
      attending: true,
      attendees: ["Jane Smith", "John Smith"],
      dietaries: ["vegetarian", ""],
      dietary: "Jane Smith: vegetarian",
      songRequests: "Dancing Queen",
    });
    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain("RSVPs");
    // The fix: lookup is by Code (in ARRAYJOIN({Invitee})), not by record id.
    expect(decodeURIComponent(url)).toContain('FIND("AB12CD"');
  });

  it("returns null when there is no existing RSVP for that code", async () => {
    mockFetchSequence([{ body: { records: [] } }]);
    const { getExistingRsvpByCode } = await import("./airtable");
    expect(await getExistingRsvpByCode("AB12CD")).toBeNull();
  });
});

describe("Notes", () => {
  beforeEach(() => {
    process.env.AIRTABLE_NOTES_TABLE = "Notes";
  });

  it("creates a note linked to the invitee", async () => {
    const fetchMock = mockFetchSequence([
      {
        body: {
          id: "rec_note_1",
          fields: {
            "Author name": "Aunt Sue",
            Message: "wishing you the best",
            Color: "Pink",
            Invitee: ["rec_invitee_1"],
          },
        },
      },
    ]);
    const { createNote } = await import("./airtable");
    const note = await createNote("rec_invitee_1", {
      authorName: "Aunt Sue",
      message: "wishing you the best",
      color: "Pink",
    });
    expect(note.authorName).toBe("Aunt Sue");
    expect(note.color).toBe("Pink");
    expect(note.mine).toBe(true);
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string).fields).toEqual({
      "Author name": "Aunt Sue",
      Message: "wishing you the best",
      Color: "Pink",
      Invitee: ["rec_invitee_1"],
    });
  });

  it("counts non-hidden notes for an invitee", async () => {
    mockFetchSequence([
      {
        body: {
          records: [
            { id: "rec_note_1", fields: { Invitee: ["rec_invitee_1"] } },
            { id: "rec_note_2", fields: { Invitee: ["rec_invitee_1"] } },
          ],
        },
      },
    ]);
    const { getNoteCountForInvitee } = await import("./airtable");
    expect(await getNoteCountForInvitee("rec_invitee_1")).toBe(2);
  });

  it("tags notes as 'mine' when linked to the viewer", async () => {
    mockFetchSequence([
      {
        body: {
          records: [
            {
              id: "rec_note_1",
              fields: {
                "Author name": "A",
                Message: "m",
                Color: "Sky",
                Invitee: ["rec_invitee_1"],
                "Heart count": 2,
              },
            },
            {
              id: "rec_note_2",
              fields: {
                "Author name": "B",
                Message: "m",
                Color: "Pink",
                Invitee: ["rec_invitee_other"],
              },
            },
          ],
        },
      },
    ]);
    const { getNotes } = await import("./airtable");
    const notes = await getNotes("rec_invitee_1");
    expect(notes[0].mine).toBe(true);
    expect(notes[0].hearts).toBe(2);
    expect(notes[1].mine).toBe(false);
  });

  it("increments a reaction counter, never going below zero", async () => {
    const fetchMock = mockFetchSequence([
      { body: { id: "rec_note_1", fields: { "Heart count": 0 } } },
      { body: { id: "rec_note_1", fields: {} } },
    ]);
    const { adjustNoteReaction } = await import("./airtable");
    await adjustNoteReaction("rec_note_1", "heart", -1);
    const patchInit = fetchMock.mock.calls[1][1] as RequestInit;
    expect(JSON.parse(patchInit.body as string)).toEqual({
      fields: { "Heart count": 0 },
    });
  });
});

describe("incrementInviteeSardineClicks", () => {
  it("reads the current counter and PATCHes the new total", async () => {
    const fetchMock = mockFetchSequence([
      { body: { id: "rec_invitee_1", fields: { "Sardine clicks": 7 } } },
      { body: { id: "rec_invitee_1", fields: {} } },
    ]);

    const { incrementInviteeSardineClicks } = await import("./airtable");
    await incrementInviteeSardineClicks("rec_invitee_1", 3);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    const patchInit = fetchMock.mock.calls[1][1] as RequestInit;
    expect(patchInit.method).toBe("PATCH");
    expect(JSON.parse(patchInit.body as string)).toEqual({
      fields: { "Sardine clicks": 10 },
    });
  });

  it("treats a missing field as zero", async () => {
    const fetchMock = mockFetchSequence([
      { body: { id: "rec_invitee_1", fields: {} } },
      { body: { id: "rec_invitee_1", fields: {} } },
    ]);

    const { incrementInviteeSardineClicks } = await import("./airtable");
    await incrementInviteeSardineClicks("rec_invitee_1", 5);

    const patchInit = fetchMock.mock.calls[1][1] as RequestInit;
    expect(JSON.parse(patchInit.body as string)).toEqual({
      fields: { "Sardine clicks": 5 },
    });
  });

  it("does nothing when delta is zero or negative", async () => {
    const fetchMock = mockFetchSequence([]);
    const { incrementInviteeSardineClicks } = await import("./airtable");
    await incrementInviteeSardineClicks("rec_invitee_1", 0);
    await incrementInviteeSardineClicks("rec_invitee_1", -1);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("endOfWeddingDay", () => {
  it("returns end-of-day Melbourne time during AEST (May, +10)", async () => {
    const { endOfWeddingDay } = await import("./airtable");
    // 23:59:59.999 on 2026-05-01 in Melbourne (+10) = 13:59:59.999Z UTC same day
    expect(endOfWeddingDay("2026-05-01").toISOString()).toBe("2026-05-01T13:59:59.999Z");
  });

  it("returns end-of-day Melbourne time during AEDT (December, +11)", async () => {
    const { endOfWeddingDay } = await import("./airtable");
    // 23:59:59.999 on 2026-12-01 in Melbourne (+11) = 12:59:59.999Z UTC same day
    expect(endOfWeddingDay("2026-12-01").toISOString()).toBe("2026-12-01T12:59:59.999Z");
  });

  it("ignores any time component in the input", async () => {
    const { endOfWeddingDay } = await import("./airtable");
    expect(endOfWeddingDay("2026-05-01T08:30:00.000Z").toISOString()).toBe(
      "2026-05-01T13:59:59.999Z"
    );
  });
});
