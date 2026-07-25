"use client"

import { SparklesIcon, CheckIcon, LoaderIcon } from "lucide-react"

export function FinanystAIShowcase() {
  return (
    <section className="relative border-t border-border/60 py-24">
      <div className="max-w-6xl mx-auto px-6">

        {/* Eyebrow */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs text-primary font-medium">
            <SparklesIcon className="w-3 h-3" />
            <span className="uppercase tracking-wide">The difference</span>
          </div>
        </div>

        {/* Section headline */}
        <h2 className="font-display text-4xl sm:text-5xl text-center text-foreground leading-[1.1] mb-4 max-w-3xl mx-auto">
          Static benchmarks are <span className="italic text-primary">dead</span>.
        </h2>
        <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto mb-16">
          Traditional tools give you industry averages. Finanyst gives you intelligence tailored to your specific business — powered by Claude AI.
        </p>

        {/* Comparison grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">

          {/* Old way */}
          <div className="rounded-2xl border border-border/60 bg-muted/30 p-8 relative">
            <div className="absolute top-6 right-6">
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Traditional tools</span>
            </div>
            <h3 className="text-lg font-semibold text-muted-foreground mb-4 mt-2">Static benchmarks</h3>

            {/* Mock field with static suggestion */}
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Year 1 revenue growth</label>
                <div className="relative">
                  <input
                    type="text"
                    value="150%"
                    readOnly
                    className="w-full px-3 py-2 rounded-lg border border-border/60 bg-card text-sm"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  SaaS industry median: 150%
                </p>
              </div>

              <div className="pt-4 border-t border-border/40">
                <p className="text-xs text-muted-foreground italic">
                  "The same number for every SaaS company, regardless of geography, funding stage, or business model."
                </p>
              </div>
            </div>
          </div>

          {/* New way */}
          <div className="rounded-2xl border-2 border-primary/40 bg-card p-8 relative shadow-lg shadow-primary/10">
            <div className="absolute top-6 right-6">
              <span className="text-xs uppercase tracking-wider text-primary font-semibold">Finanyst AI</span>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-4 mt-2">Context-aware intelligence</h3>

            {/* Mock field with AI suggestion */}
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Year 1 revenue growth</label>
                <div className="relative">
                  <input
                    type="text"
                    value="250%"
                    readOnly
                    className="w-full px-3 py-2 rounded-lg border-2 border-primary/60 bg-primary/5 text-sm font-semibold text-foreground pr-16"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-primary bg-primary/10 rounded-md">
                    <SparklesIcon className="w-3 h-3" />
                    AI
                  </div>
                </div>
              </div>

              {/* AI suggestion panel */}
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <SparklesIcon className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-medium text-primary">AI reasoning</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">Claude</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">medium</span>
                </div>
                <p className="text-xs text-foreground leading-relaxed mb-2">
                  Pre-revenue fintech in emerging market needs aggressive growth, but Ghana&apos;s smaller market size and funding constraints warrant moderating from developed-market rates.
                </p>
                <p className="text-[10px] text-muted-foreground italic">
                  Source: Emerging market fintech benchmarks · Partech Africa Report 2023
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Feature grid explaining the difference */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary mb-3">
              <span className="font-display text-lg">01</span>
            </div>
            <h4 className="font-semibold text-foreground mb-2">Context-aware</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Every suggestion considers your industry, stage, geography, and previously-entered assumptions.
            </p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary mb-3">
              <span className="font-display text-lg">02</span>
            </div>
            <h4 className="font-semibold text-foreground mb-2">Transparent reasoning</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Every AI suggestion shows its reasoning, cites sources, and honestly rates its own confidence.
            </p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary mb-3">
              <span className="font-display text-lg">03</span>
            </div>
            <h4 className="font-semibold text-foreground mb-2">Always yours to override</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AI accelerates your work. You stay in control of every number in your model.
            </p>
          </div>
        </div>

      </div>
    </section>
  )
}
