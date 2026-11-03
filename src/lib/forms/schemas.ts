/**
 * Form schemas shared by the browser (instant feedback) and the API routes
 * (the real check). Keep both sides in sync by importing from here only.
 */
import { z } from "zod";
import { careers, services } from "@/content/home";

export const serviceOptions = [
  ...services.items.filter((s) => s.id !== "custom").map((s) => s.title),
  "Custom process",
] as const;

export const teamSizeOptions = [
  "1 to 10",
  "11 to 50",
  "51 to 200",
  "200+",
  "Not sure yet",
] as const;

export const roleOptions = [...careers.openings.map((o) => o.title), "Other"] as const;

export const experienceOptions = [
  "Fresher",
  "Less than 1 year",
  "1 to 3 years",
  "3 to 5 years",
  "5+ years",
] as const;

/** Where a lead came from. Set by the website form or the chatbot. */
export const leadSources = ["website", "chatbot"] as const;
export type LeadSource = (typeof leadSources)[number];
const source = z.enum(leadSources).optional().default("website");

const name = z.string().trim().min(2, { error: "Please enter your full name." }).max(100);
const email = z
  .string()
  .trim()
  .max(200)
  .pipe(z.email({ error: "Please enter a valid email address." }));
const phone = z
  .string()
  .trim()
  .regex(/^[0-9+\-\s()]{7,20}$/, { error: "Please enter a valid phone number." });
const consent = z.literal(true, {
  error: "Please agree so we can contact you about your request.",
});
const optional = (max: number) => z.string().trim().max(max).optional().default("");

export const enquirySchema = z.object({
  name,
  company: optional(150),
  email,
  phone,
  service: z.enum(serviceOptions, { error: "Please choose a service." }),
  teamSize: z.enum(teamSizeOptions, { error: "Please choose a team size." }),
  message: z
    .string()
    .trim()
    .min(10, { error: "Please tell us a little about your requirements." })
    .max(3000),
  consent,
  source,
});

export const applicationSchema = z.object({
  name,
  email,
  phone,
  role: z.enum(roleOptions, { error: "Please choose a role." }),
  experience: z.enum(experienceOptions, { error: "Please choose your experience." }),
  city: optional(100),
  languages: optional(200),
  message: optional(2000),
  consent,
  source,
});

export type EnquiryInput = z.infer<typeof enquirySchema>;
export type ApplicationInput = z.infer<typeof applicationSchema>;

export type FieldErrors = Record<string, string>;

/** Turns a failed parse into `{ field: firstMessage }`. */
export function toFieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}

/** Hidden field that real people never fill in; bots often do. */
export const HONEYPOT_FIELD = "website";
