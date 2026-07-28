# Damber Kids — Bolalar elektromobillari (WN-189 & WN-199)

Bitta sahifali lid-sayt. Next.js 15 + TypeScript + Tailwind.
Forma → Telegram guruh + Meta CAPI (Lead) + (ixtiyoriy) AmoCRM.

---

## 1-QADAM: Lokal test (kompyuteringizda)

VS Code'da terminal ochib, quyidagilarni bajaring:

```
npm install
npm run dev
```

Brauzerda oching: http://localhost:3000
(Test uchun forma Telegram env'siz ishlamaydi — pastga qarang.)

---

## 2-QADAM: Environment Variables (.env.local)

`.env.example` faylini nusxalab, `.env.local` nomi bilan saqlang va to'ldiring.

**Hozircha faqat Telegram kerak** (qolganlarini keyin qo'shamiz):

```
TELEGRAM_BOT_TOKEN=bot_token_shu_yerga
TELEGRAM_GROUP_ID=-100xxxxxxxxxx
```

Bot Token — @BotFather'dan. Group ID — botni guruhga admin qilib qo'shib olasiz.

---

## 3-QADAM: GitHub'ga yuklash

```
git init
git add .
git commit -m "Damber Kids landing"
git branch -M main
git remote add origin https://github.com/FOYDALANUVCHI/damber-kids.git
git push -u origin main
```

(Avval GitHub'da yangi bo'sh `damber-kids` repo yarating.)

---

## 4-QADAM: Vercel'ga deploy

1. vercel.com → "Add New Project" → GitHub'dan `damber-kids` repo'ni tanlang
2. **Environment Variables** bo'limiga `.env.local`'dagi qiymatlarni qo'shing
   (TELEGRAM_BOT_TOKEN, TELEGRAM_GROUP_ID)
3. "Deploy" bosing
4. Tayyor domen: `damber-kids.vercel.app`

**MUHIM:** Env'larni qo'shgach yoki o'zgartirgach — har doim qayta Deploy qiling,
aks holda yangi qiymatlar ishlamaydi.

---

## 5-QADAM: Meta CAPI (keyinroq — Business Manager tayyor bo'lgach)

Yangi Business Manager + yangi Pixel yarating, keyin Vercel'ga qo'shing:

```
NEXT_PUBLIC_META_PIXEL_ID=pixel_id      (brauzer Pixel — NEXT_PUBLIC majburiy)
META_PIXEL_ID=pixel_id                  (server CAPI — bir xil ID)
META_CAPI_TOKEN=capi_access_token
```

Qo'shib, qayta Deploy qiling. Kod avtomatik Lead event'ni Pixel (brauzer)
va CAPI (server) orqali bir xil `event_id` bilan yuboradi — dedublikatsiya
o'z-o'zidan ishlaydi.

---

## 6-QADAM: AmoCRM (ixtiyoriy — pipeline tayyor bo'lgach)

```
AMOCRM_SUBDOMAIN=bigant
AMOCRM_ACCESS_TOKEN=...
AMOCRM_PIPELINE_ID=...
AMOCRM_STATUS_ID=...
```

Env bo'lmasa — sayt baribir Telegram orqali ishlaydi, lid yo'qolmaydi.

---

## Fayl tuzilishi

- `app/page.tsx` — sahifa (markazlashgan forma)
- `components/LeadForm.tsx` — forma: narx, so'rov (roziman/yo'q), ism, telefon + CAPI mantiq
- `app/api/lead/route.ts` — Telegram + CAPI + AmoCRM (server)
- `app/thanks/page.tsx` — rahmat sahifasi
- `lib/fpixel.ts` — Pixel yordamchi funksiyalari
- `tailwind.config.ts` — brend ranglari

## Forma mantig'i

- "Yo'q, shunchaki qiziq" bosilsa — mijoz saytdan chiqadi (lid yig'ilmaydi)
- "Narxni ko'rdim, roziman" bosilsa — forma yuborilishi mumkin
- Yuborilganda: Telegram guruhga xabar + Meta CAPI/Pixel `Lead` (bir xil event_id
  bilan dedublikatsiya) + (env bo'lsa) AmoCRM lead
