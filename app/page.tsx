import SaasHero from "@/components/saas/SaasHero";
import ProblemSection from "@/components/saas/ProblemSection";
import PlatformModules from "@/components/saas/PlatformModules";
import TableShowcase from "@/components/saas/TableShowcase";
import CustomerJourney from "@/components/saas/CustomerJourney";
import DashboardPreview from "@/components/saas/DashboardPreview";
import AIFeatures from "@/components/saas/AIFeatures";
import MobileApps from "@/components/saas/MobileApps";
import CaseStudies from "@/components/saas/CaseStudies";
import TrustSection from "@/components/saas/TrustSection";
import Pricing from "@/components/saas/Pricing";
import FAQ from "@/components/saas/FAQ";
import EnterpriseCTA from "@/components/saas/EnterpriseCTA";

/** Xasu marketing site — pitches Xasu as a restaurant OS to operators.
 *  The actual restaurant booking flow lives at /book, /menu, /orders, /pay
 *  (now positioned as the "live product demo" for prospects). */
export default function HomePage() {
  return (
    <>
      <SaasHero />
      <ProblemSection />
      <PlatformModules />
      <TableShowcase />
      <CustomerJourney />
      <DashboardPreview />
      <AIFeatures />
      <MobileApps />
      <CaseStudies />
      <TrustSection />
      <Pricing />
      <FAQ />
      <EnterpriseCTA />
    </>
  );
}
