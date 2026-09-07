"use client";

import { useRef } from "react";
import { Award, Download, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export type CertificateData = {
  id: string;
  name: string;
  eventTitle: string;
  destination: string;
  eventDate: string;
  verifiedAt: string;
  hours: number;
  method: string;
  stampName: string | null;
};

const INK = "#0B0F17";
const PAPER = "#FAFAFA";
const SAFFRON = "#E65100";

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

function drawCertificate(canvas: HTMLCanvasElement, c: CertificateData) {
  const W = 1400;
  const H = 990;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // paper ground
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);

  // ink frame
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  ctx.strokeRect(36, 36, W - 72, H - 72);
  ctx.lineWidth = 1;
  ctx.strokeRect(50, 50, W - 100, H - 100);

  // saffron top rule
  ctx.fillStyle = SAFFRON;
  ctx.fillRect(W / 2 - 60, 96, 120, 4);

  // eyebrow
  ctx.fillStyle = "#9BA6B5";
  ctx.font = "600 22px Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText("YATRA SETU · यात्रा बने सेवा", W / 2, 150);

  // title
  ctx.fillStyle = INK;
  ctx.font = "italic 72px Georgia, serif";
  ctx.fillText("Certificate of Service", W / 2, 250);

  // awarded line
  ctx.font = "26px Helvetica, Arial, sans-serif";
  ctx.fillStyle = "#5B6472";
  ctx.fillText("This certifies that", W / 2, 330);

  // name
  ctx.font = "bold 64px Georgia, serif";
  ctx.fillStyle = INK;
  ctx.fillText(c.name, W / 2, 420);

  // name underline
  ctx.strokeStyle = SAFFRON;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 280, 445);
  ctx.lineTo(W / 2 + 280, 445);
  ctx.stroke();

  // body
  ctx.fillStyle = "#333B47";
  ctx.font = "26px Helvetica, Arial, sans-serif";
  ctx.fillText(`contributed ${c.hours} hours of service at`, W / 2, 510);
  ctx.font = "bold 40px Georgia, serif";
  ctx.fillStyle = INK;
  ctx.fillText(c.eventTitle, W / 2, 575);
  ctx.font = "24px Helvetica, Arial, sans-serif";
  ctx.fillStyle = "#5B6472";
  ctx.fillText(`${c.destination} · ${fmtDate(c.eventDate)}`, W / 2, 620);

  // verification chip
  ctx.font = "600 22px Helvetica, Arial, sans-serif";
  ctx.fillStyle = "#3b6f49";
  const method = c.method === "qr" ? "QR-verified check-in" : c.method === "code" ? "Code-verified check-in" : "Verified by organiser";
  ctx.fillText(`${method} · ${fmtDate(c.verifiedAt)}`, W / 2, 690);

  // stamp earned
  if (c.stampName) {
    ctx.fillStyle = SAFFRON;
    ctx.beginPath();
    ctx.arc(W / 2, 780, 58, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = INK;
    ctx.font = "bold 20px Georgia, serif";
    ctx.fillText(c.stampName.toUpperCase(), W / 2, 776);
    ctx.font = "600 14px Helvetica, Arial, sans-serif";
    ctx.fillText("STAMP EARNED", W / 2, 800);
  }

  // verification id + footer
  ctx.fillStyle = "#9BA6B5";
  ctx.font = "18px Helvetica, Arial, sans-serif";
  ctx.fillText(`Verification ID ${c.id}`, W / 2, 890);
  ctx.font = "600 20px Helvetica, Arial, sans-serif";
  ctx.fillStyle = INK;
  ctx.fillText("The journey became service.", W / 2, 925);
}

export function CertificateCard({ cert }: { cert: CertificateData }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  function download() {
    const canvas = document.createElement("canvas");
    drawCertificate(canvas, cert);
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `yatra-setu-certificate-${cert.id.slice(-6)}.png`;
    a.click();
  }

  return (
    <div className="group overflow-hidden rounded-lg border border-ink/8 bg-paper-raised shadow-card transition-colors duration-300 hover:border-saffron/40 hover:shadow-lift">
      {/* mini preview */}
      <div className="relative flex aspect-[16/9] flex-col items-center justify-center overflow-hidden border-b border-ink/8 bg-gradient-to-br from-[#EFE8DA] to-paper-raised p-6 text-center">
        <Award className="size-6 text-saffron-deep" aria-hidden />
        <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.22em] text-stone/80">
          Certificate of Service
        </p>
        <p className="mt-3 font-display text-xl tracking-tight text-ink">{cert.name}</p>
        <p className="mt-1 max-w-[80%] truncate text-xs text-stone">
          {cert.eventTitle} · {cert.hours} hours
        </p>
        <p className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#3b6f49]">
          <MapPin className="size-3" aria-hidden />
          Verified · {fmtDate(cert.verifiedAt)}
        </p>
        {cert.stampName && (
          <span className="absolute right-4 top-4 flex size-14 items-center justify-center rounded-full border-2 border-saffron/60 bg-saffron/15 text-[9px] font-bold uppercase leading-tight tracking-wider text-saffron-deep">
            {cert.stampName}
          </span>
        )}
      </div>

      {/* info + actions */}
      <div className="p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone">
          {cert.destination} · {fmtDate(cert.eventDate)}
        </p>
        <h3 className="mt-1.5 font-display text-lg tracking-tight text-ink">{cert.eventTitle}</h3>
        <div className="mt-4 flex items-center justify-between border-t border-ink/8 pt-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#3b6f49]">
            <Award className="size-3.5" aria-hidden />
            {cert.hours} service hours · {cert.stampName ? `${cert.stampName} stamp` : "record verified"}
          </span>
          <Button variant="outline-dark" size="sm" onClick={download}>
            <Download className="size-3.5" aria-hidden />
            Download
          </Button>
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" aria-hidden />
    </div>
  );
}
