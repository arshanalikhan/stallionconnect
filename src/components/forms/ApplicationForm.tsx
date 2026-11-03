"use client";

import Link from "next/link";
import { useState } from "react";
import { site } from "@/config/site";
import { Button } from "@/components/ui/Button";
import {
  applicationSchema,
  experienceOptions,
  roleOptions,
  type FieldErrors,
} from "@/lib/forms/schemas";
import { submitForm, type SubmitSuccess } from "@/lib/forms/submit";
import { ConsentField, Honeypot, SelectField, TextAreaField, TextField } from "./fields";
import { FormError, FormSuccess } from "./FormStatus";

type State =
  | { kind: "idle" | "sending" }
  | { kind: "done"; result: SubmitSuccess }
  | { kind: "error"; message?: string };

export function ApplicationForm({ defaultRole }: { defaultRole?: string }) {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [state, setState] = useState<State>({ kind: "idle" });

  if (state.kind === "done") {
    return (
      <FormSuccess
        title="Thank you for applying."
        result={state.result}
        onReset={() => setState({ kind: "idle" })}
      >
        Please email your CV to <strong className="text-navy">{site.contact.careersEmail}</strong>{" "}
        with your name and the role in the subject line. Our HR team will be in touch.
      </FormSuccess>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setState({ kind: "sending" });
    const result = await submitForm({
      form,
      schema: applicationSchema,
      endpoint: "/api/applications",
      kind: "applications",
      email: {
        to: site.contact.careersEmail,
        subject: (d) => `Application: ${d.role} - ${d.name}`,
        labels: {
          name: "Name",
          email: "Email",
          phone: "Phone",
          role: "Role",
          experience: "Experience",
          city: "City",
          languages: "Languages",
          message: "About me",
        },
      },
    });
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

  return (
    <form noValidate onSubmit={onSubmit} className="relative grid gap-4 sm:grid-cols-2">
      <TextField name="name" label="Full name" required autoComplete="name" error={errors.name} />
      <TextField
        name="email"
        label="Email"
        type="email"
        required
        autoComplete="email"
        error={errors.email}
      />
      <TextField
        name="phone"
        label="Phone"
        type="tel"
        required
        autoComplete="tel"
        error={errors.phone}
      />
      <TextField name="city" label="City" autoComplete="address-level2" error={errors.city} />
      <SelectField
        key={defaultRole}
        name="role"
        label="Role"
        required
        options={roleOptions}
        defaultValue={defaultRole}
        error={errors.role}
      />
      <SelectField
        name="experience"
        label="Experience"
        required
        options={experienceOptions}
        error={errors.experience}
      />
      <TextField
        name="languages"
        label="Languages you speak"
        className="sm:col-span-2"
        placeholder="For example: English, Hindi, Marathi"
        error={errors.languages}
      />
      <TextAreaField
        name="message"
        label="About you"
        rows={3}
        className="sm:col-span-2"
        placeholder="A few lines about your experience and when you can join"
        error={errors.message}
      />
      <p className="rounded-xl bg-mint px-4 py-3 text-sm text-brand-green-dark sm:col-span-2">
        After submitting, email your CV to <strong>{site.contact.careersEmail}</strong>.
      </p>
      <div className="sm:col-span-2">
        <ConsentField error={errors.consent}>
          I agree that {site.name} may store my details for recruitment and contact me about this
          application, as described in the{" "}
          <Link href="/privacy" className="font-semibold text-navy underline">
            privacy policy
          </Link>
          .
        </ConsentField>
      </div>
      <Honeypot />
      {state.kind === "error" && (
        <div className="sm:col-span-2">
          <FormError message={state.message} />
        </div>
      )}
      <div className="sm:col-span-2">
        <Button type="submit" disabled={state.kind === "sending"} className="w-full sm:w-auto">
          {state.kind === "sending" ? "Sending..." : "Submit application"}
        </Button>
      </div>
    </form>
  );
}
