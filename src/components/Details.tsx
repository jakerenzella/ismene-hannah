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
    <section className="py-24 px-6 max-w-7xl mx-auto" id="details">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Venue Card */}
        <div className="md:col-span-2 bg-surface-container-lowest p-8 md:p-12 rounded-xl scrapbook-shadow flex flex-col md:flex-row gap-8 items-start border border-primary-container/10">
          <div className="w-full md:w-1/2">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-4xl text-secondary">
                location_on
              </span>
              <h3 className="font-display text-3xl font-bold text-primary">
                The Celebration
              </h3>
            </div>
            <p className="text-lg text-on-surface-variant mb-6">
              Join us for an evening of dancing, dining, and joy at the
              Abbotsford Convent. We&apos;ve chosen this spot for its winding
              gardens and beautiful historic architecture.
            </p>
            <div className="space-y-2 font-headline font-semibold text-on-surface">
              <p>Abbotsford Convent</p>
              <p>1 St Heliers St, Abbotsford VIC 3067</p>
              <p className="mt-4">Arrival: 4:30 PM</p>
              <p>Ceremony: 5:00 PM</p>
            </div>
          </div>
          <div className="w-full md:w-1/2 h-64 md:h-80 rounded-lg overflow-hidden border-4 border-surface-container">
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

        {/* RSVP Form Card */}
        <div
          className="bg-surface-container-highest p-8 md:p-12 rounded-xl scrapbook-shadow relative border-2 border-dashed border-primary/20"
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
            <h3 className="font-display text-3xl font-bold text-primary mb-2">
              Are you coming?
            </h3>
            <p className="text-on-surface-variant mb-8">
              Please let us know by June 1st.
            </p>

            {submitted ? (
              <div className="py-8">
                <span className="material-symbols-outlined text-5xl text-primary mb-4 block">
                  favorite
                </span>
                <p className="font-headline font-bold text-xl text-primary">
                  Thank you!
                </p>
                <p className="text-on-surface-variant mt-2">
                  We can&apos;t wait to celebrate with you.
                </p>
              </div>
            ) : (
              <form className="space-y-4 text-left" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm font-headline font-bold text-on-surface mb-1">
                    Guest Name(s)
                  </label>
                  <input
                    className="w-full bg-transparent border-b-2 border-outline-variant focus:border-primary focus:ring-0 focus:outline-none transition-all px-0 py-2 placeholder:text-outline-variant/50"
                    placeholder="Type here..."
                    type="text"
                    required
                  />
                </div>
                <div className="flex items-center gap-4 py-4">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      className="w-5 h-5 accent-primary"
                      name="attendance"
                      type="radio"
                      value="accept"
                      required
                    />
                    <span className="font-headline font-medium group-hover:text-primary transition-colors">
                      Joyfully Accept
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      className="w-5 h-5 accent-primary"
                      name="attendance"
                      type="radio"
                      value="decline"
                    />
                    <span className="font-headline font-medium group-hover:text-primary transition-colors">
                      Regretfully Decline
                    </span>
                  </label>
                </div>
                <button
                  className="w-full bg-primary text-on-primary font-headline font-bold py-4 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all flex justify-center items-center gap-2 cursor-pointer"
                  type="submit"
                >
                  Send RSVP
                  <span className="material-symbols-outlined">send</span>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Registry Card */}
        <div className="bg-secondary-container/30 p-8 rounded-xl scrapbook-shadow border-2 border-secondary-container/50 flex flex-col items-center justify-center text-center">
          <span className="material-symbols-outlined text-secondary text-5xl mb-4">
            card_giftcard
          </span>
          <h4 className="font-headline text-2xl font-bold text-secondary mb-2">
            Registry
          </h4>
          <p className="text-on-secondary-container mb-4">
            Your presence is our greatest gift, but if you&apos;d like to
            contribute to our future...
          </p>
          <a
            className="text-secondary font-bold underline hover:text-primary transition-colors"
            href="#"
          >
            View Registry
          </a>
        </div>

        {/* Logistics Card */}
        <div className="md:col-span-2 bg-white/40 p-8 rounded-xl scrapbook-shadow border border-outline-variant/20 backdrop-blur-sm grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex gap-4">
            <div className="bg-primary-container/20 p-3 rounded-full h-fit">
              <span className="material-symbols-outlined text-primary">
                directions_car
              </span>
            </div>
            <div>
              <h5 className="font-headline font-bold text-on-surface">
                Parking
              </h5>
              <p className="text-sm text-on-surface-variant">
                Ample parking is available on-site at the convent main entrance.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="bg-primary-container/20 p-3 rounded-full h-fit">
              <span className="material-symbols-outlined text-primary">
                local_bar
              </span>
            </div>
            <div>
              <h5 className="font-headline font-bold text-on-surface">
                Attire
              </h5>
              <p className="text-sm text-on-surface-variant">
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
