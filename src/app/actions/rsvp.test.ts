import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/airtable", async () => {
  const actual = await vi.importActual<typeof import("@/lib/airtable")>("@/lib/airtable");
  return {
    ...actual,
    getInviteeByCode: vi.fn(),
    upsertRsvpForInvitee: vi.fn(),
    getSettings: vi.fn(),
  };
});

import {
  getInviteeByCode,
  getSettings,
  upsertRsvpForInvitee,
} from "@/lib/airtable";
import { submitRsvp } from "./rsvp";
import { initialRsvpState } from "./rsvp-state";

const VALID_INVITEE = {
  id: "rec_invitee_1",
  code: "AB12CD",
  household: "The Smiths",
  maxPartySize: 2,
};

type FormOverrides = {
  code?: string;
  attending?: string;
  attendees?: string[];
  website?: string;
};

function makeFormData(overrides: FormOverrides = {}) {
  const data = {
    code: "AB12CD",
    attending: "yes",
    attendees: ["Jane Smith"],
    website: "",
    ...overrides,
  };
  const fd = new FormData();
  fd.set("code", data.code);
  fd.set("attending", data.attending);
  fd.set("website", data.website);
  for (const name of data.attendees) fd.append("attendees", name);
  return fd;
}

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  // Default: no deadline (open). Tests that need a closed deadline override this.
  vi.mocked(getSettings).mockResolvedValue({ rsvpDeadline: null });
});

afterEach(() => {
  vi.resetAllMocks();
});

describe("submitRsvp", () => {
  it("returns ok when storage succeeds (created)", async () => {
    vi.mocked(getInviteeByCode).mockResolvedValue(VALID_INVITEE);
    vi.mocked(upsertRsvpForInvitee).mockResolvedValue({
      recordId: "rec_rsvp_1",
      mode: "created",
    });

    const result = await submitRsvp(initialRsvpState, makeFormData());
    expect(result).toEqual({ status: "ok", mode: "created" });
  });

  it("returns ok with updated mode for amendments", async () => {
    vi.mocked(getInviteeByCode).mockResolvedValue(VALID_INVITEE);
    vi.mocked(upsertRsvpForInvitee).mockResolvedValue({
      recordId: "rec_rsvp_1",
      mode: "updated",
    });

    const result = await submitRsvp(initialRsvpState, makeFormData());
    expect(result).toEqual({ status: "ok", mode: "updated" });
  });

  it("rejects an unknown invite code", async () => {
    vi.mocked(getInviteeByCode).mockResolvedValue(null);

    const result = await submitRsvp(initialRsvpState, makeFormData());
    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.code).toBe("INVALID_CODE");
    }
    expect(upsertRsvpForInvitee).not.toHaveBeenCalled();
  });

  it("returns VALIDATION error when required fields are missing", async () => {
    const result = await submitRsvp(initialRsvpState, makeFormData({ attendees: [] }));
    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.code).toBe("VALIDATION");
      expect(result.fieldErrors?.attendees).toBeTruthy();
    }
    expect(getInviteeByCode).not.toHaveBeenCalled();
  });

  it("accepts a decline submission with no attendees", async () => {
    vi.mocked(getInviteeByCode).mockResolvedValue(VALID_INVITEE);
    vi.mocked(upsertRsvpForInvitee).mockResolvedValue({
      recordId: "rec_rsvp_1",
      mode: "created",
    });

    const result = await submitRsvp(
      initialRsvpState,
      makeFormData({ attending: "no", attendees: [] })
    );
    expect(result.status).toBe("ok");
  });

  it("returns STORAGE_FAILED when the Airtable write fails", async () => {
    vi.mocked(getInviteeByCode).mockResolvedValue(VALID_INVITEE);
    vi.mocked(upsertRsvpForInvitee).mockRejectedValue(new Error("airtable down"));

    const result = await submitRsvp(initialRsvpState, makeFormData());
    expect(result.status).toBe("error");
    if (result.status === "error") expect(result.code).toBe("STORAGE_FAILED");
  });

  it("returns STORAGE_FAILED when invitee lookup throws", async () => {
    vi.mocked(getInviteeByCode).mockRejectedValue(new Error("airtable timeout"));

    const result = await submitRsvp(initialRsvpState, makeFormData());
    expect(result.status).toBe("error");
    if (result.status === "error") expect(result.code).toBe("STORAGE_FAILED");
    expect(upsertRsvpForInvitee).not.toHaveBeenCalled();
  });

  it("rejects honeypot submissions silently", async () => {
    const result = await submitRsvp(
      initialRsvpState,
      makeFormData({ website: "http://spam.example" })
    );
    expect(result.status).toBe("error");
    if (result.status === "error") expect(result.code).toBe("HONEYPOT");
    expect(getInviteeByCode).not.toHaveBeenCalled();
  });

  it("rejects malformed codes via validation", async () => {
    const result = await submitRsvp(initialRsvpState, makeFormData({ code: "lower" }));
    expect(result.status).toBe("error");
    if (result.status === "error") expect(result.code).toBe("VALIDATION");
  });

  it("rejects submissions after the RSVP deadline", async () => {
    vi.mocked(getSettings).mockResolvedValue({
      rsvpDeadline: new Date("2020-01-01T23:59:59Z"),
    });

    const result = await submitRsvp(initialRsvpState, makeFormData());

    expect(result.status).toBe("error");
    if (result.status === "error") expect(result.code).toBe("DEADLINE_PASSED");
    expect(getInviteeByCode).not.toHaveBeenCalled();
    expect(upsertRsvpForInvitee).not.toHaveBeenCalled();
  });

  it("rejects more attendees than the invitee's max party size", async () => {
    vi.mocked(getInviteeByCode).mockResolvedValue(VALID_INVITEE);

    const result = await submitRsvp(
      initialRsvpState,
      makeFormData({ attendees: ["A", "B", "C"] })
    );

    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.code).toBe("VALIDATION");
      expect(result.fieldErrors?.attendees).toBeTruthy();
    }
    expect(upsertRsvpForInvitee).not.toHaveBeenCalled();
  });
});
