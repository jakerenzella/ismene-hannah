export default function Footer() {
  return (
    <footer className="w-full py-20 bg-surface-container-low/50 border-t border-primary-container/10 flex flex-col items-center gap-8 px-6 text-center">
      <div className="text-3xl font-bold text-primary font-headline tracking-tighter handwritten-tilt">
        Ismene + Hannah
      </div>
      <div className="font-body text-sm uppercase font-medium tracking-[0.3em] text-outline">
        27.02.27 &bull; Melbourne
      </div>
      <p className="font-body text-xs text-outline-variant">Website by Jake</p>
    </footer>
  );
}
