import type { Metadata } from "next";
import { BatteryLow, PhoneCall, PlaneTakeoff } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { Badge } from "@/components/ui/badge";
import { PassCache } from "@/components/offline/pass-cache";

export const metadata: Metadata = {
  title: "Offline travel pass",
  description: "Your yatra, cached on your own device — pull it up in airplane mode, with one-tap emergency dialers that need no network.",
};

export const dynamic = "force-dynamic";

const HELPLINES = [
  { tel: "112", label: "National Emergency", note: "All-in-one SOS" },
  { tel: "1078", label: "NDRF Disaster", note: "Landslide / flood rescue" },
  { tel: "1091", label: "Women Safety", note: "24×7 helpline" },
  { tel: "108", label: "Ambulance", note: "Medical emergency" },
];

export default async function OfflinePassPage() {
  const session = await auth();

  const entries = session?.user?.id
    ? (
        await prisma.eventRSVP.findMany({
          where: { userId: session.user.id, status: { in: ["GOING", "ATTENDED"] }, event: { status: { not: "CANCELLED" } } },
          orderBy: { event: { date: "asc" } },
          take: 10,
          select: {
            event: {
              select: {
                title: true,
                date: true,
                meetingPoint: true,
                slug: true,
                destination: { select: { name: true } },
              },
            },
          },
        })
      ).map(({ event }) => ({
        eventTitle: event.title,
        date: event.date.toISOString(),
        meetingPoint: event.meetingPoint,
        destination: event.destination.name,
        slug: event.slug,
      }))
    : [];

  return (
    <>
      <section className="relative flex min-h-[38svh] items-end overflow-hidden bg-ink pb-12 pt-40 text-paper">
        <div
          className="absolute inset-0"
          aria-hidden
          style={{
            background:
              "radial-gradient(70% 90% at 85% 0%, rgb(0 105 92 / 0.35), transparent 60%), radial-gradient(55% 70% at 5% 100%, rgb(196 68 0 / 0.15), transparent 65%)",
          }}
        />
        <Container className="relative">
          <Reveal>
            <p className="eyebrow flex items-center gap-3 text-saffron">
              <PlaneTakeoff className="size-4" aria-hidden />
              Offline remote pass
            </p>
            <h1 className="mt-4 max-w-2xl font-display text-4xl font-semibold leading-tight sm:text-5xl">
              Zero bars in the valley. Still works.
            </h1>
            <p className="mt-4 max-w-xl text-paper/70">
              Save your upcoming yatra to this device. The pass lives in your browser&apos;s own storage — pull it
              up in airplane mode when the Himalayan network disappears, along with emergency dialers that go
              straight to your phone&apos;s GSM hardware.
            </p>
          </Reveal>
        </Container>
      </section>

      <Container className="max-w-4xl py-16">
        <Reveal>
          <PassCache entries={entries} signedIn={Boolean(session?.user?.id)} />
        </Reveal>

        <Reveal delay={0.08}>
          <section className="mt-10 rounded-3xl border border-ink/10 bg-white/70 p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-full bg-ember/10 text-ember">
                <PhoneCall className="size-5" aria-hidden />
              </span>
              <div>
                <h2 className="font-display text-xl font-semibold text-ink">Emergency dialers</h2>
                <p className="text-sm text-stone">One tap opens your phone&apos;s dialer — these work on GSM signal alone, no data.</p>
              </div>
            </div>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {HELPLINES.map((h) => (
                <li key={h.tel}>
                  <a
                    href={`tel:${h.tel}`}
                    className="flex items-center gap-4 rounded-2xl border border-ink/10 bg-paper px-5 py-4 transition-colors hover:border-ember/50 hover:bg-ember/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
                    aria-label={`Call ${h.label} on ${h.tel}`}
                  >
                    <span className="font-mono text-2xl font-bold text-ember">{h.tel}</span>
                    <span>
                      <span className="block font-medium text-ink">{h.label}</span>
                      <span className="block text-xs text-stone">{h.note}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </Reveal>

        <Reveal delay={0.12}>
          <p className="mt-6 flex items-start gap-2 rounded-2xl border border-dashed border-ink/15 px-5 py-4 text-sm text-stone">
            <BatteryLow className="mt-0.5 size-4 shrink-0 text-ember" aria-hidden />
            <span>
              <Badge tone="teal">Honest limits</Badge> The pass renders from device cache only while this page
              itself remains in your browser cache — download the page or keep the tab open before you lose
              signal. A full offline app shell (service worker) is on the roadmap.
            </span>
          </p>
        </Reveal>
      </Container>
    </>
  );
}
