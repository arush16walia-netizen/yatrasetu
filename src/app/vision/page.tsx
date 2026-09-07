import type { Metadata } from "next";
import Image from "@/components/ui/image";
import {
  Coins,
  HandHeart,
  Radio,
  Radar,
  ScanLine,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { ButtonLink } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Problem & Vision",
  description:
    "Why Yatra Setu exists: unmanaged tourism breaks the places it loves. Our vision — turn the visit itself into the repair, through verified community restoration.",
};

export const dynamic = "force-dynamic";

const PROBLEMS = [
  {
    title: "Virality without management",
    body: "One reel can turn an unnamed cove into a destination over a weekend — before bins, trails, toilets or footpaths exist. The audience arrives faster than any system can respond.",
  },
  {
    title: "The cost lands on locals",
    body: "Waste, water stress, noise and cultural strain are externalised onto the villages and neighbourhoods that host the visit. They inherit the cleanup; the platform bills no one for the damage.",
  },
  {
    title: "Travellers care, but have no channel",
    body: "Most people would gladly give two hours of a trip to the place they came to see. There is no trusted tool that converts that intent into action — so the intent evaporates at the airport.",
  },
  {
    title: "Travel platforms optimise transactions",
    body: "Flights, rooms, checkouts. The industry monetises the visit end-to-end yet has no mechanism for stewardship of the thing being visited. Demand grows; care does not.",
  },
];

const MECHANISM = [
  {
    icon: Radio,
    title: "Locals open the events",
    body: "Verified community leads publish restoration events against the exact spots under pressure — a ghat, a shoreline, a trail — with real capacity limits.",
    href: "/events",
    hrefLabel: "See open events",
  },
  {
    icon: UserCheck,
    title: "Travellers RSVP with intent",
    body: "Crews are deliberately small. A traveller reserves a place the way they'd reserve a stay — as part of the journey, not an afterthought.",
    href: "/events",
    hrefLabel: "Reserve a spot",
  },
  {
    icon: ScanLine,
    title: "Arrival is verified, not claimed",
    body: "At the site, a QR scan captures timestamp and location. The contribution becomes a record in a database — evidence, not a pledge.",
    href: "/impact",
    hrefLabel: "Inspect the ledger",
  },
  {
    icon: Coins,
    title: "Records become currency",
    body: "Verified contributions earn stamps, and stamps earn rewards on the next journey. The loop pays travellers to keep the loop alive.",
    href: "/rewards",
    hrefLabel: "See stamps & rewards",
  },
  {
    icon: Radar,
    title: "Data guides the next intervention",
    body: "The impact ledger and crowd alerts show communities where pressure is building — so the next event opens where it matters most.",
    href: "/trending",
    hrefLabel: "View crowd alerts",
  },
];

export default async function VisionPage() {
  const [destinations, openEvents, contributions, organizers, openAlerts] =
    await Promise.all([
      prisma.destination.count(),
      prisma.restorationEvent.count({ where: { date: { gte: new Date() } } }),
      prisma.attendanceRecord.count(),
      prisma.restorationEvent.groupBy({ by: ["organizerName"] }),
      prisma.spotReport.count({ where: { status: { in: ["OPEN", "VERIFIED"] } } }),
    ]);

  const proof = [
    {
      icon: ShieldCheck,
      value: contributions.toLocaleString("en-IN"),
      label: "Verified contributions on record",
    },
    {
      icon: HandHeart,
      value: openEvents.toLocaleString("en-IN"),
      label: "Restoration events open for RSVP",
    },
    {
      icon: Radio,
      value: organizers.length.toLocaleString("en-IN"),
      label: "Community organisers running crews",
    },
  ];

  return (
    <>
      {/* Night hero */}
      <section className="relative flex min-h-[68svh] items-end overflow-hidden bg-ink pb-16 pt-44 text-paper">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            background:
              "radial-gradient(80% 90% at 85% 0%, rgb(0 77 64 / 0.32), transparent 62%), radial-gradient(60% 70% at 8% 100%, rgb(230 81 0 / 0.15), transparent 65%)",
          }}
        />
        <Container className="relative">
          <Reveal>
            <p className="eyebrow flex items-center gap-3 text-saffron">
              <span className="h-px w-10 bg-saffron/70" aria-hidden />
              The problem · हमारी समस्या
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="mt-6 max-w-4xl font-display text-[clamp(2.6rem,6vw,5.5rem)] font-medium leading-[0.98] tracking-tight text-balance">
              Loving a place to death is still a choice.
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-mist">
              Yatra Setu exists because unmanaged tourism is breaking the very places it
              celebrates. This is the problem we see on the ground — and the mechanism we
              are building so the journey itself does the repair.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4 border-t border-paper/10 pt-6">
              {[
                { v: destinations.toLocaleString("en-IN"), l: "destinations in the ledger" },
                { v: openEvents.toLocaleString("en-IN"), l: "events open now" },
                { v: contributions.toLocaleString("en-IN"), l: "verified check-ins" },
                { v: openAlerts.toLocaleString("en-IN"), l: "crowd alerts being tracked" },
              ].map((s) => (
                <div key={s.l}>
                  <dd className="font-mono text-2xl text-paper">{s.v}</dd>
                  <dt className="mt-1 text-xs uppercase tracking-[0.14em] text-mist">{s.l}</dt>
                </div>
              ))}
            </dl>
          </Reveal>
        </Container>
      </section>

      {/* Day — the problem statement */}
      <section className="bg-paper py-24 sm:py-32" aria-label="The problem statement">
        <Container>
          <SectionHeading
            eyebrow="01 — The problem statement"
            title={
              <>
                Tourism at record scale.
                <br />
                <span className="text-stone italic">Stewardship at zero.</span>
              </>
            }
            lede="Four failures compound into the same outcome: places loved faster than they can be cared for."
          />

          <div className="mt-16 grid gap-14 lg:grid-cols-12">
            <ol className="lg:col-span-7">
              {PROBLEMS.map((p, i) => (
                <Reveal key={p.title} delay={i * 0.08}>
                  <li className="grid grid-cols-[3.5rem_1fr] gap-5 border-t border-ink/10 py-8 first:border-t-0 sm:grid-cols-[4.5rem_1fr]">
                    <span className="font-display text-xl text-saffron-deep sm:text-2xl" aria-hidden>
                      0{i + 1}
                    </span>
                    <div>
                      <h3 className="font-display text-2xl tracking-tight text-ink">{p.title}</h3>
                      <p className="mt-3 max-w-xl leading-relaxed text-stone">{p.body}</p>
                    </div>
                  </li>
                </Reveal>
              ))}
            </ol>

            <Reveal delay={0.2} className="lg:col-span-5">
              <figure className="lg:sticky lg:top-28">
                <div className="relative aspect-[4/5] overflow-hidden rounded-lg shadow-lift">
                  <Image
                    src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1600&auto=format&fit=crop"
                    alt="A once-quiet backwater now crowded with tourist boats"
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/70 to-transparent p-5">
                    <figcaption className="eyebrow text-saffron">
                      A shoreline loved past its carrying capacity
                    </figcaption>
                  </div>
                </div>
              </figure>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* Night — the mechanism */}
      <section className="bg-ink py-24 text-paper sm:py-32" aria-label="Our vision and mechanism">
        <Container>
          <SectionHeading
            tone="dark"
            eyebrow="02 — Our vision"
            title={
              <>
                Turn the visit itself
                <br />
                <span className="text-saffron">into the repair.</span>
              </>
            }
            lede="Not offsets. Not pledges. A closed loop in which travelling funds and staffs the care of the destination — run by the communities who live there."
          />

          <ol className="mt-16 border-t border-paper/10">
            {MECHANISM.map((m, i) => (
              <Reveal key={m.title} delay={i * 0.06}>
                <li className="group grid gap-5 border-b border-paper/10 py-8 sm:grid-cols-[4.5rem_1fr_auto] sm:items-start">
                  <span className="font-mono text-sm text-mist" aria-hidden>
                    STEP 0{i + 1}
                  </span>
                  <div className="max-w-2xl">
                    <h3 className="flex items-center gap-3 font-display text-2xl tracking-tight">
                      <m.icon className="size-5 shrink-0 text-saffron" aria-hidden />
                      {m.title}
                    </h3>
                    <p className="mt-3 leading-relaxed text-mist">{m.body}</p>
                    <a
                      href={m.href}
                      className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-saffron underline-offset-4 hover:underline"
                    >
                      {m.hrefLabel}
                      <span aria-hidden>→</span>
                    </a>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>

          <Reveal delay={0.3}>
            <p className="mt-14 max-w-2xl font-deva text-lg leading-relaxed text-mist">
              जो देखने आते हैं, वे ही सँभालने लगें — तो हर यात्रा एक सेवा बन जाती है।
            </p>
          </Reveal>
        </Container>
      </section>

      {/* Day — proof */}
      <section className="bg-paper-soft py-24 sm:py-28" aria-label="Proof, not promises">
        <Container>
          <SectionHeading
            eyebrow="03 — Why this works"
            title={
              <>
                Proof, not <span className="text-stone italic">promises.</span>
              </>
            }
            lede="The loop is small today — every number below is live from our own records, not a projection. The design is for scale; the evidence starts now."
          />
          <div className="mt-14 grid gap-5 sm:grid-cols-3">
            {proof.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.08}>
                <div className="flex h-full flex-col justify-between rounded-lg border border-ink/8 bg-paper-raised p-7 shadow-card transition-colors duration-300 hover:border-saffron/40">
                  <s.icon className="size-6 text-teal" aria-hidden />
                  <div className="mt-10">
                    <p className="font-mono text-4xl text-ink">{s.value}</p>
                    <p className="mt-2 text-sm font-medium text-stone">{s.label}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.3}>
            <div className="mt-12 flex flex-wrap items-center gap-4">
              <ButtonLink href="/impact" size="lg">
                Read the live impact ledger
                <ShieldCheck className="size-4" aria-hidden />
              </ButtonLink>
              <p className="text-sm text-stone">
                Computed from check-ins, RSVPs and reports — nothing is hardcoded.
              </p>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
