import Image from "next/image";

export default function Hero() {
  return (
    <section className="px-6 md:px-12 max-w-7xl mx-auto mb-20">
      <div className="relative flex flex-col md:flex-row items-center gap-12 py-12">
        {/* Text */}
        <div className="w-full md:w-1/2 z-10">
          <div className="mb-6 handwritten-tilt">
            <h1 className="font-display text-5xl md:text-7xl text-primary leading-tight tracking-tight">
              Ismene + Hannah
            </h1>
            <p className="font-display text-2xl md:text-3xl text-primary/70 tracking-wide -mt-1 text-center">
              (are getting married)
            </p>
          </div>
          <div className="inline-block bg-surface-container-lowest scrapbook-shadow px-6 py-3 rounded-lg handwritten-tilt-alt border-2 border-primary-container/20">
            <p className="font-headline text-2xl md:text-3xl font-bold text-secondary">
              27.07.27 &bull; Melbourne
            </p>
          </div>
        </div>

        {/* Image */}
        <div className="w-full md:w-1/2 relative">
          {/* Decorative heart */}
          <div className="absolute -bottom-10 -right-10 z-20">
            <Image
              src="/assets/heart.svg"
              alt=""
              width={96}
              height={96}
              className="w-24 h-24"
            />
          </div>

          <div
            className="rounded-xl scrapbook-shadow border-8 border-surface-container-lowest"
            style={{ transform: "rotate(2deg)" }}
          >
            <Image
              src="/assets/watercolour.png"
              alt="Ismene and Hannah"
              width={800}
              height={800}
              className="w-full h-auto rounded-lg"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
