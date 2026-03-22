import Image from "next/image";

export default function ScatteredStickers() {
  return (
    <>
      {/* Cloud — fixed top-left */}
      <div
        className="fixed top-20 -left-8 opacity-30 pointer-events-none z-0 sticker-float"
        style={{ "--sticker-rotate": "15deg" } as React.CSSProperties}
      >
        <Image src="/assets/cloud.svg" alt="" width={160} height={160} className="w-40 h-auto" />
      </div>

      {/* Heart — absolute right side, mid-page */}
      <div
        className="absolute top-[800px] -right-4 opacity-40 pointer-events-none z-0 sticker-float"
        style={{ "--sticker-rotate": "-10deg" } as React.CSSProperties}
      >
        <Image src="/assets/heart_2.svg" alt="" width={96} height={96} className="w-24 h-auto" />
      </div>

      {/* Star — absolute left side, lower mid-page */}
      <div
        className="absolute top-[1400px] left-10 opacity-30 pointer-events-none z-0 sticker-float"
        style={{ "--sticker-rotate": "45deg" } as React.CSSProperties}
      >
        <Image src="/assets/bubble-star.svg" alt="" width={112} height={112} className="w-28 h-auto" />
      </div>

      {/* Sparkle — absolute bottom-right area */}
      <div
        className="absolute bottom-[20%] right-[10%] opacity-20 pointer-events-none z-0 sticker-float"
        style={{ "--sticker-rotate": "-20deg" } as React.CSSProperties}
      >
        <Image src="/assets/sparkle.svg" alt="" width={144} height={144} className="w-36 h-auto" />
      </div>
    </>
  );
}
