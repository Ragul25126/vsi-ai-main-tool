import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/site/nav";
import { Hero, TrustedBy } from "@/components/site/hero";
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
} from "@/components/site/sections";
import { Footer } from "@/components/site/footer";
import { CursorGlow } from "@/components/site/primitives";

const title = "ValGrow Search Intelligence — AI Search Visibility & GEO Platform";
const description =
  "Monitor how ChatGPT, Gemini, Claude, Perplexity, and Google AI Overviews mention your brand. Track AI visibility, citations, and competitors with GEO recommendations.";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "ValGrow Search Intelligence",
          applicationCategory: "BusinessApplication",
          description,
          offers: {
            "@type": "Offer",
            price: "249",
            priceCurrency: "USD",
          },
        }),
      },
    ],
  }),
});

function Index() {
  return (
    <div className="relative min-h-screen bg-background">
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
