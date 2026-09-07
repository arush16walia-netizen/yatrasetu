import Image from "@/components/ui/image";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";

const IMAGE = "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2400&auto=format&fit=crop";

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden" aria-label="Begin your journey">
      <div className="absolute inset-0" aria-hidden>
        <Image src={IMAGE} alt="" fill sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-ink/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/40" />
      </div>

      <Container className="relative flex min-h-[80svh] flex-col items-center justify-center py-32 text-center text-paper">
        <Reveal>
          <p className="eyebrow text-saffron">यात्रा बने सेवा</p>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="mt-6 max-w-4xl font-display text-5xl leading-[1.02] tracking-tight text-balance sm:text-7xl">
            Your next journey can leave a mark.
            <br />
            <span className="text-paper/60 italic">Make sure it&rsquo;s a good one.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.22}>
          <p className="mx-auto mt-7 max-w-xl text-lg leading-relaxed text-paper/75">
            Somewhere in India, a shore, a ghat or a trail is waiting for exactly
            your kind of traveller. Go. And leave it better than you found it.
          </p>
        </Reveal>
        <Reveal delay={0.34}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <ButtonLink href="/explore" size="lg">
              Explore Yatra
              <ArrowUpRight className="size-4" aria-hidden />
            </ButtonLink>
            <ButtonLink href="/events" variant="outline-light" size="lg">
              Join a restoration event
            </ButtonLink>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}