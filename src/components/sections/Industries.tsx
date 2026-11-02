import { industries } from "@/content/home";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";

export function Industries() {
  return (
    <section id="industries" className="bg-mint/60 py-20 sm:py-28">
      <Container>
        <Heading {...industries} />
        <ul className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
          {industries.items.map((item, i) => (
            <Reveal as="li" key={item.name} delay={(i % 4) * 70}>
              <div className="flex h-full flex-col items-start gap-4 rounded-2xl bg-white p-5 shadow-[0_10px_30px_-24px_rgb(1_43_117/0.6)] sm:flex-row sm:items-center">
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
