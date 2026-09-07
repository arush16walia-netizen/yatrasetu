import type { Metadata } from "next";
import Link from "next/link";
import { Award, FileText, ScanLine, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { ButtonLink } from "@/components/ui/button";
import { CertificateCard } from "@/components/certificates/certificate-card";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Service certificates",
  description:
    "Every verified check-in on Yatra Setu becomes a downloadable certificate of service — timestamped, geo-confirmed, issued in your name.",
};

export const dynamic = "force-dynamic";

function hoursFrom(start?: string | null, end?: string | null): number {
  if (!start || !end) return 3;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const mins = eh * 60 + em - (sh * 60 + sm);
  if (!Number.isFinite(mins) || mins <= 0) return 3;
  return Math.round((mins / 60) * 2) / 2;
}

export default async function CertificatesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <section className="flex min-h-[80vh] flex-col justify-center bg-ink pt-40 text-paper">
        <Container>
          <Reveal>
            <p className="eyebrow text-saffron">Service certificates</p>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="mt-5 max-w-3xl font-display text-5xl leading-[1.02] tracking-tight sm:text-6xl">
              Proof of the hours you gave.
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-mist">
              Every verified check-in — QR scan, timestamp, location confirmed — issues a
              certificate of service in your name. Sign in to see yours.
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="mt-10 flex flex-wrap gap-3">
              <ButtonLink href="/login?next=/certificates" size="lg">
                Sign in
              </ButtonLink>
              <ButtonLink href="/events" size="lg" variant="outline-light">
                Browse events to earn one
              </ButtonLink>
            </div>
          </Reveal>
        </Container>
      </section>
    );
  }

  const attendances = await prisma.attendanceRecord.findMany({
    where: { userId: session.user.id },
    orderBy: { verifiedAt: "desc" },
    include: {
      rsvp: {
        include: {
          event: {
            include: { destination: { select: { name: true, region: true } } },
          },
        },
      },
      stamp: true,
    },
  });

  const certificates = attendances.map((a) => {
    const ev = a.rsvp.event;
    return {
      id: a.id,
      name: session.user.name ?? "A traveller",
      eventTitle: ev.title,
      destination: `${ev.destination.name}, ${ev.destination.region}`,
      eventDate: ev.date.toISOString(),
      verifiedAt: a.verifiedAt.toISOString(),
      hours: hoursFrom(ev.startTime, ev.endTime),
      method: a.method,
      stampName: a.stamp?.name ?? null,
    };
  });

  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[52svh] items-end overflow-hidden bg-ink pb-14 pt-44 text-paper">
        <div
          className="absolute inset-0"
          aria-hidden
          style={{
            background:
              "radial-gradient(75% 90% at 85% 0%, rgb(230 81 0 / 0.13), transparent 60%), radial-gradient(55% 70% at 5% 100%, rgb(0 77 64 / 0.22), transparent 65%)",
          }}
        />
        <Container className="relative">
          <Reveal>
            <p className="eyebrow flex items-center gap-3 text-saffron">
              <span className="h-px w-10 bg-saffron/70" aria-hidden />
              Service certificates
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="mt-6 max-w-4xl font-display text-[clamp(2.6rem,6vw,5.5rem)] font-medium leading-[0.98] tracking-tight">
              Proof of the hours you gave.
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-paper/80">
              Each verified check-in issues a certificate — accepted by NSS/NCC cells as evidence
              of community service, because the verification behind it is real.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <p className="mt-6 flex items-center gap-2 text-sm text-paper/70">
              <ShieldCheck className="size-4 text-saffron" aria-hidden />
              {certificates.length} verified contribution{certificates.length === 1 ? "" : "s"} on record
            </p>
          </Reveal>
        </Container>
      </section>

      {/* Certificates */}
      <section className="bg-paper py-20 sm:py-28">
        <Container className="max-w-6xl">
          {certificates.length === 0 ? (
            <Reveal>
              <div className="mx-auto max-w-lg rounded-lg border border-dashed border-ink/15 p-12 text-center">
                <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-ink/5">
                  <FileText className="size-6 text-stone" aria-hidden />
                </span>
                <h2 className="mt-5 font-display text-2xl tracking-tight text-ink">
                  No certificates yet
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-stone">
                  Your first certificate is one seva away. RSVP to a restoration event, arrive,
                  scan the QR — the certificate issues itself.
                </p>
                <ButtonLink href="/events" className="mt-6">
                  Find an event
                </ButtonLink>
              </div>
            </Reveal>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {certificates.map((cert, i) => (
                <Reveal key={cert.id} delay={Math.min(i * 0.06, 0.3)}>
                  <CertificateCard cert={cert} />
                </Reveal>
              ))}
            </div>
          )}

          {certificates.length > 0 && (
            <Reveal delay={0.2}>
              <p className="mt-10 flex items-center justify-center gap-2 text-center text-sm text-stone">
                <ScanLine className="size-4 text-saffron-deep" aria-hidden />
                Every certificate carries its verification ID — auditable against the attendance record.
                <Award className="size-4 text-saffron-deep" aria-hidden />
              </p>
            </Reveal>
          )}
        </Container>
      </section>
    </>
  );
}
