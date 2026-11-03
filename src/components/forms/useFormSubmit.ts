"use client";

import { useState } from "react";
import type { z } from "zod";
import type { FieldErrors } from "@/lib/forms/schemas";
import { submitForm, type SubmitSuccess } from "@/lib/forms/submit";

export type FormState =
  | { kind: "idle" | "sending" }
  | { kind: "done"; result: SubmitSuccess }
  | { kind: "error"; message?: string };

/**
 * Shared submit handling for the quote and application forms: validates,
 * sends, shows per-field errors and focuses the first invalid field.
 */
export function useFormSubmit<S extends z.ZodType>(
  opts: Omit<Parameters<typeof submitForm<S>>[0], "form">,
) {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [state, setState] = useState<FormState>({ kind: "idle" });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setState({ kind: "sending" });
    const result = await submitForm({ ...opts, form });
    if (result.ok) {
      setErrors({});
      setState({ kind: "done", result });
      return;
    }
    setErrors(result.errors ?? {});
    if (result.errors) {
      setState({ kind: "idle" });
      const first = Object.keys(result.errors)[0];
      form.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
    } else {
      setState({ kind: "error", message: result.message });
    }
  }

  return { errors, state, onSubmit, reset: () => setState({ kind: "idle" }) };
}
