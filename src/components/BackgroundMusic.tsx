"use client";

import { Howl } from "howler";
import { useCallback, useEffect, useState } from "react";

const MUSIC_VOLUME_DESKTOP = 0.2;
const MUSIC_VOLUME_MOBILE = 0.08;
const TRACK_SRC = "/assets/idoidoido.mp3";

// Singleton across mounts so HMR / re-renders don't spawn duplicate audio.
let globalSound: Howl | null = null;
let isInitialized = false;

function isMobileDevice() {
  if (typeof window === "undefined") return false;
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
}

function getOrCreateSound(): Howl {
  if (!globalSound) {
    globalSound = new Howl({
      src: [TRACK_SRC],
      loop: true,
      volume: isMobileDevice() ? MUSIC_VOLUME_MOBILE : MUSIC_VOLUME_DESKTOP,
      html5: true,
      pool: 1,
    });
  }
  return globalSound;
}

export default function BackgroundMusic() {
  const [isMuted, setIsMuted] = useState(false);

  // Initialize and attempt autoplay
  useEffect(() => {
    if (isInitialized) return;
    isInitialized = true;

    const sound = getOrCreateSound();

    const handlePlayError = () => {
      // Browser blocked autoplay — wait for user interaction unlock.
      setIsMuted(true);
      sound.once("unlock", () => {
        if (sound.playing()) return;
        sound.play();
        setIsMuted(false);
      });
    };

    sound.once("playerror", handlePlayError);
    sound.play();

    return () => {
      sound.off("playerror", handlePlayError);
    };
  }, []);

  // Auto-mute when the tab is hidden, restore on return
  useEffect(() => {
    const sound = globalSound;
    if (!sound) return;

    let wasPlaying = false;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        wasPlaying = !isMuted && sound.playing();
        if (wasPlaying) sound.mute(true);
      } else if (wasPlaying && !isMuted) {
        sound.mute(false);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    const sound = globalSound;
    if (!sound) return;

    if (isMuted) {
      if (!sound.playing()) sound.play();
      sound.mute(false);
    } else {
      sound.mute(true);
    }
    setIsMuted((m) => !m);
  }, [isMuted]);

  return (
    <button
      type="button"
      onClick={toggleMute}
      className="w-10 h-10 inline-flex items-center justify-center rounded-full text-on-surface-variant hover:text-primary hover:bg-primary-container/20 transition-colors"
      aria-label={isMuted ? "Unmute background music" : "Mute background music"}
    >
      <span className="material-symbols-outlined text-xl leading-none">
        {isMuted ? "volume_off" : "volume_up"}
      </span>
    </button>
  );
}
