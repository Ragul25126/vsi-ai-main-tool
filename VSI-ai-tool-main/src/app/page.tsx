"use client";

import { Nav } from "@/components/valgrow/nav";
import { Hero, TrustedBy } from "@/components/valgrow/hero";
import {
  DashboardShowcase,
  FAQ,
  Features,
  FinalCTA,
  Integrations,
  Pricing,
  Problem,
  Testimonials,
  WhyAndWorkflow,
} from "@/components/valgrow/sections";
import { Footer } from "@/components/valgrow/footer";
import { CursorGlow } from "@/components/valgrow/primitives";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-background text-foreground dark">
      <CursorGlow />
      <Nav />
      <main className="relative z-10">
        <Hero />
        <TrustedBy />
        <Problem />
        <Features />
        <DashboardShowcase />
        <WhyAndWorkflow />
        <Testimonials />
        <Integrations />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
