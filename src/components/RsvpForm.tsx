"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import DoodleIcon from "@/components/DoodleIcon";
import { submitRsvp } from "@/app/actions/rsvp";
import { initialRsvpState, type RsvpState } from "@/app/actions/rsvp-state";
import type { ExistingRsvp } from "@/lib/airtable";
import type { Invitee } from "@/lib/rsvp-schema";

const inputClasses =
  "w-full bg-transparent border-b-2 border-outline-variant focus:border-primary focus:ring-0 focus:outline-none transition-all px-0 py-3 text-lg text-on-surface placeholder:text-on-surface-variant/70";

type CardProps = {
  invitee: Invitee | null;
  invalidCode: boolean;
  existingRsvp: ExistingRsvp | null;
  rsvpClosed: boolean;
  deadlineLabel: string | null;
  /** Optional: when set, the success state shows a "Close" button that calls this. */
  onClose?: () => void;
};

export function RsvpCard({
  invitee,
  invalidCode,
  existingRsvp,
  rsvpClosed,
  deadlineLabel,
  onClose,
}: CardProps) {
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

  return (
    <RsvpForm
      invitee={invitee}
      existingRsvp={existingRsvp}
      deadlineLabel={deadlineLabel}
      onClose={onClose}
    />
  );
}

export function RsvpForm({
  invitee,
  existingRsvp,
  deadlineLabel,
  onClose,
}: {
  invitee: Invitee;
  existingRsvp: ExistingRsvp | null;
  deadlineLabel: string | null;
  onClose?: () => void;
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
  const [dietaries, setDietaries] = useState<string[]>(() =>
    Array.from({ length: invitee.maxPartySize }, (_, i) => existingRsvp?.dietaries[i] ?? "")
  );
  const [songRequests, setSongRequests] = useState<string>(existingRsvp?.songRequests ?? "");
  const [editing, setEditing] = useState<boolean>(!existingRsvp);

  function setAttendeeAt(index: number, value: string) {
    setAttendees((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  function setDietaryAt(index: number, value: string) {
    setDietaries((prev) => {
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
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center justify-center gap-2 bg-primary text-on-primary font-headline font-extrabold py-3 px-8 rounded-full shadow-md hover:scale-[1.03] active:scale-95 transition-all text-base"
        >
          Close
        </button>
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
    <div>
      <h3 className="font-display text-3xl md:text-4xl font-bold text-primary mb-2 text-center">
        {existingRsvp ? "Update your RSVP" : "Are you coming?"}
      </h3>
      {!existingRsvp && (
        <p className="text-on-surface-variant mb-4 text-base text-center">
          Hi {invitee.household} — please let us know below.
        </p>
      )}
      {deadlineLabel && (
        <p className="text-xs text-on-surface-variant text-center uppercase tracking-wider mb-5 font-headline font-extrabold">
          Please RSVP by {deadlineLabel}
        </p>
      )}

      <form className="space-y-5 text-left mt-4" action={action} noValidate>
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
                ? "Your name & dietary needs"
                : cappedPartySize === 1
                  ? "Name & dietary needs"
                  : "Each guest"
            }
            hint="Add dietary requirements per guest (optional)."
            error={fieldErrors.attendees?.[0]}
          >
            <div
              className={
                cappedPartySize > 1
                  ? "grid grid-cols-1 md:grid-cols-2 gap-4"
                  : "space-y-4"
              }
            >
              {nameSlots.map((index) => (
                <div
                  key={index}
                  className="bg-surface-container-low/60 border border-outline-variant/40 rounded-2xl p-4"
                >
                  <input
                    className={inputClasses}
                    placeholder={
                      invitee.maxPartySize === 1
                        ? "Your name"
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
                  <input
                    className={`${inputClasses} mt-1 text-base`}
                    placeholder="Dietary needs (optional)"
                    type="text"
                    name="dietaries"
                    maxLength={500}
                    autoComplete="off"
                    value={dietaries[index] ?? ""}
                    onChange={(e) => setDietaryAt(index, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </Field>
        )}

        {showAttendeeFields && (
          <Field
            label="Song requests"
            hint="Anything we have to play? (Optional)"
            error={fieldErrors.songRequests?.[0]}
          >
            <textarea
              className={`${inputClasses} resize-none`}
              placeholder="The dancefloor demands…"
              name="songRequests"
              maxLength={500}
              rows={2}
              value={songRequests}
              onChange={(e) => setSongRequests(e.target.value)}
            />
          </Field>
        )}

        {state.status === "error" && state.code !== "VALIDATION" && (
          <p className="text-red-700 text-sm" role="alert" aria-live="polite">
            {state.message}
          </p>
        )}

        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
          {existingRsvp && (
            <button
              type="button"
              onClick={() => {
                setAttending(initialAttending);
                setPartySize(initialPartySize);
                setAttendees(
                  Array.from({ length: invitee.maxPartySize }, (_, i) => existingRsvp.attendees[i] ?? "")
                );
                setDietaries(
                  Array.from({ length: invitee.maxPartySize }, (_, i) => existingRsvp.dietaries[i] ?? "")
                );
                setSongRequests(existingRsvp.songRequests ?? "");
                setEditing(false);
              }}
              className="sm:flex-1 bg-transparent text-on-surface font-headline font-extrabold py-4 rounded-full border-2 border-outline-variant hover:border-primary hover:text-primary active:scale-95 transition-all text-base sm:text-lg"
            >
              Cancel
            </button>
          )}
          <button
            className="sm:flex-1 bg-primary text-on-primary font-headline font-extrabold py-4 rounded-full shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex justify-center items-center gap-3 group text-base sm:text-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
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
        </div>
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
  const songs = (existingRsvp.songRequests ?? "").trim();
  return (
    <div>
      <h3 className="font-display text-3xl md:text-4xl font-bold text-primary mb-5 text-center">
        Your RSVP
      </h3>

      <div
        className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5 ${
          existingRsvp.attending
            ? "bg-primary text-on-primary"
            : "bg-surface-container border border-outline-variant/40 text-on-surface"
        }`}
      >
        <span className="material-symbols-outlined text-lg leading-none">
          {existingRsvp.attending ? "check_circle" : "cancel"}
        </span>
        <span className="font-headline font-extrabold text-sm uppercase tracking-wider">
          {existingRsvp.attending
            ? `Attending · ${existingRsvp.attendees.length} ${guestWord}`
            : "Not attending"}
        </span>
      </div>

      {existingRsvp.attending && existingRsvp.attendees.length > 0 && (
        <div className="mb-5">
          <p className="font-headline font-extrabold text-xs uppercase tracking-wider text-on-surface-variant/80 mb-2">
            Guests
          </p>
          <ul className="space-y-3">
            {existingRsvp.attendees.map((name, i) => {
              const requirement = (existingRsvp.dietaries[i] ?? "").trim();
              const hasRequirement = requirement && requirement.toLowerCase() !== "n/a";
              return (
                <li
                  key={i}
                  className="bg-surface-container-low/60 border border-outline-variant/30 rounded-xl px-4 py-3"
                >
                  <p className="font-headline font-bold text-on-surface text-base">{name}</p>
                  {hasRequirement && (
                    <p className="text-sm text-on-surface-variant mt-0.5">{requirement}</p>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {songs && (
        <div className="mb-5">
          <p className="font-headline font-extrabold text-xs uppercase tracking-wider text-on-surface-variant/80 mb-2">
            Song requests
          </p>
          <p className="bg-surface-container-low/60 border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface text-base leading-relaxed">
            {songs}
          </p>
        </div>
      )}

      {deadlineLabel && (
        <p className="text-sm text-on-surface-variant text-center mb-5">
          You can update your response until {deadlineLabel}.
        </p>
      )}

      <button
        type="button"
        onClick={onEdit}
        className="w-full inline-flex items-center justify-center gap-2 bg-primary text-on-primary font-headline font-extrabold py-4 px-8 rounded-full shadow-xl hover:scale-[1.02] active:scale-95 transition-all text-lg"
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
