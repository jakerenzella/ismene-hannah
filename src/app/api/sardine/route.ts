import { NextResponse } from "next/server";
import { getInviteeByCode, incrementInviteeSardineClicks } from "@/lib/airtable";
import { INVITE_CODE_REGEX } from "@/lib/rsvp-schema";

const MAX_CLICKS_PER_BATCH = 1000;

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as
      | { code?: unknown; count?: unknown }
      | null;
    const code = (body?.code ?? "").toString().trim().toUpperCase();
    const count = Number(body?.count);

    if (!INVITE_CODE_REGEX.test(code)) {
      return NextResponse.json({ ok: false, reason: "invalid_code" }, { status: 400 });
    }
    if (!Number.isFinite(count) || count <= 0 || count > MAX_CLICKS_PER_BATCH) {
      return NextResponse.json({ ok: false, reason: "invalid_count" }, { status: 400 });
    }

    const invitee = await getInviteeByCode(code);
    if (!invitee) {
      return NextResponse.json({ ok: false, reason: "unknown_invitee" }, { status: 404 });
    }

    await incrementInviteeSardineClicks(invitee.id, Math.floor(count));
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[sardine] route failed", error);
    return NextResponse.json({ ok: false, reason: "server_error" }, { status: 500 });
  }
}
