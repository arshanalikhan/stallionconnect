import { getStore } from "@/lib/db";
import { json, parseForm, serverError } from "@/lib/api/http";
import { applicationSchema } from "@/lib/forms/schemas";

/** POST /api/applications: saves a job application (CVs arrive by email). */
export async function POST(request: Request) {
  const parsed = await parseForm(request, applicationSchema);
  if (parsed.ok === "spam") return json({ ok: true });
  if (!parsed.ok) return parsed.response;

  try {
    const { id } = await getStore().createApplication(parsed.data);
    return json({ ok: true, id }, 201);
  } catch (err) {
    return serverError(err);
  }
}
