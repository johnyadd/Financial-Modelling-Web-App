import { LandingHero } from "@/components/landing/landing-hero"
import { TrustBar } from "@/components/landing/trust-bar"
import { ProblemSolution } from "@/components/landing/problem-solution"
import { AudienceSegments } from "@/components/landing/audience-segments"
import { ModelRoadmap } from "@/components/landing/model-roadmap"
import { EntitySelector } from "@/components/landing/entity-selector"
import { LandingFAQ } from "@/components/landing/landing-faq"
import { LandingCTA } from "@/components/landing/landing-cta"

export const metadata = {
  title: "FinModels UK — Institutional Financial Models in Minutes",
  description:
    "Build professional financial models that pass institutional integrity checks. Purpose-built for UK founders, finance teams, and accounting firms. Multi-currency, AI-native.",
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <LandingHero />
      <TrustBar />
      <ProblemSolution />
      <AudienceSegments />
      <ModelRoadmap />
      <EntitySelector />
      <LandingFAQ />
      <LandingCTA />
    </main>
  )
}
