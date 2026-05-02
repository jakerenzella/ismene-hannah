"use client";

import { useCallback, useEffect, useState } from "react";
import BackgroundMusic from "@/components/BackgroundMusic";
import MenuSidebar from "@/components/MenuSidebar";
import RegisterSidebar from "@/components/RegisterSidebar";

export default function TopChrome({ showNotes = false }: { showNotes?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement
    ) {
      return;
    }
    if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;

    if (e.key.toLowerCase() === "m") {
      setMenuOpen((prev) => !prev);
      setRegisterOpen(false);
    } else if (e.key.toLowerCase() === "r") {
      setRegisterOpen((prev) => !prev);
      setMenuOpen(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const triggerClass = (active: boolean) =>
    `w-10 h-10 inline-flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
      active
        ? "text-on-surface-variant hover:text-primary"
        : "bg-surface-container-low/80 backdrop-blur-sm border border-outline-variant/40 text-primary hover:bg-surface-container"
    }`;

  return (
    <>
      <div
        className="fixed top-4 left-4 z-40"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <button
          type="button"
          onClick={() => {
            setMenuOpen((prev) => !prev);
            setRegisterOpen(false);
          }}
          className={triggerClass(menuOpen)}
          aria-label="Open menu (M)"
        >
          {menuOpen ? (
            <span className="material-symbols-outlined text-xl leading-none">
              close
            </span>
          ) : (
            <span className="text-sm font-medium font-headline">M</span>
          )}
        </button>
      </div>

      <div
        className="fixed top-4 right-4 z-40 flex items-center gap-2"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <BackgroundMusic />
        <button
          type="button"
          onClick={() => {
            setRegisterOpen((prev) => !prev);
            setMenuOpen(false);
          }}
          className={triggerClass(registerOpen)}
          aria-label="Open registration (R)"
        >
          {registerOpen ? (
            <span className="material-symbols-outlined text-xl leading-none">
              close
            </span>
          ) : (
            <span className="text-sm font-medium font-headline">R</span>
          )}
        </button>
      </div>

      <MenuSidebar
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        showNotes={showNotes}
      />
      <RegisterSidebar
        isOpen={registerOpen}
        onClose={() => setRegisterOpen(false)}
      />
    </>
  );
}
