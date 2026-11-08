import { FormDialogProvider } from "@/components/forms/FormDialogs";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { ChatBot } from "@/components/chat/ChatBot";
import { CustomCursor } from "@/components/layout/CustomCursor";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { ScrollVideo } from "@/components/background/ScrollVideo";
import { ScrollFrames } from "@/components/background/ScrollFrames";
import { SmoothScroll } from "@/components/background/SmoothScroll";
import { Scene3D } from "@/components/three/Scene3D";
import { BACKGROUND } from "@/config/site";

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
      {BACKGROUND === "light3d" ? (
        <Scene3D world="light" />
      ) : BACKGROUND === "journey3d" ? (
        <Scene3D world="journey" />
      ) : BACKGROUND === "network3d" ? (
        <Scene3D world="network" />
      ) : BACKGROUND === "frames" ? (
        <>
          <ScrollFrames />
          <SmoothScroll />
        </>
      ) : BACKGROUND === "video" ? (
        <ScrollVideo />
      ) : (
        <Scene3D />
      )}
      <Header />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
      <WhatsAppButton />
      <ChatBot />
      <CustomCursor />
    </FormDialogProvider>
  );
}
