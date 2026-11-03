import { About } from "@/components/sections/About";
import { Careers } from "@/components/sections/Careers";
import { CeoMessage } from "@/components/sections/CeoMessage";
import { Contact } from "@/components/sections/Contact";
import { Faq } from "@/components/sections/Faq";
import { Hero } from "@/components/sections/Hero";
import { Industries } from "@/components/sections/Industries";
import { Process } from "@/components/sections/Process";
import { Services } from "@/components/sections/Services";
import { WhyUs } from "@/components/sections/WhyUs";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Services />
      <About />
      <CeoMessage />
      <WhyUs />
      <Process />
      <Industries />
      <Careers />
      <Faq />
      <Contact />
    </>
  );
}
