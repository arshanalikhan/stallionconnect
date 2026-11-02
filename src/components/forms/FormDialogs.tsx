"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { buttonClasses } from "@/components/ui/Button";
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

/** Hosts the quote and job application dialogs for the whole site. */
export function FormDialogProvider({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [current, setCurrent] = useState<Open | null>(null);
  const [version, setVersion] = useState(0);

  const open = useCallback((o: Open) => {
    setCurrent(o);
    setVersion((v) => v + 1); // fresh form each time it opens
  }, []);

  useEffect(() => {
    const d = ref.current;
    if (current && d && !d.open) d.showModal();
  }, [current, version]);

  const close = () => ref.current?.close();

  return (
    <DialogContext.Provider value={{ open }}>
      {children}
      <dialog
        ref={ref}
        aria-labelledby="form-dialog-title"
        onClose={() => setCurrent(null)}
        onClick={(e) => e.target === e.currentTarget && close()}
        className="m-auto max-h-[92svh] w-[min(640px,calc(100%-1.5rem))] rounded-[1.75rem] p-0 shadow-[0_40px_90px_-30px_rgb(0_0_0/0.6)] backdrop:bg-navy-deep/70 backdrop:backdrop-blur-sm"
      >
        {current && (
          <div className="relative p-6 sm:p-8">
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute top-4 right-4 grid size-10 place-items-center rounded-full bg-surface text-xl text-navy hover:bg-line"
            >
              &times;
            </button>
            <p className="mb-2 text-xs font-bold tracking-[0.16em] text-brand-green uppercase">
              {current.type === "quote" ? "Get a quote" : "Apply"}
            </p>
            <h2 id="form-dialog-title" className="mb-6 pr-10 text-2xl font-bold">
              {current.type === "quote" ? "Tell us about your process" : "Apply to join our team"}
            </h2>
            {current.type === "quote" ? (
              <QuoteForm key={version} defaultService={current.service} idPrefix="dialog-" />
            ) : (
              <ApplicationForm key={version} defaultRole={current.role} />
            )}
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
