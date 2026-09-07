import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";

export function SectionHeading({
  eyebrow,
  title,
  lede,
  tone = "light",
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  lede?: string;
  tone?: "light" | "dark";
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      {eyebrow && (
        <Reveal>
          <p
            className={cn(
              "eyebrow flex items-center gap-3",
              align === "center" && "justify-center",
              tone === "dark" ? "text-saffron" : "text-saffron-deep",
            )}
          >
            <span className="h-px w-8 bg-current opacity-60" aria-hidden />
            {eyebrow}
          </p>
        </Reveal>
      )}
      <Reveal delay={0.08}>
        <h2
          className={cn(
            "font-display text-4xl leading-[1.05] tracking-tight text-balance md:text-5xl lg:text-6xl",
            tone === "dark" ? "text-paper" : "text-ink",
          )}
        >
          {title}
        </h2>
      </Reveal>
      {lede && (
        <Reveal delay={0.16}>
          <p
            className={cn(
              "max-w-xl text-lg leading-relaxed text-pretty",
              tone === "dark" ? "text-mist" : "text-stone",
              align === "center" && "mx-auto",
            )}
          >
            {lede}
          </p>
        </Reveal>
      )}
    </div>
  );
}