"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowRightIcon, SparklesIcon } from "lucide-react"

export function FinanystLandingCTA() {
  const router = useRouter()

  return (
    <section className="relative border-t border-border/60 py-24 overflow-hidden">
      {/* Subtle radial gradient background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 60% at 50% 50%, var(--brand-coral-soft) 0%, transparent 70%)",
          opacity: 0.3,
        }}
      />

      <div className="relative max-w-3xl mx-auto px-6 text-center">

        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs text-primary font-medium mb-8">
          <SparklesIcon className="w-3 h-3" />
          <span className="uppercase tracking-wide">Free tier includes full AI</span>
        </div>

        <h2 className="font-display text-4xl sm:text-5xl md:text-6xl text-foreground leading-[1.1] mb-6">
          Build your first model in the <span className="italic text-primary">next 10 minutes</span>.
        </h2>

        <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
          Skip the Excel template hell. Skip the consultancy fees. Get an institutional-grade model with AI-powered intelligence — in a few clicks.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
          <Button
            size="lg"
            className="gap-2 px-6 h-12 text-base shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow"
            onClick={() => router.push("/auth/signup")}
          >
            <SparklesIcon className="w-4 h-4" />
            Start building free
            <ArrowRightIcon className="w-4 h-4" />
          </Button>
          <Button
            size="lg"
            variant="ghost"
            className="gap-2 px-6 h-12 text-base"
            onClick={() => router.push("/pricing")}
          >
            See all pricing
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          No credit card required · Cancel anytime · GDPR compliant
        </p>

      </div>
    </section>
  )
}
