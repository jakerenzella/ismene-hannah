"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

interface MenuSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  showNotes?: boolean;
}

type MenuItem = { label: string; anchor: string };

export default function MenuSidebar({
  isOpen,
  onClose,
  showNotes = false,
}: MenuSidebarProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const items: MenuItem[] = [
    { label: "Our Story", anchor: "story" },
    { label: "RSVP", anchor: "rsvp" },
    { label: "Details", anchor: "details" },
    { label: "Mood board", anchor: "moodboard" },
    { label: "Travel", anchor: "travel" },
    ...(showNotes ? [{ label: "Notes wall", anchor: "notes" }] : []),
  ];

  const handleNavClick = (anchor: string) => {
    const el = document.getElementById(anchor);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-on-surface/40 z-50"
            onClick={onClose}
          />

          <motion.div
            initial={{ x: "calc(-100% - 20px)" }}
            animate={{ x: 0 }}
            exit={{ x: "calc(-100% - 20px)" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed left-4 right-4 sm:right-auto top-4 bottom-4 sm:w-[300px] bg-surface-container-low z-50 rounded-2xl scrapbook-shadow overflow-y-auto"
            style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
          >
            <div className="sticky top-0 p-6 border-b border-on-surface/10 bg-surface-container-low rounded-t-2xl z-10">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-4xl text-primary handwritten-tilt">
                  Ismene + Hannah
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 inline-flex items-center justify-center rounded-full text-on-surface-variant hover:text-primary hover:bg-primary-container/20 transition-colors cursor-pointer"
                  aria-label="Close menu"
                >
                  <span className="material-symbols-outlined text-xl leading-none">
                    close
                  </span>
                </button>
              </div>
            </div>

            <nav className="p-6">
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item.anchor}>
                    <button
                      type="button"
                      onClick={() => handleNavClick(item.anchor)}
                      className="w-full text-center px-4 py-3 rounded-lg text-lg font-headline text-on-surface hover:text-primary hover:bg-primary-container/20 transition-colors cursor-pointer"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
