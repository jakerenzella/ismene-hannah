"use client";

export default function Footer() {
  return (
    <footer className="w-full py-12 mt-20 bg-surface-container-low flex flex-col items-center gap-6 px-4 text-center">
      <div className="text-lg font-semibold text-primary font-headline">
        Ismene + Hannah
      </div>
      <div className="flex gap-8">
        <a
          className="font-body text-sm uppercase tracking-widest text-on-surface-variant hover:text-primary transition-all"
          href="#"
        >
          Registry
        </a>
        <a
          className="font-body text-sm uppercase tracking-widest text-on-surface-variant hover:text-primary transition-all"
          href="#"
        >
          Contact
        </a>
      </div>
      <div className="font-body text-sm uppercase tracking-widest text-on-surface-variant">
        27.07.27 &bull; Melbourne
      </div>
      <button
        className="mt-4 w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-all cursor-pointer"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <span className="material-symbols-outlined">arrow_upward</span>
      </button>
    </footer>
  );
}
