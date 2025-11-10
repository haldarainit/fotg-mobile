import { LpNavbar1 } from "@/components/pro-blocks/landing-page/lp-navbars/lp-navbar-1";
import { HeroSection2 } from "@/components/pro-blocks/landing-page/hero-sections/hero-section-2";
import { LogoSection10 } from "@/components/pro-blocks/landing-page/logo-sections/logo-section-7";
import TestimonialsSection1 from "@/components/pro-blocks/landing-page/testimonials-sections/testimonials-section-1";
import { BentoGrid6 } from "@/components/pro-blocks/landing-page/bento-grids/bento-grid-6";
import { FeatureSection9 } from "@/components/pro-blocks/landing-page/feature-sections/feature-section-9";
import { HowItWorksSection } from "@/components/pro-blocks/landing-page/how-it-works-section";
import { StatsSection4 } from "@/components/pro-blocks/landing-page/stats-sections/stats-section-4";
import { PricingSection3 } from "@/components/pro-blocks/landing-page/pricing-sections/pricing-section-3";
import { FaqSection2 } from "@/components/pro-blocks/landing-page/faq-sections/faq-section-2";
import { Footer1 } from "@/components/pro-blocks/landing-page/footers/footer-1";

export default function Page() {
  return (
    <main>
      <LpNavbar1 />
      <HeroSection2 />
      <LogoSection10 />
      <BentoGrid6 />
      <HowItWorksSection />
      <FeatureSection9 />
      <TestimonialsSection1 />
      <StatsSection4 />
      {/* <PricingSection3 /> */}
      <FaqSection2 />
      <Footer1 />
    </main>
  );
}
