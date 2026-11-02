import Image from "next/image";
import Link from "next/link";
import { site } from "@/config/site";
import { cn } from "@/lib/cn";
import logoFull from "@/assets/brand/logo-full.webp";

/** Full horizontal logo (mark + wordmark + tagline). */
export function Logo({
  className,
  imgClassName = "h-12 w-auto sm:h-14",
  priority,
}: {
  className?: string;
  imgClassName?: string;
  priority?: boolean;
}) {
  return (
    <Link href="/#home" aria-label={`${site.name} home`} className={cn("inline-flex", className)}>
      <Image src={logoFull} alt={site.name} priority={priority} className={imgClassName} />
    </Link>
  );
}
