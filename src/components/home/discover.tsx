import Link from "next/link";
import Image from "@/components/ui/image";
import { ArrowUpRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import type { DestinationSummary } from "@/lib/queries";

export function Discover({ destinations }: { destinations: DestinationSummary[] }) {
  const featured = destinations.slice(0, 6);

  return (
    <section className="bg-paper py-24 sm:py-32" aria-label="Discover India">
      <Container>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="Discover India"
            title={
              <>
                Places that need you.
                <br />
                <span className="text-stone italic">Places you&rsquo;ll never forget.</span>
              </>
            }
            lede="Every destination below carries a story — and a small way you can become part of it."
          />
          <Reveal delay={0.2}>
            <ButtonLink href="/explore" variant="outline-dark" size="md" className="shrink-0">
              All destinations
              <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </ButtonLink>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-12">
          {featured.map((dest, i) => {
            const span =
              i === 0
                ? "lg:col-span-7 lg:row-span-2"
                : i === 1 || i === 2
                  ? "lg:col-span-5"
                  : "lg:col-span-4";
            const tall = i === 0;
            return (
              <Reveal key={dest.slug} delay={(i % 3) * 0.1} className={span}>
                <Link
                  href={`/explore/${dest.slug}`}
                  className="group relative block h-full min-h-[320px] overflow-hidden rounded-lg shadow-card transition-all duration-500 ease-expo hover:shadow-lift md:min-h-[380px]"
                >
                  <Image
                    src={dest.image}
                    alt={dest.imageAlt}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    className="object-cover transition-transform duration-[1.4s] ease-expo group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/25 to-transparent transition-opacity duration-500 group-hover:from-ink/90" />

                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 sm:p-7">
                    <div>
                      <p className="eyebrow flex items-center gap-2 text-saffron">
                        <span className="h-px w-6 bg-saffron/70" aria-hidden />
                        {dest.region}
                      </p>
                      <h3 className="mt-3 font-display text-3xl tracking-tight text-paper sm:text-4xl">
                        {dest.name}
                      </h3>
                      <p className="mt-2 max-w-sm text-sm leading-relaxed text-paper/70">
                        {dest.tagline}
                      </p>
                      <p className="mt-4 inline-flex items-center gap-2 rounded-md border border-paper/20 bg-ink/30 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-paper/85 backdrop-blur-sm">
                        <span className="size-1.5 rounded-full bg-verify" aria-hidden />
                        Needs care · join the restore
                      </p>
                    </div>
                    <span
                      className="grid size-11 shrink-0 place-items-center rounded-full border border-paper/25 bg-paper/10 text-paper opacity-0 backdrop-blur-sm transition-all duration-500 ease-expo group-hover:opacity-100"
                      aria-hidden
                    >
                      <ArrowUpRight className="size-5" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}