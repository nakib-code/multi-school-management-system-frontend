import { CtaSection } from "@/components/landing/cta-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { HeroSection } from "@/components/landing/hero-section";
import { HowItWorks } from "@/components/landing/how-it-works";
import { RolesSection } from "@/components/landing/roles-section";

export default function HomePage() {
  return (
    <>
        <HeroSection />
        <FeaturesSection />
        <HowItWorks />
        <RolesSection />
        <CtaSection />
    </>
  );
}