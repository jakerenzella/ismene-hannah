import DoodleIcon from "@/components/DoodleIcon";
import PayIdCopy from "@/components/PayIdCopy";

export default function Gift() {
  return (
    <section
      id="gift"
      className="py-16 px-6 max-w-3xl mx-auto relative scroll-mt-24"
    >
      <div className="bg-surface-container-lowest p-8 md:p-12 rounded-3xl scrapbook-shadow border-2 border-dashed border-secondary/30 handwritten-tilt text-center">
        <DoodleIcon
          name="heart"
          className="w-12 h-12 text-secondary mx-auto mb-4"
        />
        <h2 className="font-display text-4xl md:text-5xl font-bold text-secondary mb-4">
          A note on gifts
        </h2>
        <p className="text-lg text-on-surface-variant leading-relaxed mb-6 max-w-xl mx-auto">
          Honestly, no presents needed — your company on the day is more than
          enough. If you&apos;d still like to contribute something towards the
          honeymoon, our PayID is below.
        </p>
        <PayIdCopy
          display="0490 923 671"
          value="0490923671"
          label="PayID"
        />
      </div>
    </section>
  );
}
