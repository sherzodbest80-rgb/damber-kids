import LeadForm from "@/components/LeadForm";

const PHONE = "+998 93 372-53-13";
const PHONE_HREF = "tel:+998933725313";

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-x-hidden bg-ink px-5 py-12">
      {/* fon panjarasi + neon pol */}
      <div className="pointer-events-none fixed inset-0 grid-lines opacity-50" />
      <div className="floor-glow pointer-events-none fixed inset-x-0 bottom-0 h-[40vh]" />

      <div className="relative z-10 w-full max-w-[460px]">
        {/* brend */}
        <div className="mb-6 flex items-center justify-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-neon font-display text-lg font-900 text-white shadow-neon">
            D
          </span>
          <span className="font-display text-xl font-800 tracking-tight text-cream">
            DAMBER <span className="text-neon">KIDS</span>
          </span>
        </div>

        <LeadForm phone={PHONE} phoneHref={PHONE_HREF} />
      </div>
    </main>
  );
}
