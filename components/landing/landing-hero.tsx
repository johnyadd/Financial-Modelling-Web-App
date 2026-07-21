"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowRightIcon, SparklesIcon } from "lucide-react"

export function LandingHero() {
  const router = useRouter()

  return (
    <section className="relative overflow-hidden border-b border-border">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(var(--foreground) 1px, transparent 1px),
            linear-gradient(90deg, var(--foreground) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />
      <div className="relative max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">

        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs text-muted-foreground mb-8">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          Built for founders, finance teams & advisors worldwide
        </div>

        {/* Headline - benefit-driven, under 44 chars */}
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-foreground leading-[1.1] mb-6">
          Institutional models.{" "}
          <span className="relative">
            <span className="relative z-10 text-primary">Founder timelines.</span>
            <span
              className="absolute bottom-1 left-0 right-0 h-[6px] bg-primary/15 rounded-full"
              aria-hidden="true"
            />
          </span>
        </h1>

        {/* Sub-headline - problem/solution */}
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-4">
          Build professional financial models that pass institutional integrity checks.
          In minutes, not weeks.
        </p>

        {/* Location context */}
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto mb-10">
          Purpose-built for UK SMEs and mid-market deals. Multi-currency support (GBP, USD, EUR) for international users.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            size="lg"
            className="gap-2"
            onClick={() => router.push("/auth/signup")}
          >
            <SparklesIcon className="w-4 h-4" />
            Get started free
            <ArrowRightIcon className="w-4 h-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => router.push("/pricing")}
          >
            See pricing
          </Button>
        </div>

        {/* Under-CTA line */}
        <p className="text-xs text-muted-foreground mt-4">
          No credit card required · 1 free model · Full institutional-quality checks
        </p>

      </div>
    </section>
  )
}
