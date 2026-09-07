import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";

const LOOP = [
  { word: "Travel", hindi: "यात्रा", line: "See India the way it deserves to be seen — slowly, deeply, with hands ready." },
  { word: "Give back", hindi: "सेवा", line: "Restore a place at every stop. An hour of your journey becomes its story." },
  { word: "Get rewarded", hindi: "प्रतिफल", line: "Verified stamps unlock discounts that make the next yatra lighter." },
  { word: "Travel again", hindi: "पुनः यात्रा", line: "Better, cheaper, more meaningful — and the loop keeps the land alive." },
];

export function CoreLoop() {
  return (
    <section className="overflow-hidden bg-paper py-24 sm:py-32" aria-label="The core loop">
      <Container>
        <Reveal>
          <p className="eyebrow text-center text-saffron-deep">The loop that keeps India alive</p>
          <h2 className="mx-auto mt-5 max-w-3xl text-center font-display text-4xl leading-[1.05] tracking-tight text-balance sm:text-6xl">
            Tourism that pays the land back —{" "}
            <span className="text-stone italic">in every direction.</span>
          </h2>
        </Reveal>

        {/* Circular arrangement on desktop */}
        <div className="relative mx-auto mt-16 hidden aspect-square w-full max-w-2xl lg:block" aria-hidden>
          {/* rotating dashed ring */}
          <div className="absolute inset-[12%] rounded-full border border-dashed border-ink/20" />
          <div className="absolute inset-[19%] rounded-full border border-ink/5" />
          {/* center */}
          <div className="absolute left-1/2 top-1/2 grid size-40 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-ink text-center shadow-lift">
            <div>
              <p className="font-deva text-lg text-saffron">यात्रा बने सेवा</p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-paper/60">
                The loop
              </p>
            </div>
          </div>

          {LOOP.map((item, i) => {
            const positions = [
              "left-1/2 top-0 -translate-x-1/2 -translate-y-1/3",
              "right-0 top-1/2 translate-x-1/3 -translate-y-1/2",
              "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/3",
              "left-0 top-1/2 -translate-x-1/3 -translate-y-1/2",
            ];
            return (
              <Reveal key={item.word} delay={i * 0.12}>
                <div
                  className={`absolute w-48 text-center ${positions[i]}`}
                  style={{ zIndex: 2 }}
                >
                  <p className="font-display text-3xl font-semibold tracking-tight text-ink">{item.word}</p>
                  <p className="mt-1 font-deva text-xs text-stone">{item.hindi}</p>
                  <p className="mt-2 text-xs leading-relaxed text-stone/80">{item.line}</p>
                </div>
              </Reveal>
            );
          })}

          {/* directional arrows */}
          <svg className="absolute inset-0 size-full" viewBox="0 0 100 100">
            {[
              "M 50 6 C 74 6 94 26 94 50",
              "M 94 50 C 94 74 74 94 50 94",
              "M 50 94 C 26 94 6 74 6 50",
              "M 6 50 C 6 26 26 6 50 6",
            ].map((d, i) => (
              <path
                key={i}
                d={d}
                fill="none"
                stroke="currentColor"
                strokeOpacity="0.25"
                strokeWidth="0.5"
                strokeDasharray="2 3"
                className="text-saffron-deep"
                markerEnd={`url(#arrow-${i})`}
              />
            ))}
            <defs>
              {[0, 1, 2, 3].map((i) => (
                <marker key={i} id={`arrow-${i}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="3.5" markerHeight="3.5" orient="auto-start-reverse">
                  <path d="M 0 1 L 9 5 L 0 9 z" fill="currentColor" className="text-saffron-deep" />
                </marker>
              ))}
            </defs>
          </svg>
        </div>

        {/* Vertical stack on mobile */}
        <div className="mt-14 grid gap-4 lg:hidden">
          {LOOP.map((item, i) => (
            <Reveal key={item.word} delay={i * 0.08}>
              <div className="rounded-lg border border-ink/8 bg-paper-raised p-6 shadow-card">
                <div className="flex items-baseline justify-between">
                  <h3 className="font-display text-2xl tracking-tight text-ink">{item.word}</h3>
                  <span className="font-deva text-sm text-saffron-deep">{item.hindi}</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-stone">{item.line}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}