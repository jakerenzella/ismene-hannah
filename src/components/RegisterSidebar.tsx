"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface RegisterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  name: string;
  email: string;
  utr: string;
  playingStyle: {
    backhand: "one-handed" | "two-handed" | "";
    forehand: "one-handed" | "two-handed" | "";
    dominantHand: "right" | "left" | "";
  };
}

export default function RegisterSidebar({
  isOpen,
  onClose,
}: RegisterSidebarProps) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    utr: "",
    playingStyle: { backhand: "", forehand: "", dominantHand: "" },
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Registration data:", formData);
  };

  const handleUtrChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setFormData((prev) => ({ ...prev, utr: value }));
    }
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
            initial={{ x: "calc(100% + 20px)" }}
            animate={{ x: 0 }}
            exit={{ x: "calc(100% + 20px)" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed left-4 sm:left-auto right-4 top-4 bottom-4 sm:w-[380px] bg-surface-container-low z-50 rounded-2xl scrapbook-shadow overflow-y-auto"
            style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
          >
            <div className="sticky top-0 p-6 border-b border-on-surface/10 bg-surface-container-low rounded-t-2xl z-10">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-4xl text-primary handwritten-tilt">
                  Register
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 inline-flex items-center justify-center rounded-full text-on-surface-variant hover:text-primary hover:bg-primary-container/20 transition-colors cursor-pointer"
                  aria-label="Close registration"
                >
                  <span className="material-symbols-outlined text-xl leading-none">
                    close
                  </span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label
                  htmlFor="reg-name"
                  className="block text-sm font-medium text-on-surface mb-1.5"
                >
                  Name <span className="text-primary">*</span>
                </label>
                <input
                  id="reg-name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full px-3 py-2 bg-surface-container-lowest rounded-lg border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label
                  htmlFor="reg-email"
                  className="block text-sm font-medium text-on-surface mb-1.5"
                >
                  Email <span className="text-primary">*</span>
                </label>
                <input
                  id="reg-email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="w-full px-3 py-2 bg-surface-container-lowest rounded-lg border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label
                  htmlFor="reg-utr"
                  className="block text-sm font-medium text-on-surface mb-1.5"
                >
                  UTR{" "}
                  <span className="text-on-surface-variant">(optional)</span>
                </label>
                <input
                  id="reg-utr"
                  type="text"
                  inputMode="decimal"
                  value={formData.utr}
                  onChange={handleUtrChange}
                  className="w-full px-3 py-2 bg-surface-container-lowest rounded-lg border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. 8.5"
                />
              </div>

              <div className="space-y-4">
                <p className="text-sm font-medium text-on-surface">
                  Playing Style
                </p>

                <ToggleRow
                  label="Dominant Hand"
                  options={[
                    { value: "right", label: "Right" },
                    { value: "left", label: "Left" },
                  ]}
                  value={formData.playingStyle.dominantHand}
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      playingStyle: {
                        ...prev.playingStyle,
                        dominantHand: value as "right" | "left",
                      },
                    }))
                  }
                />

                <ToggleRow
                  label="Backhand"
                  options={[
                    { value: "one-handed", label: "One-handed" },
                    { value: "two-handed", label: "Two-handed" },
                  ]}
                  value={formData.playingStyle.backhand}
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      playingStyle: {
                        ...prev.playingStyle,
                        backhand: value as "one-handed" | "two-handed",
                      },
                    }))
                  }
                />

                <ToggleRow
                  label="Forehand"
                  options={[
                    { value: "one-handed", label: "One-handed" },
                    { value: "two-handed", label: "Two-handed" },
                  ]}
                  value={formData.playingStyle.forehand}
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      playingStyle: {
                        ...prev.playingStyle,
                        forehand: value as "one-handed" | "two-handed",
                      },
                    }))
                  }
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-lg bg-primary text-on-primary font-medium hover:bg-primary-dim transition-colors cursor-pointer"
              >
                Submit Registration
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function ToggleRow({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <p className="block text-xs text-on-surface-variant mb-1.5">{label}</p>
      <div
        role="radiogroup"
        aria-label={label}
        className="flex w-full bg-on-surface/10 rounded-lg p-1 gap-1"
      >
        {options.map((opt) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(opt.value)}
              className={`flex-1 py-2 rounded-md text-sm transition-colors cursor-pointer ${
                selected
                  ? "bg-primary text-on-primary"
                  : "text-on-surface-variant hover:bg-on-surface/10 hover:text-on-surface"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
