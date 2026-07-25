import { FinanystHero } from "@/components/landing/finanyst-hero"
import { FinanystTrustBar } from "@/components/landing/finanyst-trust-bar"
import { FinanystAIShowcase } from "@/components/landing/finanyst-ai-showcase"
import { FinanystProblemSolution } from "@/components/landing/finanyst-problem-solution"
import { FinanystAudienceSegments } from "@/components/landing/finanyst-audience-segments"
import { FinanystModelRoadmap } from "@/components/landing/finanyst-model-roadmap"
import { FinanystFAQ } from "@/components/landing/finanyst-faq"
import { EntitySelector } from "@/components/landing/entity-selector"
import { LandingCTA } from "@/components/landing/landing-cta"

export const metadata = {
  title: "Finanyst — AI-native financial intelligence",
  description:
    "Build institutional-quality financial models with AI-powered analysis. Purpose-built for founders, finance teams, and advisors. Multi-currency, global-ready.",
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <FinanystHero />
      <FinanystTrustBar />
      <FinanystAIShowcase />
      <FinanystProblemSolution />
      <FinanystAudienceSegments />
      <FinanystModelRoadmap />
      <EntitySelector />
      <FinanystFAQ />
      <LandingCTA />
    </main>
  )
}
