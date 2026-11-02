import { services } from "@/content/home";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { QuoteButton } from "@/components/forms/FormDialogs";

export function Services() {
  return (
    <section id="services" className="scene-clear bg-white py-20 sm:py-28">
      <Container>
        <Heading {...services} panel />
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.items.map((s, i) => {
            const custom = s.id === "custom";
            return (
              <Reveal as="li" key={s.id} delay={(i % 4) * 80}>
                <article
                  data-cursor={custom ? "dark" : undefined}
                  className={
                    custom
                      ? "flex h-full flex-col rounded-card bg-linear-to-br from-navy to-brand-green-dark p-6 text-white shadow-soft"
                      : "group flex h-full flex-col rounded-card border border-line bg-white/90 p-6 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-brand-green/40 hover:shadow-soft"
                  }
                >
                  <span
                    className={
                      custom
                        ? "grid size-12 place-items-center rounded-xl bg-white/15"
                        : "grid size-12 place-items-center rounded-xl bg-mint text-navy transition group-hover:bg-brand-green group-hover:text-white"
                    }
                  >
                    <Icon name={s.icon} />
                  </span>
                  <p
                    className={`mt-5 text-[0.7rem] font-bold tracking-[0.14em] uppercase ${custom ? "text-brand-green-light" : "text-brand-green"}`}
                  >
                    {s.tag}
                  </p>
                  <h3 className={`mt-1 text-lg font-semibold ${custom ? "text-white" : ""}`}>
                    {s.title}
                  </h3>
                  <p className={`mt-2 flex-1 text-sm ${custom ? "text-white/80" : "text-muted"}`}>
                    {s.text}
                  </p>
                  <QuoteButton
                    service={custom ? "Custom process" : s.title}
                    className={`mt-5 inline-flex items-center gap-1.5 self-start text-sm font-semibold hover:underline ${custom ? "text-white" : "text-navy"}`}
                  >
                    {custom ? "Talk to us" : "Enquire"}
                    <Icon name="arrow" className="size-4" strokeWidth={2} />
                  </QuoteButton>
                </article>
              </Reveal>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
