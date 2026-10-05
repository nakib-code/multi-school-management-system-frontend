import { CtaSection } from "@/components/home/cta-section";
import { FeaturesSection } from "@/components/home/features-section";
import { HeroSection } from "@/components/home/hero-section";
import { HighlightsSection } from "@/components/home/highlights-section";
import { HowItWorks } from "@/components/home/how-it-works";
import { PricingSection } from "@/components/home/pricing-section";
import { RolesSection } from "@/components/home/roles-section";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <HighlightsSection />
      <FeaturesSection />
      <HowItWorks />
      <RolesSection />
      <PricingSection />
      <CtaSection />
    </>
  );
}
