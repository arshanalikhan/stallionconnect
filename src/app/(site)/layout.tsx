import { FormDialogProvider } from "@/components/forms/FormDialogs";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";

/** Public site shell: header, footer, WhatsApp button and the form dialogs. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <FormDialogProvider>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-100 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow-soft"
      >
        Skip to content
      </a>
      <Header />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
      <WhatsAppButton />
    </FormDialogProvider>
  );
}
