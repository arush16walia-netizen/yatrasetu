import Image from "@/components/ui/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  Clock3,
  HandHeart,
  Heart,
  MapPin,
  Sparkles,
  Star,
} from "lucide-react";
import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getDestinationBySlug,
  getDestinations,
  getStaysByDestination,
  getItinerariesByDestination,
  getEventsByDestination,
} from "@/lib/queries";
import { formatDay, formatINR } from "@/lib/utils";
import { crowdBand } from "@/lib/decongestion";
import { GroundPanel } from "@/components/live/ground-panel";

export const dynamicParams = true;

export async function generateStaticParams() {
  const destinations = await getDestinations();
  return destinations.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const dest = await getDestinationBySlug(slug);
  if (!dest) return { title: "Destination not found" };
  return { title: dest.name, description: dest.story };
}

export default async function DestinationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [dest, stays, itineraries, events] = await Promise.all([
    getDestinationBySlug(slug),
    getStaysByDestination(slug),
    getItinerariesByDestination(slug),
    getEventsByDestination(slug, 3),
  ]);

  if (!dest) notFound();

  const [lat, lng] = (dest.coordinates ?? ",").split(",").map(Number);

  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[78svh] items-end overflow-hidden bg-ink pb-14 pt-40 text-paper">
        <div className="absolute inset-0" aria-hidden>
          <Image
            src={dest.heroImage ?? dest.image}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/45 to-ink/20" />
        </div>
        <Container className="relative">
          <Reveal>
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-paper/60 transition-colors hover:text-paper"
            >
              <ArrowLeft className="size-3.5" aria-hidden />
              Explore India
            </Link>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mt-6 flex flex-wrap items-center gap-3 eyebrow text-saffron">
              {dest.region}
              {dest.bestSeason && (
                <span className="text-paper/50">
                  · Best {dest.bestSeason}
                </span>
              )}
            </p>
            <p className="mt-3 flex items-center gap-2.5 text-xs text-paper/70">
              <span
                className={cn(
                  "size-2 rounded-full",
                  crowdBand(dest.crowdScore).key === "loving-too-hard"
                    ? "bg-error"
                    : crowdBand(dest.crowdScore).key === "building"
                      ? "bg-saffron"
                      : "bg-teal",
                )}
                aria-hidden
              />
              Crowd pressure {dest.crowdScore}/100 — {crowdBand(dest.crowdScore).label.toLowerCase()} ·{" "}
              <span className="text-paper/45">Yatra Setu estimate, not a live count</span>
            </p>
          </Reveal>
          <div className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <Reveal delay={0.14}>
              <h1 className="font-display text-[clamp(3rem,8vw,7rem)] font-medium leading-[0.98] tracking-tight">
                {dest.name.split(",")[0]}
              </h1>
            </Reveal>
            {dest.hindiName && (
              <Reveal delay={0.2}>
                <p className="font-deva text-3xl text-paper/70 sm:text-4xl">{dest.hindiName}</p>
              </Reveal>
            )}
          </div>
          <Reveal delay={0.26}>
            <p className="mt-4 max-w-2xl font-display text-xl italic text-paper/75 sm:text-2xl">
              {dest.tagline}
            </p>
          </Reveal>
          <Reveal delay={0.34}>
            <div className="mt-8 flex flex-wrap gap-3">
              {dest.knownFor.slice(0, 4).map((k) => (
                <span
                  key={k}
                  className="inline-flex items-center gap-1.5 rounded-md border border-paper/20 bg-ink/30 px-4 py-1.5 text-xs font-medium text-paper/85 backdrop-blur-sm"
                >
                  <Sparkles className="size-3 text-saffron" aria-hidden />
                  {k}
                </span>
              ))}
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Story */}
      <section className="bg-paper py-24 sm:py-28">
        <Container className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-32">
              <Reveal>
                <p className="eyebrow text-saffron-deep">The story</p>
                <h2 className="mt-5 font-display text-4xl leading-[1.06] tracking-tight text-balance sm:text-5xl">
                  Why this place stays with you.
                </h2>
              </Reveal>
              <Reveal delay={0.12}>
                <dl className="mt-10 space-y-5 border-t border-ink/10 pt-8 text-sm">
                  {lat && lng && (
                    <div className="flex items-center gap-3">
                      <MapPin className="size-4 shrink-0 text-saffron-deep" aria-hidden />
                      <div>
                        <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone">
                          Where
                        </dt>
                        <dd className="mt-0.5 text-stone">
                          {lat.toFixed(2)}° N, {lng.toFixed(2)}° E
                        </dd>
                      </div>
                    </div>
                  )}
                  {dest.bestSeason && (
                    <div className="flex items-center gap-3">
                      <CalendarDays className="size-4 shrink-0 text-saffron-deep" aria-hidden />
                      <div>
                        <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone">
                          Best season
                        </dt>
                        <dd className="mt-0.5 text-stone">{dest.bestSeason}</dd>
                      </div>
                    </div>
                  )}
                </dl>
              </Reveal>
            </div>
          </div>
          <div className="lg:col-span-8">
            <Reveal delay={0.08}>
              <div className="flex flex-col gap-8">
                <p className="font-display text-2xl leading-snug text-ink sm:text-[28px]">
                  {dest.story}
                </p>
                <div className="grid gap-6 sm:grid-cols-3">
                  {dest.knownFor.map((k) => (
                    <div key={k} className="rounded-lg border border-ink/8 bg-paper-raised p-5 shadow-card">
                      <Heart className="size-4 text-saffron-deep" aria-hidden />
                      <p className="mt-3 text-sm font-semibold text-ink">{k}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* Live ground data */}
      {Number.isFinite(lat) && Number.isFinite(lng) && (
        <section className="bg-paper-soft py-20 sm:py-24">
          <Container>
            <Reveal>
              <p className="eyebrow text-saffron-deep">Live, not lorem</p>
              <h2 className="mt-3 max-w-2xl font-display text-3xl tracking-tight text-ink sm:text-4xl">
                What the map says about {dest.name.split(",")[0]} today
              </h2>
            </Reveal>
            <div className="mt-10">
              <GroundPanel name={dest.name.split(",")[0]} lat={lat} lng={lng} />
            </div>
          </Container>
        </section>
      )}

      {/* Needs care */}
      {dest.needsCare && (
        <section className="bg-ink py-20 text-paper sm:py-28">
          <Container className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <Reveal>
                <p className="eyebrow flex items-center gap-3 text-saffron">
                  <span className="h-px w-8 bg-current opacity-60" aria-hidden />
                  What this place needs
                </p>
              </Reveal>
              <Reveal delay={0.1}>
                <h2 className="mt-5 font-display text-4xl leading-[1.06] tracking-tight text-balance sm:text-5xl">
                  Even the most loved places
                  <br />
                  <span className="text-mist italic">need a hand sometimes.</span>
                </h2>
              </Reveal>
              <Reveal delay={0.2}>
                <p className="mt-6 max-w-xl text-lg leading-relaxed text-mist">{dest.needsCare}</p>
              </Reveal>
              <Reveal delay={0.3}>
                <div className="mt-8 flex flex-wrap gap-3">
                  <ButtonLink href="/events" size="md">
                    <HandHeart className="size-4" aria-hidden />
                    Find restoration events
                  </ButtonLink>
                </div>
              </Reveal>
            </div>
            <Reveal delay={0.15}>
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg shadow-lift">
                {dest.careImage && (
                  <Image
                    src={dest.careImage}
                    alt={`The landscape of ${dest.name} that needs restoration`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 flex items-center gap-3 rounded-md border border-paper/15 bg-ink/50 px-5 py-3 backdrop-blur-md">
                  <span className="size-2 shrink-0 rounded-full bg-verify animate-pulse-dot" aria-hidden />
                  <p className="text-xs font-medium text-paper/90">
                    Restoration events open nearby — join one when you visit
                  </p>
                </div>
              </div>
            </Reveal>
          </Container>
        </section>
      )}

      {/* Stays */}
      {stays.length > 0 && (
        <section className="bg-paper-soft py-20 sm:py-28">
          <Container>
            <Reveal>
              <p className="eyebrow text-saffron-deep">Stays</p>
              <h2 className="mt-4 font-display text-4xl tracking-tight text-ink sm:text-5xl">
                Rest well. <span className="text-stone italic">Some of it gives back.</span>
              </h2>
            </Reveal>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {stays.slice(0, 3).map((stay, i) => (
                <Reveal key={stay.id} delay={i * 0.1} className="h-full">
                  <div className="group flex h-full flex-col overflow-hidden rounded-lg bg-paper-raised shadow-card transition-colors duration-300 hover:border-saffron/40 hover:shadow-lift">
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <Image
                        src={stay.image}
                        alt={stay.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-[1.4s] ease-expo group-hover:scale-105"
                      />
                      {stay.ecoBadge && (
                        <div className="absolute left-3 top-3">
                          <Badge tone="verify">Gives back</Badge>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-display text-xl tracking-tight text-ink">{stay.name}</h3>
                        <span className="flex shrink-0 items-center gap-1 text-sm font-semibold text-ink">
                          <Star className="size-3.5 fill-saffron text-saffron" aria-hidden />
                          {stay.rating.toFixed(1)}
                        </span>
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-stone">
                        {stay.description}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {stay.amenityTags.slice(0, 3).map((t) => (
                          <span
                            key={t}
                            className="rounded-sm border border-ink/8 px-2.5 py-0.5 text-[11px] font-medium text-stone"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                      <div className="mt-auto flex items-center justify-between border-t border-ink/8 pt-4 text-sm">
                        <p className="text-stone">
                          <span className="font-bold text-ink">{formatINR(stay.pricePerNight)}</span>
                          {" / night"}
                        </p>
                        <Link href="/stays" className="font-semibold text-saffron-deep hover:underline">
                          View stay
                        </Link>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Itinerary + events */}
      <section className="bg-paper py-20 sm:py-28">
        <Container>
          <div className="grid gap-14 lg:grid-cols-2">
            {/* Itinerary */}
            {itineraries.length > 0 && (
              <div>
                <Reveal>
                  <p className="eyebrow text-saffron-deep">Curated journey</p>
                  <h2 className="mt-4 font-display text-3xl tracking-tight text-ink sm:text-4xl">
                    A route through {dest.name.split(",")[0]}
                  </h2>
                </Reveal>
                <Reveal delay={0.1}>
                  <Link
                    href="/itinerary"
                    className="group mt-6 block overflow-hidden rounded-lg bg-ink text-paper shadow-card transition-all duration-500 ease-expo hover:-translate-y-1 hover:shadow-lift"
                  >
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <Image
                        src={itineraries[0].image}
                        alt={itineraries[0].title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover opacity-80 transition-transform duration-[1.4s] ease-expo group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <p className="eyebrow text-saffron">
                          {itineraries[0].durationDays} days
                        </p>
                        <h3 className="mt-2 font-display text-3xl tracking-tight">
                          {itineraries[0].title}
                        </h3>
                        <p className="mt-2 flex items-center gap-2 text-sm text-paper/70">
                          <Clock3 className="size-3.5" aria-hidden />
                          {itineraries[0].stops.filter((s) => s.giveBack).length} restoration
                          {itineraries[0].stops.filter((s) => s.giveBack).length === 1 ? " hour" : " hours"}{" "}
                          woven in
                        </p>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              </div>
            )}

            {/* Events */}
            {events.length > 0 && (
              <div>
                <Reveal>
                  <p className="eyebrow text-saffron-deep">Give back here</p>
                  <h2 className="mt-4 font-display text-3xl tracking-tight text-ink sm:text-4xl">
                    Upcoming restoration events
                  </h2>
                </Reveal>
                <div className="mt-6 space-y-4">
                  {events.map((event, i) => (
                    <Reveal key={event.id} delay={i * 0.1}>
                      <Link
                        href={`/events/${event.slug}`}
                        className="group flex items-center gap-5 rounded-lg border border-ink/8 bg-paper-raised p-5 shadow-card transition-colors duration-300 hover:border-saffron/40"
                      >
                        <div className="shrink-0 rounded-xl bg-ink px-4 py-3 text-center text-paper">
                          <p className="font-display text-xl font-semibold leading-none">
                            {formatDay(event.date).split(" ")[0]}
                          </p>
                          <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-saffron">
                            {formatDay(event.date).split(" ")[1]}
                          </p>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate font-display text-lg tracking-tight text-ink">
                            {event.title}
                          </h3>
                          <p className="mt-1 truncate text-sm text-stone">
                            {event.startTime}
                            {event.endTime ? ` – ${event.endTime}` : ""} · {event.meetingPoint}
                          </p>
                        </div>
                        <ArrowUpRight
                          className="size-5 shrink-0 text-stone/40 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-saffron-deep"
                          aria-hidden
                        />
                      </Link>
                    </Reveal>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Container>
      </section>
    </>
  );
}