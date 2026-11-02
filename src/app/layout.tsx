import type { Metadata, Viewport } from "next";
import { Syne } from "next/font/google";
import { site } from "@/config/site";
import logoFull from "@/assets/brand/logo-full.webp";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
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
    <html lang="en-IN" className={syne.variable}>
      <body className="flex min-h-svh flex-col">
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}
