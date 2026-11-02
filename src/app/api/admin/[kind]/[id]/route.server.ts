import { z } from "zod";
import { getAdmin } from "@/lib/admin-auth";
import { json, serverError } from "@/lib/api/http";
import { getStore, isLeadKind, leadStatuses } from "@/lib/db";

const patchSchema = z
  .object({
    status: z.enum(leadStatuses).optional(),
    note: z.string().max(2000).optional(),
  })
  .refine((v) => v.status !== undefined || v.note !== undefined);

/** PATCH /api/admin/{enquiries|applications}/{id}: change status or note. */
export async function PATCH(
  request: Request,
  ctx: { params: Promise<{ kind: string; id: string }> },
) {
  if (!(await getAdmin(request.headers))) return json({ ok: false, error: "Unauthorised" }, 401);

  const { kind, id } = await ctx.params;
  if (!isLeadKind(kind)) return json({ ok: false, error: "Not found" }, 404);

  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return json({ ok: false, error: "Invalid update" }, 422);

  try {
    const updated = await getStore().update(kind, id, parsed.data);
    return updated ? json({ ok: true }) : json({ ok: false, error: "Not found" }, 404);
  } catch (err) {
    return serverError(err);
  }
}
