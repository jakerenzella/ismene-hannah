"use client";

import { useState } from "react";
import BackgroundMusic from "@/components/BackgroundMusic";

export default function Navbar({ showNotes = false }: { showNotes?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md shadow-sm shadow-surface-container/50">
      <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
        <a
          className="text-3xl md:text-4xl font-bold text-primary font-display whitespace-nowrap"
          style={{ transform: "rotate(-1deg)" }}
          href="#"
        >
          Ismene + Hannah
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex gap-4 lg:gap-8 items-center">
          <a
            className="font-display font-bold text-2xl text-on-surface-variant hover:text-primary transition-colors whitespace-nowrap"
            href="#story"
          >
            Wedding
          </a>
          <a
            className="font-display font-bold text-2xl text-on-surface-variant hover:text-primary transition-colors whitespace-nowrap"
            href="#details"
          >
            Details
          </a>
          <a
            className="font-display font-bold text-2xl text-on-surface-variant hover:text-primary transition-colors whitespace-nowrap"
            href="#moodboard"
          >
            Dress code
          </a>
          <a
            className="font-display font-bold text-2xl text-on-surface-variant hover:text-primary transition-colors whitespace-nowrap"
            href="#travel"
          >
            Travel
          </a>
          <a
            className="font-display font-bold text-2xl text-on-surface-variant hover:text-primary transition-colors whitespace-nowrap"
            href="#faqs"
          >
            FAQs
          </a>
          {showNotes && (
            <a
              className="font-display font-bold text-2xl text-on-surface-variant hover:text-primary transition-colors whitespace-nowrap"
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
            className="font-display font-bold text-2xl text-on-surface-variant hover:text-primary transition-colors whitespace-nowrap"
            href="#story"
            onClick={() => setMenuOpen(false)}
          >
            Wedding
          </a>
          <a
            className="font-display font-bold text-2xl text-on-surface-variant hover:text-primary transition-colors whitespace-nowrap"
            href="#details"
            onClick={() => setMenuOpen(false)}
          >
            Details
          </a>
          <a
            className="font-display font-bold text-2xl text-on-surface-variant hover:text-primary transition-colors whitespace-nowrap"
            href="#moodboard"
            onClick={() => setMenuOpen(false)}
          >
            Dress code
          </a>
          <a
            className="font-display font-bold text-2xl text-on-surface-variant hover:text-primary transition-colors whitespace-nowrap"
            href="#travel"
            onClick={() => setMenuOpen(false)}
          >
            Travel
          </a>
          <a
            className="font-display font-bold text-2xl text-on-surface-variant hover:text-primary transition-colors whitespace-nowrap"
            href="#faqs"
            onClick={() => setMenuOpen(false)}
          >
            FAQs
          </a>
          {showNotes && (
            <a
              className="font-display font-bold text-2xl text-on-surface-variant hover:text-primary transition-colors whitespace-nowrap"
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
