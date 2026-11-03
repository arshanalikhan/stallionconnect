import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <Section
      className="pt-36 sm:pt-40"
      eyebrow="Legal"
      title="Privacy Policy"
      intro="Our privacy policy is being finalised and will be published here soon."
    />
  );
}
