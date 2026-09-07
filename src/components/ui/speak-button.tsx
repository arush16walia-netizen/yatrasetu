"use client";

import { useEffect, useRef, useState } from "react";
import { CircleStop, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Speaks `text` via the browser's built-in Web Speech Synthesis.
 * Degrades honestly: when the browser has no voice for it, the button
 * disables and explains instead of pretending to play.
 */
export function SpeakButton({ text, lang, className }: { text: string; lang: string; className?: string }) {
  const [supported, setSupported] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSupported(false);
      return;
    }
    const pick = () => {
      voiceRef.current =
        window.speechSynthesis.getVoices().find((v) => v.lang === lang) ??
        window.speechSynthesis.getVoices().find((v) => v.lang.startsWith(lang.split("-")[0])) ??
        null;
    };
    pick();
    window.speechSynthesis.addEventListener("voiceschanged", pick);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", pick);
      window.speechSynthesis.cancel();
    };
  }, [lang]);

  if (!supported) {
    return (
      <span className={cn("inline-flex items-center gap-1 text-xs text-stone", className)} title="Speech playback isn't available in this browser">
        <Volume2 className="size-3.5 opacity-40" aria-hidden /> audio n/a
      </span>
    );
  }

  function speak() {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang;
    if (voiceRef.current) utter.voice = voiceRef.current;
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
    setSpeaking(true);
  }

  return (
    <button
      type="button"
      onClick={speak}
      aria-label={speaking ? `Stop audio — ${text}` : `Play audio — ${text}`}
      aria-pressed={speaking}
      className={cn(
        "inline-flex size-8 shrink-0 items-center justify-center rounded-full border transition-colors",
        speaking
          ? "border-saffron bg-saffron/15 text-saffron-deep"
          : "border-ink/15 text-ink hover:border-saffron hover:bg-saffron/10 hover:text-saffron-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron",
        className,
      )}
    >
      {speaking ? <CircleStop className="size-4" aria-hidden /> : <Volume2 className="size-4" aria-hidden />}
    </button>
  );
}
