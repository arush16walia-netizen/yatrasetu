"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useSession } from "next-auth/react";
import { ArrowUpRight, Menu, UserRound, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { SearchDialog } from "@/components/search/search-dialog";
import { NavDropdown, type MenuSection } from "@/components/layout/nav-dropdown";

type NavItem =
  | { kind: "link"; href: string; label: string; mobileLabel?: string }
  | { kind: "menu"; href: string; label: string; sections: MenuSection[] };

const NAV_ITEMS: NavItem[] = [
  { kind: "link", href: "/explore", label: "Explore" },
  {
    kind: "menu",
    href: "/events",
    label: "Restore",
    sections: [
      {
        heading: "Give back",
        links: [
          { href: "/events", label: "Restoration events", note: "RSVP to a seva morning" },
          { href: "/report-litter", label: "Report litter", note: "+50 points · dispatch a crew" },
          { href: "/trending", label: "Crowd alerts", note: "Places loved too hard" },
        ],
      },
    ],
  },
  { kind: "link", href: "/plan", label: "Plan", mobileLabel: "My Yatra" },
  { kind: "link", href: "/stays", label: "Stays" },
  {
    kind: "menu",
    href: "/heritage",
    label: "Tools",
    sections: [
      {
        heading: "Travel sharper",
        links: [
          { href: "/heritage", label: "Heritage storyteller", note: "India's stones, narrated aloud" },
          { href: "/phrasebook", label: "Dialect phrasebook", note: "Speak the hills, respect the custom" },
          { href: "/offline-pass", label: "Offline pass", note: "Works in airplane mode · SOS dialers" },
        ],
      },
    ],
  },
  { kind: "link", href: "/rewards", label: "Rewards" },
];

// One source of nav truth: the mobile overlay is derived from NAV_ITEMS —
// menu heads plus their section links (dropping any link that duplicates the
// head), with bookend Home and Impact entries.
const MOBILE_LINKS = [
  { href: "/", label: "Home" },
  ...NAV_ITEMS.flatMap((item) => {
    if (item.kind === "link") {
      return [{ href: item.href, label: item.mobileLabel ?? item.label }];
    }
    const head = { href: item.href, label: item.label };
    const sectionLinks = item.sections
      .flatMap((s) => s.links)
      .filter((l) => l.href !== item.href)
      .map((l) => ({ href: l.href, label: l.mobileLabel ?? l.label }));
    return [head, ...sectionLinks];
  }),
  { href: "/impact", label: "Impact" },
];

export function BrandMark({ dark = false }: { dark?: boolean }) {
  return (
    <Link href="/" className="group flex items-center gap-3" aria-label="Yatra Setu — home">
      <span
        className={cn(
          "grid size-9 place-items-center rounded-full border transition-colors duration-300",
          dark ? "border-paper/25 bg-paper/10" : "border-ink/15 bg-ink/5",
        )}
        aria-hidden
      >
        <span className="size-2.5 rounded-full bg-saffron transition-transform duration-500 ease-expo group-hover:scale-125" />
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-display text-lg font-semibold tracking-tight transition-colors duration-300",
            dark ? "text-paper" : "text-ink",
          )}
        >
          Yatra Setu
        </span>
        <span
          className={cn(
            "mt-1 font-deva text-[11px] transition-colors duration-300",
            dark ? "text-mist" : "text-stone",
          )}
        >
          यात्रा बने सेवा
        </span>
      </span>
    </Link>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const { data: session } = useSession();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => setOpen(false), [pathname]);

  const dark = scrolled; // solid glass bar once scrolled

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-expo",
          scrolled ? "py-2" : "py-4 sm:py-6",
        )}
      >
        <Container>
          <nav
            aria-label="Primary"
            className={cn(
              "flex items-center justify-between rounded-lg px-4 py-2.5 transition-all duration-500 ease-expo sm:px-5",
              scrolled
                ? "glass-light shadow-card"
                : "border border-transparent bg-transparent",
            )}
          >
            <BrandMark dark={!scrolled} />

            {/* Desktop links */}
            <ul className="hidden items-center gap-1 lg:flex">
              {NAV_ITEMS.map((item) => (
                <li key={item.label}>
                  {item.kind === "menu" ? (
                    <NavDropdown
                      label={item.label}
                      href={item.href}
                      sections={item.sections}
                      scrolled={scrolled}
                    />
                  ) : (() => {
                    const active = pathname.startsWith(item.href);
                    return (
                      <Link
                        href={item.href}
                        className={cn(
                          "relative rounded-md px-4 py-2 text-sm font-medium transition-colors duration-300",
                          scrolled
                            ? active
                              ? "text-ink"
                              : "text-stone hover:text-ink"
                            : active
                              ? "text-paper"
                              : "text-paper/70 hover:text-paper",
                        )}
                      >
                        {item.label}
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
                      </Link>
                    );
                  })()}
                </li>
              ))}
            </ul>

            {/* Right controls */}
            <div className="flex items-center gap-2">
              <SearchDialog variant={scrolled ? "light" : "dark"} />
              {session?.user ? (
                <Link
                  href="/profile"
                  aria-label="Your profile"
                  className={cn(
                    "flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3 text-sm font-medium transition-colors duration-300",
                    scrolled ? "text-ink" : "text-paper",
                  )}
                >
                  <span className="grid size-7 place-items-center rounded-full bg-saffron font-display text-sm font-semibold text-white">
                    {(session.user.name ?? "Y").charAt(0).toUpperCase()}
                  </span>
                  <span className={cn(scrolled ? "text-stone" : "text-paper/85")}>
                    {session.user.name?.split(" ")[0]}
                  </span>
                </Link>
              ) : (
                <Link
                  href="/profile"
                  className={cn(
                    "hidden items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-300 sm:flex",
                    scrolled ? "text-stone hover:text-ink" : "text-paper/80 hover:text-paper",
                  )}
                >
                  <UserRound className="size-4" aria-hidden />
                  Profile
                </Link>
              )}
              <ButtonLink href="/events" size="sm" className="hidden sm:inline-flex">
                Start Your Yatra
                <ArrowUpRight className="size-4" aria-hidden />
              </ButtonLink>
              <button
                type="button"
                onClick={() => setOpen(true)}
                aria-label="Open menu"
                aria-expanded={open}
                className={cn(
                  "grid size-10 place-items-center rounded-full border transition-colors duration-300 lg:hidden",
                  scrolled
                    ? "border-ink/15 text-ink"
                    : "border-paper/25 text-paper backdrop-blur-sm",
                )}
              >
                <Menu className="size-5" aria-hidden />
              </button>
            </div>
          </nav>
        </Container>
      </header>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[60] flex flex-col bg-ink text-paper lg:hidden"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduce ? undefined : { opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
          >
            <div className="flex items-center justify-between px-5 py-5">
              <BrandMark dark />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="grid size-10 place-items-center rounded-full border border-paper/25 text-paper"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>
            <nav className="flex flex-1 flex-col justify-center gap-1 px-8" aria-label="Mobile">
              {MOBILE_LINKS.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={reduce ? false : { opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + i * 0.06, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    href={link.href}
                    className="group flex items-baseline justify-between border-b border-paper/10 py-4"
                  >
                    <span className="font-display text-4xl tracking-tight transition-colors duration-300 group-hover:text-saffron">
                      {link.label}
                    </span>
                    <ArrowUpRight
                      className="size-5 text-paper/40 transition-all duration-300 group-hover:text-saffron"
                      aria-hidden
                    />
                  </Link>
                </motion.div>
              ))}
            </nav>
            <div className="px-8 pb-10">
              <ButtonLink href="/events" className="w-full" size="lg">
                Start Your Yatra
                <ArrowUpRight className="size-4" aria-hidden />
              </ButtonLink>
              <p className="mt-6 text-center font-deva text-sm text-mist">यात्रा बने सेवा</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}