import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

/**
 * AmoCRM webhook — Damber Kids
 * Lid "SOTILDI" bosqichiga o'tganda Meta'ga Purchase event yuboradi.
 *
 * Alohida voronka himoyasi: webhook faqat Damber Kids voronkasining
 * (AMOCRM_PIPELINE_ID) "Sotildi" bosqichi (AMOCRM_SOLD_STATUS_ID) uchun
 * ishlaydi. Boshqa voronkalar (Massajor va h.k.) bilan aralashmaydi.
 */

export async function POST(req: NextRequest) {
  try {
    // --- Xavfsizlik: maxfiy kalit ---
    const url = new URL(req.url);
    const SECRET = process.env.AMOCRM_WEBHOOK_SECRET?.trim();
    if (SECRET && url.searchParams.get("key") !== SECRET) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const data: Record<string, string> = {};
    for (const [key, value] of formData.entries()) {
      data[key] = String(value);
    }
    console.log("[DAMBER PURCHASE] Received:", JSON.stringify(data));

    const leadId = data["leads[status][0][id]"];
    const statusId = data["leads[status][0][status_id]"];
    const pipelineId = data["leads[status][0][pipeline_id]"];
    const price = data["leads[status][0][price]"];

    if (!leadId) {
      return NextResponse.json({ ok: true });
    }

    // --- Alohida voronka + "Sotildi" bosqichi tekshiruvi ---
    const SOLD_STATUS_ID = process.env.AMOCRM_SOLD_STATUS_ID?.trim();
    const PIPELINE_ID = process.env.AMOCRM_PIPELINE_ID?.trim();

    if (PIPELINE_ID && String(pipelineId) !== String(PIPELINE_ID)) {
      console.log(`[DAMBER PURCHASE] Boshqa voronka (${pipelineId}) — o'tkazildi`);
      return NextResponse.json({ ok: true });
    }
    if (SOLD_STATUS_ID && String(statusId) !== String(SOLD_STATUS_ID)) {
      console.log(`[DAMBER PURCHASE] Bosqich ${statusId} — SOTILDI emas`);
      return NextResponse.json({ ok: true });
    }

    const leadInfo = await fetchLeadDetails(leadId);
    if (!leadInfo) {
      return NextResponse.json({ ok: true });
    }

    const finalPrice = parseFloat(price) || leadInfo.price || 0;
    if (!finalPrice || finalPrice <= 0) {
      console.warn(`[DAMBER PURCHASE] Summa 0 — yuborilmadi`);
      return NextResponse.json({ ok: true, skipped: true, reason: "Summa kiritilmagan" });
    }

    const result = await sendPurchaseToMeta({
      leadId: String(leadId),
      contactId: leadInfo.contactId,
      phone: leadInfo.phone,
      name: leadInfo.name,
      price: finalPrice,
    });

    return NextResponse.json({ ok: true, meta: result });
  } catch (err) {
    console.error("[DAMBER PURCHASE ERROR]", err);
    return NextResponse.json({ ok: true });
  }
}

// AmoCRM ba'zan webhook URL'ini GET bilan tekshiradi
export async function GET() {
  return NextResponse.json({ ok: true, service: "amocrm-purchase" });
}

async function fetchLeadDetails(leadId: string) {
  const SUBDOMAIN = process.env.AMOCRM_SUBDOMAIN?.trim();
  const ACCESS_TOKEN = process.env.AMOCRM_ACCESS_TOKEN?.trim();
  if (!SUBDOMAIN || !ACCESS_TOKEN) return null;

  const headers = { Authorization: `Bearer ${ACCESS_TOKEN}` };
  const base = `https://${SUBDOMAIN}.amocrm.ru`;

  try {
    const leadRes = await fetch(`${base}/api/v4/leads/${leadId}?with=contacts`, { headers });
    if (!leadRes.ok) return null;
    const lead = await leadRes.json();

    const contactId = lead?._embedded?.contacts?.[0]?.id;
    if (!contactId) return { contactId: "", name: "", phone: "", price: lead.price || 0 };

    const contactRes = await fetch(`${base}/api/v4/contacts/${contactId}`, { headers });
    if (!contactRes.ok) return { contactId: String(contactId), name: "", phone: "", price: lead.price || 0 };
    const contact = await contactRes.json();

    let phone = "";
    for (const field of contact.custom_fields_values || []) {
      if (field.field_code === "PHONE") phone = field.values?.[0]?.value || "";
    }

    return {
      contactId: String(contactId),
      name: contact.name || "",
      phone,
      price: lead.price || 0,
    };
  } catch (err) {
    console.error("[DAMBER FETCH LEAD]", err);
    return null;
  }
}

async function sendPurchaseToMeta(data: {
  leadId: string;
  contactId: string;
  phone: string;
  name: string;
  price: number;
}) {
  const PIXEL_ID = process.env.META_PIXEL_ID?.trim();
  const ACCESS_TOKEN = process.env.META_CAPI_TOKEN?.trim();
  if (!PIXEL_ID || !ACCESS_TOKEN) {
    console.warn("[META PURCHASE] Credentials yo'q");
    return { skipped: true };
  }

  const hash = (v: string) =>
    crypto.createHash("sha256").update(v.toLowerCase().trim()).digest("hex");

  const normalizedPhone = data.phone.replace(/[\s\-()+]/g, "");
  const nameParts = (data.name || "").trim().split(/\s+/);
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  // user_data — bo'sh qiymatlarni qo'shmaymiz
  const userData: Record<string, unknown> = {};
  if (normalizedPhone) userData.ph = [hash(normalizedPhone)];
  if (firstName) userData.fn = [hash(firstName)];
  if (lastName) userData.ln = [hash(lastName)];
  if (data.contactId) userData.external_id = [hash(data.contactId)];
  userData.country = [hash("uz")];

  const payload = {
    data: [
      {
        event_name: "Purchase",
        event_time: Math.floor(Date.now() / 1000),
        event_id: `purchase_${data.leadId}`, // deduplikatsiya
        event_source_url:
          process.env.NEXT_PUBLIC_SITE_URL || "https://damber-kids-ten.vercel.app",
        action_source: "system_generated",
        user_data: userData,
        custom_data: { currency: "UZS", value: data.price },
      },
    ],
    ...(process.env.META_TEST_EVENT_CODE
      ? { test_event_code: process.env.META_TEST_EVENT_CODE }
      : {}),
  };

  const res = await fetch(
    `https://graph.facebook.com/v21.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
  const result = await res.json();
  if (!res.ok) {
    console.error("[META PURCHASE ERROR]", result);
    return { error: result };
  }
  console.log(`[META PURCHASE] Yuborildi! Summa: ${data.price} UZS`);
  return result;
}