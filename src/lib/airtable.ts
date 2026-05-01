import type { Invitee, RsvpInput } from "./rsvp-schema";

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
    // Treat the deadline as end-of-day UTC: "2027-06-01" → 2027-06-01T23:59:59Z.
    // Close enough for a wedding deadline; submissions made on the day are accepted.
    const deadline = new Date(`${dateStr.slice(0, 10)}T23:59:59Z`);
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
