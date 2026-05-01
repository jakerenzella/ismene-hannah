"use client";

import Image from "next/image";
import DoodleIcon from "@/components/DoodleIcon";
import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { submitRsvp } from "@/app/actions/rsvp";
import { initialRsvpState, type RsvpState } from "@/app/actions/rsvp-state";
import type { ExistingRsvp } from "@/lib/airtable";
import type { Invitee } from "@/lib/rsvp-schema";

type Props = {
  invitee: Invitee | null;
  invalidCode: boolean;
  existingRsvp: ExistingRsvp | null;
  rsvpClosed: boolean;
  deadlineLabel: string | null;
};

const inputClasses =
  "w-full bg-transparent border-b-2 border-outline-variant focus:border-primary focus:ring-0 focus:outline-none transition-all px-0 py-3 text-lg text-on-surface placeholder:text-on-surface-variant/70";

export default function Details({
  invitee,
  invalidCode,
  existingRsvp,
  rsvpClosed,
  deadlineLabel,
}: Props) {
  return (
    <section className="py-32 px-6 max-w-7xl mx-auto relative">
      <div className="absolute -top-16 right-10 opacity-30 pointer-events-none z-0">
        <Image src="/assets/cloud.svg" alt="" width={176} height={176} className="w-44 h-auto" />
      </div>

      {/* RSVP — the most important card on the site, given prime real estate */}
      <div
        className="relative z-10 max-w-3xl mx-auto bg-surface-container-highest p-8 md:p-14 rounded-3xl scrapbook-shadow border-2 border-dashed border-primary/30 handwritten-tilt-alt mb-16 md:mb-20 scroll-mt-24"
        id="rsvp"
      >
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-10 w-28 opacity-80 pointer-events-none">
          <Image src="/assets/tape.svg" alt="" width={200} height={100} className="w-full h-auto" />
        </div>
        <RsvpCard
          invitee={invitee}
          invalidCode={invalidCode}
          existingRsvp={existingRsvp}
          rsvpClosed={rsvpClosed}
          deadlineLabel={deadlineLabel}
        />
      </div>

      {/* Secondary details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative z-10 items-stretch">
        <div
          id="details"
          className="md:col-span-3 bg-surface-container-lowest p-8 md:p-14 rounded-3xl scrapbook-shadow flex flex-col lg:flex-row gap-10 items-center border border-primary-container/10 scroll-mt-24"
        >
          <div className="w-full lg:w-1/2">
            <h3 className="font-display text-4xl font-bold text-primary mb-6 flex items-center gap-3">
              <DoodleIcon name="location-marker" className="w-10 h-10 text-primary" />
              The Celebration
            </h3>
            <p className="text-lg text-on-surface-variant mb-8 leading-relaxed">
              Join us for an evening of dancing, dining, and joy at the Abbotsford Convent. We&apos;ve
              chosen this spot for its winding gardens and beautiful historic architecture.
            </p>
            <div className="space-y-3 font-headline font-bold text-xl text-on-surface">
              <p className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                Abbotsford Convent, Melbourne
              </p>
              <p className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                Arrival: 4:30 PM
              </p>
              <p className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                Ceremony: 5:00 PM
              </p>
            </div>
          </div>
          <div className="w-full lg:w-1/2 h-80 rounded-2xl overflow-hidden border-8 border-surface-container rotate-[-1deg]">
            <iframe
              src="https://www.google.com/maps?q=Abbotsford+Convent,+1+St+Heliers+St,+Abbotsford+VIC+3067,+Australia&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Abbotsford Convent Map"
            />
          </div>
        </div>

        <div className="md:col-span-3 bg-surface-container/30 p-8 rounded-3xl scrapbook-shadow border border-outline-variant/10 backdrop-blur-sm grid grid-cols-1 sm:grid-cols-2 gap-8 items-start">
          <div className="flex gap-4">
            <div className="bg-primary-container/30 p-3 rounded-xl h-fit rotate-[-5deg]">
              <DoodleIcon name="map" className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h5 className="font-headline font-extrabold text-lg text-on-surface mb-1">Parking</h5>
              <p className="text-sm text-on-surface-variant">
                Ample parking is available on-site at the convent main entrance.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="bg-primary-container/30 p-3 rounded-xl h-fit rotate-[8deg]">
              <DoodleIcon name="tag" className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h5 className="font-headline font-extrabold text-lg text-on-surface mb-1">Attire</h5>
              <p className="text-sm text-on-surface-variant">
                Cocktail attire. The ceremony is outdoors on grass, so choose footwear accordingly!
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function RsvpCard({ invitee, invalidCode, existingRsvp, rsvpClosed, deadlineLabel }: Props) {
  if (invalidCode) {
    return (
      <div className="text-center py-4">
        <h3 className="font-display text-3xl font-bold text-primary mb-3">
          Hmm — that link didn&apos;t work
        </h3>
        <p className="text-on-surface-variant text-lg">
          The invite code in your link wasn&apos;t recognised. Please check the link we sent you, or
          email us so we can sort it out.
        </p>
      </div>
    );
  }

  if (!invitee) {
    return (
      <div className="text-center py-4">
        <h3 className="font-display text-3xl font-bold text-primary mb-3">Are you coming?</h3>
        <p className="text-on-surface-variant text-lg">
          Please open the personal invite link we sent you to RSVP.
        </p>
      </div>
    );
  }

  if (rsvpClosed) {
    return (
      <div className="text-center py-4">
        <DoodleIcon name="heart" className="w-10 h-10 mx-auto mb-4 text-primary opacity-70" />
        <h3 className="font-display text-3xl font-bold text-primary mb-3">RSVPs have closed</h3>
        <p className="text-on-surface-variant text-lg leading-relaxed">
          {deadlineLabel
            ? `RSVPs closed on ${deadlineLabel}.`
            : "RSVPs are now closed."}{" "}
          If you still need to update your response, please get in touch with Ismene &amp; Hannah
          directly.
        </p>
        {existingRsvp && (
          <p className="text-on-surface-variant text-sm mt-6">
            We have your previous response on file —{" "}
            <span className="font-headline font-bold text-on-surface">
              {existingRsvp.attending
                ? `attending (${existingRsvp.attendees.length})`
                : "not attending"}
            </span>
            .
          </p>
        )}
      </div>
    );
  }

  return <RsvpForm invitee={invitee} existingRsvp={existingRsvp} deadlineLabel={deadlineLabel} />;
}

function RsvpForm({
  invitee,
  existingRsvp,
  deadlineLabel,
}: {
  invitee: Invitee;
  existingRsvp: ExistingRsvp | null;
  deadlineLabel: string | null;
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState(submitRsvp, initialRsvpState);
  // Refresh server data once after a successful RSVP so downstream sections
  // (the Notes composer, in particular) see the new RSVP and unlock without
  // requiring the guest to reload the page.
  const lastRefreshedRef = useRef<RsvpState | null>(null);
  useEffect(() => {
    if (state.status === "ok" && lastRefreshedRef.current !== state) {
      lastRefreshedRef.current = state;
      router.refresh();
    }
  }, [state, router]);
  const initialAttending: "yes" | "no" | null = existingRsvp
    ? existingRsvp.attending
      ? "yes"
      : "no"
    : null;
  const initialPartySize = existingRsvp && existingRsvp.attendees.length > 0
    ? Math.min(existingRsvp.attendees.length, invitee.maxPartySize)
    : 1;
  const [attending, setAttending] = useState<"yes" | "no" | null>(initialAttending);
  const [partySize, setPartySize] = useState<number>(initialPartySize);
  // Controlled inputs so the form survives validation re-renders
  // (React 19 auto-resets uncontrolled forms after action submit).
  const [attendees, setAttendees] = useState<string[]>(() =>
    Array.from({ length: invitee.maxPartySize }, (_, i) => existingRsvp?.attendees[i] ?? "")
  );
  const [email, setEmail] = useState<string>(existingRsvp?.email ?? "");
  const [dietary, setDietary] = useState<string>(existingRsvp?.dietary ?? "");
  const [editing, setEditing] = useState<boolean>(!existingRsvp);

  function setAttendeeAt(index: number, value: string) {
    setAttendees((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  if (state.status === "ok") {
    return (
      <div className="text-center py-8">
        <DoodleIcon name="heart" className="w-12 h-12 mb-4 mx-auto text-primary" />
        <p className="font-headline font-bold text-xl text-primary">Thank you!</p>
        <p className="text-on-surface-variant mt-2 mb-8">
          {state.mode === "updated"
            ? "We've updated your RSVP."
            : "We can't wait to celebrate with you."}
        </p>
        <a
          href="#notes"
          className="inline-flex items-center justify-center gap-2 bg-primary-container/40 text-on-surface font-headline font-extrabold py-3 px-6 rounded-full hover:scale-[1.03] active:scale-95 transition-all text-base border-2 border-primary/20"
        >
          Leave a note for us
          <span className="material-symbols-outlined text-lg">arrow_downward</span>
        </a>
      </div>
    );
  }

  if (existingRsvp && !editing) {
    return (
      <RsvpSummary
        existingRsvp={existingRsvp}
        deadlineLabel={deadlineLabel}
        onEdit={() => setEditing(true)}
      />
    );
  }

  const fieldErrors = state.status === "error" ? state.fieldErrors ?? {} : {};
  const showAttendeeFields = attending === "yes";
  const cappedPartySize = Math.min(partySize, invitee.maxPartySize);
  const nameSlots = Array.from({ length: cappedPartySize }, (_, i) => i);

  return (
    <div className="text-center">
      <h3 className="font-display text-4xl md:text-5xl font-bold text-primary mb-3">
        {existingRsvp ? "Update your RSVP" : "Are you coming?"}
      </h3>
      {!existingRsvp && (
        <p className="text-on-surface-variant mb-2 text-lg">
          Hi {invitee.household} —{" "}
          {deadlineLabel ? `please let us know by ${deadlineLabel}.` : "please let us know."}
        </p>
      )}

      <form className="space-y-6 text-left mt-8" action={action} noValidate>
        <input type="hidden" name="code" value={invitee.code} />
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          className="hidden"
          aria-hidden="true"
        />

        <fieldset className="space-y-3 py-2" aria-describedby="attending-error">
          <RadioOption
            name="attending"
            value="yes"
            required
            checked={attending === "yes"}
            onChange={() => setAttending("yes")}
          >
            Joyfully Accept
          </RadioOption>
          <RadioOption
            name="attending"
            value="no"
            checked={attending === "no"}
            onChange={() => setAttending("no")}
          >
            Regretfully Decline
          </RadioOption>
          {fieldErrors.attending?.[0] && (
            <p id="attending-error" className="text-red-700 text-sm">
              {fieldErrors.attending[0]}
            </p>
          )}
        </fieldset>

        {showAttendeeFields && invitee.maxPartySize > 1 && (
          <Field
            label="How many will attend?"
            hint={`Your invite covers up to ${invitee.maxPartySize} ${invitee.maxPartySize === 1 ? "person" : "people"}.`}
          >
            <PartySizePills
              max={invitee.maxPartySize}
              value={cappedPartySize}
              onChange={setPartySize}
            />
          </Field>
        )}

        {showAttendeeFields && (
          <Field
            label={
              invitee.maxPartySize === 1
                ? "Your name"
                : cappedPartySize === 1
                  ? "Name"
                  : "Names of attending guests"
            }
            error={fieldErrors.attendees?.[0]}
          >
            <div
              className={
                cappedPartySize > 1
                  ? "grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3"
                  : "space-y-3"
              }
            >
              {nameSlots.map((index) => (
                <input
                  key={index}
                  className={inputClasses}
                  placeholder={
                    invitee.maxPartySize === 1
                      ? "Type here..."
                      : index === 0
                        ? "Your name"
                        : `Guest ${index + 1}`
                  }
                  type="text"
                  name="attendees"
                  required
                  maxLength={120}
                  autoComplete={index === 0 ? "name" : "off"}
                  value={attendees[index] ?? ""}
                  onChange={(e) => setAttendeeAt(index, e.target.value)}
                />
              ))}
            </div>
          </Field>
        )}

        <div
          className={
            showAttendeeFields ? "grid grid-cols-1 md:grid-cols-2 gap-6" : ""
          }
        >
          <Field
            label="Email"
            hint={
              attending === "no"
                ? "Optional — we'll only use this if we need to follow up."
                : "So we can send confirmation and event updates."
            }
            error={fieldErrors.email?.[0]}
          >
            <input
              className={inputClasses}
              placeholder="you@example.com"
              type="email"
              name="email"
              maxLength={320}
              required={showAttendeeFields}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>

          {showAttendeeFields && (
            <Field label="Dietary requirements" error={fieldErrors.dietary?.[0]}>
              <textarea
                className={`${inputClasses} resize-none`}
                placeholder="Allergies, intolerances, or preferences (optional)"
                name="dietary"
                maxLength={1000}
                rows={2}
                value={dietary}
                onChange={(e) => setDietary(e.target.value)}
              />
            </Field>
          )}
        </div>

        {state.status === "error" && state.code !== "VALIDATION" && (
          <p className="text-red-700 text-sm" role="alert" aria-live="polite">
            {state.message}
          </p>
        )}

        <button
          className="w-full bg-primary text-on-primary font-headline font-extrabold py-5 rounded-full shadow-xl hover:scale-[1.03] active:scale-95 transition-all flex justify-center items-center gap-3 group text-xl disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
          type="submit"
          disabled={pending}
        >
          {pending ? "Sending..." : existingRsvp ? "Update RSVP" : "Send RSVP"}
          {!pending && (
            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
              send
            </span>
          )}
        </button>
      </form>
    </div>
  );
}

function RadioOption({
  name,
  value,
  required,
  checked,
  onChange,
  children,
}: {
  name: string;
  value: string;
  required?: boolean;
  checked?: boolean;
  onChange?: () => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex items-center gap-4 cursor-pointer group select-none p-3 rounded-xl hover:bg-surface-container-low transition-colors">
      <input
        type="radio"
        name={name}
        value={value}
        required={required}
        checked={checked}
        onChange={onChange}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className="w-6 h-6 rounded-full border-2 border-outline-variant flex-shrink-0 transition-all peer-checked:border-primary peer-checked:bg-primary peer-checked:shadow-[inset_0_0_0_4px_var(--color-on-primary)] peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-surface-container-highest"
      />
      <span className="font-headline font-bold text-lg text-on-surface group-hover:text-primary peer-checked:text-primary transition-colors">
        {children}
      </span>
    </label>
  );
}

function PartySizePills({
  max,
  value,
  onChange,
}: {
  max: number;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div role="radiogroup" aria-label="Party size" className="flex flex-wrap gap-2">
      {Array.from({ length: max }, (_, i) => i + 1).map((n) => {
        const selected = n === value;
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(n)}
            className={`min-w-12 h-12 px-4 rounded-full font-headline font-extrabold text-lg transition-all border-2 ${
              selected
                ? "bg-primary text-on-primary border-primary shadow-md scale-105"
                : "bg-transparent text-on-surface border-outline-variant hover:border-primary hover:text-primary"
            }`}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}

function RsvpSummary({
  existingRsvp,
  deadlineLabel,
  onEdit,
}: {
  existingRsvp: ExistingRsvp;
  deadlineLabel: string | null;
  onEdit: () => void;
}) {
  const guestWord = existingRsvp.attendees.length === 1 ? "guest" : "guests";
  return (
    <div className="text-center">
      <h3 className="font-display text-4xl md:text-5xl font-bold text-primary mb-3">
        Your RSVP
      </h3>
      <p className="text-on-surface-variant text-lg mb-8">
        You&apos;ve already RSVP&apos;d
        {deadlineLabel ? ` — you can update your response any time before ${deadlineLabel}.` : "."}
      </p>

      <div className="mx-auto max-w-md bg-surface-container-low border border-primary/20 rounded-2xl p-6 text-left">
        {existingRsvp.attending ? (
          <>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="font-headline font-extrabold text-on-surface text-xl">
                Attending
              </span>
              <span className="text-on-surface-variant text-sm">
                · {existingRsvp.attendees.length} {guestWord}
              </span>
            </div>
            {existingRsvp.attendees.length > 0 && (
              <ul className="space-y-1 mb-4">
                {existingRsvp.attendees.map((name, i) => (
                  <li key={i} className="flex items-center gap-2 text-on-surface">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {name}
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <p className="font-headline font-extrabold text-on-surface text-xl mb-4">
            Not attending
          </p>
        )}
        {existingRsvp.email && (
          <p className="text-sm text-on-surface-variant break-all">
            <span className="font-headline font-bold uppercase tracking-wider text-xs text-on-surface-variant/80 mr-2">
              Email
            </span>
            {existingRsvp.email}
          </p>
        )}
        {existingRsvp.dietary && (
          <p className="text-sm text-on-surface-variant mt-2">
            <span className="font-headline font-bold uppercase tracking-wider text-xs text-on-surface-variant/80 mr-2">
              Dietary
            </span>
            {existingRsvp.dietary}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={onEdit}
        className="mt-8 inline-flex items-center justify-center gap-2 bg-primary text-on-primary font-headline font-extrabold py-4 px-10 rounded-full shadow-xl hover:scale-[1.03] active:scale-95 transition-all text-lg"
      >
        Edit RSVP
        <span className="material-symbols-outlined">edit</span>
      </button>
    </div>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-headline font-extrabold text-on-surface uppercase tracking-wider mb-2">
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-on-surface-variant mt-1">{hint}</p>}
      {error && <p className="text-red-700 text-sm mt-1">{error}</p>}
    </div>
  );
}
