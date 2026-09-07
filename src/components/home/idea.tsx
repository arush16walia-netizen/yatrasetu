import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";

const STAGES = [
  {
    step: "Visit",
    hindi: "यात्रा",
    line: "You arrive with wonder — and a question: what does this place need?",
  },
  {
    step: "Participate",
    hindi: "सहभागिता",
    line: "You join a restoration event run by locals, for the place itself.",
  },
  {
    step: "Restore",
    hindi: "पुनर्स्थापन",
    line: "A shoreline, a ghat, a trail — your hands make it measurably better.",
  },
  {
    step: "Reward",
    hindi: "प्रतिफल",
    line: "A verified contribution, a stamp in your passport, a reward for your next yatra.",
  },
];

export function Idea() {
  return (
    <section className="bg-ink py-24 text-paper sm:py-32" aria-label="The Yatra Setu idea">
      <Container>
        <SectionHeading
          tone="dark"
          eyebrow="The idea"
          title={
            <>
              Travel can <em className="text-saffron">give back</em>.
            </>
          }
          lede="Yatra Setu turns the moment of arrival into a moment of contribution. Four moves, one continuous cycle — and it starts the second you land."
        />

        <div className="mt-16 grid gap-4 lg:grid-cols-4">
          {STAGES.map((stage, i) => (
            <Reveal key={stage.step} delay={i * 0.12} className="h-full">
              <div className="group relative flex h-full flex-col justify-between rounded-lg border border-paper/10 bg-ink-soft p-7 transition-colors duration-300 hover:border-saffron/40 hover:bg-ink-raised">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-display text-5xl font-light text-paper/15 transition-colors duration-500 group-hover:text-saffron/40">
                      0{i + 1}
                    </span>
                    <span className="font-deva text-sm text-mist">{stage.hindi}</span>
                  </div>
                  <h3 className="mt-6 font-display text-3xl tracking-tight">{stage.step}</h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-mist">{stage.line}</p>
                </div>
                {i < STAGES.length - 1 && (
                  <ArrowRight
                    className="absolute -right-3.5 top-1/2 z-10 hidden size-6 -translate-y-1/2 text-saffron lg:block"
                    aria-hidden
                  />
                )}
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.4}>
          <p className="mx-auto mt-12 max-w-2xl text-center font-deva text-lg leading-relaxed text-mist">
            जो देखने आते हैं, वे ही सँभालने लगें — तो हर यात्रा एक सेवा बन जाती है।
          </p>
        </Reveal>
      </Container>
    </section>
  );
}