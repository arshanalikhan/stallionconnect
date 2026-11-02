import "server-only";
import type { z } from "zod";
import { HONEYPOT_FIELD, toFieldErrors } from "@/lib/forms/schemas";

const MAX_BODY_BYTES = 20_000;

export const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

type Parsed<T> = { ok: true; data: T } | { ok: false; response: Response } | { ok: "spam" };

/** Reads a JSON body, rejects oversized or invalid input, and catches the honeypot. */
export async function parseForm<S extends z.ZodType>(
  request: Request,
  schema: S,
): Promise<Parsed<z.infer<S>>> {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return { ok: false, response: json({ ok: false, error: "Expected JSON." }, 415) };
  }
  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) {
    return { ok: false, response: json({ ok: false, error: "Request too large." }, 413) };
  }

  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return { ok: false, response: json({ ok: false, error: "Invalid JSON." }, 400) };
  }

  if (body && typeof body === "object" && (body as Record<string, unknown>)[HONEYPOT_FIELD]) {
    return { ok: "spam" };
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    return {
      ok: false,
      response: json({ ok: false, errors: toFieldErrors(result.error) }, 422),
    };
  }
  return { ok: true, data: result.data };
}

export const serverError = (err: unknown) => {
  console.error(err);
  return json({ ok: false, error: "Something went wrong. Please try again." }, 500);
};
