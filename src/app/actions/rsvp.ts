"use server";

import {
  getInviteeByCode,
  getSettings,
  isPastDeadline,
  upsertRsvpForInvitee,
} from "@/lib/airtable";
import { parseFormData, RsvpInputSchema } from "@/lib/rsvp-schema";
import type { RsvpState } from "./rsvp-state";

export async function submitRsvp(_prev: RsvpState, formData: FormData): Promise<RsvpState> {
  const raw = parseFormData(formData);
  const parsed = RsvpInputSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      status: "error",
      code: "VALIDATION",
      message: "Please check the form fields.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }
  const payload = parsed.data;

  if (payload.website) {
    return { status: "error", code: "HONEYPOT", message: "Submission blocked." };
  }

  // Deadline check before any Airtable writes. Fail-open: if settings can't be
  // fetched, getSettings logs and returns no deadline → submissions still go through.
  const settings = await getSettings();
  if (isPastDeadline(settings.rsvpDeadline)) {
    return {
      status: "error",
      code: "DEADLINE_PASSED",
      message:
        "RSVPs have closed. Please get in touch with Ismene & Hannah directly to update your response.",
    };
  }

  const invitee = await safeGetInvitee(payload.code);
  if (invitee === "lookup_failed") {
    console.error("[rsvp] invitee lookup failed", { code: payload.code, payload });
    return {
      status: "error",
      code: "STORAGE_FAILED",
      message: "We couldn't reach our system. Please try again, or email us.",
    };
  }
  if (!invitee) {
    return {
      status: "error",
      code: "INVALID_CODE",
      message: "We couldn't find that invite code. Please use the link we sent you.",
    };
  }

  if (payload.attending === "yes" && payload.attendees.length > invitee.maxPartySize) {
    return {
      status: "error",
      code: "VALIDATION",
      message: `Your invite covers up to ${invitee.maxPartySize} ${invitee.maxPartySize === 1 ? "person" : "people"}.`,
      fieldErrors: {
        attendees: [`Maximum ${invitee.maxPartySize} attending`],
      },
    };
  }

  let mode: "created" | "updated";
  try {
    const result = await upsertRsvpForInvitee(invitee.id, payload);
    mode = result.mode;
  } catch (error) {
    console.error("[rsvp] airtable write failed", { error, payload });
    return {
      status: "error",
      code: "STORAGE_FAILED",
      message: "Something went wrong on our end. Please try again, or email us.",
    };
  }

  return { status: "ok", mode };
}

async function safeGetInvitee(code: string) {
  try {
    return await getInviteeByCode(code);
  } catch (error) {
    console.error("[rsvp] invitee lookup error", { error, code });
    return "lookup_failed" as const;
  }
}
