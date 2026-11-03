import type { ApplicationInput, EnquiryInput } from "@/lib/forms/schemas";

export const leadStatuses = ["new", "contacted", "closed"] as const;
export type LeadStatus = (typeof leadStatuses)[number];

export const leadKinds = ["enquiries", "applications"] as const;
export type LeadKind = (typeof leadKinds)[number];

type Meta = { id: string; status: LeadStatus; createdAt: string; note: string };

export type Enquiry = Omit<EnquiryInput, "consent"> & Meta;
export type Application = Omit<ApplicationInput, "consent"> & Meta;

export type LeadMap = { enquiries: Enquiry; applications: Application };

export interface LeadStore {
  createEnquiry(input: EnquiryInput): Promise<{ id: string }>;
  createApplication(input: ApplicationInput): Promise<{ id: string }>;
  /** Newest first, up to 1000 rows. */
  list<K extends LeadKind>(kind: K): Promise<LeadMap[K][]>;
  update(
    kind: LeadKind,
    id: string,
    patch: { status?: LeadStatus; note?: string },
  ): Promise<boolean>;
  remove(kind: LeadKind, id: string): Promise<boolean>;
}

export const isLeadKind = (v: unknown): v is LeadKind => leadKinds.includes(v as LeadKind);
export const isLeadStatus = (v: unknown): v is LeadStatus => leadStatuses.includes(v as LeadStatus);
