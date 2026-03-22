import Image from "next/image";
import FishSwarm from "@/components/FishSwarm";

const milestones = [
  { icon: "/assets/doodle/heart.svg", label: "First Date", detail: "Fitzroy, 2022" },
  { icon: "/assets/doodle/home.svg", label: "New Home", detail: "Carlton, 2024" },
  { icon: "/assets/doodle/medal.svg", label: "The Yes!", detail: "Botanic Gardens, 2026" },
];

export default function OurStory() {
  return (
    <section className="bg-surface-container-low/50 py-16 relative" id="story">
      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        {/* Decorative fish */}
        <div className="mb-8 flex justify-center">
          <FishSwarm>
            <Image src="/assets/fish.svg" alt="" width={240} height={240} className="w-60 h-60" />
          </FishSwarm>
        </div>

        <h2 className="font-display text-5xl font-bold text-primary mb-10 handwritten-tilt">
          Our Story
        </h2>

        <div className="relative max-w-2xl mx-auto">
          {/* Ribbon sticker */}
          <div className="absolute -left-16 -top-4 hidden lg:block opacity-60 pointer-events-none">
            <Image src="/assets/ribbon.svg" alt="" width={80} height={80} className="w-20 h-auto rotate-[-20deg]" />
          </div>
          <p className="text-xl md:text-2xl leading-relaxed text-on-surface-variant font-body mb-12">
            It started with a shared love for Melbourne&apos;s hidden cafes and
            ended with a rainy afternoon proposal in the Royal Botanic Gardens.
            From our first date to this moment, every chapter of our journey has
            been filled with laughter, art, and enough coffee to fuel a small city.
            We can&apos;t wait to write our next chapter with you.
          </p>
        </div>

        {/* Timeline cards */}
        <div className="flex flex-wrap justify-center gap-8 mt-16">
          {milestones.map((m, i) => (
            <div
              key={m.label}
              className={`bg-surface-container-lowest p-8 rounded-2xl scrapbook-shadow w-56 border border-outline-variant/10 ${
                i % 2 === 0 ? "handwritten-tilt" : "handwritten-tilt-alt"
              }`}
            >
              <Image src={m.icon} alt="" width={40} height={40} className="w-10 h-10 mb-3 mx-auto doodle-icon-primary" />
              <p className="font-headline font-bold text-xl text-on-surface">
                {m.label}
              </p>
              <p className="text-sm text-on-surface-variant mt-1">{m.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
