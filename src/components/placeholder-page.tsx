import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/container";

export function PlaceholderPage({
  title,
  note,
}: {
  title: string;
  note: string;
}) {
  return (
    <section className="flex min-h-[80vh] flex-col justify-end bg-ink pb-20 pt-40 text-paper">
      <Container>
        <p className="eyebrow text-saffron">Yatra Setu</p>
        <h1 className="mt-5 max-w-3xl font-display text-6xl leading-[1.02] tracking-tight sm:text-7xl">
          {title}
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-mist">{note}</p>
        <Link
          href="/"
          className="mt-10 inline-flex items-center gap-2 text-sm font-semibold text-paper/70 transition-colors hover:text-paper"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to home
        </Link>
      </Container>
    </section>
  );
}