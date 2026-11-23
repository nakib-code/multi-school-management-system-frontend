import Cta from "@/components/home/Cta";
import Hero from "@/components/home/hero";
import HowOnboardingWorks from "@/components/home/how-onboarding-works";
import Pricing from "@/components/home/pricing";
import SystemModules from "@/components/home/system-modules";

export default function HomePage() {
  return (
    <>
      <Hero />
      <SystemModules />
      <HowOnboardingWorks />
      <Pricing />
      <Cta />
    </>
  );
}
