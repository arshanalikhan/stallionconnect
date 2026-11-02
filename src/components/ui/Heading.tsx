import { cn } from "@/lib/cn";

/** Section heading: eyebrow, title with a green highlight, optional intro. */
export function Heading({
  eyebrow,
  title,
  highlight,
  intro,
  align = "left",
  tone = "light",
  className,
}: {
  eyebrow: string;
  title: string;
  highlight?: string;
  intro?: string;
  align?: "left" | "center";
  tone?: "light" | "dark";
  className?: string;
}) {
  const dark = tone === "dark";
  return (
    <header className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      <p
        className={cn(
          "mb-3 text-xs font-bold tracking-[0.16em] uppercase",
          dark ? "text-brand-green-light" : "text-brand-green",
        )}
      >
        {eyebrow}
      </p>
      <h2 className={cn("text-3xl font-bold sm:text-4xl", dark && "text-white")}>
        {title}{" "}
        {highlight && (
          <span className={dark ? "text-brand-green-light" : "text-brand-green"}>{highlight}</span>
        )}
      </h2>
      {intro && (
        <p className={cn("mt-4 text-lg", dark ? "text-[#c4d6e8]" : "text-muted")}>{intro}</p>
      )}
    </header>
  );
}
