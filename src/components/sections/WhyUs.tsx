import { whyUs } from "@/content/home";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Reveal } from "@/components/ui/Reveal";

export function WhyUs() {
  return (
    <section
      id="why-us"
      className="relative overflow-hidden bg-linear-to-br from-navy-deep via-navy to-[#03306b] py-20 sm:py-28"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 right-0 size-[480px] translate-x-1/3 -translate-y-1/3 rounded-full bg-brand-green/20 blur-3xl"
      />
      <Container className="relative">
        <Heading {...whyUs} tone="dark" />
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {whyUs.items.map((item, i) => (
            <Reveal as="li" key={item.title} delay={(i % 3) * 80}>
              <div className="h-full rounded-card border border-white/15 bg-white/5 p-6 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-brand-green-light/60 hover:bg-white/10">
                <span className="text-xs font-bold tracking-[0.14em] text-brand-green-light">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm text-[#c4d6e8]">{item.text}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}
