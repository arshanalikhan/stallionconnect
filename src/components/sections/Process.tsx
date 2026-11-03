import { process } from "@/content/home";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Reveal } from "@/components/ui/Reveal";

export function Process() {
  return (
    <section id="process" className="scene-clear scene-window bg-white py-20 sm:py-28">
      <Container>
        <Heading {...process} align="center" panel />
        <div className="mt-14">
          <ol className="scene-panel relative grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4 lg:gap-6">
            {/* connecting line on large screens */}
            <span
              aria-hidden="true"
              className="absolute top-7 right-[12.5%] left-[12.5%] hidden h-0.5 bg-linear-to-r from-brand-green via-royal to-brand-green lg:block"
            />
            {process.steps.map((step, i) => (
              <Reveal as="li" key={step.title} delay={i * 100} className="relative text-center">
                <span className="relative mx-auto grid size-14 place-items-center rounded-full bg-brand-green text-lg font-bold text-white ring-8 ring-mint">
                  {i + 1}
                </span>
                <h3 className="mt-5 text-xl font-semibold">{step.title}</h3>
                <p className="mx-auto mt-2 max-w-xs text-sm text-muted">{step.text}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
