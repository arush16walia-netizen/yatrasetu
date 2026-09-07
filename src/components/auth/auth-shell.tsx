import Image from "@/components/ui/image";
import { AuthForm } from "./auth-form";

const IMAGE = "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=1800&auto=format&fit=crop";

export function AuthShell({ mode }: { mode: "login" | "register" }) {
  const isRegister = mode === "register";

  return (
    <div className="grid min-h-[100svh] lg:grid-cols-2">
      {/* Cinematic panel */}
      <div className="relative hidden overflow-hidden bg-ink lg:block">
        <Image src={IMAGE} alt="" fill sizes="50vw" className="object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/10" />
        <div className="relative flex h-full flex-col justify-end p-14 text-paper">
          <p className="eyebrow text-saffron">यात्रा बने सेवा</p>
          <blockquote className="mt-6 max-w-md font-display text-3xl leading-[1.15] tracking-tight text-balance">
            &ldquo;Travel can be the most beautiful form of giving —
            <span className="text-paper/60 italic"> if you let it.</span>&rdquo;
          </blockquote>
          <p className="mt-6 font-deva text-lg text-paper/60">
            हर यात्रा एक कहानी है। उसे सेवा की कहानी बनाइए।
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-paper px-6 py-24 sm:px-12">
        <div className="w-full max-w-md">
          <p className="eyebrow text-saffron-deep">Yatra Setu</p>
          <h1 className="mt-4 font-display text-4xl leading-[1.05] tracking-tight text-ink sm:text-5xl">
            {isRegister ? (
              <>
                Begin your
                <br />
                <span className="italic text-stone">passport.</span>
              </>
            ) : (
              <>
                Welcome
                <br />
                <span className="italic text-stone">back to the journey.</span>
              </>
            )}
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-stone">
            {isRegister
              ? "One identity for every place you'll restore — stamps, rewards and verified contributions, all in one place."
              : "Your stamps, RSVPs and verified contributions are waiting."}
          </p>
          <div className="mt-8">
            <AuthForm mode={mode} />
          </div>
        </div>
      </div>
    </div>
  );
}