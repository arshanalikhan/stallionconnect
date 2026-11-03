import { getAdmin } from "@/lib/admin-auth";
import { json, serverError } from "@/lib/api/http";
import { getStore, isLeadKind } from "@/lib/db";

/** GET /api/admin/{enquiries|applications}: all rows, newest first. */
export async function GET(request: Request, ctx: { params: Promise<{ kind: string }> }) {
  const admin = await getAdmin(request.headers);
  if (!admin) return json({ ok: false, error: "Unauthorised" }, 401);

  const { kind } = await ctx.params;
  if (!isLeadKind(kind)) return json({ ok: false, error: "Not found" }, 404);

  try {
    return json({ ok: true, admin: admin.email, rows: await getStore().list(kind) });
  } catch (err) {
    return serverError(err);
  }
}
