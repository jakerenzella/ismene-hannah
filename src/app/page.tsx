import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import OurStory from "@/components/OurStory";
import Details from "@/components/Details";
import MoodBoard from "@/components/MoodBoard";
import Gift from "@/components/Gift";
import Travel from "@/components/Travel";
import Notes from "@/components/Notes";
import Footer from "@/components/Footer";
import Sticker from "@/components/Sticker";
import ScatteredStickers from "@/components/ScatteredStickers";
import {
  getExistingRsvpByCode,
  getInviteeByCode,
  getNotes,
  getSettings,
  isPastDeadline,
  WEDDING_TIMEZONE,
  type ExistingRsvp,
  type Note,
} from "@/lib/airtable";
import { INVITE_CODE_REGEX, type Invitee } from "@/lib/rsvp-schema";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

type Resolved = {
  invitee: Invitee | null;
  invalidCode: boolean;
  existingRsvp: ExistingRsvp | null;
};

async function resolveInvitee(searchParams: SearchParams): Promise<Resolved> {
  const params = await searchParams;
  const raw = params.code;
  const code = (Array.isArray(raw) ? raw[0] : raw)?.trim().toUpperCase();
  if (!code) return { invitee: null, invalidCode: false, existingRsvp: null };
  if (!INVITE_CODE_REGEX.test(code)) {
    return { invitee: null, invalidCode: true, existingRsvp: null };
  }
  try {
    const invitee = await getInviteeByCode(code);
    if (!invitee) return { invitee: null, invalidCode: true, existingRsvp: null };
    let existingRsvp: ExistingRsvp | null = null;
    try {
      existingRsvp = await getExistingRsvpByCode(code);
    } catch (error) {
      console.error("[page] existing-rsvp lookup failed", { error, code });
    }
    return { invitee, invalidCode: false, existingRsvp };
  } catch (error) {
    console.error("[page] invitee lookup failed", { error, code });
    return { invitee: null, invalidCode: false, existingRsvp: null };
  }
}

const deadlineFormatter = new Intl.DateTimeFormat("en-AU", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: WEDDING_TIMEZONE,
});

async function safeGetNotes(myInviteeId: string | null): Promise<Note[]> {
  try {
    return await getNotes(myInviteeId);
  } catch (error) {
    console.error("[page] notes lookup failed", error);
    return [];
  }
}

export default async function Home({ searchParams }: { searchParams: SearchParams }) {
  const [{ invitee, invalidCode, existingRsvp }, settings] = await Promise.all([
    resolveInvitee(searchParams),
    getSettings(),
  ]);
  const notes = invitee ? await safeGetNotes(invitee.id) : [];

  const rsvpClosed = isPastDeadline(settings.rsvpDeadline);
  const deadlineLabel = settings.rsvpDeadline
    ? deadlineFormatter.format(settings.rsvpDeadline)
    : null;

  return (
    <>
      <Navbar showNotes={!!invitee} />
      <ScatteredStickers />
      <main className="pt-12 relative z-10">
        <Hero />
        <OurStory code={invitee?.code ?? null} />
        <Details
          invitee={invitee}
          invalidCode={invalidCode}
          existingRsvp={existingRsvp}
          rsvpClosed={rsvpClosed}
          deadlineLabel={deadlineLabel}
        />
        <MoodBoard />
        {invitee && <Gift />}
        <Travel />
        {invitee && (
          <Notes
            notes={notes}
            code={invitee.code}
            household={invitee.household}
            hasRsvp={existingRsvp !== null}
          />
        )}
        <div className="py-12 flex justify-center">
          <Sticker
            src="/assets/sparkle.svg"
            width={200}
            height={200}
            className="w-48 h-48"
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
