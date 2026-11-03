import Link from "next/link";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md";

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-display font-semibold tracking-[-0.01em] transition duration-200 disabled:pointer-events-none disabled:opacity-60";

const variants: Record<Variant, string> = {
  // Glossy: lighter top, darker bottom, bright inner top edge, green glow.
  primary:
    "bg-linear-to-b from-[#24b84c] to-[#108a26] text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.35),inset_0_-1px_0_rgb(0_0_0/0.12),0_1px_2px_rgb(16_24_40/0.1),0_8px_20px_-8px_rgb(19_149_40/0.6)] hover:from-[#2bc455] hover:to-[#0f8423] hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.4),inset_0_-1px_0_rgb(0_0_0/0.12),0_1px_2px_rgb(16_24_40/0.1),0_12px_28px_-8px_rgb(19_149_40/0.7)]",
  secondary:
    "border border-line bg-linear-to-b from-white to-[#f3f6fb] text-navy shadow-[inset_0_1px_0_#fff,0_1px_2px_rgb(16_24_40/0.06)] hover:border-navy/30 hover:to-[#e9eff8]",
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
