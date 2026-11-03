import Image from "next/image";
import ceoPhoto from "@/assets/team/ceo.webp";
import { ceo } from "@/content/home";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

export function CeoMessage() {
  return (
    <section id="ceo" className="scene-clear scene-window bg-white py-20 sm:py-28">
      <Container className="grid items-start gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        {/* Portrait with a glossy frame and a name badge */}
        <Reveal className="relative mx-auto w-full max-w-md lg:sticky lg:top-28 lg:max-w-none">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/80 shadow-lift">
            <Image
              src={ceoPhoto}
              alt={`${ceo.name}, ${ceo.role}`}
              sizes="(min-width: 1024px) 40vw, 90vw"
              className="aspect-[4/5] w-full object-cover"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-linear-to-tr from-transparent via-transparent to-white/25"
            />
          </div>
          <div className="absolute right-4 -bottom-6 left-4 rounded-2xl bg-linear-to-br from-[#0a3f95] via-navy to-[#04402a] p-5 text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.25),0_20px_40px_-16px_rgb(1_43_117/0.6)] sm:-right-6 sm:right-auto sm:left-auto sm:w-72 lg:-right-8">
            <p className="font-display text-lg font-bold">{ceo.name}</p>
            <p className="mt-0.5 text-sm text-white/75">{ceo.role}</p>
          </div>
        </Reveal>

        <Reveal className="scene-panel mt-6 lg:mt-0">
          <p className="mb-4 inline-flex items-center gap-2.5 font-display text-[13px] font-semibold tracking-[0.12em] text-brand-green uppercase">
            <span aria-hidden="true" className="h-px w-6 bg-current" />
            {ceo.eyebrow}
          </p>
          <h2 className="text-3xl font-bold sm:text-4xl lg:text-[2.6rem]">
            {ceo.title} <span className="accent-serif text-brand-green">{ceo.highlight}</span>
          </h2>

          <div className="mt-6 space-y-4 text-[17px] leading-relaxed text-[#2b3f57]">
            {ceo.paragraphs.map((p, i) => (
              <p key={i} className={i === 0 ? "text-lg text-ink" : undefined}>
                {p}
              </p>
            ))}
          </div>

          <ul className="mt-7 flex flex-wrap gap-2">
            {ceo.values.map((v) => (
              <li
                key={v}
                className="rounded-full border border-line/80 bg-white/90 px-4 py-2 text-sm font-semibold text-navy shadow-[inset_0_1px_0_#fff]"
              >
                {v}
              </li>
            ))}
          </ul>

          <div className="mt-8 border-t border-line/70 pt-6">
            <p className="accent-script text-3xl text-navy">{ceo.name}</p>
            <p className="mt-1 text-sm text-muted">{ceo.role}</p>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
