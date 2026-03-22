export default function ScatteredStickers() {
  return (
    <>
      {/* Cloud — fixed top-left */}
      <div
        className="fixed top-20 -left-8 text-primary-container/30 pointer-events-none z-0 sticker-float"
        style={{ "--sticker-rotate": "15deg" } as React.CSSProperties}
      >
        <span
          className="material-symbols-outlined text-[3840px]"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          cloud
        </span>
      </div>

      {/* Heart — absolute right side, mid-page */}
      <div
        className="absolute top-[800px] -right-4 text-tertiary-container/40 pointer-events-none z-0 sticker-float"
        style={{ "--sticker-rotate": "-10deg" } as React.CSSProperties}
      >
        <span
          className="material-symbols-outlined text-[2560px]"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          favorite
        </span>
      </div>

      {/* Star — absolute left side, lower mid-page */}
      <div
        className="absolute top-[1400px] left-10 text-secondary-container/30 pointer-events-none z-0 sticker-float"
        style={{ "--sticker-rotate": "45deg" } as React.CSSProperties}
      >
        <span
          className="material-symbols-outlined text-[3200px]"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          star
        </span>
      </div>

      {/* Fish — absolute bottom-right area */}
      <div
        className="absolute bottom-[20%] right-[10%] text-primary-container/20 pointer-events-none z-0 sticker-float"
        style={{ "--sticker-rotate": "-20deg" } as React.CSSProperties}
      >
        <span
          className="material-symbols-outlined text-[4480px]"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          set_meal
        </span>
      </div>
    </>
  );
}
