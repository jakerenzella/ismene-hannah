"use server";

import { updateTag } from "next/cache";
import {
  getExistingRsvpByCode,
  getInviteeByCode,
  getSettings,
  isPastDeadline,
  upsertRsvpForInvitee,
  type ExistingRsvp,
} from "@/lib/airtable";
import { parseFormData, RsvpInputSchema, type RsvpInput } from "@/lib/rsvp-schema";
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

  // No-op short-circuit: if the new payload exactly matches the stored RSVP,
  // skip the upsert entirely. This is a cache hit (the homepage just fetched
  // it), so no extra Airtable cost — and it saves the write on accidental
  // re-submits or "Update RSVP" presses with no edits.
  //
  // We also pass the result through to upsertRsvpForInvitee so it doesn't
  // re-fetch — that's what keeps the submit flow at 1 write per call.
  let existing: ExistingRsvp | null = null;
  let lookupOk = false;
  try {
    existing = await getExistingRsvpByCode(payload.code);
    lookupOk = true;
  } catch (error) {
    console.error("[rsvp] existing-rsvp lookup failed", { error, code: payload.code });
  }
  if (existing && rsvpUnchanged(existing, payload)) {
    return { status: "ok", mode: "updated" };
  }

  let mode: "created" | "updated";
  try {
    const result = await upsertRsvpForInvitee(
      invitee.id,
      payload,
      lookupOk ? existing : undefined
    );
    mode = result.mode;
  } catch (error) {
    console.error("[rsvp] airtable write failed", { error, payload });
    return {
      status: "error",
      code: "STORAGE_FAILED",
      message: "Something went wrong on our end. Please try again, or email us.",
    };
  }

  // Refresh the cached existing-RSVP entry so subsequent page loads see the
  // new state without burning calls until next user-driven invalidation.
  updateTag(`rsvp:${payload.code}`);

  return { status: "ok", mode };
}

function rsvpUnchanged(existing: ExistingRsvp, payload: RsvpInput): boolean {
  if (existing.attending !== (payload.attending === "yes")) return false;
  if ((existing.songRequests ?? "").trim() !== (payload.songRequests ?? "").trim()) return false;
  // For "no" responses, the attendee/dietary arrays don't matter — Airtable
  // stores empty strings either way.
  if (payload.attending === "no") return true;
  if (existing.attendees.length !== payload.attendees.length) return false;
  for (let i = 0; i < payload.attendees.length; i++) {
    if (existing.attendees[i] !== payload.attendees[i]) return false;
    if ((existing.dietaries[i] ?? "").trim() !== (payload.dietaries[i] ?? "").trim()) return false;
  }
  return true;
}

async function safeGetInvitee(code: string) {
  try {
    return await getInviteeByCode(code);
  } catch (error) {
    console.error("[rsvp] invitee lookup error", { error, code });
    return "lookup_failed" as const;
  }
}
