import { config as loadEnv } from "dotenv";
import { existsSync, readFileSync } from "node:fs";

// Next.js auto-loads .env.local at runtime, but plain Node scripts don't.
// Load .env.local first (preferred for secrets), fall back to .env.
if (existsSync(".env.local")) loadEnv({ path: ".env.local" });
else loadEnv();
import { resolve } from "node:path";
import { customAlphabet } from "nanoid";
import { createInvitee, getInviteeByCode } from "../src/lib/airtable";
import { INVITE_CODE_ALPHABET } from "../src/lib/rsvp-schema";

const generateCode = customAlphabet(INVITE_CODE_ALPHABET, 6);

type Row = { household: string; maxPartySize: number };

function parseCsv(input: string): Row[] {
  const lines = input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));
  if (lines.length === 0) return [];

  const [headerLine, ...dataLines] = lines;
  const headers = headerLine.split(",").map((h) => h.trim().toLowerCase());
  const householdIdx = headers.indexOf("household");
  const maxIdx = headers.indexOf("max_party_size");
  if (householdIdx === -1 || maxIdx === -1) {
    throw new Error("CSV must have 'household' and 'max_party_size' columns");
  }

  return dataLines.map((line, i) => {
    const cells = splitCsvLine(line);
    const household = cells[householdIdx]?.trim();
    const max = Number(cells[maxIdx]?.trim());
    if (!household) throw new Error(`Row ${i + 2}: missing household`);
    if (!Number.isFinite(max) || max < 1) {
      throw new Error(`Row ${i + 2}: max_party_size must be a number ≥ 1`);
    }
    return { household, maxPartySize: max };
  });
}

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      out.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  out.push(current);
  return out;
}

async function uniqueCode(maxAttempts = 5): Promise<string> {
  for (let i = 0; i < maxAttempts; i++) {
    const code = generateCode();
    const existing = await getInviteeByCode(code);
    if (!existing) return code;
  }
  throw new Error("Failed to generate a unique code after several attempts");
}

async function main() {
  const csvPath = resolve(process.argv[2] ?? "scripts/guests.csv");
  console.log(`Reading guests from ${csvPath}`);
  const csv = readFileSync(csvPath, "utf8");
  const rows = parseCsv(csv);
  console.log(`Parsed ${rows.length} household(s).`);

  const baseUrl = process.env.SITE_BASE_URL ?? "https://your-domain.example";
  const created: { household: string; code: string; link: string }[] = [];

  for (const row of rows) {
    const code = await uniqueCode();
    const invitee = await createInvitee({
      code,
      household: row.household,
      maxPartySize: row.maxPartySize,
    });
    const link = `${baseUrl}/i/${invitee.code}`;
    created.push({ household: invitee.household, code: invitee.code, link });
    console.log(`  + ${invitee.household.padEnd(30)} ${invitee.code}  ${link}`);
  }

  console.log(`\nDone. ${created.length} invitee(s) added.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
