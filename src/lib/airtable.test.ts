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
  email: "jane@example.com",
  dietary: "",
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
    const sentFields = JSON.parse(postInit.body as string).fields;
    expect(sentFields["Attendee names"]).toBe("Jane Smith\nJohn Smith");
    expect(sentFields["Party size"]).toBe(2);
    expect(sentFields).not.toHaveProperty("Additional guests");
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
      email: "",
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
                Email: "jane@example.com",
                Dietary: "vegetarian",
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
      email: "jane@example.com",
      dietary: "vegetarian",
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

describe("updateInviteeEmail", () => {
  it("PATCHes the Invitees record with the new Email", async () => {
    const fetchMock = mockFetchSequence([{ body: { id: "rec_invitee_1", fields: {} } }]);

    const { updateInviteeEmail } = await import("./airtable");
    await updateInviteeEmail("rec_invitee_1", "guest@example.com");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/Invitees/rec_invitee_1");
    expect(init.method).toBe("PATCH");
    expect(JSON.parse(init.body as string)).toEqual({
      fields: { Email: "guest@example.com" },
    });
  });

  it("throws on a non-2xx response", async () => {
    mockFetchSequence([{ status: 500, body: { error: "boom" } }]);
    const { updateInviteeEmail } = await import("./airtable");
    await expect(updateInviteeEmail("rec_invitee_1", "g@example.com")).rejects.toThrow(
      /Airtable 500/
    );
  });
});
