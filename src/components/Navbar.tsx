"use client";

import { useState } from "react";
import BackgroundMusic from "@/components/BackgroundMusic";

export default function Navbar({ showNotes = false }: { showNotes?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md shadow-sm shadow-surface-container/50">
      <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
        <a
          className="text-2xl font-bold tracking-tighter text-primary font-headline"
          style={{ transform: "rotate(-1deg)" }}
          href="#"
        >
          Ismene + Hannah
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex gap-8 items-center">
          <a
            className="font-headline tracking-tight text-lg text-on-surface-variant hover:text-primary transition-colors"
            href="#story"
          >
            Our Story
          </a>
          <a
            className="font-headline tracking-tight text-lg text-on-surface-variant hover:text-primary transition-colors"
            href="#details"
          >
            Details
          </a>
          <a
            className="font-headline tracking-tight text-lg text-primary font-bold border-b-2 border-primary pb-1"
            href="#rsvp"
          >
            RSVP
          </a>
          <a
            className="font-headline tracking-tight text-lg text-on-surface-variant hover:text-primary transition-colors"
            href="#moodboard"
          >
            Mood board
          </a>
          <a
            className="font-headline tracking-tight text-lg text-on-surface-variant hover:text-primary transition-colors"
            href="#travel"
          >
            Travel
          </a>
          {showNotes && (
            <a
              className="font-headline tracking-tight text-lg text-on-surface-variant hover:text-primary transition-colors"
              href="#notes"
            >
              Notes wall
            </a>
          )}
          <BackgroundMusic />
        </div>

        {/* Mobile controls */}
        <div className="md:hidden flex items-center gap-2">
          <BackgroundMusic />
          <button
            className="text-primary text-2xl p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? "\u2715" : "\u2630"}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden px-6 pb-4 flex flex-col gap-4 bg-surface/95 backdrop-blur-md">
          <a
            className="font-headline text-lg text-on-surface-variant hover:text-primary transition-colors"
            href="#story"
            onClick={() => setMenuOpen(false)}
          >
            Our Story
          </a>
          <a
            className="font-headline text-lg text-on-surface-variant hover:text-primary transition-colors"
            href="#details"
            onClick={() => setMenuOpen(false)}
          >
            Details
          </a>
          <a
            className="font-headline text-lg text-primary font-bold"
            href="#rsvp"
            onClick={() => setMenuOpen(false)}
          >
            RSVP
          </a>
          <a
            className="font-headline text-lg text-on-surface-variant hover:text-primary transition-colors"
            href="#moodboard"
            onClick={() => setMenuOpen(false)}
          >
            Mood board
          </a>
          <a
            className="font-headline text-lg text-on-surface-variant hover:text-primary transition-colors"
            href="#travel"
            onClick={() => setMenuOpen(false)}
          >
            Travel
          </a>
          {showNotes && (
            <a
              className="font-headline text-lg text-on-surface-variant hover:text-primary transition-colors"
              href="#notes"
              onClick={() => setMenuOpen(false)}
            >
              Notes wall
            </a>
          )}
        </div>
      )}
    </nav>
  );
}
