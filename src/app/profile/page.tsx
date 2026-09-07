import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight, CalendarCheck2, LogOut, Stamp as StampIcon, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { SignOutButton } from "@/components/auth/sign-out-button";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?next=/profile");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      _count: {
        select: {
          rsvps: { where: { status: { in: ["CONFIRMED", "ATTENDED"] } } },
          attendances: true,
          earnedStamps: true,
        },
      },
      rsvps: {
        where: { status: { in: ["CONFIRMED", "ATTENDED"] } },
        orderBy: { createdAt: "desc" },
        take: 4,
        include: { event: { select: { title: true, date: true, slug: true, destination: { select: { name: true } } } } },
      },
    },
  });

  if (!user) redirect("/login");

  const stats = [
    { icon: CalendarCheck2, label: "Events joined", value: user._count.rsvps },
    { icon: ShieldCheck, label: "Verified contributions", value: user._count.attendances },
    { icon: StampIcon, label: "Stamps earned", value: user._count.earnedStamps },
  ];

  return (
    <section className="min-h-[100svh] bg-paper pt-36 pb-24">
      <Container className="max-w-5xl">
        {/* header */}
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="flex items-center gap-6">
            <span className="grid size-20 place-items-center rounded-full bg-ink font-display text-3xl font-semibold text-saffron">
              {(user.name ?? "Y").charAt(0).toUpperCase()}
            </span>
            <div>
              <h1 className="font-display text-4xl tracking-tight text-ink sm:text-5xl">
                {user.name}
              </h1>
              <p className="mt-2 text-sm text-stone">
                {user.email} · traveller since {formatDate(user.createdAt)}
              </p>
            </div>
          </div>
          <SignOutButton />
        </div>

        {/* stats */}
        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border border-ink/8 bg-paper-raised p-6 shadow-card"
            >
              <stat.icon className="size-5 text-saffron-deep" aria-hidden />
              <p className="mt-4 font-display text-5xl tracking-tight text-ink">{stat.value}</p>
              <p className="mt-1 text-sm text-stone">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* upcoming */}
        <div className="mt-14">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl tracking-tight text-ink sm:text-3xl">
              Your events
            </h2>
            <Link href="/events" className="group inline-flex items-center gap-1.5 text-sm font-semibold text-saffron-deep hover:underline">
              Find more
              <ArrowUpRight className="size-4" aria-hidden />
            </Link>
          </div>
          {user.rsvps.length === 0 ? (
            <div className="mt-6 rounded-lg border border-dashed border-ink/20 bg-paper-raised/60 p-10 text-center">
              <p className="font-display text-xl text-ink">Your journey hasn&rsquo;t found its first seva yet.</p>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-stone">
                Join a restoration event — a shoreline, a ghat or a trail is waiting for you.
              </p>
              <ButtonLink href="/events" className="mt-6">
                Explore restoration events
                <ArrowUpRight className="size-4" aria-hidden />
              </ButtonLink>
            </div>
          ) : (
            <ul className="mt-6 space-y-3">
              {user.rsvps.map((rsvp) => (
                <li key={rsvp.id}>
                  <Link
                    href={`/events/${rsvp.event.slug}`}
                    className="flex items-center justify-between gap-4 rounded-lg border border-ink/8 bg-paper-raised p-5 shadow-card transition-colors duration-300 hover:border-saffron/40"
                  >
                    <div>
                      <p className="font-display text-lg tracking-tight text-ink">{rsvp.event.title}</p>
                      <p className="mt-1 text-sm text-stone">
                        {rsvp.event.destination.name} · {formatDate(rsvp.event.date)}
                      </p>
                    </div>
                    <span className="flex shrink-0 items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-verify">
                      <span className="size-1.5 rounded-full bg-verify" aria-hidden />
                      {rsvp.status === "ATTENDED" ? "Attended" : "Confirmed"}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Container>
    </section>
  );
}