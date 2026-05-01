"use client";

import Image from "next/image";
import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";

interface SwimmingFish {
  id: number;
  size: number;
  y: number;
  delay: number;
  duration: number;
  wiggleAmount: number;
  opacity: number;
  flip: boolean;
}

let fishId = 0;

export default function FishSwarm({
  children,
  code,
}: {
  children: React.ReactNode;
  code: string | null;
}) {
  const [fish, setFish] = useState<SwimmingFish[]>([]);
  const pendingClicksRef = useRef(0);

  // Periodic + lifecycle flush of pending click counts to /api/sardine.
  useEffect(() => {
    if (!code) return;

    function flush(useKeepalive: boolean) {
      const pending = pendingClicksRef.current;
      if (pending <= 0) return;
      pendingClicksRef.current = 0;
      fetch("/api/sardine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, count: pending }),
        keepalive: useKeepalive,
      }).catch((error) => {
        console.error("[sardine] flush failed", error);
      });
    }

    const interval = setInterval(() => flush(false), 3000);
    const handlePageHide = () => flush(true);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      clearInterval(interval);
      window.removeEventListener("pagehide", handlePageHide);
      flush(true); // last attempt on unmount / HMR
    };
  }, [code]);

  const spawnFish = useCallback(() => {
    if (code) pendingClicksRef.current += 1;

    const newFish: SwimmingFish[] = [];
    const count = 8 + Math.floor(Math.random() * 7);

    for (let i = 0; i < count; i++) {
      newFish.push({
        id: fishId++,
        size: 24 + Math.random() * 56,
        y: Math.random() * window.innerHeight,
        delay: Math.random() * 0.8,
        duration: 2.5 + Math.random() * 2,
        wiggleAmount: 15 + Math.random() * 30,
        opacity: 0.4 + Math.random() * 0.5,
        flip: Math.random() > 0.5,
      });
    }

    setFish((prev) => [...prev, ...newFish]);
  }, [code]);

  const removeFish = useCallback((id: number) => {
    setFish((prev) => prev.filter((f) => f.id !== id));
  }, []);

  return (
    <>
      <button
        onClick={spawnFish}
        className="border-0 bg-transparent p-0 transition-transform hover:scale-110 active:scale-95"
        aria-label="Click for swimming fish!"
      >
        {children}
      </button>

      <AnimatePresence>
        {fish.map((f) => (
          <motion.div
            key={f.id}
            initial={{ x: f.flip ? window.innerWidth + 50 : -80, y: f.y, opacity: 0 }}
            animate={{
              x: f.flip ? -80 : window.innerWidth + 50,
              y: [
                f.y,
                f.y - f.wiggleAmount,
                f.y + f.wiggleAmount * 0.6,
                f.y - f.wiggleAmount * 0.4,
                f.y,
              ],
              opacity: [0, f.opacity, f.opacity, f.opacity, 0],
            }}
            transition={{
              duration: f.duration,
              delay: f.delay,
              ease: "easeInOut",
              y: { duration: f.duration, ease: "easeInOut" },
            }}
            onAnimationComplete={() => removeFish(f.id)}
            className="fixed pointer-events-none z-50"
            style={{ top: 0, left: 0 }}
          >
            <Image
              src="/assets/fish.svg"
              alt=""
              width={80}
              height={80}
              style={{
                width: f.size,
                height: "auto",
                transform: f.flip ? "scaleX(-1)" : "scaleX(1)",
              }}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </>
  );
}
