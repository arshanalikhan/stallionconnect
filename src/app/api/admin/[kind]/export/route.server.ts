import { getAdmin } from "@/lib/admin-auth";
import { json, serverError } from "@/lib/api/http";
import { getStore, isLeadKind } from "@/lib/db";

/** Quotes a CSV cell and neutralises spreadsheet formula injection. */
function cell(value: unknown) {
  let s = String(value ?? "");
  // Phone numbers like "+91 98765 43210" are safe; other leading + or - may be a formula.
  const isPhone = /^[+-][\d\s()-]*$/.test(s);
  if (/^[=+\-@\t\r]/.test(s) && !isPhone) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

/** GET /api/admin/{enquiries|applications}/export: download as CSV. */
export async function GET(request: Request, ctx: RouteContext<"/api/admin/[kind]/export">) {
  if (!(await getAdmin(request.headers))) return json({ ok: false, error: "Unauthorised" }, 401);

  const { kind } = await ctx.params;
  if (!isLeadKind(kind)) return json({ ok: false, error: "Not found" }, 404);

  try {
    const rows = (await getStore().list(kind)) as Record<string, unknown>[];
    const first = ["createdAt", "status", "note"];
    const headers = rows[0]
      ? [...first, ...Object.keys(rows[0]).filter((k) => !first.includes(k) && k !== "id"), "id"]
      : first;
    const csv = [
      headers.map(cell).join(","),
      ...rows.map((r) => headers.map((h) => cell(r[h])).join(",")),
    ].join("\r\n");
    const date = new Date().toISOString().slice(0, 10);
    return new Response("﻿" + csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="stallion-${kind}-${date}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    return serverError(err);
  }
}
