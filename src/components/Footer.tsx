"use client";

import DoodleIcon from "@/components/DoodleIcon";

export default function Footer() {
  return (
    <footer className="w-full py-20 bg-surface-container-low/50 border-t border-primary-container/10 flex flex-col items-center gap-8 px-6 text-center">
      <div className="text-3xl font-bold text-primary font-headline tracking-tighter handwritten-tilt">
        Ismene + Hannah
      </div>
      <div className="flex gap-10">
        <a
          className="font-body text-sm uppercase font-bold tracking-[0.2em] text-on-surface-variant hover:text-primary transition-all"
          href="#"
        >
          Registry
        </a>
        <a
          className="font-body text-sm uppercase font-bold tracking-[0.2em] text-on-surface-variant hover:text-primary transition-all"
          href="#"
        >
          Contact
        </a>
      </div>
      <div className="font-body text-sm uppercase font-medium tracking-[0.3em] text-outline">
        27.07.27 &bull; Melbourne
      </div>
      <button
        className="mt-8 w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 hover:scale-110 transition-all shadow-lg shadow-primary/5"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <DoodleIcon name="up-arrow" className="w-7 h-7 text-primary" />
      </button>
    </footer>
  );
}
