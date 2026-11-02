import Link from "next/link";
import { site, whatsappUrl } from "@/config/site";
import { Container } from "@/components/ui/Container";
import { Logo } from "./Logo";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-surface">
      <Container className="grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-sm text-muted">{site.description}</p>
        </div>

        <div>
          <h2 className="text-sm font-bold tracking-widest text-brand-green uppercase">Explore</h2>
          <ul className="mt-4 grid grid-cols-2 gap-2 text-sm">
            {site.nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-muted hover:text-navy">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-bold tracking-widest text-brand-green uppercase">Contact</h2>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            <li>
              <a href={`mailto:${site.contact.email}`} className="hover:text-navy">
                {site.contact.email}
              </a>
            </li>
            <li>
              <a href={`mailto:${site.contact.careersEmail}`} className="hover:text-navy">
                {site.contact.careersEmail}
              </a>
            </li>
            <li>
              <a href={`tel:${site.contact.phoneHref}`} className="hover:text-navy">
                {site.contact.phone}
              </a>
            </li>
            <li>
              <a
                href={whatsappUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-navy"
              >
                Chat on WhatsApp
              </a>
            </li>
            <li>{site.contact.hours}</li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-line">
        <Container className="flex flex-col gap-2 py-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <span>
            &copy; {year} {site.legalName}. All rights reserved.
          </span>
          <span className="flex gap-4">
            <Link href="/privacy" className="hover:text-navy">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-navy">
              Terms
            </Link>
          </span>
        </Container>
      </div>
    </footer>
  );
}
