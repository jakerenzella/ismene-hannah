import { Resend } from "resend";
import type { Invitee, RsvpInput } from "./rsvp-schema";

function env(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export type RsvpNotification = {
  invitee: Invitee;
  payload: RsvpInput;
  mode: "created" | "updated";
};

export async function sendRsvpNotification(input: RsvpNotification): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey === "re_xxx") {
    console.warn("[email] RESEND_API_KEY not configured; skipping notification");
    return;
  }
  const resend = new Resend(apiKey);
  const { invitee, payload, mode } = input;
  const attending = payload.attending === "yes";
  const partySize = attending ? payload.attendees.length : 0;
  const guestWord = partySize === 1 ? "1 guest" : `${partySize} guests`;
  const subject = attending
    ? `✓ RSVP ${mode}: ${invitee.household} (${guestWord})`
    : `✗ RSVP ${mode}: ${invitee.household} (declined)`;

  const lines = [
    `Household: ${invitee.household}`,
    `Code: ${invitee.code}`,
    `Status: ${attending ? "Attending" : "Declined"} (${mode})`,
    attending ? `Party size: ${partySize} of ${invitee.maxPartySize}` : null,
    attending && payload.attendees.length > 0
      ? `Attendees:\n${payload.attendees.map((n) => `  • ${n}`).join("\n")}`
      : null,
    payload.email ? `Email: ${payload.email}` : null,
    payload.dietary ? `Dietary: ${payload.dietary}` : null,
  ].filter(Boolean);

  const result = await resend.emails.send({
    from: env("RESEND_FROM_EMAIL"),
    to: env("RESEND_TO_EMAIL"),
    replyTo: payload.email || undefined,
    subject,
    text: lines.join("\n"),
  });

  if (result.error) {
    throw new Error(`Resend: ${result.error.message ?? "send failed"}`);
  }
}
