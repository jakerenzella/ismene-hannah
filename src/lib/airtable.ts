import { unstable_cache } from "next/cache";
import { cache } from "react";
import type { Invitee, RsvpInput } from "./rsvp-schema";
import type { NoteColor, NoteInput, ReactionType } from "./notes-schema";

const AIRTABLE_API_BASE = "https://api.airtable.com/v0";

type AirtableRecord<T> = {
  id: string;
  fields: T;
  createdTime?: string;
};

type InviteeFields = {
  Code: string;
  Household: string;
  "Max party size"?: number;
};

type RsvpFields = {
  Invitee: string[];
  Attending: boolean;
  "Attendee names": string;
  "Party size": number;
  Dietary?: string;
  "Song requests"?: string;
  "Raw payload": string;
};

function env(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function tableUrl(table: string): string {
  return `${AIRTABLE_API_BASE}/${env("AIRTABLE_BASE_ID")}/${encodeURIComponent(table)}`;
}

async function airtableFetch(
  url: string,
  init: RequestInit & { cache?: RequestCache } = {}
): Promise<Response> {
  // Reads wrapped in unstable_cache pass through with the default no-store
  // (the outer cache layer handles correctness). Writes also use no-store
  // since we never want a stale POST/PATCH cached at the HTTP layer.
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${env("AIRTABLE_PAT")}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    cache: init.cache ?? "no-store",
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Airtable ${response.status}: ${body.slice(0, 500)}`);
  }
  return response;
}

async function fetchInviteeByCode(code: string): Promise<Invitee | null> {
  const table = env("AIRTABLE_INVITEES_TABLE");
  const formula = encodeURIComponent(`{Code} = "${code.replace(/"/g, "")}"`);
  const url = `${tableUrl(table)}?filterByFormula=${formula}&maxRecords=1`;
  const response = await airtableFetch(url);
  const data = (await response.json()) as { records: AirtableRecord<InviteeFields>[] };
  const record = data.records[0];
  if (!record) return null;
  return {
    id: record.id,
    code: record.fields.Code,
    household: record.fields.Household,
    maxPartySize: record.fields["Max party size"] ?? 1,
  };
}

const cachedInviteeByCode = (code: string) =>
  unstable_cache(
    () => fetchInviteeByCode(code),
    ["invitee", code],
    { tags: ["invitees", `invitee:${code}`], revalidate: 3600 }
  )();

// react cache() dedupes truly identical calls within a single render
// (e.g. generateMetadata + the page component on /i/[code]). Cross-request
// caching is handled by the inner unstable_cache layer.
export const getInviteeByCode = cache(
  (code: string): Promise<Invitee | null> => cachedInviteeByCode(code)
);

// ============================================================
// Notes
// ============================================================

type NoteFields = {
  "Author name": string;
  Message: string;
  Color: NoteColor;
  Invitee: string[];
  "Submitted at"?: string;
  Hidden?: boolean;
  "Heart count"?: number;
  "Sparkle count"?: number;
  "Laugh count"?: number;
};

export type Note = {
  id: string;
  authorName: string;
  message: string;
  color: NoteColor;
  submittedAt: string | null;
  hearts: number;
  sparkles: number;
  laughs: number;
  /** True when this note is linked to the viewer's invitee. Used to gate delete UI. */
  mine: boolean;
};

type RawNote = Omit<Note, "mine"> & { linkedInviteeIds: string[] };

function parseRawNote(record: AirtableRecord<NoteFields>): RawNote {
  return {
    id: record.id,
    authorName: record.fields["Author name"] ?? "",
    message: record.fields.Message ?? "",
    color: record.fields.Color,
    submittedAt: record.fields["Submitted at"] ?? record.createdTime ?? null,
    hearts: record.fields["Heart count"] ?? 0,
    sparkles: record.fields["Sparkle count"] ?? 0,
    laughs: record.fields["Laugh count"] ?? 0,
    linkedInviteeIds: record.fields.Invitee ?? [],
  };
}

const fetchNotesRaw = async (): Promise<RawNote[]> => {
  const table = process.env.AIRTABLE_NOTES_TABLE;
  if (!table) return [];
  const formula = encodeURIComponent("NOT({Hidden})");
  const sort = "sort%5B0%5D%5Bfield%5D=Submitted%20at&sort%5B0%5D%5Bdirection%5D=desc";
  const url = `${tableUrl(table)}?filterByFormula=${formula}&pageSize=100&${sort}`;
  const response = await airtableFetch(url);
  const data = (await response.json()) as { records: AirtableRecord<NoteFields>[] };
  return data.records.map(parseRawNote);
};

const getNotesRaw = unstable_cache(
  fetchNotesRaw,
  ["notes-raw"],
  { tags: ["notes"], revalidate: 86400 }
);

/**
 * Returns visible notes (Hidden != true), newest first. The cached layer is
 * viewer-agnostic; the per-viewer `mine` flag is computed on each call.
 */
export async function getNotes(myInviteeId: string | null = null): Promise<Note[]> {
  const raw = await getNotesRaw();
  return raw.map(({ linkedInviteeIds, ...rest }) => ({
    ...rest,
    mine: !!myInviteeId && linkedInviteeIds.includes(myInviteeId),
  }));
}

const fetchNoteCountForInvitee = async (inviteeId: string): Promise<number> => {
  const table = process.env.AIRTABLE_NOTES_TABLE;
  if (!table) return 0;
  const formula = encodeURIComponent(`AND(NOT({Hidden}), FIND("${inviteeId.replace(/"/g, "")}", ARRAYJOIN({Invitee})))`);
  const url = `${tableUrl(table)}?filterByFormula=${formula}&pageSize=100&fields%5B%5D=Invitee`;
  const response = await airtableFetch(url);
  const data = (await response.json()) as { records: AirtableRecord<NoteFields>[] };
  return data.records.length;
};

export const getNoteCountForInvitee = (inviteeId: string) =>
  unstable_cache(
    () => fetchNoteCountForInvitee(inviteeId),
    ["note-count", inviteeId],
    { tags: [`note-count:${inviteeId}`], revalidate: 86400 }
  )();

export async function createNote(
  inviteeId: string,
  payload: Pick<NoteInput, "authorName" | "message" | "color">
): Promise<Note> {
  const table = env("AIRTABLE_NOTES_TABLE");
  const fields: NoteFields = {
    "Author name": payload.authorName,
    Message: payload.message,
    Color: payload.color,
    Invitee: [inviteeId],
  };
  // typecast: true tells Airtable to create missing single-select options on the
  // fly and accept case-insensitive matches, so the form doesn't break if the
  // host hasn't pre-created every Color option in the schema.
  const response = await airtableFetch(tableUrl(table), {
    method: "POST",
    body: JSON.stringify({ fields, typecast: true }),
  });
  const data = (await response.json()) as AirtableRecord<NoteFields>;
  const { linkedInviteeIds, ...rest } = parseRawNote(data);
  return { ...rest, mine: linkedInviteeIds.includes(inviteeId) };
}

export async function getNoteOwnerInviteeId(noteId: string): Promise<string | null> {
  const table = env("AIRTABLE_NOTES_TABLE");
  const response = await airtableFetch(`${tableUrl(table)}/${noteId}`);
  const data = (await response.json()) as AirtableRecord<NoteFields>;
  return data.fields.Invitee?.[0] ?? null;
}

export async function deleteNote(noteId: string): Promise<void> {
  const table = env("AIRTABLE_NOTES_TABLE");
  await airtableFetch(`${tableUrl(table)}/${noteId}`, { method: "DELETE" });
}

const REACTION_FIELD: Record<ReactionType, "Heart count" | "Sparkle count" | "Laugh count"> = {
  heart: "Heart count",
  sparkle: "Sparkle count",
  laugh: "Laugh count",
};

export async function adjustNoteReaction(
  noteId: string,
  type: ReactionType,
  delta: number
): Promise<void> {
  if (delta === 0) return;
  const table = env("AIRTABLE_NOTES_TABLE");
  const url = `${tableUrl(table)}/${noteId}`;
  const getRes = await airtableFetch(url);
  const data = (await getRes.json()) as AirtableRecord<NoteFields>;
  const field = REACTION_FIELD[type];
  const current = data.fields[field] ?? 0;
  const next = Math.max(0, current + delta);
  await airtableFetch(url, {
    method: "PATCH",
    body: JSON.stringify({ fields: { [field]: next } }),
  });
}

export type ExistingRsvp = {
  recordId: string;
  attending: boolean;
  attendees: string[];
  /** One entry per attendee; empty string when none provided. Aligned by index with `attendees`. */
  dietaries: string[];
  /** Combined display string of all per-guest dietary requirements (for summary view). */
  dietary: string;
  songRequests: string;
};

/**
 * Parses the multi-line Dietary field back into a per-attendee array.
 * Modern format: each line is `Name: requirement`. Falls back to a single
 * combined string if the legacy single-textarea format is detected.
 */
function parseDietaryField(raw: string, attendees: string[]): string[] {
  const result = attendees.map(() => "");
  if (!raw) return result;
  const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  let matchedAny = false;
  for (const line of lines) {
    const colon = line.indexOf(":");
    if (colon <= 0) continue;
    const name = line.slice(0, colon).trim();
    const requirement = line.slice(colon + 1).trim();
    const idx = attendees.findIndex((a) => a.toLowerCase() === name.toLowerCase());
    if (idx >= 0) {
      result[idx] = requirement;
      matchedAny = true;
    }
  }
  // Legacy fallback: single block of text with no name prefixes — surface it
  // against the first attendee so it still shows up in the UI.
  if (!matchedAny && attendees.length > 0) {
    result[0] = raw.trim();
  }
  return result;
}

function formatDietariesForStorage(attendees: string[], dietaries: string[]): string {
  const lines: string[] = [];
  for (let i = 0; i < attendees.length; i++) {
    const name = attendees[i];
    const requirement = (dietaries[i] ?? "").trim();
    if (!requirement) continue;
    lines.push(`${name}: ${requirement}`);
  }
  return lines.join("\n");
}

async function fetchExistingRsvpByCode(code: string): Promise<ExistingRsvp | null> {
  const table = env("AIRTABLE_RSVPS_TABLE");
  // {Invitee} is a linked field. In Airtable formulas, linked fields evaluate to
  // their *primary field* of the linked record (here: the Code), not the record id.
  // ARRAYJOIN flattens to a string we can FIND in.
  const safeCode = code.replace(/"/g, "");
  const formula = encodeURIComponent(`FIND("${safeCode}", ARRAYJOIN({Invitee}))`);
  const url = `${tableUrl(table)}?filterByFormula=${formula}&maxRecords=1`;
  const response = await airtableFetch(url);
  const data = (await response.json()) as { records: AirtableRecord<RsvpFields>[] };
  const record = data.records[0];
  if (!record) return null;
  const namesText = record.fields["Attendee names"] ?? "";
  const attendees = namesText
    .split(/\r?\n/)
    .map((n) => n.trim())
    .filter((n) => n.length > 0);
  const dietaryRaw = record.fields.Dietary ?? "";
  const dietaries = parseDietaryField(dietaryRaw, attendees);
  return {
    recordId: record.id,
    attending: !!record.fields.Attending,
    attendees,
    dietaries,
    dietary: dietaryRaw,
    songRequests: record.fields["Song requests"] ?? "",
  };
}

export const getExistingRsvpByCode = (code: string) =>
  unstable_cache(
    () => fetchExistingRsvpByCode(code),
    ["rsvp", code],
    { tags: ["rsvps", `rsvp:${code}`], revalidate: 86400 }
  )();

function buildRsvpFields(inviteeId: string, payload: RsvpInput): RsvpFields {
  const attending = payload.attending === "yes";
  const dietaryText = attending
    ? formatDietariesForStorage(payload.attendees, payload.dietaries)
    : "";
  return {
    Invitee: [inviteeId],
    Attending: attending,
    "Attendee names": payload.attendees.join("\n"),
    "Party size": attending ? payload.attendees.length : 0,
    Dietary: dietaryText || undefined,
    "Song requests": payload.songRequests || undefined,
    "Raw payload": JSON.stringify(payload),
  };
}

/**
 * Find-then-write upsert. The caller (`submitRsvp`) usually has an `existing`
 * record on hand from its no-op detection step — passing it through means we
 * skip a duplicate Airtable read here. When `existing` is undefined, we fall
 * back to a fresh lookup (rare: only when the caller's lookup itself failed).
 *
 * We can't use Airtable's `performUpsert` primitive because the natural merge
 * key (the `Invitee` linked-record field) is rejected with
 * `UNSUPPORTED_FIELD_TYPE_TO_UPSERT` — it only accepts text/numeric merge fields.
 */
export async function upsertRsvpForInvitee(
  inviteeId: string,
  payload: RsvpInput,
  existing?: ExistingRsvp | null
): Promise<{ recordId: string; mode: "created" | "updated" }> {
  const table = env("AIRTABLE_RSVPS_TABLE");
  const fields = buildRsvpFields(inviteeId, payload);
  const known = existing !== undefined ? existing : await getExistingRsvpByCode(payload.code);

  if (known) {
    const response = await airtableFetch(`${tableUrl(table)}/${known.recordId}`, {
      method: "PATCH",
      body: JSON.stringify({ fields, typecast: true }),
    });
    const data = (await response.json()) as AirtableRecord<RsvpFields>;
    return { recordId: data.id, mode: "updated" };
  }

  const response = await airtableFetch(tableUrl(table), {
    method: "POST",
    body: JSON.stringify({ fields, typecast: true }),
  });
  const data = (await response.json()) as AirtableRecord<RsvpFields>;
  return { recordId: data.id, mode: "created" };
}

export type Settings = {
  rsvpDeadline: Date | null;
};

type SettingsFields = {
  "RSVP deadline"?: string;
};

export const WEDDING_TIMEZONE = "Australia/Melbourne";

/**
 * Returns the offset between the given timezone and UTC at the given instant,
 * in milliseconds (positive east of UTC). Uses Intl so DST is handled correctly.
 */
function offsetMsInTimezone(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "longOffset",
  }).formatToParts(date);
  const tzName = parts.find((p) => p.type === "timeZoneName")?.value ?? "GMT";
  const match = tzName.match(/GMT([+-])(\d{1,2}):?(\d{2})?/);
  if (!match) return 0;
  const sign = match[1] === "+" ? 1 : -1;
  const hours = parseInt(match[2] ?? "0", 10);
  const mins = parseInt(match[3] ?? "0", 10);
  return sign * (hours * 60 + mins) * 60 * 1000;
}

/**
 * Treats `dateStr` (YYYY-MM-DD) as a wall-clock date in the wedding timezone and
 * returns the absolute instant of 23:59:59.999 on that date in that zone. The
 * server's own timezone is irrelevant.
 */
export function endOfWeddingDay(dateStr: string): Date {
  const naive = new Date(`${dateStr.slice(0, 10)}T23:59:59.999Z`);
  const offsetMs = offsetMsInTimezone(naive, WEDDING_TIMEZONE);
  return new Date(naive.getTime() - offsetMs);
}

/**
 * Reads site-wide settings from the Airtable Settings table (single row).
 * Fail-open: any error or missing config returns a permissive default,
 * so a settings-table outage cannot block guests from RSVPing.
 *
 * Returned shape uses epoch ms instead of a Date because `unstable_cache`
 * serializes via JSON — a `Date` would round-trip to a string and break
 * `getTime()` on the consumer side.
 */
async function fetchRawSettings(): Promise<{ deadlineMs: number | null }> {
  // Accept both spellings; the rest of the schema uses plural ("Invitees", "RSVPs").
  const table = process.env.AIRTABLE_SETTINGS_TABLE ?? process.env.AIRTABLE_SETTING_TABLE;
  if (!table) return { deadlineMs: null };

  try {
    const url = `${tableUrl(table)}?maxRecords=1`;
    const response = await airtableFetch(url);
    const data = (await response.json()) as { records: AirtableRecord<SettingsFields>[] };
    const dateStr = data.records[0]?.fields["RSVP deadline"];
    if (!dateStr) return { deadlineMs: null };
    const ms = endOfWeddingDay(dateStr).getTime();
    return { deadlineMs: Number.isNaN(ms) ? null : ms };
  } catch (error) {
    console.error("[settings] fetch failed", error);
    return { deadlineMs: null };
  }
}

const getRawSettings = unstable_cache(
  fetchRawSettings,
  ["settings"],
  { tags: ["settings"], revalidate: 86400 }
);

export async function getSettings(): Promise<Settings> {
  const { deadlineMs } = await getRawSettings();
  return { rsvpDeadline: deadlineMs == null ? null : new Date(deadlineMs) };
}

export function isPastDeadline(deadline: Date | null, now: Date = new Date()): boolean {
  if (!deadline) return false;
  return now.getTime() > deadline.getTime();
}

