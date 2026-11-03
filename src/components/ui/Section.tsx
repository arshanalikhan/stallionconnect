import { cn } from "@/lib/cn";
import { Container } from "./Container";

type SectionProps = React.ComponentProps<"section"> & {
  eyebrow?: string;
  title?: React.ReactNode;
  intro?: React.ReactNode;
  containerClassName?: string;
};

/** Standard page section with optional eyebrow, heading and intro text. */
export function Section({
  eyebrow,
  title,
  intro,
  className,
  containerClassName,
  children,
  ...props
}: SectionProps) {
  return (
    <section className={cn("py-20 sm:py-28", className)} {...props}>
      <Container className={containerClassName}>
        {(eyebrow || title || intro) && (
          <header className="max-w-2xl">
            {eyebrow && (
              <p className="mb-3 text-xs font-bold tracking-[0.16em] text-brand-green uppercase">
                {eyebrow}
              </p>
            )}
            {title && <h2 className="text-3xl font-bold sm:text-4xl">{title}</h2>}
            {intro && <p className="mt-4 text-lg text-muted">{intro}</p>}
          </header>
        )}
        {children}
      </Container>
    </section>
  );
}
