"use client";

import { useState } from "react";

type Props = {
  display: string;
  value: string;
  label: string;
};

export default function PayIdCopy({ display, value, label }: Props) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard might be unavailable (insecure context, older browsers).
      // Surface the value via prompt() as a graceful fallback so guests can
      // still copy it manually.
      window.prompt(`Copy this ${label}:`, value);
    }
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      className="inline-flex items-center gap-3 bg-secondary-container/50 border-2 border-secondary/30 rounded-2xl px-5 py-3 hover:scale-[1.02] active:scale-95 transition-all group"
    >
      <span className="flex flex-col text-left">
        <span className="font-headline font-extrabold uppercase tracking-wider text-xs text-secondary">
          {label}
        </span>
        <span className="font-headline font-extrabold text-xl text-on-surface tracking-wider">
          {display}
        </span>
      </span>
      <span className="material-symbols-outlined text-secondary group-hover:translate-y-[-1px] transition-transform">
        {copied ? "check" : "content_copy"}
      </span>
    </button>
  );
}
