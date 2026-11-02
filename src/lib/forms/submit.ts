import type { z } from "zod";
import { HONEYPOT_FIELD, toFieldErrors, type FieldErrors } from "./schemas";

/** A ready-to-send email, used where there is no server to save the form. */
export type EmailDraft = { to: string; subject: string; body: string; href: string };

export type SubmitSuccess =
  { ok: true; via: "api" } | { ok: true; via: "email"; draft: EmailDraft };

export type SubmitResult = SubmitSuccess | { ok: false; errors?: FieldErrors; message?: string };

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export const isStaticPreview = process.env.NEXT_PUBLIC_STATIC_PREVIEW === "true";

/** Reads a form into a plain object; checkboxes become booleans. */
export function readForm(form: HTMLFormElement) {
  const data: Record<string, unknown> = {};
  for (const el of Array.from(form.elements) as HTMLInputElement[]) {
    if (!el.name) continue;
    data[el.name] = el.type === "checkbox" ? el.checked : el.value;
  }
  return data;
}

/**
 * Validates in the browser, then sends to the API.
 * On the static GitHub Pages preview there is no API and nothing is saved, so it
 * returns a ready-to-send email draft for the visitor to send themselves.
 */
export async function submitForm<S extends z.ZodType>(opts: {
  form: HTMLFormElement;
  schema: S;
  endpoint: string;
  email: { to: string; subject: (d: z.infer<S>) => string; labels: Record<string, string> };
}): Promise<SubmitResult> {
  const raw = readForm(opts.form);
  const parsed = opts.schema.safeParse(raw);
  if (!parsed.success) return { ok: false, errors: toFieldErrors(parsed.error) };
  const data = parsed.data as Record<string, unknown>;

  if (isStaticPreview) {
    const body = Object.entries(opts.email.labels)
      .map(([k, label]) => `${label}: ${String(data[k] ?? "") || "-"}`)
      .join("\n");
    const subject = opts.email.subject(parsed.data);
    const href = `mailto:${opts.email.to}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
    return { ok: true, via: "email", draft: { to: opts.email.to, subject, body, href } };
  }

  try {
    const res = await fetch(`${basePath}${opts.endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, [HONEYPOT_FIELD]: raw[HONEYPOT_FIELD] ?? "" }),
    });
    const json = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      errors?: FieldErrors;
      error?: string;
    };
    if (res.ok && json.ok) return { ok: true, via: "api" };
    return { ok: false, errors: json.errors, message: json.error };
  } catch {
    return { ok: false };
  }
}
