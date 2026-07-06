import { LandingHero } from "@/components/landing/landing-hero"
import { EntitySelector } from "@/components/landing/entity-selector"
import { TrustBar } from "@/components/landing/trust-bar"

export const metadata = {
  title: "FinModels UK — Financial Modelling for Every Stage",
  description:
    "Professional financial models for UK startups and established businesses. DCF, 3-statement, LBO and more — generated in minutes.",
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <LandingHero />
      <EntitySelector />
      <TrustBar />
    </main>
  )
}
