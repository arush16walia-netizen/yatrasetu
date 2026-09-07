import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";

const columns = [
  {
    title: "Explore",
    links: [
      { href: "/explore", label: "Discover India" },
      { href: "/stays", label: "Stays that give back" },
      { href: "/itinerary", label: "Curated itineraries" },
    ],
  },
  {
    title: "Give back",
    links: [
      { href: "/vision", label: "Problem & vision" },
      { href: "/events", label: "Restoration events" },
      { href: "/impact", label: "Impact ledger" },
      { href: "/trending", label: "Trending spot alerts" },
      { href: "/community-apply", label: "Become a community lead" },
      { href: "/certificates", label: "Service certificates" },
      { href: "/rewards", label: "Stamps & rewards" },
      { href: "/passport", label: "Your Yatra Passport" },
    ],
  },
  {
    title: "Your journey",
    links: [
      { href: "/profile", label: "Profile" },
      { href: "/login", label: "Sign in" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-ink text-paper">
      <div className="border-b border-paper/10">
        <Container className="flex flex-col items-start gap-10 py-20 sm:py-28 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <p className="eyebrow text-saffron">यात्रा बने सेवा</p>
            <h2 className="mt-5 font-display text-4xl leading-[1.05] tracking-tight text-balance sm:text-5xl">
              Your next journey can leave a mark.
              <br />
              <span className="text-mist">Make sure it&rsquo;s a good one.</span>
            </h2>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/explore" size="lg">
                Explore Yatra
                <ArrowUpRight className="size-4" aria-hidden />
              </ButtonLink>
              <ButtonLink href="/events" variant="outline-light" size="lg">
                Join a restoration event
              </ButtonLink>
            </div>
          </div>
          <p className="max-w-sm font-deva text-lg leading-relaxed text-mist">
            हर यात्रा एक सेवा बन सकती है। जहाँ जाओ, वहाँ कुछ छोड़ जाओ — अच्छा।
          </p>
        </Container>
      </div>

      <Container className="grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <p className="font-display text-2xl font-semibold tracking-tight">Yatra Setu</p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-mist">
            The bridge between travel and service. Discover India, restore the places you love,
            and earn rewards that make your next journey lighter on the land.
          </p>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <p className="eyebrow text-paper/50">{col.title}</p>
            <ul className="mt-4 space-y-3">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-paper/80 transition-colors duration-300 hover:text-saffron"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>

      <div className="border-t border-paper/10">
        <Container className="flex flex-col items-center justify-between gap-3 py-6 text-xs text-mist sm:flex-row">
          <p>© 2026 Yatra Setu. Yatra bane seva.</p>
          <p className="font-deva">यात्रा बने सेवा — travel, transformed into service.</p>
        </Container>
      </div>
    </footer>
  );
}