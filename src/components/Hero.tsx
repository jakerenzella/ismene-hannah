import Image from "next/image";
import Sticker from "@/components/Sticker";

export default function Hero() {
  return (
    <section className="px-6 md:px-12 max-w-7xl mx-auto mb-20">
      <div className="relative flex flex-col md:flex-row items-center gap-12 py-12">
        {/* Text */}
        <div className="w-full md:w-1/2 z-10">
          <div className="mb-6 handwritten-tilt inline-flex flex-col">
            <h1 id="hero-title" className="font-display text-5xl md:text-9xl text-primary leading-tight md:leading-24 tracking-tight font-bold">
              Ismene + Hannah
            </h1>
            <p className="font-display text-3xl md:text-4xl text-primary tracking-wide mt-0 md:mt-3 ml-6">
              (are getting married)
            </p>
          </div>
        </div>

        {/* Image */}
        <div className="w-full md:w-1/2 relative">
          {/* Date/location pill — scrapbook corner overlapping bottom-left of image */}
          <div className="absolute -bottom-6 -left-6 md:-left-12 z-20 bg-surface-container-lowest scrapbook-shadow px-8 py-4 rounded-full handwritten-tilt-alt border-2 border-secondary-container/40">
            <p className="font-headline text-xl md:text-2xl font-bold text-secondary whitespace-nowrap">
              27.07.27 &bull; Melbourne
            </p>
          </div>

          {/* Decorative heart */}
          <div className="absolute -top-10 -right-10 z-20">
            <Sticker
              src="/assets/heart.svg"
              width={96}
              height={96}
              className="w-24 h-24"
            />
          </div>

          <div
            className="rounded-xl scrapbook-shadow"
            style={{ transform: "rotate(2deg)" }}
          >
            <Image
              src="/assets/watercolour.png"
              alt="Ismene and Hannah"
              width={800}
              height={800}
              className="w-full h-auto rounded-md"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
