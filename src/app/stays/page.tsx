import type { Metadata } from "next";
import Image from "@/components/ui/image";
import Link from "next/link";
import { ArrowUpRight, BadgeCheck, Leaf, MapPin, Star } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { getStays } from "@/lib/queries";
import { formatINR } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Stays that give back",
  description:
    "Homestays, lodges and houseboats across India — including eco partners in the Yatra Setu give-back loop. Stamp discounts apply at partner properties.",
};

export default async function StaysPage() {
  const stays = await getStays();
  const eco = stays.filter((s) => s.ecoBadge);

  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[56svh] items-end overflow-hidden bg-ink pb-14 pt-44 text-paper">
        <div className="absolute inset-0" aria-hidden>
          <Image
            src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2400&auto=format&fit=crop"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-55"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/75 to-ink/30" />
        </div>
        <Container className="relative">
          <Reveal>
            <p className="eyebrow flex items-center gap-3 text-saffron">
              <span className="h-px w-10 bg-saffron/70" aria-hidden />
              Stays that give back
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="mt-6 max-w-4xl font-display text-[clamp(2.6rem,6vw,5.5rem)] font-medium leading-[0.98] tracking-tight">
              Rest well.
              <br />
              <span className="text-paper/60 italic">Some of it gives back.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-paper/80">
              {eco.length} of these {stays.length} properties carry the give-back badge —
              they participate in the restoration loop, and your stamps turn into discounts
              at their counters.
            </p>
          </Reveal>
        </Container>
      </section>

      {/* The reward loop, honestly labelled */}
      <section className="border-b border-ink/8 bg-paper-soft py-14">
        <Container className="max-w-6xl">
          <div className="grid gap-6 rounded-lg border border-saffron/30 bg-saffron/8 p-8 sm:grid-cols-[auto_1fr] sm:items-center">
            <span className="grid size-14 place-items-center rounded-full bg-saffron/15 text-saffron-deep">
              <Leaf className="size-6" aria-hidden />
            </span>
            <div>
              <p className="font-display text-2xl tracking-tight text-ink">
                The more you give back, the more rewarding your journey becomes.
              </p>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-stone">
                Verified check-ins earn stamps; stamps redeem for discounts at partner stays.
                Booking itself is <strong className="text-ink">prototype inventory</strong> — the
                discount codes are real, issued from your verified contribution record, and
                honoured by the partner network as the loop grows.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Catalog */}
      <section className="bg-paper py-20 sm:py-28">
        <Container>
          <SectionHeading
            eyebrow="The catalog"
            title={
              <>
                Every stay, <span className="text-stone italic">sorted by how travellers rate it.</span>
              </>
            }
          />
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {stays.map((stay, i) => (
              <Reveal key={stay.id} delay={Math.min(i * 0.05, 0.3)} className="h-full">
                <div className="group flex h-full flex-col overflow-hidden rounded-lg border border-ink/8 bg-paper-raised shadow-card transition-all duration-500 ease-expo hover:shadow-lift">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={stay.image}
                      alt={stay.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      className="object-cover transition-transform duration-[1.4s] ease-expo group-hover:scale-105"
                    />
                    {stay.ecoBadge && (
                      <div className="absolute left-3 top-3">
                        <Badge tone="verify">
                          <BadgeCheck className="size-3" aria-hidden />
                          Gives back
                        </Badge>
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
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-stone">
                      <MapPin className="size-3 text-saffron-deep" aria-hidden />
                      {stay.destination.name} · {stay.destination.region}
                    </p>
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
                      <Link
                        href={`/explore/${stay.destination.slug}`}
                        className="font-semibold text-saffron-deep hover:underline"
                      >
                        {stay.ecoBadge ? "Redeem a stamp here" : "View destination"}
                        <ArrowUpRight className="ml-1 inline size-3.5" aria-hidden />
                      </Link>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.2}>
            <div className="mt-14 flex flex-col items-center gap-4 rounded-lg border border-dashed border-ink/15 p-8 text-center">
              <p className="max-w-xl text-sm leading-relaxed text-stone">
                Stays are seeded demo inventory for the prototype. Redeem codes are real ledger
                records — the partner network honours them as properties onboard.
              </p>
              <ButtonLink href="/rewards" variant="outline-dark" size="md">
                See what stamps unlock
              </ButtonLink>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
