import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { ArrowUpRight, MapPin, Stamp as StampIcon } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";

export function Passport() {
  return (
    <section className="bg-ink py-24 text-paper sm:py-32" aria-label="The Yatra Passport">
      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div>
            <SectionHeading
              tone="dark"
              eyebrow="Yatra Passport"
              title={
                <>
                  One passport.
                  <br />
                  Every place you&rsquo;ve helped.
                </>
              }
              lede="Your verified contributions, the places you restored, the stamps you earned — one living record of every journey that gave back."
            />
            <Reveal delay={0.2}>
              <ButtonLink href="/passport" size="md" className="mt-10">
                Open your passport
                <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </ButtonLink>
            </Reveal>
            <Reveal delay={0.3}>
              <p className="mt-6 text-sm text-mist">
                New here? <Link href="/login" className="text-saffron underline-offset-4 hover:underline">Sign in</Link> to
                start your first page.
              </p>
            </Reveal>
          </div>

          {/* Passport spread */}
          <Reveal delay={0.15}>
            <div
              className="relative mx-auto max-w-lg -rotate-1 transition-transform duration-700 ease-expo hover:rotate-0"
              aria-hidden
            >
              <div className="absolute -inset-5 rounded-[36px] bg-saffron/15 blur-3xl" />
              <div className="relative grid grid-cols-2 overflow-hidden rounded-lg shadow-lift">
                {/* Left page */}
                <div className="flex flex-col bg-paper p-5 text-ink sm:p-7">
                  <div className="flex items-center justify-between">
                    <p className="eyebrow text-saffron-deep">Destinations</p>
                    <MapPin className="size-4 text-stone/50" aria-hidden />
                  </div>
                  <p className="mt-3 font-display text-xl leading-tight tracking-tight">
                    Places I helped
                  </p>
                  <div className="mt-4 space-y-2.5">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="flex h-11 items-center rounded-md border border-dashed border-ink/15 px-3 text-xs text-stone/50"
                      >
                        {i === 0 ? "Your first place awaits…" : ""}
                      </div>
                    ))}
                  </div>
                  <div className="mt-auto pt-6">
                    <p className="font-deva text-sm text-stone">यात्रा सेतु</p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-stone/50">
                      Yatra Passport · No. YS-001
                    </p>
                  </div>
                </div>
                {/* Right page */}
                <div className="flex flex-col bg-paper-soft p-5 text-ink sm:p-7">
                  <div className="flex items-center justify-between">
                    <p className="eyebrow text-saffron-deep">Stamps</p>
                    <StampIcon className="size-4 text-stone/50" aria-hidden />
                  </div>
                  <p className="mt-3 font-display text-xl leading-tight tracking-tight">
                    Verified seva
                  </p>
                  <div className="mt-4 grid flex-1 grid-cols-3 content-start gap-2.5">
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="grid aspect-square place-items-center rounded-md border border-dashed border-ink/15 text-stone/40"
                      >
                        {i === 0 && (
                          <span className="text-[9px] font-semibold uppercase tracking-wider text-center leading-tight">
                            Your first
                            <br />
                            stamp
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 rounded-md bg-ink px-3 py-2 text-center">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-saffron">
                      0 verified contributions
                    </p>
                  </div>
                </div>
              </div>
              {/* spine */}
              <div className="absolute inset-y-0 left-1/2 w-[6px] -translate-x-1/2 bg-gradient-to-b from-ink/20 via-ink/5 to-ink/20" />
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}