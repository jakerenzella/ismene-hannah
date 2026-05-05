"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import DoodleIcon from "@/components/DoodleIcon";
import { RsvpCard } from "@/components/RsvpForm";
import type { ExistingRsvp } from "@/lib/airtable";
import type { Invitee } from "@/lib/rsvp-schema";

type Props = {
  invitee: Invitee;
  existingRsvp: ExistingRsvp | null;
  rsvpClosed: boolean;
  deadlineLabel: string | null;
};

export default function HeroRsvp({
  invitee,
  existingRsvp,
  rsvpClosed,
  deadlineLabel,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Lock body scroll while drawer is open.
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  const status = describeStatus({ existingRsvp, rsvpClosed, deadlineLabel });

  return (
    <>
      <div className="relative mt-2 max-w-md">
        <div className="bg-surface-container-lowest scrapbook-shadow rounded-2xl border-2 border-dashed border-primary/30 px-6 py-5 handwritten-tilt-alt">
          <div className="flex items-start gap-3 mb-3">
            <DoodleIcon name="heart" className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <p className="font-headline font-extrabold text-xs uppercase tracking-wider text-primary/80">
                Hi {invitee.household}
              </p>
              <p className="font-headline font-extrabold text-lg md:text-xl text-on-surface leading-tight">
                {status.title}
              </p>
              {status.detail && (
                <p className="text-sm text-on-surface-variant mt-1">{status.detail}</p>
              )}
            </div>
          </div>
          {status.buttonLabel && (
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="w-full inline-flex items-center justify-center gap-2 bg-primary text-on-primary font-headline font-extrabold py-3 px-6 rounded-full shadow-md hover:scale-[1.03] active:scale-95 transition-all text-base group"
            >
              {status.buttonLabel}
              <span className="material-symbols-outlined text-lg group-hover:translate-x-0.5 transition-transform">
                arrow_forward
              </span>
            </button>
          )}
          {existingRsvp && (
            <a
              href="#notes"
              className="mt-3 w-full inline-flex items-center justify-center gap-2 bg-transparent text-on-surface font-headline font-extrabold py-3 px-6 rounded-full border-2 border-primary/30 hover:border-primary hover:text-primary active:scale-95 transition-all text-base group"
            >
              Leave a note
              <span className="material-symbols-outlined text-lg group-hover:translate-y-0.5 transition-transform">
                arrow_downward
              </span>
            </a>
          )}
        </div>
      </div>

      {isClient &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 bg-on-surface/50 z-[100]"
                  onClick={() => setIsOpen(false)}
                />

                <motion.div
                  role="dialog"
                  aria-modal="true"
                  aria-label="RSVP"
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: "100%", opacity: 0 }}
                  transition={{ type: "spring", damping: 28, stiffness: 220 }}
                  className="fixed inset-0 bg-surface-container-lowest z-[110] overflow-y-auto"
                  style={{
                    paddingTop: "env(safe-area-inset-top, 0px)",
                    paddingBottom: "env(safe-area-inset-bottom, 0px)",
                  }}
                >
                  <div className="sticky top-0 z-10 bg-surface-container-lowest/95 backdrop-blur-sm border-b border-on-surface/10">
                    <div className="flex items-center justify-between px-5 sm:px-6 py-4 max-w-2xl mx-auto">
                      <h2 className="font-display text-3xl text-primary handwritten-tilt">RSVP</h2>
                      <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="w-10 h-10 inline-flex items-center justify-center rounded-full text-on-surface-variant hover:text-primary hover:bg-primary-container/20 transition-colors cursor-pointer"
                        aria-label="Close RSVP"
                      >
                        <span className="material-symbols-outlined text-2xl leading-none">close</span>
                      </button>
                    </div>
                  </div>

                  <div className="px-5 sm:px-6 pt-6 pb-12 max-w-2xl mx-auto">
                    <RsvpCard
                      invitee={invitee}
                      invalidCode={false}
                      existingRsvp={existingRsvp}
                      rsvpClosed={rsvpClosed}
                      deadlineLabel={deadlineLabel}
                      onClose={() => setIsOpen(false)}
                    />
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}

function describeStatus({
  existingRsvp,
  rsvpClosed,
  deadlineLabel,
}: {
  existingRsvp: ExistingRsvp | null;
  rsvpClosed: boolean;
  deadlineLabel: string | null;
}): { title: string; detail: string | null; buttonLabel: string | null } {
  if (rsvpClosed) {
    if (existingRsvp) {
      const guestWord = existingRsvp.attendees.length === 1 ? "guest" : "guests";
      return {
        title: existingRsvp.attending
          ? `You're attending — ${existingRsvp.attendees.length} ${guestWord}`
          : "You've declined",
        detail: "RSVPs have closed. Get in touch with us to update your response.",
        buttonLabel: null,
      };
    }
    return {
      title: "RSVPs have closed",
      detail: deadlineLabel ? `Closed on ${deadlineLabel}.` : null,
      buttonLabel: null,
    };
  }

  if (!existingRsvp) {
    return {
      title: "You haven't RSVP'd yet",
      detail: deadlineLabel ? `Please RSVP by ${deadlineLabel}.` : null,
      buttonLabel: "RSVP Now",
    };
  }

  if (existingRsvp.attending) {
    const guestWord = existingRsvp.attendees.length === 1 ? "guest" : "guests";
    return {
      title: `You're attending — ${existingRsvp.attendees.length} ${guestWord}`,
      detail: deadlineLabel ? `You can update your response until ${deadlineLabel}.` : null,
      buttonLabel: "Update RSVP",
    };
  }

  return {
    title: "You've declined",
    detail: deadlineLabel ? `You can change your response until ${deadlineLabel}.` : null,
    buttonLabel: "Change response",
  };
}
