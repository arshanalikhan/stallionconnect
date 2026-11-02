import { site } from "@/config/site";
import { Icon } from "@/components/ui/Icon";

export function FormSuccess({
  title,
  via,
  children,
  onReset,
}: {
  title: string;
  via: "api" | "email";
  children: React.ReactNode;
  onReset: () => void;
}) {
  return (
    <div role="status" className="py-6 text-center">
      <span className="mx-auto grid size-16 place-items-center rounded-full bg-brand-green text-white">
        <Icon name="check" className="size-8" strokeWidth={2.5} />
      </span>
      <h3 className="mt-5 text-xl font-bold">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-muted">
        {via === "email"
          ? "Your email app should now be open with your details filled in. Please press send to reach us."
          : children}
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-6 text-sm font-semibold text-navy underline underline-offset-4"
      >
        Send another
      </button>
    </div>
  );
}

export function FormError({ message }: { message?: string }) {
  return (
    <p role="alert" className="rounded-xl bg-[#fdecea] px-4 py-3 text-sm text-[#8a1f17]">
      {message ?? "We could not send your details."} Please try again, or email us at{" "}
      <a href={`mailto:${site.contact.email}`} className="font-semibold underline">
        {site.contact.email}
      </a>
      .
    </p>
  );
}
