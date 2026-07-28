import Link from "next/link";

const PHONE = "+998 93 372-53-13";
const PHONE_HREF = "tel:+998933725313";

export default function ThanksPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink px-5">
      <div className="pointer-events-none absolute inset-0 grid-lines opacity-60" />
      <div className="floor-glow pointer-events-none absolute inset-x-0 bottom-0 h-64" />

      <div className="relative z-10 w-full max-w-md animate-fade-up text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-neon text-3xl text-white shadow-neon-lg">
          ✓
        </div>
        <h1 className="font-display text-3xl font-900 tracking-tight text-cream sm:text-4xl">
          Rahmat!
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted">
          Buyurtmangiz qabul qilindi. Menejerimiz siz bilan tez orada
          bog'lanadi. Iltimos, telefoningizni yaqin ushlab turing.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3">
          <a
            href={PHONE_HREF}
            className="w-full rounded-full bg-neon py-3.5 font-display text-base font-700 text-white shadow-neon transition hover:shadow-neon-lg"
          >
            {PHONE}
          </a>
          <Link
            href="/"
            className="text-sm font-600 text-muted transition hover:text-neon"
          >
            ← Bosh sahifaga qaytish
          </Link>
        </div>
      </div>
    </main>
  );
}
