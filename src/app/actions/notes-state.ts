import type { Note } from "@/lib/airtable";

export type NoteFormState =
  | { status: "idle" }
  | { status: "ok"; note: Note }
  | {
      status: "error";
      code:
        | "VALIDATION"
        | "INVALID_CODE"
        | "NO_RSVP"
        | "AT_LIMIT"
        | "STORAGE_FAILED"
        | "HONEYPOT";
      message: string;
      fieldErrors?: Record<string, string[]>;
    };

export const initialNoteFormState: NoteFormState = { status: "idle" };
