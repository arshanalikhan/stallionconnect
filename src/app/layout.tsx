import type { Metadata, Viewport } from "next";
import { Dancing_Script, Instrument_Serif, Tinos } from "next/font/google";
import { site } from "@/config/site";
import logoFull from "@/assets/brand/logo-full.webp";
import "./globals.css";

/** Body and headings: Times New Roman style. */
const tinos = Tinos({
  variable: "--font-tinos",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

/** Accent: elegant serif italic for highlighted words in headings. */
const serif = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

/** Accent: handwritten script, used sparingly (tagline). */
const script = Dancing_Script({
  variable: "--font-dancing",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} | ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  openGraph: {
    type: "website",
    locale: site.locale,
    siteName: site.name,
    url: site.url,
    images: [{ url: logoFull.src, width: logoFull.width, height: logoFull.height, alt: site.name }],
  },
};

export const viewport: Viewport = {
  themeColor: "#012b75",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" className={`${tinos.variable} ${serif.variable} ${script.variable}`}>
      <body className="flex min-h-svh flex-col">
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}
