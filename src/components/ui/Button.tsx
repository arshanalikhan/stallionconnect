import Link from "next/link";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md";

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-display font-semibold tracking-[-0.01em] transition duration-200 disabled:pointer-events-none disabled:opacity-60";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand-green text-white shadow-[0_1px_2px_rgb(16_24_40/0.08),0_8px_20px_-8px_rgb(19_149_40/0.55)] hover:bg-[#0f8423] hover:shadow-[0_1px_2px_rgb(16_24_40/0.08),0_12px_28px_-8px_rgb(19_149_40/0.6)]",
  secondary:
    "border border-line bg-white text-navy shadow-[0_1px_2px_rgb(16_24_40/0.05)] hover:border-navy/30 hover:bg-surface",
  ghost: "text-navy hover:bg-surface",
};

const sizes: Record<Size, string> = {
  sm: "h-10 px-4 text-sm",
  md: "h-12 px-6 text-[15px]",
};

type StyleProps = { variant?: Variant; size?: Size; className?: string };

export function buttonClasses({ variant = "primary", size = "md", className }: StyleProps = {}) {
  return cn(base, variants[variant], sizes[size], className);
}

export function Button({
  variant,
  size,
  className,
  type = "button",
  ...props
}: StyleProps & React.ComponentProps<"button">) {
  return <button type={type} className={buttonClasses({ variant, size, className })} {...props} />;
}

export function ButtonLink({
  variant,
  size,
  className,
  ...props
}: StyleProps & React.ComponentProps<typeof Link>) {
  return <Link className={buttonClasses({ variant, size, className })} {...props} />;
}
