"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import Image from "next/image";
import logoFull from "@/assets/brand/logo-full.webp";
import { buttonClasses } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { ApplicationForm } from "./ApplicationForm";
import { QuoteForm } from "./QuoteForm";

type Open = { type: "quote"; service?: string } | { type: "apply"; role?: string };
type Ctx = { open: (o: Open) => void };

const DialogContext = createContext<Ctx | null>(null);

export function useFormDialog() {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error("useFormDialog must be used inside <FormDialogProvider>");
  return ctx;
}

const brandCopy = {
  quote: {
    eyebrow: "Work with us",
    title: "Let's build your",
    accent: "dream team.",
    text: "Tell us how your process works. We will come back with a plan, a team size and a quote.",
    points: [
      "Reply within one working day",
      "Start with a pilot, scale when ready",
      "Domestic and international",
    ],
    switchText: "Looking for a job?",
    switchCta: "Apply instead",
    formEyebrow: "Get a quote",
    formTitle: "Request a quote",
  },
  apply: {
    eyebrow: "Careers",
    title: "Start your",
    accent: "next chapter.",
    text: "Freshers are trained from day one, and experienced people grow into leader and trainer roles.",
    points: ["Training from day one", "Clear growth path", "Send your CV by email after applying"],
    switchText: "Need our services?",
    switchCta: "Get a quote",
    formEyebrow: "Apply",
    formTitle: "Join our team",
  },
} as const;

/**
 * Hosts the quote and job application forms for the whole site, in one
 * glossy split card. The brand side and the form side swap places:
 * "Get a Quote" brings the form in from the right, "Apply" from the left, and
 * switching between them inside the card glides the brand side across.
 */
export function FormDialogProvider({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [current, setCurrent] = useState<Open | null>(null);
  const [version, setVersion] = useState(0);

  const open = useCallback((o: Open) => {
    setCurrent(o);
    setVersion((v) => v + 1); // fresh form and entrance animation each time
  }, []);

  useEffect(() => {
    const d = ref.current;
    if (current && d && !d.open) d.showModal();
  }, [current, version]);

  const close = () => ref.current?.close();
  const mode = current?.type ?? "quote";
  const copy = brandCopy[mode];

  return (
    <DialogContext.Provider value={{ open }}>
      {children}
      <dialog
        ref={ref}
        aria-labelledby="form-dialog-title"
        onClose={() => setCurrent(null)}
        onClick={(e) => e.target === e.currentTarget && close()}
        className="fd-dialog m-auto max-h-[94svh] w-[min(1060px,calc(100%-1.5rem))] overflow-y-auto overscroll-contain rounded-[2rem] bg-transparent p-0 backdrop:bg-navy-deep/60 backdrop:backdrop-blur-md"
      >
        {current && (
          <div key={version} className="fd" data-mode={mode} data-enter={current.type}>
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute top-4 right-4 z-30 grid size-10 place-items-center rounded-full border border-white/60 bg-white/70 text-xl text-navy shadow-[inset_0_1px_0_#fff] backdrop-blur hover:bg-white"
            >
              &times;
            </button>

            {/* Brand side: glossy navy-to-green glass with a diagonal blade edge */}
            <aside className="fd-brand" aria-hidden="true">
              <div className="fd-brand-inner">
                <span className="inline-flex items-center rounded-full bg-white/90 px-3 py-1.5 shadow-[inset_0_1px_0_#fff]">
                  <Image src={logoFull} alt="" className="h-7 w-auto" />
                </span>
                <p className="mt-8 font-display text-[12px] font-semibold tracking-[0.2em] text-brand-green-light uppercase">
                  {copy.eyebrow}
                </p>
                <p className="mt-3 font-display text-3xl leading-tight font-bold text-white lg:text-[2.4rem]">
                  {copy.title} <span className="accent-serif text-[#9ff2bd]">{copy.accent}</span>
                </p>
                <p className="mt-4 max-w-xs text-[15px] leading-relaxed text-white/75">
                  {copy.text}
                </p>
                <ul className="mt-6 hidden space-y-2.5 text-sm text-white/85 lg:block">
                  {copy.points.map((pt) => (
                    <li key={pt} className="flex items-center gap-2.5">
                      <span className="grid size-5 place-items-center rounded-full bg-brand-green-light/20 text-brand-green-light">
                        <Icon name="check" className="size-3" strokeWidth={3} />
                      </span>
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            {/* Form side */}
            <div className="fd-form">
              <div className="fd-form-inner">
                <p className="font-display text-[12px] font-semibold tracking-[0.18em] text-brand-green uppercase">
                  {copy.formEyebrow}
                </p>
                <h2 id="form-dialog-title" className="mt-2 pr-10 text-[1.75rem] font-bold">
                  {copy.formTitle}
                </h2>
                <span
                  aria-hidden="true"
                  className="mt-3 mb-6 block h-[3px] w-12 rounded-full bg-linear-to-r from-brand-green to-brand-green-light"
                />
                {current.type === "quote" ? (
                  <QuoteForm defaultService={current.service} idPrefix="dialog-" />
                ) : (
                  <ApplicationForm defaultRole={current.role} />
                )}
                <p className="mt-6 border-t border-line/70 pt-5 text-sm text-muted">
                  {copy.switchText}{" "}
                  <button
                    type="button"
                    onClick={() =>
                      setCurrent(current.type === "quote" ? { type: "apply" } : { type: "quote" })
                    }
                    className="font-semibold text-navy underline decoration-brand-green decoration-2 underline-offset-4 hover:text-brand-green"
                  >
                    {copy.switchCta}
                  </button>
                </p>
              </div>
            </div>
          </div>
        )}
      </dialog>
    </DialogContext.Provider>
  );
}

type ButtonStyle = Parameters<typeof buttonClasses>[0];

export function QuoteButton({
  service,
  children = "Get a Quote",
  className,
  style,
  onOpen,
}: {
  service?: string;
  children?: React.ReactNode;
  className?: string;
  style?: ButtonStyle;
  onOpen?: () => void;
}) {
  const { open } = useFormDialog();
  return (
    <button
      type="button"
      className={className ?? buttonClasses(style)}
      onClick={() => {
        onOpen?.();
        open({ type: "quote", service });
      }}
    >
      {children}
    </button>
  );
}

export function ApplyButton({
  role,
  children = "Apply now",
  className,
  style,
}: {
  role?: string;
  children?: React.ReactNode;
  className?: string;
  style?: ButtonStyle;
}) {
  const { open } = useFormDialog();
  return (
    <button
      type="button"
      className={className ?? buttonClasses(style)}
      onClick={() => open({ type: "apply", role })}
    >
      {children}
    </button>
  );
}
