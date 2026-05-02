const suburbs = [
  "Brunswick",
  "Northcote",
  "Fitzroy",
  "Carlton",
  "Collingwood",
  "Thornbury",
  "Preston",
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
          Both venues are in Melbourne&apos;s inner north. Here are a few suburbs to look at if
          you&apos;re booking somewhere to stay.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
        {suburbs.map((name, i) => (
          <span
            key={name}
            className={`bg-surface-container-lowest border border-primary/20 rounded-full px-5 py-2 font-headline font-bold text-lg text-primary scrapbook-shadow ${
              i % 2 === 0 ? "handwritten-tilt" : "handwritten-tilt-alt"
            }`}
          >
            {name}
          </span>
        ))}
      </div>

      <div className="mt-12 max-w-3xl mx-auto bg-surface-container/30 border border-outline-variant/20 rounded-2xl p-6 backdrop-blur-sm flex gap-4 items-start">
        <div className="bg-primary-container/30 p-3 rounded-xl rotate-[-5deg] flex-shrink-0 flex items-center justify-center">
          <span
            className="material-symbols-outlined text-primary text-[32px] leading-none"
            style={{ fontVariationSettings: '"FILL" 0, "wght" 700, "GRAD" 200' }}
          >
            flight
          </span>
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
