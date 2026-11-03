/**
 * Chatbot script. Edit questions, answers and keywords here; no code changes
 * needed. Answers must stay factual: no prices or promises we cannot keep.
 *
 * - `label` is the button text shown to visitors.
 * - `keywords` match what visitors type (lowercase, any one word or phrase).
 * - `next` lists follow-up buttons shown after the answer (FAQ ids or actions).
 */
export type ChatAction = "quote" | "apply" | "human" | "menu" | "form";
export type ChatFaq = {
  id: string;
  label: string;
  keywords: string[];
  answer: string;
  next?: (string | ChatAction)[];
};

export const greeting =
  "Hi! I'm the Stallion Connect assistant. I can answer common questions, take a quote request or help you apply for a job. What would you like to do?";

export const menu: (string | ChatAction)[] = [
  "services",
  "pricing",
  "pilot",
  "quote",
  "apply",
  "human",
];

export const actionLabels: Record<ChatAction, string> = {
  quote: "Get a quote",
  apply: "Apply for a job",
  human: "Talk to a person",
  menu: "Main menu",
  form: "Use the full form instead",
};

export const faqs: ChatFaq[] = [
  {
    id: "services",
    label: "What services do you offer?",
    keywords: ["service", "services", "offer", "provide", "do you do", "what do you"],
    answer:
      "We run outsourced operations under one roof:\n• Call centre (domestic and international voice)\n• Banking & financial services: card and loan sales, onboarding, KYC, collections\n• Inbound and outbound sales\n• BPO & ITES: email and chat support, L1 helpdesk, data processing\n• Customer support and lead generation\n• Recruitment and training\n• Back-office and admin\nIf your process is different, we can design a team around it.",
    next: ["industries", "pilot", "quote"],
  },
  {
    id: "pricing",
    label: "How much does it cost?",
    keywords: [
      "price",
      "pricing",
      "cost",
      "rate",
      "rates",
      "charge",
      "budget",
      "quote",
      "fees",
      "how much",
    ],
    answer:
      "Pricing depends on the process, team size, shifts, languages and the reports you need, so we quote for each client. Share a few details and our team will send you a plan and a quote, usually within one working day.",
    next: ["quote", "pilot", "menu"],
  },
  {
    id: "pilot",
    label: "Can we start with a small pilot?",
    keywords: ["pilot", "trial", "small team", "start small", "test"],
    answer:
      "Yes. Most clients start with a small team for a few weeks, review the results together, then scale up.",
    next: ["golive", "quote", "menu"],
  },
  {
    id: "golive",
    label: "How quickly can a team go live?",
    keywords: [
      "how quickly",
      "how soon",
      "go live",
      "start",
      "timeline",
      "ramp",
      "launch",
      "time to",
    ],
    answer:
      "It depends on team size and training needs. A small pilot can usually go live within a few weeks of the process being agreed. Hiring and training are handled by us.",
    next: ["quote", "menu"],
  },
  {
    id: "international",
    label: "Do you handle international processes?",
    keywords: [
      "international",
      "overseas",
      "abroad",
      "uk",
      "us",
      "usa",
      "australia",
      "global",
      "time zone",
      "timezone",
    ],
    answer:
      "Yes. We run domestic and international voice and non-voice processes, with shifts planned around your customers' time zones.",
    next: ["languages", "quote", "menu"],
  },
  {
    id: "languages",
    label: "Which languages do you support?",
    keywords: ["language", "languages", "hindi", "english", "regional", "multilingual"],
    answer:
      "Our teams work in English, Hindi and regional languages. Tell us which ones your customers use.",
    next: ["quote", "menu"],
  },
  {
    id: "industries",
    label: "Which industries do you work with?",
    keywords: [
      "industry",
      "industries",
      "sector",
      "bank",
      "banking",
      "insurance",
      "telecom",
      "ecommerce",
      "e-commerce",
      "healthcare",
      "travel",
      "education",
      "real estate",
      "bfsi",
    ],
    answer:
      "Banking and financial services, insurance, telecom and internet, e-commerce and retail, healthcare, travel and hospitality, education and real estate. We specialise in BFSI.",
    next: ["services", "quote", "menu"],
  },
  {
    id: "security",
    label: "How do you protect our data?",
    keywords: [
      "data",
      "security",
      "secure",
      "privacy",
      "confidential",
      "protect",
      "nda",
      "compliance",
    ],
    answer:
      "Access is limited to the people working on your process, staff sign confidentiality agreements, and we follow your data-handling rules.",
    next: ["reports", "quote", "menu"],
  },
  {
    id: "reports",
    label: "How will we track performance?",
    keywords: [
      "report",
      "reports",
      "kpi",
      "kpis",
      "track",
      "performance",
      "quality",
      "sla",
      "audit",
    ],
    answer:
      "You get regular reports on the KPIs we agree at the start, such as calls handled, conversion, quality scores and turnaround times. We also run call audits and refine the process every month.",
    next: ["quote", "menu"],
  },
  {
    id: "hours",
    label: "Do you offer 24x7 support?",
    keywords: ["24x7", "24/7", "night", "shift", "shifts", "weekend", "hours", "round the clock"],
    answer:
      "Yes, 24x7 coverage is available, and shifts can be planned around your customers' hours.",
    next: ["quote", "menu"],
  },
  {
    id: "jobs",
    label: "Are you hiring?",
    keywords: [
      "job",
      "jobs",
      "hiring",
      "career",
      "careers",
      "vacancy",
      "vacancies",
      "opening",
      "fresher",
      "work with you",
      "apply",
    ],
    answer:
      "Yes. We hire for customer support, international voice, tele-sales (BFSI), back-office, team leaders and trainers. Freshers are trained from day one.",
    next: ["apply", "cv", "menu"],
  },
  {
    id: "cv",
    label: "How do I send my CV?",
    keywords: ["cv", "resume", "résumé", "biodata"],
    answer:
      "Apply here in the chat first, then email your CV to careers@stallionconnect.in with your name and the role in the subject line.",
    next: ["apply", "menu"],
  },
  {
    id: "contact",
    label: "How can I contact you?",
    keywords: [
      "contact",
      "phone",
      "call",
      "email",
      "address",
      "location",
      "office",
      "where",
      "whatsapp",
      "reach",
    ],
    answer: "You can reach us by email, phone or WhatsApp. Choose an option below.",
    next: ["human", "quote", "menu"],
  },
];

/** Shown when nothing matches what the visitor typed. */
export const fallback =
  "I'm not sure about that one. I can answer common questions, take a quote request, or connect you with our team.";
