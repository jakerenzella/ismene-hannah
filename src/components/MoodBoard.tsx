import Image from "next/image";
import { readdir } from "node:fs/promises";
import path from "node:path";

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);
// Cycle through these per-image so the grid feels handmade rather than mechanical.
const TILTS = ["-3deg", "2deg", "-1deg", "4deg", "-2deg", "3deg"];

async function loadMoodboardImages(): Promise<string[]> {
  const dir = path.join(process.cwd(), "public", "assets", "moodboard");
  try {
    const entries = await readdir(dir);
    return entries
      .filter((name) => IMAGE_EXTENSIONS.has(path.extname(name).toLowerCase()))
      .sort()
      .map((name) => `/assets/moodboard/${name}`);
  } catch {
    // Directory missing → no grid, fall through to vibe text only.
    return [];
  }
}

export default async function MoodBoard() {
  const images = await loadMoodboardImages();

  return (
    <section
      id="moodboard"
      className="py-24 px-6 max-w-7xl mx-auto relative scroll-mt-24"
    >
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h2 className="font-display text-5xl md:text-6xl font-bold text-primary mb-6 handwritten-tilt-alt">
          The Vibe
        </h2>
        <p className="text-lg md:text-xl text-on-surface-variant leading-relaxed">
          Late-summer Melbourne, dappled grass, terracotta and burgundy, dancing
          shoes you can stand in all night. Wear what makes you feel like
          yourself — bright colour very welcome.
        </p>
      </div>

      {images.length > 0 && (
        <div className="flex flex-wrap justify-center gap-6 md:gap-8">
          {images.map((src, i) => (
            <div
              key={src}
              className="bg-surface-container-lowest p-3 rounded-xl scrapbook-shadow"
              style={{ transform: `rotate(${TILTS[i % TILTS.length]})` }}
            >
              <Image
                src={src}
                alt=""
                width={400}
                height={400}
                sizes="(max-width: 768px) 50vw, 25vw"
                className="w-44 md:w-56 h-auto rounded-md"
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
