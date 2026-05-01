import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/airtable", async () => {
  const actual = await vi.importActual<typeof import("@/lib/airtable")>("@/lib/airtable");
  return {
    ...actual,
    getInviteeByCode: vi.fn(),
    upsertRsvpForInvitee: vi.fn(),
    updateInviteeEmail: vi.fn(),
    getSettings: vi.fn(),
  };
});

vi.mock("@/lib/email", () => ({
  sendRsvpNotification: vi.fn(),
}));

import {
  getInviteeByCode,
  getSettings,
  updateInviteeEmail,
  upsertRsvpForInvitee,
} from "@/lib/airtable";
import { sendRsvpNotification } from "@/lib/email";
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
  email?: string;
  dietary?: string;
  website?: string;
};

function makeFormData(overrides: FormOverrides = {}) {
  const data = {
    code: "AB12CD",
    attending: "yes",
    attendees: ["Jane Smith"],
    email: "jane@example.com",
    dietary: "",
    website: "",
    ...overrides,
  };
  const fd = new FormData();
  fd.set("code", data.code);
  fd.set("attending", data.attending);
  fd.set("email", data.email);
  fd.set("dietary", data.dietary);
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
  it("returns ok when storage and email succeed (created)", async () => {
    vi.mocked(getInviteeByCode).mockResolvedValue(VALID_INVITEE);
    vi.mocked(upsertRsvpForInvitee).mockResolvedValue({
      recordId: "rec_rsvp_1",
      mode: "created",
    });
    vi.mocked(sendRsvpNotification).mockResolvedValue(undefined);

    const result = await submitRsvp(initialRsvpState, makeFormData());
    expect(result).toEqual({ status: "ok", mode: "created" });
  });

  it("returns ok with updated mode for amendments", async () => {
    vi.mocked(getInviteeByCode).mockResolvedValue(VALID_INVITEE);
    vi.mocked(upsertRsvpForInvitee).mockResolvedValue({
      recordId: "rec_rsvp_1",
      mode: "updated",
    });
    vi.mocked(sendRsvpNotification).mockResolvedValue(undefined);

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
    expect(sendRsvpNotification).not.toHaveBeenCalled();
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

  it("requires email when attending", async () => {
    const result = await submitRsvp(initialRsvpState, makeFormData({ email: "" }));
    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.code).toBe("VALIDATION");
      expect(result.fieldErrors?.email).toBeTruthy();
    }
  });

  it("does not require email when declining", async () => {
    vi.mocked(getInviteeByCode).mockResolvedValue(VALID_INVITEE);
    vi.mocked(upsertRsvpForInvitee).mockResolvedValue({
      recordId: "rec_rsvp_1",
      mode: "created",
    });
    vi.mocked(sendRsvpNotification).mockResolvedValue(undefined);

    const result = await submitRsvp(
      initialRsvpState,
      makeFormData({ attending: "no", email: "", attendees: [] })
    );
    expect(result.status).toBe("ok");
  });

  it("returns PARTIAL_FAILURE when Airtable fails but email succeeds", async () => {
    vi.mocked(getInviteeByCode).mockResolvedValue(VALID_INVITEE);
    vi.mocked(upsertRsvpForInvitee).mockRejectedValue(new Error("airtable down"));
    vi.mocked(sendRsvpNotification).mockResolvedValue(undefined);

    const result = await submitRsvp(initialRsvpState, makeFormData());
    expect(result.status).toBe("error");
    if (result.status === "error") expect(result.code).toBe("PARTIAL_FAILURE");
  });

  it("returns ok when Airtable succeeds even if email fails", async () => {
    vi.mocked(getInviteeByCode).mockResolvedValue(VALID_INVITEE);
    vi.mocked(upsertRsvpForInvitee).mockResolvedValue({
      recordId: "rec_rsvp_1",
      mode: "created",
    });
    vi.mocked(sendRsvpNotification).mockRejectedValue(new Error("resend down"));

    const result = await submitRsvp(initialRsvpState, makeFormData());
    expect(result.status).toBe("ok");
  });

  it("returns STORAGE_FAILED when both Airtable and email fail", async () => {
    vi.mocked(getInviteeByCode).mockResolvedValue(VALID_INVITEE);
    vi.mocked(upsertRsvpForInvitee).mockRejectedValue(new Error("airtable down"));
    vi.mocked(sendRsvpNotification).mockRejectedValue(new Error("resend down"));

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

  it("writes the email back to the invitee record on a successful RSVP", async () => {
    vi.mocked(getInviteeByCode).mockResolvedValue(VALID_INVITEE);
    vi.mocked(upsertRsvpForInvitee).mockResolvedValue({
      recordId: "rec_rsvp_1",
      mode: "created",
    });
    vi.mocked(sendRsvpNotification).mockResolvedValue(undefined);
    vi.mocked(updateInviteeEmail).mockResolvedValue(undefined);

    const result = await submitRsvp(initialRsvpState, makeFormData());

    expect(result.status).toBe("ok");
    expect(updateInviteeEmail).toHaveBeenCalledWith(VALID_INVITEE.id, "jane@example.com");
  });

  it("does not call write-back when no email was provided", async () => {
    vi.mocked(getInviteeByCode).mockResolvedValue(VALID_INVITEE);
    vi.mocked(upsertRsvpForInvitee).mockResolvedValue({
      recordId: "rec_rsvp_1",
      mode: "created",
    });
    vi.mocked(sendRsvpNotification).mockResolvedValue(undefined);

    await submitRsvp(
      initialRsvpState,
      makeFormData({ attending: "no", email: "", attendees: [] })
    );

    expect(updateInviteeEmail).not.toHaveBeenCalled();
  });

  it("treats write-back failure as non-fatal", async () => {
    vi.mocked(getInviteeByCode).mockResolvedValue(VALID_INVITEE);
    vi.mocked(upsertRsvpForInvitee).mockResolvedValue({
      recordId: "rec_rsvp_1",
      mode: "created",
    });
    vi.mocked(sendRsvpNotification).mockResolvedValue(undefined);
    vi.mocked(updateInviteeEmail).mockRejectedValue(new Error("airtable patch failed"));

    const result = await submitRsvp(initialRsvpState, makeFormData());

    expect(result.status).toBe("ok");
  });

  it("does not attempt write-back when the RSVP write itself failed", async () => {
    vi.mocked(getInviteeByCode).mockResolvedValue(VALID_INVITEE);
    vi.mocked(upsertRsvpForInvitee).mockRejectedValue(new Error("airtable down"));
    vi.mocked(sendRsvpNotification).mockResolvedValue(undefined);

    await submitRsvp(initialRsvpState, makeFormData());

    expect(updateInviteeEmail).not.toHaveBeenCalled();
  });
});
