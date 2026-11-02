import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";

/*
 * Phase 1 shell: every section exists with its anchor so navigation works.
 * Phase 2 replaces each placeholder with the real section component.
 */
const placeholders = [
  { id: "services", eyebrow: "What we do", title: "Services" },
  { id: "about", eyebrow: "About Stallion Connect", title: "About" },
  { id: "why-us", eyebrow: "Why Stallion Connect", title: "What sets us apart" },
  { id: "process", eyebrow: "How we work", title: "Discover, Design, Deploy, Optimise" },
  { id: "industries", eyebrow: "Industries", title: "Sectors we serve" },
  { id: "careers", eyebrow: "Careers", title: "Build your career with us" },
  { id: "contact", eyebrow: "Contact", title: "Get a quote" },
];

export default function HomePage() {
  return (
    <>
      <section id="home" className="bg-linear-to-b from-surface to-white py-24 sm:py-32">
        <Container>
          <p className="mb-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-navy shadow-soft">
            <span className="size-2 rounded-full bg-brand-green-light" />
            Call centre, BPO and back office, India and overseas
          </p>
          <h1 className="max-w-3xl text-4xl font-bold sm:text-6xl">
            Customer conversations that <span className="text-brand-green">grow business.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted">
            Stallion Connect runs call centre, sales, customer support and back-office operations so
            your team can focus on what it does best.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/#contact">Get a Quote</ButtonLink>
            <ButtonLink href="/#services" variant="secondary">
              Explore Services
            </ButtonLink>
          </div>
        </Container>
      </section>

      {placeholders.map((s, i) => (
        <Section
          key={s.id}
          id={s.id}
          eyebrow={s.eyebrow}
          title={s.title}
          intro="Section content arrives in Phase 2."
          className={i % 2 === 0 ? "bg-white" : "bg-surface"}
        />
      ))}
    </>
  );
}
