import { hero } from "@/content/home";
import { site } from "@/config/site";
import { ButtonLink } from "@/components/ui/Button";
import { QuoteButton } from "@/components/forms/FormDialogs";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { CallCard } from "./CallCard";

export function Hero() {
  return (
    <section
      id="home"
      className="scene-clear relative flex items-center overflow-hidden bg-linear-to-b from-[#eaf3fc] via-surface to-white pt-14 pb-20 sm:pt-20 sm:pb-28 lg:min-h-[calc(100svh-5rem)]"
    >
      {/* soft brand glows */}
      <div
        aria-hidden="true"
        className="scene-hide pointer-events-none absolute -top-40 -right-40 size-[520px] rounded-full bg-royal/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="scene-hide pointer-events-none absolute -bottom-48 -left-32 size-[460px] rounded-full bg-brand-green/10 blur-3xl"
      />

      {/* keeps the headline readable over the 3D scene */}
      <div
        aria-hidden="true"
        className="scene-only pointer-events-none absolute inset-0 bg-linear-to-b from-white/75 via-white/50 to-white/10 lg:bg-linear-to-r lg:from-white/90 lg:via-white/65 lg:to-transparent"
      />

      <Container className="relative grid items-center gap-14 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <p className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-line/80 bg-white/90 py-1.5 pr-4 pl-2 text-[13px] font-medium text-navy shadow-[0_1px_2px_rgb(16_24_40/0.05)] backdrop-blur">
            <span className="rounded-full bg-mint px-2 py-0.5 font-display text-[11px] font-bold tracking-wide text-brand-green-dark uppercase">
              BPO
            </span>
            {hero.badge}
          </p>
          <h1 className="text-[2.6rem] leading-[1.05] font-extrabold tracking-[-0.035em] sm:text-6xl lg:text-[4.25rem]">
            {hero.title} <span className="text-brand-green">{hero.highlight}</span>
          </h1>
          <p className="mt-5 font-display text-lg font-semibold text-royal">{site.tagline}</p>
          <p className="scene-glass-text mt-4 max-w-xl text-[17px] leading-relaxed text-[#2b3f57]">
            {hero.intro}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <QuoteButton />
            <ButtonLink href="/#services" variant="secondary">
              Explore services
              <Icon name="arrow" className="size-4" strokeWidth={2} />
            </ButtonLink>
          </div>
          <dl className="scene-glass-text mt-10 flex max-w-xl divide-x divide-line">
            {hero.stats.map((s) => (
              <div key={s.label} className="flex-1 px-4 first:pl-0 last:pr-0">
                <dt className="sr-only">{s.label}</dt>
                <dd className="font-display text-2xl font-bold tracking-tight text-navy sm:text-[1.75rem]">
                  {s.value}
                </dd>
                <dd className="mt-0.5 text-[13px] leading-snug text-muted">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* On desktops with the 3D scene, the 3D card replaces this one */}
        <div className="scene-hide-card transition-opacity duration-700">
          <CallCard />
        </div>
      </Container>
    </section>
  );
}
