import { getAdmin } from "@/lib/admin-auth";
import { json, serverError } from "@/lib/api/http";
import { csvFilename, toCsv } from "@/lib/csv";
import { getStore, isLeadKind } from "@/lib/db";

/** GET /api/admin/{enquiries|applications}/export: download as CSV. */
export async function GET(request: Request, ctx: { params: Promise<{ kind: string }> }) {
  if (!(await getAdmin(request.headers))) return json({ ok: false, error: "Unauthorised" }, 401);

  const { kind } = await ctx.params;
  if (!isLeadKind(kind)) return json({ ok: false, error: "Not found" }, 404);

  try {
    const rows = (await getStore().list(kind)) as Record<string, unknown>[];
    return new Response(toCsv(rows), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${csvFilename(kind)}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    return serverError(err);
  }
}
