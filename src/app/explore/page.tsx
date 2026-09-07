import Image from "@/components/ui/image";
import Link from "next/link";
import { ArrowUpRight, Star } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { ExploreHero } from "@/components/map/explore-hero";
import { Spotlight } from "@/components/map/spotlight";
import { getDestinations } from "@/lib/queries";
import { PlaceSearch } from "@/components/live/place-search";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Discover India" };

export default async function ExplorePage() {
  const destinations = await getDestinations();

  return (
    <>
      {/* Hero — the interactive 3D map IS the background */}
      <ExploreHero destinations={destinations} />

      {/* Mobile spotlight — the hero's floating panel is desktop-only */}
      <section className="bg-paper py-14 lg:hidden" aria-label="Featured destinations">
        <Container>
          <Spotlight
            featured={destinations.some((d) => d.featured) ? destinations.filter((d) => d.featured) : destinations.slice(0, 5)}
            activeId={null}
          />
        </Container>
      </section>

      {/* Live search across all of OpenStreetMap's India */}
      <section className="bg-paper py-20 sm:py-24" aria-label="Search places">
        <Container>
          <div id="search" className="scroll-mt-28">
            <Reveal>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="eyebrow text-saffron-deep">Beyond the sixteen</p>
                  <h2 className="mt-3 max-w-xl font-display text-2xl tracking-tight text-ink sm:text-3xl">
                    Looking for somewhere we haven&rsquo;t written yet?
                  </h2>
                </div>
                <p className="text-xs text-stone">Live from OpenStreetMap · no destination left behind</p>
              </div>
            </Reveal>
            <div className="mt-6 max-w-3xl">
              <PlaceSearch />
            </div>
          </div>

          <div className="mt-14 flex flex-wrap items-center gap-3 border-t border-ink/10 pt-8">
            <span className="eyebrow mr-2 text-stone">Every place on the map</span>
            {destinations.map((d) => (
              <Link
                key={d.slug}
                href={`/explore/${d.slug}`}
                className="inline-flex items-center gap-1.5 rounded-md border border-ink/12 px-4 py-2 text-[13px] font-medium text-stone transition-colors duration-300 hover:border-saffron-deep hover:bg-saffron/10 hover:text-ink"
              >
                {d.featured && <span className="size-1.5 rounded-full bg-saffron-deep" aria-hidden />}
                {d.name}
                <ArrowUpRight className="size-3.5 opacity-50" aria-hidden />
              </Link>
            ))}
          </div>

          <p className="mt-6 text-[11px] leading-relaxed text-stone">
            India outline © Wikimedia Commons (CC BY-SA 3.0) · destination photography © Unsplash
            & Wikimedia Commons contributors · positions indicative.
          </p>
        </Container>
      </section>

      {/* Catalog */}
      <section id="catalog" className="bg-paper-soft py-24 sm:py-32" aria-label="All destinations">
        <Container>
          <Reveal>
            <p className="eyebrow text-saffron-deep">The catalog</p>
            <h2 className="mt-5 max-w-3xl font-display text-4xl leading-[1.05] tracking-tight sm:text-6xl">
              Read them like chapters —
              <br />
              <span className="text-stone italic">each with a part for you.</span>
            </h2>
          </Reveal>

          <div className="mt-16 space-y-16 sm:space-y-24">
            {destinations.map((dest, i) => {
              const flip = i % 2 === 1;
              return (
                <Reveal key={dest.slug}>
                  <article
                    id={`dest-${dest.slug}`}
                    className={`group grid items-center gap-8 lg:grid-cols-12 lg:gap-14 ${flip ? "" : ""}`}
                  >
                    {/* image */}
                    <div
                      className={`relative overflow-hidden rounded-lg shadow-card lg:col-span-7 ${flip ? "lg:order-2" : ""} ${dest.featured ? "ring-1 ring-saffron/50" : ""}`}
                    >
                      <Link href={`/explore/${dest.slug}`} className="block" aria-label={dest.name}>
                        <div className="relative aspect-[16/10] w-full overflow-hidden">
                          <Image
                            src={dest.image}
                            alt={dest.imageAlt}
                            fill
                            sizes="(max-width: 1024px) 100vw, 55vw"
                            className="object-cover transition-transform duration-[1.6s] ease-expo group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent" />
                          <span className="absolute left-5 top-4 font-display text-6xl font-light text-paper/30 sm:text-7xl">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          {dest.featured && (
                            <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-sm border border-saffron/40 bg-ink/50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-saffron backdrop-blur-sm">
                              <Star className="size-3 fill-current" aria-hidden />
                              Featured
                            </span>
                          )}
                        </div>
                      </Link>
                    </div>

                    {/* copy */}
                    <div className={`lg:col-span-5 ${flip ? "lg:order-1" : ""}`}>
                      <p className="eyebrow text-saffron-deep">{dest.region}</p>
                      <h3 className="mt-4 font-display text-4xl tracking-tight text-ink sm:text-5xl">
                        {dest.name}
                        {dest.hindiName && (
                          <span className="ml-3 align-middle font-deva text-2xl text-stone">
                            {dest.hindiName}
                          </span>
                        )}
                      </h3>
                      <p className="mt-3 font-display text-lg italic text-stone">{dest.tagline}</p>
                      <p className="mt-5 leading-relaxed text-stone">{dest.story}</p>

                      <div className="mt-6 flex flex-wrap gap-2">
                        {dest.knownFor.slice(0, 3).map((k) => (
                          <span
                            key={k}
                            className="rounded-sm border border-ink/10 bg-paper px-3 py-1 text-xs font-medium text-stone"
                          >
                            {k}
                          </span>
                        ))}
                      </div>

                      {dest.needsCare && (
                        <p className="mt-6 flex items-start gap-2.5 rounded-lg border border-saffron/25 bg-saffron/10 p-4 text-sm leading-relaxed text-ink">
                          <span className="mt-0.5 size-2 shrink-0 rounded-full bg-saffron-deep" aria-hidden />
                          <span>
                            <strong className="font-semibold">This place needs:</strong>{" "}
                            {dest.needsCare}
                          </span>
                        </p>
                      )}

                      <Link
                        href={`/explore/${dest.slug}`}
                        className="group/link mt-7 inline-flex items-center gap-2 text-sm font-bold text-ink"
                      >
                        Enter {dest.name.split(",")[0]}
                        <ArrowUpRight className="size-4 transition-transform duration-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                      </Link>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </section>
    </>
  );
}