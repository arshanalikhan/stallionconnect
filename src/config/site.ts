/**
 * Single source of truth for business details.
 * Placeholder values are marked TODO and will be replaced before launch.
 */
export const site = {
  name: "Stallion Connect",
  legalName: "Stallion Connect Pvt Ltd",
  tagline: "Where every connection counts",
  description:
    "Call centre, BPO, sales, customer support and back-office outsourcing for banks, financial services firms and growing brands in India and overseas.",
  url: "https://stallionconnect.in",
  locale: "en_IN",

  contact: {
    email: "info@stallionconnect.in",
    careersEmail: "careers@stallionconnect.in",
    phone: "+91 00000 00000", // TODO: real number
    phoneHref: "+910000000000", // TODO: real number, digits only with country code
    whatsapp: "910000000000", // TODO: WhatsApp number, digits only with country code
    whatsappMessage: "Hi Stallion Connect, I would like to know more about your services.",
    address: "India", // TODO: full office address
    hours: "Mon to Sat, 9:00 AM to 7:00 PM IST", // TODO: confirm
  },

  nav: [
    { label: "Home", href: "/#home" },
    { label: "Services", href: "/#services" },
    { label: "About", href: "/#about" },
    { label: "How we work", href: "/#process" },
    { label: "Industries", href: "/#industries" },
    { label: "Careers", href: "/#careers" },
    { label: "FAQ", href: "/#faq" },
    { label: "Contact", href: "/#contact" },
  ],
} as const;

export const whatsappUrl = (message: string = site.contact.whatsappMessage) =>
  `https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent(message)}`;
