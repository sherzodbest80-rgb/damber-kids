import type { Metadata } from "next";
import { Archivo, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  variable: "--font-archivo",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export const metadata: Metadata = {
  title: "Damber Kids — Bolalar uchun elektromobil | WN-189 & WN-199",
  description:
    "Bolangiz uchun eng yaxshi tanlov: WN-189 va WN-199 bolalar elektromobillari. Sifat, uslub, ishonch. Butun O'zbekiston bo'ylab yetkazib berish.",
  openGraph: {
    title: "Damber Kids — Bolalar uchun elektromobil",
    description:
      "WN-189 va WN-199 bolalar elektromobillari. Bolangiz uchun eng yaxshi tanlov.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz" className={`${archivo.variable} ${inter.variable}`}>
      <body className="font-body antialiased">
        {/* Meta Pixel — faqat Pixel ID mavjud bo'lsa ishga tushadi */}
        {PIXEL_ID ? (
          <>
            <Script id="meta-pixel" strategy="afterInteractive">
              {`
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${PIXEL_ID}');
                fbq('track', 'PageView');
              `}
            </Script>
            <noscript>
              <img
                height="1"
                width="1"
                style={{ display: "none" }}
                alt=""
                src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
              />
            </noscript>
          </>
        ) : null}
        {children}
      </body>
    </html>
  );
}
