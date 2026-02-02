import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SharedFooter from "@/components/SharedFooter";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kodeordsgenerator - Gratis sikker password generator | Kodeord.dk",
  description: "Gratis dansk kodeordsgenerator. Opret stærke, sikre kodeord med et klik. Alt foregår lokalt i din browser - ingen data sendes til servere.",
  keywords: "kodeordsgenerator, password generator, sikker kodeord, stærkt kodeord, gratis kodeord, dansk password generator, generer kodeord",
  authors: [{ name: "Kodeordsgenerator.dk" }],
  openGraph: {
    title: "Kodeordsgenerator - Gratis sikker password generator",
    description: "Opret stærke, sikre kodeord med et klik. Gratis og privat.",
    type: "website",
    locale: "da_DK",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="da">
      <head>
        <link rel="canonical" href="https://kodeord.dk" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Kodeordsgenerator",
              "description": "Gratis dansk kodeordsgenerator til sikre passwords",
              "url": "https://kodeord.dk",
              "applicationCategory": "UtilitiesApplication",
              "operatingSystem": "Any",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "DKK"
              }
            })
          }}
        />
      </head>
      <body className={inter.className}>
        {children}
        <SharedFooter />
      </body>
    </html>
  );
}
