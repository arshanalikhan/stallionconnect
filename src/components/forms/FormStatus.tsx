"use client";

import { useState } from "react";
import { site } from "@/config/site";
import { buttonClasses } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { EmailDraft, SubmitSuccess } from "@/lib/forms/submit";

export function FormSuccess({
  title,
  result,
  children,
  onReset,
}: {
  title: string;
  result: SubmitSuccess;
  children: React.ReactNode;
  onReset: () => void;
}) {
  if (result.via === "email") return <EmailStep draft={result.draft} onReset={onReset} />;

  return (
    <div role="status" className="py-6 text-center">
      <span className="mx-auto grid size-16 place-items-center rounded-full bg-brand-green text-white">
        <Icon name="check" className="size-8" strokeWidth={2.5} />
      </span>
      <h3 className="mt-5 text-xl font-bold">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-muted">{children}</p>
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

/**
 * Shown only where the form cannot be saved (the static preview site): the
 * visitor sends their details by email instead. Nothing has been received yet,
 * so the wording must not say it has.
 */
function EmailStep({ draft, onReset }: { draft: EmailDraft; onReset: () => void }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(
        `To: ${draft.to}\nSubject: ${draft.subject}\n\n${draft.body}`,
      );
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div role="status" className="py-2 text-center">
      <span className="mx-auto grid size-16 place-items-center rounded-full bg-royal text-white">
        <Icon name="mail" className="size-8" strokeWidth={2} />
      </span>
      <h3 className="mt-5 text-xl font-bold">One more step: send it by email</h3>
      <p className="mx-auto mt-2 max-w-md text-muted">
        Your details are ready but have <strong className="text-ink">not been sent yet</strong>.
        Open your email app and press send, or copy the details and email them to{" "}
        <strong className="text-navy">{draft.to}</strong>.
      </p>
      <pre className="mx-auto mt-5 max-h-40 max-w-md overflow-auto rounded-xl bg-surface p-4 text-left font-sans text-sm whitespace-pre-wrap text-ink">
        {draft.body}
      </pre>
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <a href={draft.href} className={buttonClasses()}>
          Open email app
        </a>
        <button type="button" onClick={copy} className={buttonClasses({ variant: "secondary" })}>
          {copied ? "Copied" : "Copy details"}
        </button>
      </div>
      <button
        type="button"
        onClick={onReset}
        className="mt-5 text-sm font-semibold text-navy underline underline-offset-4"
      >
        Back to the form
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
