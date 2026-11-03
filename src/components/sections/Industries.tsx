import { industries } from "@/content/home";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";

export function Industries() {
  return (
    <section id="industries" className="scene-clear bg-mint/60 py-20 sm:py-28">
      <Container>
        <Heading {...industries} panel />
        <ul className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
          {industries.items.map((item, i) => (
            <Reveal as="li" key={item.name} delay={(i % 4) * 70}>
              <div className="flex h-full flex-col items-start gap-4 rounded-card border border-line/80 bg-white/95 p-5 shadow-soft sm:flex-row sm:items-center">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-navy text-white">
                  <Icon name={item.icon} className="size-5" />
                </span>
                <span className="text-sm font-semibold text-navy sm:text-base">{item.name}</span>
              </div>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}
