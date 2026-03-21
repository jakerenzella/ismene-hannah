"use client";

import Image from "next/image";
import { useCallback, type MouseEvent } from "react";

const FELT_COLORS = [
  "#ff8fa4", // pink (tertiary-container)
  "#ffc4b1", // peach (secondary-container)
  "#bb0006", // red (primary)
  "#ff7765", // coral (primary-container)
  "#a03a0f", // burnt orange (secondary)
  "#b70049", // magenta (tertiary)
  "#cce7f2", // sky blue (surface-container-high)
  "#f0c040", // gold
];

const SHAPES = ["circle", "heart", "star"] as const;

function createConfettiPiece(x: number, y: number) {
  const el = document.createElement("div");
  const color = FELT_COLORS[Math.floor(Math.random() * FELT_COLORS.length)];
  const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  const size = 6 + Math.random() * 10;
  const angle = Math.random() * Math.PI * 2;
  const velocity = 80 + Math.random() * 160;
  const dx = Math.cos(angle) * velocity;
  const dy = Math.sin(angle) * velocity - 40;
  const rotation = Math.random() * 360;
  const duration = 600 + Math.random() * 600;

  el.style.position = "fixed";
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  el.style.width = `${size}px`;
  el.style.height = `${size}px`;
  el.style.pointerEvents = "none";
  el.style.zIndex = "9999";
  el.style.transform = `rotate(${rotation}deg)`;

  if (shape === "circle") {
    el.style.borderRadius = "50%";
    el.style.backgroundColor = color;
    // Felt texture: slightly rough edge via box-shadow
    el.style.boxShadow = `inset 0 0 ${size / 3}px rgba(0,0,0,0.1)`;
  } else if (shape === "heart") {
    el.innerHTML = `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="${color}"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;
  } else {
    el.innerHTML = `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="${color}"><path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7-6.3-4.6L5.7 21l2.3-7L2 9.4h7.6z"/></svg>`;
  }

  document.body.appendChild(el);

  const start = performance.now();

  function animate(now: number) {
    const t = (now - start) / duration;
    if (t >= 1) {
      el.remove();
      return;
    }
    const ease = 1 - (1 - t) * (1 - t); // ease-out quad
    const gravity = t * t * 120;
    el.style.left = `${x + dx * ease}px`;
    el.style.top = `${y + dy * ease + gravity}px`;
    el.style.opacity = `${1 - t * t}`;
    el.style.transform = `rotate(${rotation + t * 360}deg) scale(${1 - t * 0.3})`;
    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}

interface StickerProps {
  src: string;
  alt?: string;
  width: number;
  height: number;
  className?: string;
}

export default function Sticker({
  src,
  alt = "",
  width,
  height,
  className,
}: StickerProps) {
  const handleClick = useCallback((e: MouseEvent) => {
    const count = 20 + Math.floor(Math.random() * 15);
    for (let i = 0; i < count; i++) {
      createConfettiPiece(e.clientX, e.clientY);
    }
  }, []);

  return (
    <button
      onClick={handleClick}
      className="cursor-pointer border-0 bg-transparent p-0 transition-transform hover:scale-110 active:scale-95"
      aria-label="Click for confetti!"
    >
      <Image src={src} alt={alt} width={width} height={height} className={className} />
    </button>
  );
}
