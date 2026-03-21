import Image from "next/image";

const milestones = [
  { icon: "restaurant", label: "First Date", detail: "Fitzroy, 2022" },
  { icon: "home", label: "New Home", detail: "Carlton, 2024" },
  { icon: "diamond", label: "The Yes!", detail: "Botanic Gardens, 2026" },
];

export default function OurStory() {
  return (
    <section className="bg-surface-container-low py-24" id="story">
      <div className="max-w-4xl mx-auto px-6 text-center">
        {/* Decorative stars + heart */}
        <div className="mb-8 flex justify-center">
          <Image
            src="/assets/fish.svg"
            alt=""
            width={240}
            height={240}
            className="w-60 h-60"
          />
        </div>

        <h2 className="font-display text-4xl font-bold text-primary mb-8">
          Our Story
        </h2>

        <p className="text-xl md:text-2xl leading-relaxed text-on-surface-variant font-body mb-8">
          It started with a shared love for Melbourne&apos;s hidden cafes and
          ended with a rainy afternoon proposal in the Royal Botanic Gardens.
          From our first date to this moment, every chapter of our journey has
          been filled with laughter, art, and enough coffee to fuel a small city.
          We can&apos;t wait to write our next chapter with you.
        </p>

        {/* Timeline cards */}
        <div className="flex flex-wrap justify-center gap-6 mt-12">
          {milestones.map((m, i) => (
            <div
              key={m.label}
              className={`bg-surface-container-lowest p-6 rounded-lg scrapbook-shadow w-48 border border-outline-variant/20 ${
                i % 2 === 0 ? "handwritten-tilt" : "handwritten-tilt-alt"
              }`}
            >
              <span className="material-symbols-outlined text-primary mb-2 text-2xl block">
                {m.icon}
              </span>
              <p className="font-headline font-bold text-on-surface">
                {m.label}
              </p>
              <p className="text-sm text-on-surface-variant">{m.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
