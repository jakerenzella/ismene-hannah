import DoodleIcon from "@/components/DoodleIcon";

const suburbs = [
  {
    name: "Brunswick",
    blurb:
      "Closest to the ceremony at Ceres. Plenty of Airbnbs and bars stretching down Sydney Rd and Lygon St.",
  },
  {
    name: "Northcote",
    blurb:
      "Walk-home territory from the reception. High St has the cafes, the bars, and the wine shops you want.",
  },
  {
    name: "Fitzroy",
    blurb:
      "Roughly 10 minutes by Uber to either venue. Busiest food and drinks scene if you fancy a big night out.",
  },
  {
    name: "Carlton",
    blurb:
      "Leafy and central, easy tram into the CBD. A short ride from both venues.",
  },
  {
    name: "Collingwood",
    blurb:
      "Restaurants, breweries, and quick to either venue. Good base if you’re staying a few extra nights.",
  },
  {
    name: "Thornbury",
    blurb:
      "Quieter, great cafes, walkable from the reception. Lovely if you’d rather a slower base.",
  },
];

export default function Travel() {
  return (
    <section
      id="travel"
      className="py-24 px-6 max-w-7xl mx-auto relative scroll-mt-24"
    >
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h2 className="font-display text-5xl md:text-6xl font-bold text-primary mb-6 handwritten-tilt">
          Coming from out of town?
        </h2>
        <p className="text-lg md:text-xl text-on-surface-variant leading-relaxed">
          Both venues are in Melbourne&apos;s inner north — Brunswick and
          Northcote sit a short walk apart. Here are a few suburbs to look at if
          you&apos;re booking somewhere to stay.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {suburbs.map((s, i) => (
          <div
            key={s.name}
            className={`bg-surface-container-lowest p-6 rounded-2xl scrapbook-shadow border border-outline-variant/10 ${
              i % 2 === 0 ? "handwritten-tilt" : "handwritten-tilt-alt"
            }`}
          >
            <h3 className="font-headline font-extrabold text-2xl text-primary mb-2">
              {s.name}
            </h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              {s.blurb}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-12 max-w-3xl mx-auto bg-surface-container/30 border border-outline-variant/20 rounded-2xl p-6 backdrop-blur-sm flex gap-4 items-start">
        <div className="bg-primary-container/30 p-3 rounded-xl rotate-[-5deg] flex-shrink-0">
          <DoodleIcon name="plane" className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h4 className="font-headline font-extrabold text-lg text-on-surface mb-1">
            Getting in from the airport
          </h4>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            The SkyBus from Melbourne (Tullamarine) runs to Southern Cross
            station every ~15 minutes; from there it&apos;s a quick tram or
            train ride to either venue. Ubers from the airport run roughly
            $50–80 depending on the time of day.
          </p>
        </div>
      </div>
    </section>
  );
}
