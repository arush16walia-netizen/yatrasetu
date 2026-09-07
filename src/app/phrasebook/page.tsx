import type { Metadata } from "next";
import { HandMetal } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { SpeakButton } from "@/components/ui/speak-button";
import { DIALECTS } from "@/lib/phrasebook";

export const metadata: Metadata = {
  title: "Dialect phrasebook",
  description: "Speak the hills — regional greetings, thanks and trail phrases with audio, plus the eco-etiquette that keeps sacred places sacred.",
};

export default function PhrasebookPage() {
  return (
    <>
      <section className="relative flex min-h-[38svh] items-end overflow-hidden bg-ink pb-12 pt-40 text-paper">
        <div
          className="absolute inset-0"
          aria-hidden
          style={{
            background:
              "radial-gradient(70% 90% at 80% 0%, rgb(0 105 92 / 0.3), transparent 60%), radial-gradient(50% 70% at 8% 100%, rgb(196 68 0 / 0.15), transparent 65%)",
          }}
        />
        <Container className="relative">
          <Reveal>
            <p className="eyebrow flex items-center gap-3 text-saffron">
              <span className="h-px w-10 bg-saffron/70" aria-hidden />
              Dialect phrasebook
            </p>
            <h1 className="mt-4 max-w-2xl font-display text-4xl font-semibold leading-tight sm:text-5xl">
              Six regions. One respectful hello.
            </h1>
            <p className="mt-4 max-w-xl text-paper/70">
              Tap the speaker to hear each phrase in your browser — no network, no downloads. And read the
              eco-etiquette: in these hills, how you behave matters more than what you say.
            </p>
          </Reveal>
        </Container>
      </section>

      <Container className="py-16">
        <div className="grid gap-8 lg:grid-cols-2">
          {DIALECTS.map((d, i) => (
            <Reveal key={d.id} delay={i * 0.05}>
              <section className="h-full rounded-3xl border border-ink/10 bg-white/70 p-6 shadow-sm" aria-label={`${d.dialect} phrases for ${d.region}`}>
                <header className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-xl font-semibold text-ink">{d.dialect}</h2>
                    <p className="text-sm text-stone">
                      {d.region} · {d.where}
                    </p>
                  </div>
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-ink/5 text-saffron-deep">
                    <HandMetal className="size-5" aria-hidden />
                  </span>
                </header>

                <ul className="mt-5 space-y-2">
                  {d.phrases.map((p) => (
                    <li key={p.text} className="flex items-start gap-3 rounded-2xl border border-ink/10 bg-paper px-4 py-3">
                      <SpeakButton text={p.text} lang={p.lang} className="mt-0.5" />
                      <div>
                        <p className="font-medium text-ink">
                          {p.text}
                          {p.hindi && <span className="ml-2 text-stone">{p.hindi}</span>}
                        </p>
                        <p className="text-sm text-stone">{p.meaning}</p>
                      </div>
                    </li>
                  ))}
                </ul>

                <h3 className="mt-6 text-xs font-semibold uppercase tracking-wider text-ember">Eco-etiquette — do not</h3>
                <ul className="mt-2 space-y-1.5 text-sm text-stone">
                  {d.taboos.map((t) => (
                    <li key={t} className="flex gap-2">
                      <span aria-hidden className="mt-2 size-1 shrink-0 rounded-full bg-ember" />
                      {t}
                    </li>
                  ))}
                </ul>
              </section>
            </Reveal>
          ))}
        </div>
      </Container>
    </>
  );
}
