"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getCookie, generateEventId, buildFbcFromUrl } from "@/lib/fpixel";

const PRICE = "1 900 000";

export default function LeadForm({
  phone,
  phoneHref,
}: {
  phone: string;
  phoneHref: string;
}) {
  const router = useRouter();

  const [agreed, setAgreed] = useState(false); // "Narxni ko'rdim, roziman"
  const [name, setName] = useState("");
  const [tel, setTel] = useState("+998 ");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [leaving, setLeaving] = useState(false);

  // "Yo'q, shunchaki qiziq" — saytdan chiqarish
  function handleNo() {
    setLeaving(true);
    setTimeout(() => {
      window.location.href = "about:blank";
    }, 1600);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!agreed) {
      setError("Iltimos, avval yuqoridagi savolga javob bering.");
      return;
    }
    const digits = tel.replace(/\D/g, "");
    if (name.trim().length < 2) {
      setError("Iltimos, ismingizni kiriting.");
      return;
    }
    if (digits.length < 9) {
      setError("Telefon raqamini to'liq kiriting.");
      return;
    }

    setLoading(true);

    const eventId = generateEventId();
    const fbp = getCookie("_fbp");
    const fbc = getCookie("_fbc") || buildFbcFromUrl();

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: tel.trim(),
          agreed: true,
          event_id: eventId,
          fbp,
          fbc,
          source: "damber-kids landing",
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(
          data?.telegram_description ||
            data?.error ||
            "Yuborishda xatolik. Iltimos, qayta urinib ko'ring."
        );
        setLoading(false);
        return;
      }

      // Meta Pixel Lead (brauzer) — server CAPI bilan bir xil event_id
      if (typeof window !== "undefined" && window.fbq) {
        window.fbq("track", "Lead", {}, { eventID: eventId });
      }

      setTimeout(() => router.push("/thanks"), 350);
    } catch {
      setError("Internet aloqasi bilan muammo. Qayta urinib ko'ring.");
      setLoading(false);
    }
  }

  // Chiqish ekrani
  if (leaving) {
    return (
      <div className="animate-fade-up rounded-3xl border border-line bg-panel p-8 text-center shadow-neon-lg">
        <h3 className="font-display text-2xl font-800 text-cream">Rahmat!</h3>
        <p className="mt-2 text-sm text-muted">
          Qiziqishingiz uchun rahmat. Kerak bo'lsa, istalgan vaqtda
          qaytishingiz mumkin.
        </p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-line bg-panel p-7 shadow-neon-lg sm:p-8">
      {/* Narx bloki */}
      <div className="mb-6 rounded-2xl border border-neon/35 bg-neon/[0.08] px-5 py-4 text-center">
        <div className="text-xs font-600 uppercase tracking-wider text-muted">
          Bolalar elektromobili · narxi
        </div>
        <div className="mt-1 font-display text-4xl font-900 leading-none tracking-tight text-cream">
          {PRICE}
          <span className="ml-1 text-base font-700 text-neon-soft">so'm</span>
        </div>
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-line bg-ink px-3.5 py-1.5 text-xs font-600 text-cream">
          <b className="font-700 text-neon-soft">Muddatli to'lovga berilmaydi</b>{" "}
          · faqat naqd
        </div>
      </div>

      <h2 className="font-display text-2xl font-900 tracking-tight text-cream">
        Ma'lumotlaringizni yozing
      </h2>
      <p className="mt-2 text-sm text-muted">
        Ma'lumotlaringizni qoldiring — menejerimiz siz bilan tez orada
        bog'lanadi.
      </p>

      <form onSubmit={handleSubmit} className="mt-1">
        {/* So'rov */}
        <label className="mb-2 mt-5 block text-xs font-600 uppercase tracking-wide text-muted">
          Mahsulotni xarid qilishga rozimisiz?
        </label>
        <div className="grid gap-2">
          <button
            type="button"
            onClick={() => {
              setAgreed(true);
              setError("");
            }}
            className={`rounded-xl border px-4 py-3.5 text-left text-[15px] font-600 transition ${
              agreed
                ? "border-neon bg-neon/15 text-cream"
                : "border-line bg-ink text-cream hover:border-neon/50"
            }`}
          >
            Narxni ko'rdim, roziman
          </button>
          <button
            type="button"
            onClick={handleNo}
            className="rounded-xl border border-line bg-ink px-4 py-3.5 text-left text-[15px] font-600 text-cream transition hover:border-neon/50"
          >
            Yo'q, shunchaki qiziq
          </button>
        </div>

        {/* Ism */}
        <label className="mb-2 mt-5 block text-xs font-600 uppercase tracking-wide text-muted">
          Ismingiz
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ismingiz"
          className="w-full rounded-xl border border-line bg-ink px-4 py-3.5 text-cream placeholder-muted/60 outline-none transition focus:border-neon"
        />

        {/* Telefon */}
        <label className="mb-2 mt-5 block text-xs font-600 uppercase tracking-wide text-muted">
          Telefon raqamingiz
        </label>
        <input
          type="tel"
          inputMode="tel"
          value={tel}
          onChange={(e) => setTel(e.target.value)}
          placeholder="+998 90 123 45 67"
          className="w-full rounded-xl border border-line bg-ink px-4 py-3.5 text-cream placeholder-muted/60 outline-none transition focus:border-neon"
        />

        {error ? (
          <p className="mt-4 rounded-xl border border-neon/40 bg-neon/10 px-4 py-3 text-sm text-neon-soft">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-full bg-neon py-4 font-display text-base font-700 text-white shadow-neon transition hover:shadow-neon-lg disabled:opacity-60"
        >
          {loading ? "Yuborilmoqda..." : "Yuborish"}
        </button>

        <p className="mt-4 text-center text-sm text-muted/75">
          Yoki qo'ng'iroq qiling:{" "}
          <a href={phoneHref} className="font-600 text-cream hover:text-neon">
            {phone}
          </a>
        </p>
      </form>
    </div>
  );
}
