/**
 * All homepage copy lives here so text can be edited without touching layout code.
 * Numbers and claims are placeholders until confirmed by the business.
 */
import type { IconName } from "@/components/ui/Icon";

export const hero = {
  badge: "Call centre, BPO and back office, India and overseas",
  title: "Customer conversations that",
  highlight: "grow business.",
  intro:
    "Stallion Connect runs call centre, sales, customer support and back-office operations for banks, financial services firms and growing brands in India and overseas, so your team can focus on what it does best.",
  points: ["Domestic and international", "Inbound and outbound", "BFSI specialists"],
};

export type Service = {
  id: string;
  tag: string;
  title: string;
  text: string;
  icon: IconName;
};

export const services: {
  eyebrow: string;
  title: string;
  highlight: string;
  intro: string;
  items: Service[];
} = {
  eyebrow: "What we do",
  title: "End-to-end outsourcing,",
  highlight: "under one roof",
  intro:
    "From the first sales call to the last line of paperwork, our trained teams handle the work that keeps your customers happy and your business moving.",
  items: [
    {
      id: "voice",
      tag: "Voice",
      title: "Call Centre Operations",
      text: "Domestic and international voice with trained agents and flexible shifts across time zones.",
      icon: "headset",
    },
    {
      id: "bfsi",
      tag: "BFSI",
      title: "Banking & Financial Services",
      text: "Card and loan sales, onboarding, KYC and collections for banks, NBFCs and fintechs.",
      icon: "bank",
    },
    {
      id: "sales",
      tag: "Sales",
      title: "Inbound & Outbound Sales",
      text: "Teams that convert enquiries into customers and reach new prospects, compliantly.",
      icon: "trend",
    },
    {
      id: "bpo",
      tag: "BPO & ITES",
      title: "BPO & ITES Operations",
      text: "Email and chat support, L1 helpdesk, data processing and content review.",
      icon: "monitor",
    },
    {
      id: "support",
      tag: "Support",
      title: "Support & Lead Generation",
      text: "Omnichannel support plus B2B and B2C lead generation and qualification.",
      icon: "chat",
    },
    {
      id: "people",
      tag: "People",
      title: "Recruitment & Training",
      text: "Volume hiring, assessments, induction, voice and soft-skills training.",
      icon: "people",
    },
    {
      id: "back",
      tag: "Back office",
      title: "Back-Office & Admin",
      text: "Data entry, document processing, verification, billing support and MIS reports.",
      icon: "file",
    },
    {
      id: "custom",
      tag: "Custom",
      title: "Need something custom?",
      text: "Tell us how your process works and we will design a team around it.",
      icon: "spark",
    },
  ],
};

export const about = {
  eyebrow: "About Stallion Connect",
  title: "A partner that works like",
  highlight: "an extension of your team.",
  text: "Stallion Connect Pvt Ltd is a business process outsourcing company serving businesses across India and overseas. Skilled people, clear processes and the right tools add up to consistent results, whether you need ten agents or a full operations floor.",
  // TODO: replace with confirmed figures.
  stats: [
    { value: 7, suffix: "", label: "Core service lines under one roof" },
    { value: 2, suffix: "", label: "Markets served: domestic and international" },
    { value: 24, suffix: "x7", label: "Support coverage available" },
    { value: 1, suffix: "", label: "Partner for front and back office" },
  ],
  values: [
    {
      title: "Mission",
      text: "Deliver reliable, high-quality outsourcing that helps clients grow.",
    },
    {
      title: "Vision",
      text: "Be the most trusted outsourcing partner for customer-first businesses.",
    },
  ],
};

export const whyUs = {
  eyebrow: "Why Stallion Connect",
  title: "What sets us",
  highlight: "apart",
  intro: "Reliable, high-quality outsourcing that helps clients grow and builds rewarding careers.",
  items: [
    {
      title: "Industry-trained teams",
      text: "Agents learn your products and compliance rules and are assessed before going live.",
    },
    {
      title: "Quality you can measure",
      text: "Call audits, KPIs and regular reports with clear SLAs.",
    },
    { title: "Built to scale", text: "Start with a pilot and grow as volumes increase." },
    {
      title: "Data security first",
      text: "Access controls and confidentiality agreements protect customer information.",
    },
    { title: "Multilingual teams", text: "English, Hindi and regional languages." },
    {
      title: "Cost-effective delivery",
      text: "Flexible team sizes and quick ramp-up, without cutting corners.",
    },
  ],
};

export const process = {
  eyebrow: "How we work",
  title: "Four steps, then we",
  highlight: "keep improving.",
  intro: "A clear onboarding path so you know what happens, and when.",
  steps: [
    {
      title: "Discover",
      text: "We learn your goals, customers, call volumes and what success looks like.",
    },
    { title: "Design", text: "We map the process, scripts, SOPs, team size and reporting." },
    { title: "Deploy", text: "We hire, train and launch your team, often starting with a pilot." },
    { title: "Optimise", text: "We track quality and KPIs and refine the process every month." },
  ],
};

export const industries = {
  eyebrow: "Industries",
  title: "Built for sectors that run on",
  highlight: "customer conversations",
  items: [
    { name: "Banking & Financial Services", icon: "bank" },
    { name: "Insurance", icon: "shield" },
    { name: "Telecom & Internet", icon: "signal" },
    { name: "E-commerce & Retail", icon: "cart" },
    { name: "Healthcare", icon: "heart" },
    { name: "Travel & Hospitality", icon: "plane" },
    { name: "Education & EdTech", icon: "book" },
    { name: "Real Estate", icon: "home" },
  ] satisfies { name: string; icon: IconName }[],
};

export const careers = {
  eyebrow: "Careers",
  title: "Build your career",
  highlight: "with us",
  intro:
    "Freshers are trained from day one, and experienced people grow into team leader and trainer roles. Send your CV with the role name in the subject line.",
  // TODO: confirm current openings.
  openings: [
    { title: "Customer Support Executive", type: "Full time", mode: "Domestic voice" },
    {
      title: "International Voice Process Associate",
      type: "Full time",
      mode: "International voice",
    },
    { title: "Tele-sales Executive (BFSI)", type: "Full time", mode: "Outbound sales" },
    { title: "Back-Office Executive", type: "Full time", mode: "Non-voice" },
    { title: "Team Leader", type: "Full time", mode: "Operations" },
    { title: "Process Trainer", type: "Full time", mode: "Training" },
  ],
  perks: ["Training from day one", "Clear growth path", "Supportive team culture"],
};

export const faq = {
  eyebrow: "FAQ",
  title: "Questions we",
  highlight: "often hear",
  items: [
    {
      q: "Can we start with a small pilot?",
      a: "Yes. Most clients start with a small team for a few weeks, review the results, then scale up.",
    },
    {
      q: "How quickly can a team go live?",
      a: "It depends on team size and training needs. A small pilot can usually go live within a few weeks of the process being agreed.",
    },
    {
      q: "Do you handle international processes?",
      a: "Yes. We run domestic and international voice and non-voice processes, with shifts planned around your customers' time zones.",
    },
    {
      q: "How do you protect our customer data?",
      a: "Access is limited to the people working on your process, staff sign confidentiality agreements, and we follow your data-handling rules.",
    },
    {
      q: "How will we track performance?",
      a: "You get regular reports on the KPIs we agree at the start, such as calls handled, conversion, quality scores and turnaround times.",
    },
  ],
};

export const contact = {
  eyebrow: "Contact",
  title: "Let's design a team",
  highlight: "around your process",
  intro:
    "Tell us about your process, expected volumes and timelines, and we will get back to you with a plan and a quote.",
};
