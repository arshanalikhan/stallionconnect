import { contact } from "@/content/home";
import { site, whatsappUrl } from "@/config/site";
import { QuoteForm } from "@/components/forms/QuoteForm";
import { Container } from "@/components/ui/Container";
import { Icon, type IconName } from "@/components/ui/Icon";

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
    <section id="contact" className="scene-clear bg-white py-20 sm:py-28">
      <Container>
        <div className="grid overflow-hidden rounded-[2rem] shadow-soft lg:grid-cols-[0.85fr_1.15fr]">
          <div className="bg-linear-to-br from-navy via-[#0a4580] to-brand-green-dark p-8 text-white sm:p-10">
            <p className="mb-3 text-xs font-bold tracking-[0.16em] text-brand-green-light uppercase">
              {contact.eyebrow}
            </p>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              {contact.title}{" "}
              <span className="accent-serif text-brand-green-light">{contact.highlight}</span>
            </h2>
            <p className="mt-4 text-lg text-[#d7e6f4]">{contact.intro}</p>

            <ul className="mt-8 space-y-1">
              {methods.map((m) => {
                const body = (
                  <>
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/15">
                      <Icon name={m.icon} className="size-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-xs font-semibold tracking-wider text-white/60 uppercase">
                        {m.label}
                      </span>
                      <span className="block font-semibold break-words">{m.value}</span>
                    </span>
                  </>
                );
                return (
                  <li key={m.label}>
                    {m.href ? (
                      <a
                        href={m.href}
                        {...(m.external && { target: "_blank", rel: "noopener noreferrer" })}
                        className="-mx-3 flex items-center gap-4 rounded-xl px-3 py-2.5 transition hover:bg-white/10"
                      >
                        {body}
                      </a>
                    ) : (
                      <div className="flex items-center gap-4 py-2.5">{body}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="bg-white p-6 sm:p-10">
            <h3 className="text-2xl font-bold">Request a quote</h3>
            <p className="mt-1 mb-6 text-sm text-muted">
              Fields marked <span className="text-brand-green">*</span> are required.
            </p>
            <QuoteForm />
          </div>
        </div>
      </Container>
    </section>
  );
}
