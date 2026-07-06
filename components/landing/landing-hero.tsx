export function LandingHero() {
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
          Built for UK founders and finance teams
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-foreground leading-[1.1] mb-6">
          Financial models that{" "}
          <span className="relative">
            <span className="relative z-10 text-primary">fit your business</span>
            <span
              className="absolute bottom-1 left-0 right-0 h-[6px] bg-primary/15 rounded-full"
              aria-hidden="true"
            />
          </span>
          <br />
          — not the other way round.
        </h1>

        {/* Sub-headline */}
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Answer a few questions or upload your financials. Get a professionally
          structured Excel model — DCF, 3-statement, LBO and more — in minutes,
          not days.
        </p>
      </div>
    </section>
  )
}
