import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "saffron" | "teal" | "verify" | "ink" | "paper" | "ember" | "neutral";

const tones: Record<Tone, string> = {
  saffron: "bg-saffron/12 text-saffron-deep border-saffron/35",
  teal: "bg-teal/10 text-teal border-teal/25",
  verify: "bg-verify/10 text-verify border-verify/25",
  ink: "bg-ink text-paper border-ink",
  paper: "bg-paper text-ink border-paper",
  ember: "bg-error/8 text-error border-error/25",
  neutral: "bg-ink/5 text-stone border-ink/10",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
