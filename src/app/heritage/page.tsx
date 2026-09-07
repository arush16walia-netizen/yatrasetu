import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Landmark } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { HERITAGE_SITES } from "@/lib/heritage";

export const metadata: Metadata = {
  title: "Heritage storyteller",
  description: "India's living heritage sites — stories narrated aloud, with history resolved live from Wikipedia.",
};

export default function HeritagePage() {
  return (
    <>
      <section className="relative flex min-h-[40svh] items-end overflow-hidden bg-ink pb-12 pt-40 text-paper">
        <div
          className="absolute inset-0"
          aria-hidden
          style={{
            background:
              "radial-gradient(70% 90% at 85% 0%, rgb(196 68 0 / 0.28), transparent 60%), radial-gradient(50% 70% at 5% 100%, rgb(0 105 92 / 0.25), transparent 65%)",
          }}
        />
        <Container className="relative">
          <Reveal>
            <p className="eyebrow flex items-center gap-3 text-saffron">
              <span className="h-px w-10 bg-saffron/70" aria-hidden />
              Heritage storyteller
            </p>
            <h1 className="mt-4 max-w-2xl font-display text-4xl font-semibold leading-tight sm:text-5xl">
              Every stone here is still speaking.
            </h1>
            <p className="mt-4 max-w-xl text-paper/70">
              Eight living monuments, each with a story told aloud — and deeper history resolved live from
              Wikipedia. Listen before you go; tread gently when you do.
            </p>
          </Reveal>
        </Container>
      </section>

      <Container className="py-16">
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {HERITAGE_SITES.map((site, i) => (
            <Reveal key={site.slug} delay={i * 0.04}>
              <li className="h-full">
                <Link
                  href={`/heritage/${site.slug}`}
                  className="group flex h-full flex-col rounded-3xl border border-ink/10 bg-white/70 p-6 shadow-sm transition-all duration-300 ease-expo hover:-translate-y-1 hover:border-saffron/40 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saffron"
                >
                  <div className="flex items-center justify-between">
                    <span className="grid size-10 place-items-center rounded-full bg-ink/5 text-saffron-deep">
                      <Landmark className="size-5" aria-hidden />
                    </span>
                    <ArrowUpRight className="size-4 text-stone transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-saffron-deep" aria-hidden />
                  </div>
                  <h2 className="mt-4 font-display text-xl font-semibold text-ink">
                    {site.name} <span className="text-stone">· {site.hindiName}</span>
                  </h2>
                  <p className="mt-1 text-xs font-medium uppercase tracking-wide text-teal">{site.era}</p>
                  <p className="mt-3 line-clamp-3 text-sm text-stone">{site.blurb}</p>
                  <p className="mt-auto pt-4 text-xs text-stone">
                    {site.city}, {site.state}
                  </p>
                </Link>
              </li>
            </Reveal>
          ))}
        </ul>
      </Container>
    </>
  );
}
