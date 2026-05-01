import Image from "next/image";
import Link from "next/link";
import { getInviteeByCode } from "@/lib/airtable";
import { INVITE_CODE_REGEX, type Invitee } from "@/lib/rsvp-schema";

type Params = Promise<{ code: string }>;

export const dynamic = "force-dynamic";

export default async function InvitePage({ params }: { params: Params }) {
  const { code: rawCode } = await params;
  const code = rawCode.trim().toUpperCase();

  const isWellFormed = INVITE_CODE_REGEX.test(code);
  let invitee: Invitee | null = null;
  if (isWellFormed) {
    try {
      invitee = await getInviteeByCode(code);
    } catch (error) {
      console.error("[invite] lookup failed", { error, code });
    }
  }

  return (
    <InviteFrame>
      {invitee ? (
        <WelcomeContent invitee={invitee} />
      ) : (
        <InvalidCodeContent attemptedCode={rawCode} />
      )}
    </InviteFrame>
  );
}

function InviteFrame({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative min-h-screen overflow-hidden flex items-center justify-center px-6 py-16">
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
        <div
          className="absolute top-12 left-8 md:top-20 md:left-20 sticker-float"
          style={{ "--sticker-rotate": "-12deg" } as React.CSSProperties}
        >
          <Image
            src="/assets/heart.svg"
            alt=""
            width={140}
            height={140}
            className="w-20 md:w-32 h-auto"
          />
        </div>
        <div
          className="absolute top-6 right-10 md:top-16 md:right-24 sticker-float"
          style={
            {
              "--sticker-rotate": "18deg",
              animationDelay: "1.2s",
            } as React.CSSProperties
          }
        >
          <Image
            src="/assets/sparkle.svg"
            alt=""
            width={120}
            height={120}
            className="w-16 md:w-24 h-auto"
          />
        </div>
        <div className="absolute bottom-24 -left-6 md:bottom-32 md:left-10 opacity-40 rotate-[8deg]">
          <Image
            src="/assets/cloud.svg"
            alt=""
            width={200}
            height={200}
            className="w-32 md:w-44 h-auto"
          />
        </div>
        <div
          className="absolute bottom-10 right-6 md:bottom-20 md:right-20 sticker-float"
          style={
            {
              "--sticker-rotate": "14deg",
              animationDelay: "0.5s",
            } as React.CSSProperties
          }
        >
          <Image
            src="/assets/glitter-heart.svg"
            alt=""
            width={140}
            height={140}
            className="w-20 md:w-28 h-auto"
          />
        </div>
        <div className="absolute top-1/2 -right-4 md:right-8 rotate-[-20deg] opacity-80">
          <Image
            src="/assets/star.svg"
            alt=""
            width={100}
            height={100}
            className="w-12 md:w-20 h-auto"
          />
        </div>
      </div>

      <article className="relative z-10 max-w-2xl w-full bg-surface-container-lowest scrapbook-shadow rounded-3xl border-2 border-dashed border-primary/30 px-8 py-14 md:px-16 md:py-20 text-center handwritten-tilt-alt">
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-24 opacity-80 pointer-events-none">
          <Image src="/assets/tape.svg" alt="" width={200} height={100} className="w-full h-auto" />
        </div>
        {children}
      </article>
    </main>
  );
}

function WelcomeContent({ invitee }: { invitee: Invitee }) {
  return (
    <>
      <p className="font-display text-3xl md:text-5xl text-on-surface-variant mb-2">Hi</p>
      <h1 className="font-display text-5xl md:text-7xl font-bold text-primary leading-none mb-8 break-words">
        {invitee.household}
      </h1>

      <p className="text-lg md:text-xl text-on-surface-variant max-w-md mx-auto mb-10 leading-relaxed">
        Ismene &amp; Hannah are tying the knot on{" "}
        <span className="font-headline font-bold text-on-surface">27 July 2027</span>
        {" in Melbourne — and they\u2019d love to share the day with you."}
      </p>

      <Link
        href={`/?code=${invitee.code}#rsvp`}
        className="inline-flex items-center justify-center gap-3 bg-primary text-on-primary font-headline font-extrabold py-5 px-10 rounded-full shadow-xl hover:scale-[1.03] active:scale-95 transition-all text-lg md:text-xl"
      >
        Open your invitation
        <span className="material-symbols-outlined">arrow_forward</span>
      </Link>

      <p className="mt-10 font-display text-2xl text-secondary">With love, I &amp; H</p>
    </>
  );
}

function InvalidCodeContent({ attemptedCode }: { attemptedCode: string }) {
  const displayCode = attemptedCode.trim().slice(0, 24) || "(empty)";

  return (
    <>
      <p className="font-display text-3xl md:text-5xl text-on-surface-variant mb-2">Hmm…</p>
      <h1 className="font-display text-4xl md:text-6xl font-bold text-primary leading-tight mb-6 break-words">
        That code doesn&apos;t look right
      </h1>

      <p className="text-lg md:text-xl text-on-surface-variant max-w-md mx-auto mb-6 leading-relaxed">
        We couldn&apos;t find your invite from that link. It might be a typo, or the link may have
        been copied incompletely.
      </p>

      <div className="inline-block bg-surface-container/60 border border-outline-variant/30 rounded-xl px-5 py-3 mb-8">
        <p className="text-xs font-headline font-extrabold uppercase tracking-wider text-on-surface-variant mb-1">
          The code we received
        </p>
        <p className="font-mono text-lg text-on-surface break-all">{displayCode}</p>
      </div>

      <p className="text-base md:text-lg text-on-surface-variant max-w-md mx-auto leading-relaxed">
        If you&apos;re having any trouble, please reach out to Ismene &amp; Hannah and they&apos;ll
        sort it out for you.
      </p>

      <p className="mt-10 font-display text-2xl text-secondary">With love, I &amp; H</p>
    </>
  );
}
