"use client";

import Link from "next/link";
import { useState } from "react";
import { site } from "@/config/site";
import { Button } from "@/components/ui/Button";
import {
  enquirySchema,
  serviceOptions,
  teamSizeOptions,
  type FieldErrors,
} from "@/lib/forms/schemas";
import { submitForm, type SubmitSuccess } from "@/lib/forms/submit";
import { ConsentField, Honeypot, SelectField, TextAreaField, TextField } from "./fields";
import { FormError, FormSuccess } from "./FormStatus";

type State =
  | { kind: "idle" | "sending" }
  | { kind: "done"; result: SubmitSuccess }
  | { kind: "error"; message?: string };

export function QuoteForm({
  defaultService,
  idPrefix = "",
}: {
  defaultService?: string;
  idPrefix?: string;
}) {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [state, setState] = useState<State>({ kind: "idle" });

  if (state.kind === "done") {
    return (
      <FormSuccess
        title="Thank you, we have your enquiry."
        result={state.result}
        onReset={() => setState({ kind: "idle" })}
      >
        Our team will get back to you within one working day.
      </FormSuccess>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setState({ kind: "sending" });
    const result = await submitForm({
      form,
      schema: enquirySchema,
      endpoint: "/api/enquiries",
      email: {
        to: site.contact.email,
        subject: (d) => `Quote request: ${d.service}`,
        labels: {
          name: "Name",
          company: "Company",
          email: "Email",
          phone: "Phone",
          service: "Service",
          teamSize: "Team size",
          message: "Requirements",
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
    <form
      noValidate
      onSubmit={onSubmit}
      className="relative grid gap-4 sm:grid-cols-2"
      data-form={`${idPrefix}quote`}
    >
      <TextField name="name" label="Full name" required autoComplete="name" error={errors.name} />
      <TextField
        name="company"
        label="Company"
        autoComplete="organization"
        error={errors.company}
      />
      <TextField
        name="email"
        label="Work email"
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
      <SelectField
        key={defaultService}
        name="service"
        label="Service"
        required
        options={serviceOptions}
        defaultValue={defaultService}
        error={errors.service}
      />
      <SelectField
        name="teamSize"
        label="Team size"
        required
        options={teamSizeOptions}
        error={errors.teamSize}
      />
      <TextAreaField
        name="message"
        label="Your requirements"
        required
        className="sm:col-span-2"
        placeholder="Tell us about your process, expected volumes, languages and timelines"
        error={errors.message}
      />
      <div className="sm:col-span-2">
        <ConsentField error={errors.consent}>
          I agree that {site.name} may contact me about this enquiry and store my details as
          described in the{" "}
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
          {state.kind === "sending" ? "Sending..." : "Send enquiry"}
        </Button>
      </div>
    </form>
  );
}
