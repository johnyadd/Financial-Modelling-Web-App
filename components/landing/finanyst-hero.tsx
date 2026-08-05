"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowRightIcon, SparklesIcon } from "lucide-react"

export function FinanystHero() {
  const router = useRouter()

  return (
    <section className="relative overflow-hidden">
      {/* Subtle grid background */}
      <div className="absolute inset-0 opacity-[0.04] bg-grid" />

      {/* Radial gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 20%, var(--brand-coral-soft) 0%, transparent 70%)",
          opacity: 0.4,
        }}
      />

      <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-20">

        {/* Founder badge */}
        <div className="flex justify-center mb-4 animate-fade-in-up">
          <p className="text-xs text-muted-foreground font-medium tracking-wide">
            Built by a fractional CFO. The tool I always wished existed.
          </p>
        </div>

        {/* Eyebrow */}
        <div className="flex justify-center mb-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 backdrop-blur-sm px-4 py-1.5 text-xs text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="font-medium tracking-wide uppercase">AI-native · Global-ready</span>
          </div>
        </div>

        {/* Headline - Display serif for editorial gravitas */}
        <h1 className="font-display text-5xl sm:text-6xl md:text-7xl text-center text-foreground leading-[1.05] mb-8 max-w-5xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          Financial models,{" "}
          <span className="italic text-primary">reimagined</span>{" "}
          by AI.
        </h1>

        {/* Sub-headline */}
        <p className="text-lg md:text-xl text-muted-foreground text-center max-w-2xl mx-auto leading-relaxed mb-4 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          Build institutional-quality financial models with intelligence that reasons, not just calculates.
        </p>

        {/* Positioning line */}
        <p className="text-sm text-muted-foreground text-center max-w-xl mx-auto mb-12 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          For advisors, finance teams, and founders who expect more than static spreadsheets.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
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
            View pricing
          </Button>
        </div>

        {/* Trust line under CTAs */}
        <p className="text-xs text-muted-foreground text-center animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
          No credit card required · 1 free model with full AI · Cancel anytime
        </p>

        {/* Subtle divider */}
        <div className="mt-20 flex items-center justify-center gap-3 animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
          <span className="h-px w-16 bg-border" />
          <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
            Powered by Claude AI · Auditor-ready output · Multi-currency
          </span>
          <span className="h-px w-16 bg-border" />
        </div>

      </div>
    </section>
  )
}
