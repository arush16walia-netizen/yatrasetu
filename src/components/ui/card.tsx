import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...rest }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-lg border border-ink/8 bg-paper-raised shadow-card",
        className,
      )}
      {...rest}
    />
  );
}
