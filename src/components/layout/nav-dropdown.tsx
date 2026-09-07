"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export type MenuSection = {
  heading?: string;
  links: { href: string; label: string; note?: string; mobileLabel?: string }[];
};

type Props = {
  label: string;
  href: string;
  sections: MenuSection[];
  /** Active state styling comes from the parent navbar (scrolled or not). */
  scrolled: boolean;
};

/**
 * Accessible dropdown: opens on hover (desktop) or click, fully keyboard
 * navigable (Enter/Space opens, Escape closes, focus moves inside), and works
 * on touch where hover doesn't exist.
 */
export function NavDropdown({ label, href, sections, scrolled }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const reduce = useReducedMotion();

  // Close on outside click and on route change.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const active = pathname === href || pathname.startsWith(href + "/");

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((o) => !o)}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((o) => !o);
          }
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className={cn(
          "relative flex items-center gap-1 rounded-md px-4 py-2 text-sm font-medium transition-colors duration-300",
          scrolled
            ? active
              ? "text-ink"
              : "text-stone hover:text-ink"
            : active
              ? "text-paper"
              : "text-paper/70 hover:text-paper",
        )}
      >
        {label}
        <ChevronDown
          className={cn(
            "size-3.5 transition-transform duration-300",
            open && "rotate-180",
          )}
          aria-hidden
        />
        {active && (
          <motion.span
            layoutId="nav-active"
            className={cn(
              "absolute inset-x-3 -bottom-px h-px",
              scrolled ? "bg-saffron-deep" : "bg-saffron",
            )}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? undefined : { opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-1/2 top-full z-50 mt-1 w-max min-w-64 -translate-x-1/2"
            role="menu"
            aria-label={label}
          >
            <div className="overflow-hidden rounded-lg border border-ink/10 bg-paper shadow-lift">
              <div className="flex gap-0">
                {sections.map((section, si) => (
                  <div
                    key={si}
                    className={cn(
                      "min-w-48 py-3",
                      si > 0 && "border-l border-ink/8",
                    )}
                  >
                    {section.heading && (
                      <p className="px-4 pb-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-stone">
                        {section.heading}
                      </p>
                    )}
                    <ul>
                      {section.links.map((link) => (
                        <li key={link.href}>
                          <Link
                            href={link.href}
                            role="menuitem"
                            onClick={() => setOpen(false)}
                            className="block px-4 py-2 transition-colors hover:bg-saffron/10"
                          >
                            <span className="block text-sm font-medium text-ink">
                              {link.label}
                            </span>
                            {link.note && (
                              <span className="mt-0.5 block text-xs text-stone">{link.note}</span>
                            )}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
