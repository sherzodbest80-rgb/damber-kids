import { NextResponse } from "next/server";
import crypto from "crypto";

export const runtime = "nodejs";

interface LeadBody {
  name: string;
  phone: string;
  agreed?: boolean;
  event_id: string;
  fbp?: string;
  fbc?: string;
  source?: string;
}

const PRODUCT_PRICE = 1900000; // Damber Kids narxi (UZS)

function escapeHtml(text: string): string {
  if (!text) return "";
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function normalizePhone(raw: string): string {
  const d = raw.replace(/\D/g, "");
  if (d.startsWith("998")) return d;
  if (d.length === 9) return "998" + d;
  return d;
}

function sha256(value: string): string {
  return crypto.createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

export async function POST(req: Request) {
  try {
    const body: LeadBody = await req.json();
    const { name, phone, agreed, event_id, fbp, fbc, source } = body;

    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: "Ism kiritilmagan" }, { status: 400 });
    }
    if (!phone || phone.replace(/\D/g, "").length < 9) {
      return NextResponse.json({ error: "Telefon raqami noto'g'ri" }, { status: 400 });
    }

    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "";
    const userAgent = req.headers.get("user-agent") || "";

    // ============ 1) TELEGRAM ============
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN?.trim();
    const GROUP_ID = process.env.TELEGRAM_GROUP_ID?.trim();

    if (!BOT_TOKEN || !GROUP_ID) {
      return NextResponse.json(
        { error: "Server konfiguratsiya xatosi (Telegram env yo'q)" },
        { status: 500 }
      );
    }

    const text = [
      "🚗 <b>Yangi buyurtma — Damber Kids</b>",
      "",
      `👤 <b>Ism:</b> ${escapeHtml(name)}`,
      `📞 <b>Telefon:</b> ${escapeHtml(phone)}`,
      `✅ <b>Xaridga rozi:</b> ${agreed ? "Ha (narxni ko'rdi)" : "—"}`,
      `🌐 <b>Manba:</b> ${escapeHtml(source || "damber-kids")}`,
    ].join("\n");

    const tgRes = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: GROUP_ID, text, parse_mode: "HTML" }),
      }
    );
    const tgResult = await tgRes.json();

    if (!tgRes.ok || !tgResult.ok) {
      console.error("TELEGRAM XATO:", JSON.stringify(tgResult));
      return NextResponse.json(
        {
          error: "Telegram'ga yuborilmadi",
          telegram_error_code: tgResult.error_code,
          telegram_description: tgResult.description,
        },
        { status: 502 }
      );
    }

    // ============ 2) META CAPI — Lead event ============
    const PIXEL_ID = process.env.META_PIXEL_ID?.trim();
    const CAPI_TOKEN = process.env.META_CAPI_TOKEN?.trim();

    if (PIXEL_ID && CAPI_TOKEN && event_id) {
      try {
        const eventUrl = req.headers.get("referer") || "https://damber-kids-ten.vercel.app/";
        const userData: Record<string, unknown> = {
          ph: [sha256(normalizePhone(phone))],
          client_ip_address: clientIp,
          client_user_agent: userAgent,
        };
        if (fbp) userData.fbp = fbp;
        if (fbc) userData.fbc = fbc;

        const capiRes = await fetch(
          `https://graph.facebook.com/v21.0/${PIXEL_ID}/events?access_token=${CAPI_TOKEN}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              data: [
                {
                  event_name: "Lead",
                  event_time: Math.floor(Date.now() / 1000),
                  event_id,
                  action_source: "website",
                  event_source_url: eventUrl,
                  user_data: userData,
                },
              ],
            }),
          }
        );
        if (!capiRes.ok) console.error("CAPI XATO:", await capiRes.text());
      } catch (capiErr) {
        console.error("CAPI EXCEPTION:", capiErr);
      }
    }

    // ============ 3) AMOCRM — "Неразобранное" (kiruvchi lid) ============
    let amocrm: unknown = "skipped (env yo'q)";
    const AMO_SUBDOMAIN = process.env.AMOCRM_SUBDOMAIN?.trim();
    const AMO_TOKEN = process.env.AMOCRM_ACCESS_TOKEN?.trim();
    const AMO_PIPELINE_ID = process.env.AMOCRM_PIPELINE_ID?.trim();

    if (AMO_SUBDOMAIN && AMO_TOKEN && AMO_PIPELINE_ID) {
      try {
        const nowSec = Math.floor(Date.now() / 1000);
        const uid = `damber-${nowSec}-${Math.random().toString(36).slice(2, 8)}`;

        const unsorted = [
          {
            source_name: "Damber Kids sayt",
            source_uid: uid,
            created_at: nowSec,
            pipeline_id: Number(AMO_PIPELINE_ID),
            _embedded: {
              contacts: [
                {
                  name: name,
                  custom_fields_values: [
                    {
                      field_code: "PHONE",
                      values: [{ enum_code: "WORK", value: phone }],
                    },
                  ],
                },
              ],
              leads: [
                {
                  name: `Damber Kids — ${name}`,
                  price: PRODUCT_PRICE,
                },
              ],
            },
            metadata: {
              form_id: "damber-kids-form",
              form_name: "Damber Kids buyurtma",
              form_page: "https://damber-kids-ten.vercel.app",
              form_sent_at: nowSec,
              referer: "https://damber-kids-ten.vercel.app",
              ip: clientIp,
            },
          },
        ];

        const amoRes = await fetch(
          `https://${AMO_SUBDOMAIN}.amocrm.ru/api/v4/leads/unsorted/forms`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${AMO_TOKEN}`,
            },
            body: JSON.stringify(unsorted),
          }
        );
        const amoText = await amoRes.text();
        if (!amoRes.ok) {
          console.error("AMOCRM XATO:", amoText);
          amocrm = { status: amoRes.status, error: amoText };
        } else {
          amocrm = { status: amoRes.status, ok: true };
        }
      } catch (amoErr) {
        console.error("AMOCRM EXCEPTION:", amoErr);
        amocrm = { exception: String(amoErr) };
      }
    } else {
      amocrm = {
        skipped: true,
        has_subdomain: !!AMO_SUBDOMAIN,
        has_token: !!AMO_TOKEN,
        has_pipeline: !!AMO_PIPELINE_ID,
      };
    }

    return NextResponse.json({ success: true, amocrm });
  } catch (err) {
    console.error("SERVER XATO:", err);
    return NextResponse.json({ error: "Server xatosi", detail: String(err) }, { status: 500 });
  }
}