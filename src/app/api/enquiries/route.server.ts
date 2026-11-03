import { getStore } from "@/lib/db";
import { json, parseForm, serverError } from "@/lib/api/http";
import { enquirySchema } from "@/lib/forms/schemas";

/** POST /api/enquiries: saves a quote request. */
export async function POST(request: Request) {
  const parsed = await parseForm(request, enquirySchema);
  if (parsed.ok === "spam") return json({ ok: true });
  if (!parsed.ok) return parsed.response;

  try {
    const { id } = await getStore().createEnquiry(parsed.data);
    return json({ ok: true, id }, 201);
  } catch (err) {
    return serverError(err);
  }
}
