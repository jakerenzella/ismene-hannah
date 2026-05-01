"use server";

import {
  adjustNoteReaction,
  createNote,
  deleteNote,
  getExistingRsvpByCode,
  getInviteeByCode,
  getNoteCountForInvitee,
  getNoteOwnerInviteeId,
} from "@/lib/airtable";
import {
  MAX_NOTES_PER_INVITEE,
  NoteInputSchema,
  parseNoteFormData,
  REACTION_TYPES,
  type ReactionType,
} from "@/lib/notes-schema";
import { INVITE_CODE_REGEX } from "@/lib/rsvp-schema";
import type { NoteFormState } from "./notes-state";

export async function postNote(_prev: NoteFormState, formData: FormData): Promise<NoteFormState> {
  const raw = parseNoteFormData(formData);
  const parsed = NoteInputSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      status: "error",
      code: "VALIDATION",
      message: "Please check the fields below.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }
  const payload = parsed.data;

  if (payload.website) {
    return { status: "error", code: "HONEYPOT", message: "Submission blocked." };
  }

  let invitee;
  try {
    invitee = await getInviteeByCode(payload.code);
  } catch (error) {
    console.error("[notes] invitee lookup failed", error);
    return {
      status: "error",
      code: "STORAGE_FAILED",
      message: "We couldn't reach our system. Please try again.",
    };
  }
  if (!invitee) {
    return {
      status: "error",
      code: "INVALID_CODE",
      message: "We couldn't recognise that invite code.",
    };
  }

  // Must have an RSVP to post a note.
  let rsvp;
  try {
    rsvp = await getExistingRsvpByCode(payload.code);
  } catch (error) {
    console.error("[notes] rsvp lookup failed", error);
    return {
      status: "error",
      code: "STORAGE_FAILED",
      message: "We couldn't verify your RSVP. Please try again.",
    };
  }
  if (!rsvp) {
    return {
      status: "error",
      code: "NO_RSVP",
      message: "Please RSVP first — then come back to leave a note.",
    };
  }

  // Cap at MAX_NOTES_PER_INVITEE notes per household.
  let count = 0;
  try {
    count = await getNoteCountForInvitee(invitee.id);
  } catch (error) {
    console.error("[notes] count lookup failed", error);
  }
  if (count >= MAX_NOTES_PER_INVITEE) {
    return {
      status: "error",
      code: "AT_LIMIT",
      message: `You've already left ${MAX_NOTES_PER_INVITEE} notes — delete one to leave another.`,
    };
  }

  try {
    const note = await createNote(invitee.id, {
      authorName: payload.authorName,
      message: payload.message,
      color: payload.color,
    });
    return { status: "ok", note };
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    console.error("[notes] create failed:", detail, { payload });
    return {
      status: "error",
      code: "STORAGE_FAILED",
      message: "Couldn't save your note. Please try again.",
    };
  }
}

export type DeleteNoteResult =
  | { ok: true }
  | { ok: false; reason: "INVALID_CODE" | "NOT_OWNER" | "STORAGE_FAILED" };

export async function deleteNoteAction(noteId: string, code: string): Promise<DeleteNoteResult> {
  const cleanCode = code.trim().toUpperCase();
  if (!INVITE_CODE_REGEX.test(cleanCode)) return { ok: false, reason: "INVALID_CODE" };
  if (typeof noteId !== "string" || noteId.length === 0) {
    return { ok: false, reason: "INVALID_CODE" };
  }
  try {
    const invitee = await getInviteeByCode(cleanCode);
    if (!invitee) return { ok: false, reason: "INVALID_CODE" };
    const owner = await getNoteOwnerInviteeId(noteId);
    if (owner !== invitee.id) return { ok: false, reason: "NOT_OWNER" };
    await deleteNote(noteId);
    return { ok: true };
  } catch (error) {
    console.error("[notes] delete failed", { error, noteId });
    return { ok: false, reason: "STORAGE_FAILED" };
  }
}

export type ReactResult =
  | { ok: true }
  | { ok: false; reason: "INVALID_CODE" | "INVALID_INPUT" | "STORAGE_FAILED" };

export async function reactToNoteAction(
  noteId: string,
  code: string,
  type: ReactionType,
  delta: 1 | -1
): Promise<ReactResult> {
  const cleanCode = code.trim().toUpperCase();
  if (!INVITE_CODE_REGEX.test(cleanCode)) return { ok: false, reason: "INVALID_CODE" };
  if (!REACTION_TYPES.includes(type)) return { ok: false, reason: "INVALID_INPUT" };
  if (delta !== 1 && delta !== -1) return { ok: false, reason: "INVALID_INPUT" };
  if (typeof noteId !== "string" || noteId.length === 0) {
    return { ok: false, reason: "INVALID_INPUT" };
  }
  try {
    const invitee = await getInviteeByCode(cleanCode);
    if (!invitee) return { ok: false, reason: "INVALID_CODE" };
    await adjustNoteReaction(noteId, type, delta);
    return { ok: true };
  } catch (error) {
    console.error("[notes] react failed", { error, noteId, type, delta });
    return { ok: false, reason: "STORAGE_FAILED" };
  }
}
