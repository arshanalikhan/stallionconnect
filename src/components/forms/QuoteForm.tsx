"use client";

import Link from "next/link";
import { site } from "@/config/site";
import { Button } from "@/components/ui/Button";
import { enquirySchema, serviceOptions, teamSizeOptions } from "@/lib/forms/schemas";
import { ConsentField, Honeypot, SelectField, TextAreaField, TextField } from "./fields";
import { FormError, FormSuccess } from "./FormStatus";
import { useFormSubmit } from "./useFormSubmit";

export function QuoteForm({ defaultService }: { defaultService?: string }) {
  const { errors, state, onSubmit, reset } = useFormSubmit({
    schema: enquirySchema,
    endpoint: "/api/enquiries",
    kind: "enquiries",
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

  if (state.kind === "done") {
    return (
      <FormSuccess title="Thank you, we have your enquiry." result={state.result} onReset={reset}>
        Our team will get back to you within one working day.
      </FormSuccess>
    );
  }

  return (
    <form noValidate onSubmit={onSubmit} className="relative grid gap-4 sm:grid-cols-2">
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
