"use client"

import { useRouter } from "next/navigation"
import { RocketIcon, TrendingUpIcon, BriefcaseIcon, ArrowRightIcon } from "lucide-react"

const PATHS = [
  {
    icon: <RocketIcon className="w-5 h-5" />,
    tag: "Startup founders",
    title: "Answer questions, get a model",
    description: "Guided questionnaire tailored to your business type and goal — AI-guided all the way.",
    cta: "Start startup path",
    route: "/questionnaire",
  },
  {
    icon: <TrendingUpIcon className="w-5 h-5" />,
    tag: "Existing business",
    title: "Upload your financials",
    description: "AI extracts historical data from your statements and projects forward intelligently.",
    cta: "Upload financials",
    route: "/upload",
  },
  {
    icon: <BriefcaseIcon className="w-5 h-5" />,
    tag: "Advisors & firms",
    title: "Build for your clients",
    description: "Template-first vendor portal with white-label branding for accounting firms and fractional CFOs.",
    cta: "Enter vendor portal",
    route: "/vendor/new",
  },
]

export function FinanystEntitySelector() {
  const router = useRouter()

  return (
    <section className="border-t border-border/60 py-24">
      <div className="max-w-5xl mx-auto px-6">

        <div className="text-center mb-16">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3 font-medium">Choose your path</p>
          <h2 className="font-display text-4xl sm:text-5xl text-foreground leading-[1.1] mb-4 max-w-3xl mx-auto">
            Every path <span className="italic text-primary">starts with intelligence</span>.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Whatever your starting point, AI-powered guidance shortens the distance from question to answer.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PATHS.map((path, i) => (
            <button
              key={i}
              onClick={() => router.push(path.route)}
              className="group text-left rounded-2xl border border-border/60 bg-card p-6 hover:border-primary/40 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  {path.icon}
                </div>
                <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
                  {path.tag}
                </span>
              </div>

              <h3 className="font-semibold text-foreground mb-2 leading-tight">{path.title}</h3>

              <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                {path.description}
              </p>

              <div className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
                {path.cta}
                <ArrowRightIcon className="w-3.5 h-3.5" />
              </div>
            </button>
          ))}
        </div>

      </div>
    </section>
  )
}
