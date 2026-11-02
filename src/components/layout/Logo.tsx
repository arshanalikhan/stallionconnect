import Image from "next/image";
import Link from "next/link";
import { site } from "@/config/site";
import { cn } from "@/lib/cn";

/** Full horizontal logo (mark + wordmark + tagline). */
export function Logo({ className, priority }: { className?: string; priority?: boolean }) {
  return (
    <Link href="/#home" aria-label={`${site.name} home`} className={cn("inline-flex", className)}>
      <Image
        src="/brand/logo-full.webp"
        alt={site.name}
        width={900}
        height={276}
        priority={priority}
        className="h-11 w-auto sm:h-12"
      />
    </Link>
  );
}
