import { cn } from "@/lib/cn";

/** Section heading: eyebrow, title with a green highlight, optional intro. */
export function Heading({
  eyebrow,
  title,
  highlight,
  intro,
  align = "left",
  tone = "light",
  panel = false,
  className,
}: {
  eyebrow: string;
  title: string;
  highlight?: string;
  intro?: string;
  align?: "left" | "center";
  tone?: "light" | "dark";
  /** Frosted-glass background when the 3D scene is showing behind the page. */
  panel?: boolean;
  className?: string;
}) {
  const dark = tone === "dark";
  return (
    <header
      className={cn(
        // As a panel it spans the full content width so its edges line up
        // with the cards below; the text inside keeps a readable width.
        panel ? "scene-panel [&>*]:max-w-2xl" : "max-w-2xl",
        align === "center" && "text-center",
        align === "center" && (panel ? "[&>*]:mx-auto" : "mx-auto"),
        className,
      )}
    >
      <p
        className={cn(
          "mb-4 inline-flex items-center gap-2.5 font-display text-[13px] font-semibold tracking-[0.12em] uppercase",
          align === "center" && "justify-center",
          dark ? "text-brand-green-light" : "text-brand-green",
        )}
      >
        <span aria-hidden="true" className="h-px w-6 bg-current" />
        {eyebrow}
      </p>
      <h2 className={cn("text-3xl font-bold sm:text-4xl lg:text-[2.6rem]", dark && "text-white")}>
        {title}{" "}
        {highlight && (
          <span
            className={cn("accent-serif", dark ? "text-brand-green-light" : "text-brand-green")}
          >
            {highlight}
          </span>
        )}
      </h2>
      {intro && (
        <p
          className={cn("mt-4 text-[17px] leading-relaxed", dark ? "text-[#c4d6e8]" : "text-muted")}
        >
          {intro}
        </p>
      )}
    </header>
  );
}
