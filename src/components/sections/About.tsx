import { about } from "@/content/home";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Reveal } from "@/components/ui/Reveal";
import { CountUp } from "./CountUp";

export function About() {
  return (
    <section id="about" className="scene-clear scene-window bg-surface py-20 sm:py-28">
      <Container className="card-lane-left lane-1col grid items-start gap-12 lg:grid-cols-2">
        <Reveal className="scene-panel">
          <Heading eyebrow={about.eyebrow} title={about.title} highlight={about.highlight} />
          <p className="mt-5 text-lg text-muted">{about.text}</p>
          <dl className="mt-8 grid gap-4 sm:grid-cols-2">
            {about.values.map((v) => (
              <div key={v.title} className="border-l-4 border-brand-green pl-4">
                <dt className="font-bold text-navy">{v.title}</dt>
                <dd className="mt-1 text-sm text-muted">{v.text}</dd>
              </div>
            ))}
          </dl>
        </Reveal>

        <dl className="grid grid-cols-2 gap-4">
          {about.stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 80}>
              <div className="gloss h-full rounded-card border border-line/80 bg-white/95 p-6 shadow-soft">
                <dd className="text-4xl font-bold text-navy sm:text-5xl">
                  <CountUp value={s.value} suffix={s.suffix} />
                </dd>
                <dt className="mt-2 text-sm text-muted">{s.label}</dt>
              </div>
            </Reveal>
          ))}
        </dl>
      </Container>
    </section>
  );
}
