import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Landmark, MapPin } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { SpeakButton } from "@/components/ui/speak-button";
import { HERITAGE_SITES, heritageDetail, heritageSite } from "@/lib/heritage";

export function generateStaticParams() {
  return HERITAGE_SITES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const site = heritageSite(slug);
  if (!site) return {};
  return { title: `${site.name} — heritage storyteller`, description: site.blurb };
}

export default async function HeritageDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const site = heritageSite(slug);
  if (!site) notFound();

  const { wiki } = await heritageDetail(site);
  const story = wiki?.extract ?? site.blurb;

  return (
    <>
      <section className="relative flex min-h-[46svh] items-end overflow-hidden bg-ink pb-12 pt-40 text-paper">
        <div
          className="absolute inset-0"
          aria-hidden
          style={{
            background:
              "radial-gradient(70% 90% at 85% 0%, rgb(196 68 0 / 0.3), transparent 60%), radial-gradient(50% 70% at 5% 100%, rgb(0 105 92 / 0.28), transparent 65%)",
          }}
        />
        <Container className="relative">
          <Reveal>
            <Link href="/heritage" className="inline-flex items-center gap-1.5 text-sm text-paper/70 transition-colors hover:text-paper">
              <ArrowLeft className="size-4" aria-hidden /> All heritage sites
            </Link>
            <p className="eyebrow mt-6 flex items-center gap-3 text-saffron">
              <Landmark className="size-4" aria-hidden />
              {site.era}
            </p>
            <h1 className="mt-3 font-display text-4xl font-semibold leading-tight sm:text-5xl">
              {site.name} <span className="text-paper/60">· {site.hindiName}</span>
            </h1>
            <p className="mt-3 flex items-center gap-1.5 text-paper/70">
              <MapPin className="size-4" aria-hidden /> {site.city}, {site.state}
            </p>
            <div className="mt-5 inline-flex items-center gap-3 rounded-full border border-paper/20 bg-paper/5 py-2 pl-4 pr-3">
              <span className="text-sm text-paper/80">Listen to this story</span>
              <SpeakButton text={`${site.name}. ${story}`} lang="en-IN" />
            </div>
          </Reveal>
        </Container>
      </section>

      <Container className="max-w-3xl py-16">
        <Reveal>
          <article className="rounded-3xl border border-ink/10 bg-white/70 p-8 shadow-sm">
            <h2 className="font-display text-2xl font-semibold text-ink">The story</h2>
            <p className="mt-4 text-lg leading-relaxed text-ink">{story}</p>
            {wiki && (
              <a
                href={wiki.articleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-teal hover:underline"
              >
                Deeper history via Wikipedia <ExternalLink className="size-3.5" aria-hidden />
              </a>
            )}
            <p className="mt-6 rounded-2xl bg-ink/5 px-5 py-4 text-sm leading-relaxed text-stone">
              {site.blurb}
            </p>
          </article>

          {site.destinationSlug && (
            <Link
              href={`/explore/${site.destinationSlug}`}
              className="mt-6 inline-flex items-center gap-1.5 font-medium text-saffron-deep hover:underline"
            >
              Plan a responsible yatra to {site.city} →
            </Link>
          )}
        </Reveal>
      </Container>
    </>
  );
}
