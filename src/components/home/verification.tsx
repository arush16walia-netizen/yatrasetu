import { toDataURL } from "qrcode";
import { BadgeCheck, Clock3, MapPinned, QrCode } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";

export async function Verification() {
  // A real QR — scan it, it points at the philosophy.
  const qr = await toDataURL("https://yatrasetu.in/yatra-bane-seva", {
    margin: 1,
    width: 420,
    color: { dark: "#0B0F17", light: "#FFFFFF" },
  });

  const proofs = [
    { icon: QrCode, title: "QR check-in", line: "Each event has a unique code at the site." },
    { icon: Clock3, title: "Timestamp", line: "The exact minute you arrived, on record." },
    { icon: MapPinned, title: "Location verification", line: "Confirmed at the event's coordinates." },
  ];

  return (
    <section className="bg-paper py-24 sm:py-32" aria-label="QR verification">
      <Container className="grid items-center gap-14 lg:grid-cols-2">
        <div>
          <SectionHeading
            eyebrow="Verified contribution"
            title={
              <>
                Your contribution is <span className="text-verify">real</span> — and we can prove it.
              </>
            }
            lede="No screenshots, no honour-system. When you scan the event QR at the site, three things are captured at once — and a permanent, verifiable record is created."
          />
          <div className="mt-10 space-y-4">
            {proofs.map((proof, i) => (
              <Reveal key={proof.title} delay={i * 0.1}>
                <div className="flex items-start gap-4 rounded-lg border border-ink/8 bg-paper-raised p-5 shadow-card transition-colors duration-300 hover:border-saffron/40">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-teal/12 text-teal">
                    <proof.icon className="size-5" aria-hidden />
                  </span>
                  <div>
                    <h3 className="font-semibold text-ink">{proof.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-stone">{proof.line}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* The QR visual */}
        <Reveal delay={0.15}>
          <div className="relative mx-auto w-full max-w-sm">
            <div className="absolute -inset-6 rounded-[40px] bg-gradient-to-br from-saffron/25 via-transparent to-teal/20 blur-2xl" aria-hidden />
            <div className="relative rounded-lg border border-ink/8 bg-paper-raised p-8 shadow-lift">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qr} alt="QR code that links to the Yatra Setu philosophy" className="mx-auto w-full rounded-md" width={420} height={420} />
              <div className="mt-6 flex items-center justify-between rounded-md border border-verify/25 bg-verify/8 px-4 py-3">
                <span className="flex items-center gap-2 text-sm font-semibold text-verify">
                  <BadgeCheck className="size-5" aria-hidden />
                  Verified participation
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-verify/80">
                  Stamped
                </span>
              </div>
            </div>
            <Reveal delay={0.35}>
              <p className="mt-5 text-center text-xs leading-relaxed text-stone">
                Scan it — even the explanation leads somewhere.
                <br />
                <span className="font-deva text-[13px]">यात्रा बने सेवा</span>
              </p>
            </Reveal>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}