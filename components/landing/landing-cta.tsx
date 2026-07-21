"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowRightIcon, SparklesIcon } from "lucide-react"

export function LandingCTA() {
  const router = useRouter()

  return (
    <section className="border-b border-border py-20 bg-gradient-to-br from-primary/5 via-transparent to-primary/5">
      <div className="max-w-3xl mx-auto px-6 text-center">

        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground mb-6">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          Free tier includes full institutional checks
        </div>

        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
          Build your first model in the next 10 minutes.
        </h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Skip the Excel template hell. Skip the consultancy fees. Get an institutional-grade model that balances, ties, and passes audit — all in a few clicks.
        </p>

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
            See all pricing
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-6">
          No credit card required · Cancel anytime · GDPR compliant
        </p>

      </div>
    </section>
  )
}
