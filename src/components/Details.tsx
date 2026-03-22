"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";

export default function Details() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <section className="py-32 px-6 max-w-7xl mx-auto relative" id="details">
      {/* Overlapping cloud sticker */}
      <div className="absolute -top-16 right-10 opacity-30 pointer-events-none z-0">
        <Image src="/assets/cloud.svg" alt="" width={176} height={176} className="w-44 h-auto" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative z-10">
        {/* Venue Card */}
        <div className="md:col-span-2 bg-surface-container-lowest p-8 md:p-14 rounded-3xl scrapbook-shadow flex flex-col lg:flex-row gap-10 items-center border border-primary-container/10">
          <div className="w-full lg:w-1/2">
            <h3 className="font-display text-4xl font-bold text-primary mb-6 flex items-center gap-3">
              <Image src="/assets/doodle/location-marker.svg" alt="" width={40} height={40} className="w-10 h-10 doodle-icon-primary" />
              The Celebration
            </h3>
            <p className="text-lg text-on-surface-variant mb-8 leading-relaxed">
              Join us for an evening of dancing, dining, and joy at the
              Abbotsford Convent. We&apos;ve chosen this spot for its winding
              gardens and beautiful historic architecture.
            </p>
            <div className="space-y-3 font-headline font-bold text-xl text-on-surface">
              <p className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                Abbotsford Convent, Melbourne
              </p>
              <p className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                Arrival: 4:30 PM
              </p>
              <p className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                Ceremony: 5:00 PM
              </p>
            </div>
          </div>
          <div className="w-full lg:w-1/2 h-80 rounded-2xl overflow-hidden border-8 border-surface-container rotate-[-1deg]">
            <iframe
              src="https://www.google.com/maps?q=Abbotsford+Convent,+1+St+Heliers+St,+Abbotsford+VIC+3067,+Australia&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Abbotsford Convent Map"
            />
          </div>
        </div>

        {/* RSVP Form Card — taped note style */}
        <div
          className="bg-surface-container-highest p-10 md:p-12 rounded-3xl scrapbook-shadow relative border-2 border-dashed border-primary/30 handwritten-tilt-alt"
          id="rsvp"
        >
          {/* Tape sticker */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-10 w-24 opacity-80">
            <Image
              src="/assets/tape.svg"
              alt=""
              width={200}
              height={100}
              className="w-full h-auto"
            />
          </div>
          <div className="text-center">
            <h3 className="font-display text-4xl font-bold text-primary mb-3">
              Are you coming?
            </h3>
            <p className="text-on-surface-variant mb-10 text-lg">
              Please let us know by June 1st.
            </p>

            {submitted ? (
              <div className="py-8">
                <Image src="/assets/doodle/heart.svg" alt="" width={48} height={48} className="w-12 h-12 mb-4 mx-auto doodle-icon-primary" />
                <p className="font-headline font-bold text-xl text-primary">
                  Thank you!
                </p>
                <p className="text-on-surface-variant mt-2">
                  We can&apos;t wait to celebrate with you.
                </p>
              </div>
            ) : (
              <form className="space-y-6 text-left" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm font-headline font-extrabold text-on-surface uppercase tracking-wider mb-2">
                    Guest Name(s)
                  </label>
                  <input
                    className="w-full bg-transparent border-b-2 border-outline-variant focus:border-primary focus:ring-0 focus:outline-none transition-all px-0 py-3 text-lg placeholder:text-outline-variant/40"
                    placeholder="Type here..."
                    type="text"
                    required
                  />
                </div>
                <div className="space-y-4 py-4">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      className="w-6 h-6 accent-primary"
                      name="attendance"
                      type="radio"
                      value="accept"
                      required
                    />
                    <span className="font-headline font-bold text-lg group-hover:text-primary transition-colors">
                      Joyfully Accept
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      className="w-6 h-6 accent-primary"
                      name="attendance"
                      type="radio"
                      value="decline"
                    />
                    <span className="font-headline font-bold text-lg group-hover:text-primary transition-colors">
                      Regretfully Decline
                    </span>
                  </label>
                </div>
                <button
                  className="w-full bg-primary text-on-primary font-headline font-extrabold py-5 rounded-full shadow-xl hover:scale-[1.03] active:scale-95 transition-all flex justify-center items-center gap-3 group text-xl"
                  type="submit"
                >
                  Send RSVP
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                    send
                  </span>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Registry Card */}
        <div className="bg-secondary-container/20 p-10 rounded-3xl scrapbook-shadow border-2 border-secondary-container/40 flex flex-col items-center justify-center text-center handwritten-tilt">
          <Image src="/assets/doodle/shopping.svg" alt="" width={56} height={56} className="w-14 h-14 mb-6 doodle-icon-primary" />
          <h4 className="font-headline text-3xl font-bold text-secondary mb-4">
            Registry
          </h4>
          <p className="text-on-secondary-container text-lg mb-6 leading-relaxed">
            Your presence is our greatest gift, but if you&apos;d like to
            contribute to our future...
          </p>
          <a
            className="text-secondary font-extrabold text-xl underline hover:text-primary transition-colors decoration-2 underline-offset-4"
            href="#"
          >
            View Registry
          </a>
        </div>

        {/* Logistics Card */}
        <div className="md:col-span-2 bg-surface-container/30 p-10 rounded-3xl scrapbook-shadow border border-outline-variant/10 backdrop-blur-sm grid grid-cols-1 sm:grid-cols-2 gap-10 items-start">
          <div className="flex gap-5">
            <div className="bg-primary-container/30 p-4 rounded-2xl h-fit rotate-[-5deg]">
              <Image src="/assets/doodle/map.svg" alt="" width={56} height={56} className="w-14 h-14 doodle-icon-primary" />
            </div>
            <div>
              <h5 className="font-headline font-extrabold text-xl text-on-surface mb-2">
                Parking
              </h5>
              <p className="text-on-surface-variant">
                Ample parking is available on-site at the convent main entrance.
              </p>
            </div>
          </div>
          <div className="flex gap-5">
            <div className="bg-primary-container/30 p-4 rounded-2xl h-fit rotate-[8deg]">
              <Image src="/assets/doodle/tag.svg" alt="" width={56} height={56} className="w-14 h-14 doodle-icon-primary" />
            </div>
            <div>
              <h5 className="font-headline font-extrabold text-xl text-on-surface mb-2">
                Attire
              </h5>
              <p className="text-on-surface-variant">
                Cocktail attire. The ceremony is outdoors on grass, so choose
                footwear accordingly!
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
