// Meta Pixel + CAPI uchun yordamchi funksiyalar (brauzer tomonida)

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

// Cookie qiymatini o'qish (fbp / fbc olish uchun)
export function getCookie(name: string): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(
    new RegExp("(^| )" + name + "=([^;]+)")
  );
  return match ? decodeURIComponent(match[2]) : "";
}

// Har bir lid uchun noyob event ID — Pixel va CAPI dedublikatsiyasi kaliti
export function generateEventId(): string {
  return (
    "lead." +
    Date.now().toString(36) +
    "." +
    Math.random().toString(36).slice(2, 10)
  );
}

// URL'dan fbclid olib, fbc formatida qaytaradi (agar cookie bo'lmasa)
export function buildFbcFromUrl(): string {
  if (typeof window === "undefined") return "";
  const params = new URLSearchParams(window.location.search);
  const fbclid = params.get("fbclid");
  if (!fbclid) return "";
  return `fb.1.${Date.now()}.${fbclid}`;
}
