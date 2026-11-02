import { careers } from "@/content/home";
import { site } from "@/config/site";
import { buttonClasses } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";

const applyHref = (role: string) =>
  `mailto:${site.contact.careersEmail}?subject=${encodeURIComponent(`Application: ${role}`)}`;

export function Careers() {
  return (
    <section id="careers" className="bg-white py-20 sm:py-28">
      <Container className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <Reveal>
          <Heading eyebrow={careers.eyebrow} title={careers.title} highlight={careers.highlight} />
          <p className="mt-5 text-lg text-muted">{careers.intro}</p>
          <ul className="mt-6 space-y-2">
            {careers.perks.map((p) => (
              <li key={p} className="flex items-center gap-2 text-ink">
                <Icon name="check" className="size-5 text-brand-green" strokeWidth={2.5} />
                {p}
              </li>
            ))}
          </ul>
          <div className="mt-8 rounded-2xl border border-line bg-surface p-5">
            <p className="text-sm text-muted">Send your CV to</p>
            <a
              href={applyHref("General application")}
              className="mt-1 inline-flex items-center gap-2 text-lg font-bold break-all text-navy hover:text-brand-green"
            >
              <Icon name="mail" className="size-5 shrink-0" />
              {site.contact.careersEmail}
            </a>
          </div>
        </Reveal>

        <ul className="grid gap-4 sm:grid-cols-2">
          {careers.openings.map((job, i) => (
            <Reveal as="li" key={job.title} delay={(i % 2) * 80}>
              <article className="flex h-full flex-col rounded-2xl border border-line p-5 transition hover:border-brand-green/40 hover:shadow-soft">
                <span className="grid size-10 place-items-center rounded-xl bg-mint text-brand-green">
                  <Icon name="briefcase" className="size-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold">{job.title}</h3>
                <p className="mt-1 flex-1 text-sm text-muted">
                  {job.mode} &middot; {job.type}
                </p>
                <a
                  href={applyHref(job.title)}
                  className={buttonClasses({
                    variant: "secondary",
                    size: "sm",
                    className: "mt-4 self-start",
                  })}
                >
                  Apply by email
                </a>
              </article>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}
