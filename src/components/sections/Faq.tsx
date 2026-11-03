import { faq } from "@/content/home";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";

export function Faq() {
  return (
    <section id="faq" className="scene-clear bg-surface py-20 sm:py-28">
      <Container className="card-lane-right lane-1col grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <Heading eyebrow={faq.eyebrow} title={faq.title} highlight={faq.highlight} panel />
        <div className="divide-y divide-line rounded-card border border-line/80 bg-white/95 px-6 shadow-soft">
          {faq.items.map((item) => (
            <details key={item.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-semibold text-navy [&::-webkit-details-marker]:hidden">
                {item.q}
                <span
                  aria-hidden="true"
                  className="text-2xl leading-none text-brand-green transition group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 text-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}
