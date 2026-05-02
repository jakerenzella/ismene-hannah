import Image from "next/image";
import FishSwarm from "@/components/FishSwarm";

export default function OurStory({ code }: { code: string | null }) {
  return (
    <section className="bg-surface-container-low/50 py-16 relative scroll-mt-24" id="story">
      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        {/* Decorative fish */}
        <div className="mb-8 flex justify-center">
          <FishSwarm code={code}>
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
      </div>
    </section>
  );
}
