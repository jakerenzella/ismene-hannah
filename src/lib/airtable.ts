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
  Email?: string;
  "Sardine clicks"?: number;
};

type RsvpFields = {
  Invitee: string[];
  Attending: boolean;
  "Attendee names": string;
  "Party size": number;
  Email?: string;
  Dietary?: string;
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

async function airtableFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${env("AIRTABLE_PAT")}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Airtable ${response.status}: ${body.slice(0, 500)}`);
  }
  return response;
}

export async function getInviteeByCode(code: string): Promise<Invitee | null> {
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

export async function updateInviteeEmail(inviteeId: string, email: string): Promise<void> {
  const table = env("AIRTABLE_INVITEES_TABLE");
  await airtableFetch(`${tableUrl(table)}/${inviteeId}`, {
    method: "PATCH",
    body: JSON.stringify({ fields: { Email: email } }),
  });
}

/**
 * Read-then-PATCH increment of the "Sardine clicks" counter on an Invitee.
 * Airtable has no atomic increment; concurrent updates may lose a tick. That's
 * acceptable for a fun click counter — we just want a rough leaderboard.
 */
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

function parseNoteRecord(
  record: AirtableRecord<NoteFields>,
  myInviteeId: string | null
): Note {
  return {
    id: record.id,
    authorName: record.fields["Author name"] ?? "",
    message: record.fields.Message ?? "",
    color: record.fields.Color,
    submittedAt: record.fields["Submitted at"] ?? record.createdTime ?? null,
    hearts: record.fields["Heart count"] ?? 0,
    sparkles: record.fields["Sparkle count"] ?? 0,
    laughs: record.fields["Laugh count"] ?? 0,
    mine: !!myInviteeId && (record.fields.Invitee ?? []).includes(myInviteeId),
  };
}

/**
 * Returns visible notes (Hidden != true), newest first.
 * If `myInviteeId` is provided, each note is tagged with `mine: true`
 * when it's linked to that invitee, so the UI can show delete controls.
 */
export async function getNotes(myInviteeId: string | null = null): Promise<Note[]> {
  const table = process.env.AIRTABLE_NOTES_TABLE;
  if (!table) return [];
  const formula = encodeURIComponent("NOT({Hidden})");
  const sort = "sort%5B0%5D%5Bfield%5D=Submitted%20at&sort%5B0%5D%5Bdirection%5D=desc";
  const url = `${tableUrl(table)}?filterByFormula=${formula}&pageSize=100&${sort}`;
  const response = await airtableFetch(url);
  const data = (await response.json()) as { records: AirtableRecord<NoteFields>[] };
  return data.records.map((r) => parseNoteRecord(r, myInviteeId));
}

export async function getNoteCountForInvitee(inviteeId: string): Promise<number> {
  const table = process.env.AIRTABLE_NOTES_TABLE;
  if (!table) return 0;
  const formula = encodeURIComponent(`AND(NOT({Hidden}), FIND("${inviteeId.replace(/"/g, "")}", ARRAYJOIN({Invitee})))`);
  const url = `${tableUrl(table)}?filterByFormula=${formula}&pageSize=100&fields%5B%5D=Invitee`;
  const response = await airtableFetch(url);
  const data = (await response.json()) as { records: AirtableRecord<NoteFields>[] };
  return data.records.length;
}

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
  return parseNoteRecord(data, inviteeId);
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

export async function incrementInviteeSardineClicks(
  inviteeId: string,
  delta: number
): Promise<void> {
  if (delta <= 0) return;
  const table = env("AIRTABLE_INVITEES_TABLE");
  const url = `${tableUrl(table)}/${inviteeId}`;
  const getRes = await airtableFetch(url);
  const data = (await getRes.json()) as AirtableRecord<InviteeFields>;
  const current = data.fields["Sardine clicks"] ?? 0;
  await airtableFetch(url, {
    method: "PATCH",
    body: JSON.stringify({ fields: { "Sardine clicks": current + delta } }),
  });
}

export type ExistingRsvp = {
  recordId: string;
  attending: boolean;
  attendees: string[];
  email: string;
  dietary: string;
};

export async function getExistingRsvpByCode(code: string): Promise<ExistingRsvp | null> {
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
  return {
    recordId: record.id,
    attending: !!record.fields.Attending,
    attendees,
    email: record.fields.Email ?? "",
    dietary: record.fields.Dietary ?? "",
  };
}

function buildRsvpFields(inviteeId: string, payload: RsvpInput): RsvpFields {
  const attending = payload.attending === "yes";
  return {
    Invitee: [inviteeId],
    Attending: attending,
    "Attendee names": payload.attendees.join("\n"),
    "Party size": attending ? payload.attendees.length : 0,
    Email: payload.email || undefined,
    Dietary: payload.dietary || undefined,
    "Raw payload": JSON.stringify(payload),
  };
}

export async function upsertRsvpForInvitee(
  inviteeId: string,
  payload: RsvpInput
): Promise<{ recordId: string; mode: "created" | "updated" }> {
  const table = env("AIRTABLE_RSVPS_TABLE");
  const fields = buildRsvpFields(inviteeId, payload);
  const existing = await getExistingRsvpByCode(payload.code);

  if (existing) {
    const response = await airtableFetch(`${tableUrl(table)}/${existing.recordId}`, {
      method: "PATCH",
      body: JSON.stringify({ fields }),
    });
    const data = (await response.json()) as AirtableRecord<RsvpFields>;
    return { recordId: data.id, mode: "updated" };
  }

  const response = await airtableFetch(tableUrl(table), {
    method: "POST",
    body: JSON.stringify({ fields }),
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
 */
export async function getSettings(): Promise<Settings> {
  // Accept both spellings; the rest of the schema uses plural ("Invitees", "RSVPs").
  const table = process.env.AIRTABLE_SETTINGS_TABLE ?? process.env.AIRTABLE_SETTING_TABLE;
  if (!table) return { rsvpDeadline: null };

  try {
    const url = `${tableUrl(table)}?maxRecords=1`;
    const response = await airtableFetch(url);
    const data = (await response.json()) as { records: AirtableRecord<SettingsFields>[] };
    const dateStr = data.records[0]?.fields["RSVP deadline"];
    if (!dateStr) return { rsvpDeadline: null };
    const deadline = endOfWeddingDay(dateStr);
    return { rsvpDeadline: Number.isNaN(deadline.getTime()) ? null : deadline };
  } catch (error) {
    console.error("[settings] fetch failed", error);
    return { rsvpDeadline: null };
  }
}

export function isPastDeadline(deadline: Date | null, now: Date = new Date()): boolean {
  if (!deadline) return false;
  return now.getTime() > deadline.getTime();
}

export async function createInvitee(input: {
  code: string;
  household: string;
  maxPartySize: number;
  email?: string;
}): Promise<Invitee> {
  const table = env("AIRTABLE_INVITEES_TABLE");
  const fields: InviteeFields = {
    Code: input.code,
    Household: input.household,
    "Max party size": input.maxPartySize,
  };
  if (input.email) fields.Email = input.email;
  const response = await airtableFetch(tableUrl(table), {
    method: "POST",
    body: JSON.stringify({ fields }),
  });
  const data = (await response.json()) as AirtableRecord<InviteeFields>;
  return {
    id: data.id,
    code: data.fields.Code,
    household: data.fields.Household,
    maxPartySize: data.fields["Max party size"] ?? input.maxPartySize,
  };
}
