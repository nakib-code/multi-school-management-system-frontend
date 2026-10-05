import Cta from "@/components/home/Cta";
import FeaturedSchools from "@/components/home/featured-schools";
import Hero from "@/components/home/hero";
import HowAdmissionWorks from "@/components/home/how-admission-works";
import Pricing from "@/components/home/pricing";
import SchoolAdminCta from "@/components/home/school-admin-cta";

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedSchools/>
      <HowAdmissionWorks/>
      <SchoolAdminCta/>
      <Pricing />
      <Cta />
    </>
  );
}
