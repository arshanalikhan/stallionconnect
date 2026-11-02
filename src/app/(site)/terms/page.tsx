import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";

export const metadata: Metadata = { title: "Terms of Use" };

export default function TermsPage() {
  return (
    <Section
      eyebrow="Legal"
      title="Terms of Use"
      intro="Our terms of use are being finalised and will be published here soon."
    />
  );
}
