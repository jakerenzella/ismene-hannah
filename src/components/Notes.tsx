"use client";

import {
  useActionState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  deleteNoteAction,
  postNote,
  reactToNoteAction,
} from "@/app/actions/notes";
import { initialNoteFormState } from "@/app/actions/notes-state";
import type { Note } from "@/lib/airtable";
import Image from "next/image";
import {
  MAX_NOTES_PER_INVITEE,
  NOTE_COLOR_STYLES,
  NOTE_COLOR_VALUES,
  NOTE_AUTHOR_MAX,
  NOTE_MESSAGE_MAX,
  REACTION_EMOJI,
  REACTION_TYPES,
  tapeForId,
  tiltForId,
  type NoteColor,
  type ReactionType,
} from "@/lib/notes-schema";
import DoodleIcon from "@/components/DoodleIcon";

type Props = {
  notes: Note[];
  code: string | null;
  household: string | null;
  hasRsvp: boolean;
};

const SUGGESTIONS = [
  "share a favourite memory",
  "offer some advice",
  "make a wish for the day",
  "quote a song lyric",
  "describe their love in three words",
  "the best part of knowing them",
  "what you're most excited for",
  "a moment you'll never forget",
];

export default function Notes({ notes: initialNotes, code, household, hasRsvp }: Props) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const myNoteCount = useMemo(() => notes.filter((n) => n.mine).length, [notes]);

  // Memoised so passing them to children doesn't break effect-dependency comparisons.
  const handleDeleted = useCallback((noteId: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
  }, []);

  const handleCreated = useCallback((note: Note) => {
    setNotes((prev) => {
      // Idempotent: if the same note id is already on the wall, do nothing.
      if (prev.some((n) => n.id === note.id)) return prev;
      return [{ ...note, mine: true }, ...prev];
    });
  }, []);

  return (
    <section className="pt-8 md:pt-12 pb-24 px-6 max-w-7xl mx-auto scroll-mt-24" id="notes">
      <div className="text-center mb-12">
        <h2 className="font-display text-5xl md:text-6xl font-bold text-primary mb-3 handwritten-tilt">
          The Notes Wall
        </h2>
        <p className="text-on-surface-variant text-lg max-w-xl mx-auto">
          Leave a sweet message — visible to everyone with an invite. Memories, advice, song
          requests, anything.
        </p>
      </div>

      {code && (
        <div className="max-w-3xl mx-auto mb-16">
          <NoteComposer
            code={code}
            household={household ?? ""}
            hasRsvp={hasRsvp}
            myNoteCount={myNoteCount}
            onCreated={handleCreated}
          />
        </div>
      )}

      {notes.length === 0 ? (
        <p className="text-center text-on-surface-variant text-lg italic">
          No notes yet. Be the first!
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 px-3 pt-10">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} code={code} onDeleted={handleDeleted} />
          ))}
        </div>
      )}
    </section>
  );
}

// ---------- Composer ----------

function NoteComposer({
  code,
  household,
  hasRsvp,
  myNoteCount,
  onCreated,
}: {
  code: string;
  household: string;
  hasRsvp: boolean;
  myNoteCount: number;
  onCreated: (note: Note) => void;
}) {
  const [state, action, pending] = useActionState(postNote, initialNoteFormState);
  const formRef = useRef<HTMLFormElement>(null);
  // Tracks the id of the last successfully-handled note so the success effect
  // can fire side-effects exactly once per resolved action, even if its deps
  // (onCreated, household) churn for unrelated reasons.
  const lastHandledNoteIdRef = useRef<string | null>(null);

  // Initial colour is deterministic so SSR markup matches the first client render.
  // We randomise on mount in the effect below.
  const [authorName, setAuthorName] = useState(household);
  const [message, setMessage] = useState("");
  const [color, setColor] = useState<NoteColor>(NOTE_COLOR_VALUES[0]);

  useEffect(() => {
    setColor(NOTE_COLOR_VALUES[Math.floor(Math.random() * NOTE_COLOR_VALUES.length)]);
  }, []);

  const atLimit = myNoteCount >= MAX_NOTES_PER_INVITEE;

  // After successful post: confetti, reset, append to wall — exactly once.
  useEffect(() => {
    if (state.status !== "ok") return;
    if (lastHandledNoteIdRef.current === state.note.id) return;
    lastHandledNoteIdRef.current = state.note.id;
    onCreated(state.note);
    setMessage("");
    formRef.current?.reset();
    setColor(NOTE_COLOR_VALUES[Math.floor(Math.random() * NOTE_COLOR_VALUES.length)]);
    setAuthorName(household);
    fireConfetti();
  }, [state, onCreated, household]);

  if (!hasRsvp) {
    return (
      <div className="bg-surface-container-low border-2 border-dashed border-primary/30 rounded-3xl px-6 py-10 text-center scrapbook-shadow handwritten-tilt-alt">
        <DoodleIcon name="heart" className="w-10 h-10 mx-auto text-primary mb-3" />
        <p className="font-headline font-bold text-xl text-on-surface mb-1">
          You can leave a note once you&apos;ve RSVP&apos;d
        </p>
      </div>
    );
  }

  if (atLimit) {
    return (
      <div className="bg-surface-container-low border border-primary/20 rounded-3xl px-6 py-8 text-center scrapbook-shadow">
        <p className="font-headline font-bold text-on-surface">
          You&apos;ve left {MAX_NOTES_PER_INVITEE} notes — the limit.
        </p>
        <p className="text-on-surface-variant text-sm mt-1">
          Delete one below to leave another.
        </p>
      </div>
    );
  }

  const styles = NOTE_COLOR_STYLES[color];
  const fieldErrors = state.status === "error" ? state.fieldErrors ?? {} : {};
  const remaining = NOTE_MESSAGE_MAX - message.length;

  return (
    <form
      ref={formRef}
      action={action}
      noValidate
      className="rounded-2xl border-2 p-6 md:p-8 transition-colors shadow-lg"
      style={{ backgroundColor: styles.bg, borderColor: styles.ring }}
    >
      <input type="hidden" name="code" value={code} />
      <input type="hidden" name="color" value={color} />
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      <div className="flex items-center justify-between mb-4">
        <p className="font-headline font-extrabold uppercase tracking-wider text-sm" style={{ color: styles.ink }}>
          Leave a note
        </p>
        <p className="text-xs" style={{ color: styles.ink, opacity: 0.7 }}>
          {myNoteCount}/{MAX_NOTES_PER_INVITEE} used
        </p>
      </div>

      <SuggestionMarquee suggestions={SUGGESTIONS} ink={styles.ink} />

      <textarea
        name="message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={5}
        maxLength={NOTE_MESSAGE_MAX}
        placeholder="Type your note here…"
        className="w-full bg-white/40 focus:bg-white/60 border-0 outline-none rounded-[10px] p-4 text-lg resize-none transition-colors"
        style={{ color: styles.ink }}
        required
      />
      {fieldErrors.message?.[0] && (
        <p className="text-red-700 text-sm mt-1">{fieldErrors.message[0]}</p>
      )}
      <div className="text-right text-xs mt-1" style={{ color: styles.ink, opacity: 0.6 }}>
        {remaining} characters left
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-end">
        <div>
          <label className="block text-xs font-headline font-extrabold uppercase tracking-wider mb-2" style={{ color: styles.ink }}>
            From
          </label>
          <input
            type="text"
            name="authorName"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            maxLength={NOTE_AUTHOR_MAX}
            placeholder="Your name"
            className="w-full bg-white/40 focus:bg-white/60 border-0 outline-none rounded-[10px] p-3 text-base transition-colors"
            style={{ color: styles.ink }}
            required
          />
          {fieldErrors.authorName?.[0] && (
            <p className="text-red-700 text-sm mt-1">{fieldErrors.authorName[0]}</p>
          )}
        </div>

        <div>
          <p className="block text-xs font-headline font-extrabold uppercase tracking-wider mb-2" style={{ color: styles.ink }}>
            Colour
          </p>
          <div className="flex gap-2 flex-wrap">
            {NOTE_COLOR_VALUES.map((c) => {
              const s = NOTE_COLOR_STYLES[c];
              const selected = c === color;
              return (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  aria-label={`Colour: ${c}`}
                  aria-pressed={selected}
                  className={`w-9 h-9 rounded-full border-2 transition-transform ${
                    selected ? "scale-110 ring-2 ring-on-surface/30" : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: s.bg, borderColor: selected ? s.ink : s.ring }}
                />
              );
            })}
          </div>
        </div>
      </div>

      {state.status === "error" && state.code !== "VALIDATION" && (
        <p className="mt-4 text-red-700 text-sm" role="alert" aria-live="polite">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-6 w-full font-headline font-extrabold py-4 rounded-full shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex justify-center items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
        style={{ backgroundColor: styles.ink, color: styles.bg }}
      >
        {pending ? "Posting…" : "Post note"}
        {!pending && <span className="material-symbols-outlined">favorite</span>}
      </button>
    </form>
  );
}

// ---------- Suggestion marquee ----------

function SuggestionMarquee({ suggestions, ink }: { suggestions: string[]; ink: string }) {
  // Prepend an "Ideas:" lead-in once, then repeat the items twice for seamless looping.
  const sep = "  ·  ";
  const lead = "Ideas: ";
  const reel = lead + suggestions.join(sep);
  return (
    <div
      className="overflow-hidden mb-3"
      style={{
        maskImage:
          "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
      }}
      aria-hidden="true"
    >
      <div className="flex whitespace-nowrap" style={{ animation: "marquee 40s linear infinite" }}>
        <span
          className="font-display text-xl md:text-2xl pr-12"
          style={{ color: ink, opacity: 0.6 }}
        >
          {reel}
        </span>
        <span
          className="font-display text-xl md:text-2xl pr-12"
          style={{ color: ink, opacity: 0.6 }}
        >
          {reel}
        </span>
      </div>
    </div>
  );
}

// ---------- Note card ----------

function NoteCard({
  note,
  code,
  onDeleted,
}: {
  note: Note;
  code: string | null;
  onDeleted: (id: string) => void;
}) {
  const styles = NOTE_COLOR_STYLES[note.color] ?? NOTE_COLOR_STYLES.Peach;
  const tilt = tiltForId(note.id);
  const tape = tapeForId(note.id);
  const [deleting, startDeleteTransition] = useTransition();
  const [reactionCounts, setReactionCounts] = useState<Record<ReactionType, number>>({
    heart: note.hearts,
    sparkle: note.sparkles,
    laugh: note.laughs,
  });
  const [myReactions, setMyReactions] = useState<Set<ReactionType>>(new Set());

  // Hydrate "my reactions" from localStorage on mount.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(`note-reactions:${note.id}`);
      if (raw) {
        const parsed = JSON.parse(raw) as ReactionType[];
        setMyReactions(new Set(parsed.filter((t) => REACTION_TYPES.includes(t))));
      }
    } catch {
      /* ignore */
    }
  }, [note.id]);

  function handleReact(type: ReactionType) {
    if (!code) return;
    const isMine = myReactions.has(type);
    const delta: 1 | -1 = isMine ? -1 : 1;
    // Optimistic UI
    setReactionCounts((c) => ({ ...c, [type]: Math.max(0, c[type] + delta) }));
    setMyReactions((prev) => {
      const next = new Set(prev);
      if (isMine) next.delete(type);
      else next.add(type);
      try {
        window.localStorage.setItem(
          `note-reactions:${note.id}`,
          JSON.stringify(Array.from(next))
        );
      } catch {
        /* ignore */
      }
      return next;
    });
    reactToNoteAction(note.id, code, type, delta).then((res) => {
      if (!res.ok) {
        // Roll back optimistic change
        setReactionCounts((c) => ({ ...c, [type]: Math.max(0, c[type] - delta) }));
        setMyReactions((prev) => {
          const next = new Set(prev);
          if (isMine) next.add(type);
          else next.delete(type);
          try {
            window.localStorage.setItem(
              `note-reactions:${note.id}`,
              JSON.stringify(Array.from(next))
            );
          } catch {
            /* ignore */
          }
          return next;
        });
      }
    });
  }

  function handleDelete() {
    if (!code) return;
    if (!confirm("Delete this note?")) return;
    startDeleteTransition(async () => {
      const res = await deleteNoteAction(note.id, code);
      if (res.ok) onDeleted(note.id);
      else alert("Couldn't delete that note.");
    });
  }

  return (
    <div
      className="relative rounded-md p-5 md:p-6 flex flex-col h-64 border-2"
      style={{
        backgroundColor: styles.bg,
        borderColor: styles.ring,
        transform: `rotate(${tilt}deg)`,
        color: styles.ink,
        boxShadow: "0 8px 18px -6px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.08)",
      }}
    >
      {/* Tape strip — randomised angle/offset per note */}
      <div
        className="absolute -top-6 left-1/2 z-10 w-24 pointer-events-none opacity-90"
        style={{
          transform: `translateX(calc(-50% + ${tape.offset}px)) rotate(${tape.rotate}deg)`,
        }}
      >
        <Image
          src="/assets/tape.svg"
          alt=""
          width={200}
          height={100}
          className="w-full h-auto"
        />
      </div>

      <p className="font-display text-xl md:text-2xl leading-snug whitespace-pre-wrap break-words flex-1 overflow-hidden line-clamp-5 mb-3">
        {note.message}
      </p>

      <div className="flex items-end justify-between gap-3 mb-3">
        <p
          className="font-headline font-extrabold text-sm uppercase tracking-wider opacity-80 break-words flex-1 min-w-0"
        >
          — {note.authorName}
        </p>
        {note.mine && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            aria-label="Delete this note"
            className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full opacity-70 hover:opacity-100 hover:bg-black/10 transition-all disabled:opacity-40"
          >
            <span className="material-symbols-outlined text-xl">
              {deleting ? "hourglass_empty" : "delete"}
            </span>
          </button>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        {REACTION_TYPES.map((type) => {
          const count = reactionCounts[type];
          const reacted = myReactions.has(type);
          return (
            <button
              key={type}
              type="button"
              onClick={() => handleReact(type)}
              disabled={!code}
              aria-pressed={reacted}
              aria-label={`React with ${type}`}
              className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5 transition-all border-2 ${
                reacted
                  ? "bg-white border-current shadow-sm"
                  : "bg-white/85 border-transparent hover:bg-white"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <span
                aria-hidden="true"
                className="text-base"
                style={{ filter: "drop-shadow(0 0 1px rgba(0,0,0,0.25))" }}
              >
                {REACTION_EMOJI[type]}
              </span>
              {count > 0 && <span className="font-headline font-bold text-xs">{count}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------- Helpers ----------

const FELT_COLORS = ["#ff8fa4", "#ffc4b1", "#bb0006", "#ff7765", "#a03a0f", "#b70049", "#cce7f2", "#f0c040"];
const SHAPES = ["circle", "heart", "star"] as const;

/** Mini confetti burst centered on the screen — adapted from Sticker.tsx. */
function fireConfetti() {
  const x = window.innerWidth / 2;
  const y = window.innerHeight / 3;
  const count = 30 + Math.floor(Math.random() * 20);
  for (let i = 0; i < count; i++) createConfettiPiece(x, y);
}

function createConfettiPiece(x: number, y: number) {
  const el = document.createElement("div");
  const color = FELT_COLORS[Math.floor(Math.random() * FELT_COLORS.length)];
  const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  const size = 6 + Math.random() * 12;
  const angle = Math.random() * Math.PI * 2;
  const velocity = 100 + Math.random() * 200;
  const dx = Math.cos(angle) * velocity;
  const dy = Math.sin(angle) * velocity - 60;
  const rotation = Math.random() * 360;
  const duration = 700 + Math.random() * 700;

  el.style.position = "fixed";
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  el.style.width = `${size}px`;
  el.style.height = `${size}px`;
  el.style.pointerEvents = "none";
  el.style.zIndex = "9999";
  el.style.transform = `rotate(${rotation}deg)`;

  if (shape === "circle") {
    el.style.borderRadius = "50%";
    el.style.backgroundColor = color;
    el.style.boxShadow = `inset 0 0 ${size / 3}px rgba(0,0,0,0.1)`;
  } else if (shape === "heart") {
    el.innerHTML = `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="${color}"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;
  } else {
    el.innerHTML = `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="${color}"><path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7-6.3-4.6L5.7 21l2.3-7L2 9.4h7.6z"/></svg>`;
  }

  document.body.appendChild(el);

  const start = performance.now();

  function animate(now: number) {
    const t = (now - start) / duration;
    if (t >= 1 || now - start > 3500) {
      el.remove();
      return;
    }
    const ease = 1 - (1 - t) * (1 - t);
    const gravity = t * t * 140;
    el.style.left = `${x + dx * ease}px`;
    el.style.top = `${y + dy * ease + gravity}px`;
    el.style.opacity = `${1 - t * t}`;
    el.style.transform = `rotate(${rotation + t * 360}deg) scale(${1 - t * 0.3})`;
    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}
