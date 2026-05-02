import Image from "next/image";
import FishSwarm from "@/components/FishSwarm";

export default function OurStory({ code }: { code: string | null }) {
  return (
    <section className="bg-surface-container-low/50 py-16 relative scroll-mt-24" id="story">
      <div className="max-w-4xl lg:max-w-5xl mx-auto px-6 text-center relative z-10">
        {/* Decorative fish */}
        <div className="mb-8 flex justify-center">
          <FishSwarm code={code}>
            <Image src="/assets/fish.svg" alt="" width={240} height={240} className="w-60 h-60" />
          </FishSwarm>
        </div>

        <h2 className="font-display text-5xl font-bold text-primary mb-10 handwritten-tilt">
          Our Wedding
        </h2>

        <div className="relative max-w-2xl lg:max-w-4xl mx-auto">
          {/* Ribbon sticker */}
          <div className="absolute -left-16 -top-4 hidden lg:block opacity-60 pointer-events-none">
            <Image src="/assets/ribbon.svg" alt="" width={80} height={80} className="w-20 h-auto rotate-[-20deg]" />
          </div>
          <p
            className="text-[1.3rem] md:text-[1.8rem] lg:text-[2.4rem] leading-[115%] text-on-surface-variant mb-12 px-4"
            style={{ fontFamily: "'Esteban', serif", letterSpacing: "-0.05em" }}
          >
            After 10 years together, we are excited to celebrate our wedding
            with our most cherished family and friends. Our wedding is inspired
            by old Hollywood glamour meets Muriel’s Wedding, so expect
            surprises, melodrama and maximalism. Wear whatever sets your soul
            on fire, whether it be your Sunday best or a white wedding dress
            (we won’t be, so you won’t upstage us). Don’t feel limited by our
            mood board, we just want everyone to have fun. As they say, to be
            forewarned is to be forearmed.
          </p>
        </div>
      </div>
    </section>
  );
}
