import { hero } from "@/content/home";
import { site } from "@/config/site";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { CallCard } from "./CallCard";

export function Hero() {
  return (
    <section
      id="home"
      className="relative overflow-hidden bg-linear-to-b from-[#eaf3fc] via-surface to-white pt-14 pb-20 sm:pt-20 sm:pb-28"
    >
      {/* soft brand glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -right-40 size-[520px] rounded-full bg-royal/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-48 -left-32 size-[460px] rounded-full bg-brand-green/10 blur-3xl"
      />

      <Container className="relative grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="mb-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-navy shadow-soft">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand-green-light opacity-60 motion-reduce:hidden" />
              <span className="relative inline-flex size-2 rounded-full bg-brand-green-light" />
            </span>
            {hero.badge}
          </p>
          <h1 className="text-4xl font-bold sm:text-5xl lg:text-6xl">
            {hero.title} <span className="text-brand-green">{hero.highlight}</span>
          </h1>
          <p className="mt-5 text-xl font-semibold text-royal italic">{site.tagline}</p>
          <p className="mt-4 max-w-xl text-lg text-muted">{hero.intro}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/#contact">Get a Quote</ButtonLink>
            <ButtonLink href="/#services" variant="secondary">
              Explore Services
            </ButtonLink>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#26435e]">
            {hero.points.map((p) => (
              <li key={p} className="flex items-center gap-2">
                <Icon name="check" className="size-4 text-brand-green" strokeWidth={2.5} />
                {p}
              </li>
            ))}
          </ul>
        </div>

        <CallCard />
      </Container>
    </section>
  );
}
