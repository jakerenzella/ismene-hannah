import Image from "next/image";
import DoodleIcon from "@/components/DoodleIcon";

export default function Details() {
  return (
    <section className="py-32 px-6 max-w-7xl mx-auto relative">
      <div className="absolute -top-16 right-10 opacity-30 pointer-events-none z-0">
        <Image src="/assets/cloud.svg" alt="" width={176} height={176} className="w-44 h-auto" />
      </div>

      <div id="details" className="relative z-10 scroll-mt-24">
        <div className="text-center mb-10 md:mb-12">
          <h2 className="font-display text-5xl md:text-6xl font-bold text-primary handwritten-tilt inline-block">
            Venues
          </h2>
          <p className="mt-3 text-on-surface-variant text-base md:text-lg max-w-xl mx-auto">
            Ceremony and reception are all within Melbourne&apos;s inner north.
          </p>
        </div>

        <div className="space-y-10 md:space-y-12">
          <VenueCard
            icon="location-marker"
            title="Ceremony"
            venue="The Village Green at Ceres, Brunswick"
            schedule={[
              "Arrive 4:00 PM",
              "Ceremony begins 4:30 PM",
            ]}
            intro="An outdoor ceremony on the grass at Ceres Environment Park."
            parking="Parking is limited but there are spaces on Stewart Street (via the main entrance) or Lee Street (via the side entrance)."
            mapSrc="https://www.google.com/maps?q=CERES+Community+Environment+Park,+Lee+St,+Brunswick+East+VIC+3057,+Australia&output=embed"
            mapTitle="CERES Environment Park map"
            mapTilt="-1deg"
          />

          <VenueCard
            icon="home"
            title="Reception"
            venue="Maharaja Palace, Northcote"
            schedule={["From 6:00 PM to 11:00 PM"]}
            intro="From Ceres, it's a 26 minute walk, 6 minute Uber, or 13 minute bus ride to Northcote for dinner, drinks, and dancing."
            parking="Parking is limited but there should be street parking on High St."
            mapSrc="https://www.google.com/maps?q=Maharaja+Palace,+Northcote+VIC,+Australia&output=embed"
            mapTitle="Maharaja Palace map"
            mapTilt="1deg"
            flipLayout
          />

          <div className="text-center max-w-3xl mx-auto px-4">
            <DoodleIcon name="star" className="w-10 h-10 text-primary mx-auto mb-3" />
            <h3 className="font-display text-3xl md:text-4xl font-bold text-primary mb-3 handwritten-tilt-alt inline-block">
              Afterparty (TBC)
            </h3>
            <p className="text-base md:text-lg text-on-surface-variant leading-relaxed">
              From <span className="font-headline font-bold text-on-surface">11pm till late</span>.
              We&apos;ll share the details closer to the day. Maybe karaoke?
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function VenueCard({
  icon,
  title,
  venue,
  schedule,
  intro,
  parking,
  mapSrc,
  mapTitle,
  mapTilt,
  flipLayout = false,
}: {
  icon: string;
  title: string;
  venue: string;
  schedule: string[];
  intro: string;
  parking?: string;
  mapSrc: string;
  mapTitle: string;
  mapTilt: string;
  flipLayout?: boolean;
}) {
  return (
    <div className="bg-surface-container-lowest p-6 md:p-12 rounded-3xl scrapbook-shadow flex flex-col lg:flex-row gap-8 lg:gap-10 items-center border border-primary-container/10">
      <div className={`w-full lg:w-1/2 ${flipLayout ? "lg:order-2" : ""}`}>
        <h3 className="font-display text-3xl md:text-4xl font-bold text-primary mb-5 flex items-center gap-3">
          <DoodleIcon name={icon} className="w-9 h-9 md:w-10 md:h-10 text-primary" />
          {title}
        </h3>
        <p className="text-base md:text-lg text-on-surface-variant mb-6 leading-relaxed">{intro}</p>
        <div className="space-y-2.5 font-headline font-bold text-lg md:text-xl text-on-surface">
          <p className="flex items-start gap-2">
            <span className="w-2 h-2 mt-2.5 rounded-full bg-primary flex-shrink-0" />
            <span>{venue}</span>
          </p>
          {schedule.map((line) => (
            <p key={line} className="flex items-start gap-2">
              <span className="w-2 h-2 mt-2.5 rounded-full bg-primary flex-shrink-0" />
              <span>{line}</span>
            </p>
          ))}
        </div>
        {parking && (
          <p className="mt-5 text-sm md:text-base text-on-surface-variant leading-relaxed">
            <span className="font-headline font-extrabold text-on-surface mr-1">Parking:</span>
            {parking}
          </p>
        )}
      </div>
      <div
        className={`w-full lg:w-1/2 h-64 md:h-80 rounded-2xl overflow-hidden border-4 md:border-8 border-surface-container ${flipLayout ? "lg:order-1" : ""}`}
        style={{ transform: `rotate(${mapTilt})` }}
      >
        <iframe
          src={mapSrc}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={mapTitle}
        />
      </div>
    </div>
  );
}
