import Image from "next/image";
import Sticker from "@/components/Sticker";
import HeroRsvp from "@/components/HeroRsvp";
import type { ExistingRsvp } from "@/lib/airtable";
import type { Invitee } from "@/lib/rsvp-schema";

type Props = {
  invitee: Invitee | null;
  invalidCode: boolean;
  existingRsvp: ExistingRsvp | null;
  rsvpClosed: boolean;
  deadlineLabel: string | null;
};

export default function Hero({ invitee, invalidCode, existingRsvp, rsvpClosed, deadlineLabel }: Props) {
  return (
    <section className="px-6 md:px-12 max-w-7xl mx-auto mb-20">
      <div className="relative flex flex-col md:flex-row items-center gap-12 py-12">
        {/* Text */}
        <div className="w-full md:w-1/2 z-10">
          <div className="mb-6 handwritten-tilt inline-flex flex-col">
            <h1
              id="hero-title"
              className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl text-primary leading-tight lg:leading-24 tracking-tight font-bold"
            >
              <span className="whitespace-nowrap">Ismene +</span> Hannah
            </h1>
            <p className="font-display text-2xl sm:text-3xl md:text-3xl lg:text-4xl text-primary tracking-wide mt-0 md:mt-3 ml-4 sm:ml-6 whitespace-nowrap">
              (are getting married)
            </p>
          </div>
          {invitee && (
            <HeroRsvp
              invitee={invitee}
              existingRsvp={existingRsvp}
              rsvpClosed={rsvpClosed}
              deadlineLabel={deadlineLabel}
            />
          )}
          {!invitee && invalidCode && (
            <div className="mt-2 max-w-md bg-surface-container-lowest scrapbook-shadow rounded-2xl border-2 border-dashed border-primary/30 px-6 py-5 handwritten-tilt-alt">
              <p className="font-headline font-extrabold text-base text-on-surface mb-1">
                Hmm — that invite link didn&apos;t work.
              </p>
              <p className="text-sm text-on-surface-variant">
                The code in your link wasn&apos;t recognised. Please check the link we sent you, or
                email us so we can sort it out.
              </p>
            </div>
          )}
        </div>

        {/* Image */}
        <div className="w-full md:w-1/2 relative">
          {/* Date/location pill — scrapbook corner overlapping bottom-left of image */}
          <div className="absolute -bottom-6 -left-6 md:-left-12 z-20 bg-surface-container-lowest scrapbook-shadow px-8 py-4 rounded-full handwritten-tilt-alt border-2 border-secondary-container/40">
            <p className="font-headline text-xl md:text-2xl font-bold text-secondary whitespace-nowrap">
              27.02.27 &bull; Melbourne
            </p>
          </div>

          {/* Decorative heart */}
          <div className="absolute -top-4 -right-2 md:-top-10 md:-right-10 z-20">
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
              width={1920}
              height={2773}
              sizes="(max-width: 768px) 92vw, (max-width: 1280px) 46vw, 600px"
              className="w-full h-auto rounded-md"
              priority
              fetchPriority="high"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
