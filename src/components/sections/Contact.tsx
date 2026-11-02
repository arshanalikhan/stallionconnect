import { contact } from "@/content/home";
import { site, whatsappUrl } from "@/config/site";
import { buttonClasses } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Icon, type IconName } from "@/components/ui/Icon";

const quoteMail = `mailto:${site.contact.email}?subject=${encodeURIComponent("Quote request")}`;

const methods: {
  icon: IconName;
  label: string;
  value: string;
  href?: string;
  external?: boolean;
}[] = [
  { icon: "mail", label: "Email", value: site.contact.email, href: `mailto:${site.contact.email}` },
  {
    icon: "phone",
    label: "Phone",
    value: site.contact.phone,
    href: `tel:${site.contact.phoneHref}`,
  },
  { icon: "chat", label: "WhatsApp", value: "Chat with us", href: whatsappUrl(), external: true },
  { icon: "clock", label: "Hours", value: site.contact.hours },
  { icon: "pin", label: "Office", value: site.contact.address },
];

export function Contact() {
  return (
    <section id="contact" className="bg-white py-20 sm:py-28">
      <Container>
        <div className="grid overflow-hidden rounded-[2rem] bg-linear-to-br from-navy via-[#0a4580] to-brand-green-dark shadow-soft lg:grid-cols-[1.1fr_0.9fr]">
          <div className="p-8 text-white sm:p-12">
            <p className="mb-3 text-xs font-bold tracking-[0.16em] text-brand-green-light uppercase">
              {contact.eyebrow}
            </p>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              {contact.title} <span className="text-brand-green-light">{contact.highlight}</span>
            </h2>
            <p className="mt-4 max-w-lg text-lg text-[#d7e6f4]">{contact.intro}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              {/* Phase 3 replaces this with the quote form */}
              <a href={quoteMail} className={buttonClasses({ variant: "secondary" })}>
                Get a Quote
              </a>
              <a
                href={whatsappUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClasses({
                  className: "bg-[#25d366] text-white shadow-none hover:bg-[#1ebe5b]",
                })}
              >
                WhatsApp us
              </a>
            </div>
          </div>

          <ul className="grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-1">
            {methods.map((m) => {
              const body = (
                <>
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/15 text-white">
                    <Icon name={m.icon} className="size-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs font-semibold tracking-wider text-white/60 uppercase">
                      {m.label}
                    </span>
                    <span className="block font-semibold break-words text-white">{m.value}</span>
                  </span>
                </>
              );
              return (
                <li key={m.label} className="bg-navy-deep/40">
                  {m.href ? (
                    <a
                      href={m.href}
                      {...(m.external && { target: "_blank", rel: "noopener noreferrer" })}
                      className="flex items-center gap-4 px-8 py-5 transition hover:bg-white/10"
                    >
                      {body}
                    </a>
                  ) : (
                    <div className="flex items-center gap-4 px-8 py-5">{body}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </Container>
    </section>
  );
}
