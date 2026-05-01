import { z } from "zod";
import { INVITE_CODE_REGEX } from "./rsvp-schema";

export const NOTE_COLOR_VALUES = ["Peach", "Pink", "Sky", "Sun", "Mint", "Lavender"] as const;
export type NoteColor = (typeof NOTE_COLOR_VALUES)[number];

export const NOTE_COLOR_STYLES: Record<NoteColor, { bg: string; ring: string; ink: string }> = {
  Peach: { bg: "#ffd9c8", ring: "#ffb999", ink: "#5a2510" },
  Pink: { bg: "#ffc8d4", ring: "#ff8fa4", ink: "#67001a" },
  Sky: { bg: "#cce7f2", ring: "#9bd0e3", ink: "#0c3744" },
  Sun: { bg: "#f6dc7a", ring: "#e6c95c", ink: "#4a3608" },
  Mint: { bg: "#c8eecc", ring: "#9ad79f", ink: "#0e3915" },
  Lavender: { bg: "#d8c8ff", ring: "#b39bff", ink: "#240a55" },
};

export const REACTION_TYPES = ["heart", "sparkle", "laugh"] as const;
export type ReactionType = (typeof REACTION_TYPES)[number];

export const REACTION_EMOJI: Record<ReactionType, string> = {
  heart: "❤️",
  sparkle: "✨",
  laugh: "😂",
};

export const NOTE_MESSAGE_MAX = 500;
export const NOTE_AUTHOR_MAX = 40;
export const MAX_NOTES_PER_INVITEE = 3;

export const NoteInputSchema = z.object({
  code: z.string().regex(INVITE_CODE_REGEX, "Invalid invite code"),
  authorName: z.string().trim().min(1, "Please add a name").max(NOTE_AUTHOR_MAX),
  message: z.string().trim().min(1, "Please write a message").max(NOTE_MESSAGE_MAX),
  color: z.enum(NOTE_COLOR_VALUES),
  website: z.string().max(500).optional().or(z.literal("")),
});

export type NoteInput = z.infer<typeof NoteInputSchema>;

export function parseNoteFormData(formData: FormData): unknown {
  return {
    code: (formData.get("code") ?? "").toString(),
    authorName: (formData.get("authorName") ?? "").toString(),
    message: (formData.get("message") ?? "").toString(),
    color: (formData.get("color") ?? "").toString(),
    website: (formData.get("website") ?? "").toString(),
  };
}

function hashId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(hash);
}

/** Deterministic small rotation per note id, for scrapbook tilt without re-render jitter. */
export function tiltForId(id: string): number {
  const range = 6;
  return ((hashId(id) % (range * 100)) / 100) - range / 2;
}

/** Per-note tape angle/offset so the tape strip sits a little differently on each. */
export function tapeForId(id: string): { rotate: number; offset: number } {
  const h = hashId(id);
  return {
    rotate: (h % 28) - 14, // -14..13 deg
    offset: ((h >>> 5) % 30) - 15, // -15..14 px from centre
  };
}
