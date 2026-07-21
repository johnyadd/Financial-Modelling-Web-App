"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { PlusIcon, MinusIcon } from "lucide-react"

const FAQ = [
  {
    q: "How is this different from Fathom, Jirav, or Cube?",
    a: "Fathom is reporting-first (takes historical data and visualises it). Jirav is FP&A software focused on driver-based forecasts for in-house finance teams. Cube is a spreadsheet-first FP&A tool. We're different: AI-native from day one, institutional-quality Excel export that PE analysts can actually audit, and purpose-built for both founders and accounting firms serving mid-market deals.",
  },
  {
    q: "How is this different from Excel?",
    a: "Every calculation in our models passes 5 institutional integrity checks by construction. Excel templates rely on the person building them to check the maths — ours enforces the accounting identity automatically. Plus, the assumptions are AI-suggested based on your industry and stage, saving hours of research.",
  },
  {
    q: "Is the Excel export real Excel, or a cloud lock-in?",
    a: "Real Excel. Every export is a native .xlsx file with 9 sheets: Cover Page, Summary, P&L Schedule, Balance Sheet, Cash Flow Statement, Free Cash Flow, Model Checks, Model Inputs, and Scenarios. Open in Excel, LibreOffice, Google Sheets — anywhere.",
  },
  {
    q: "What countries and currencies do you support?",
    a: "Primary focus is UK with UK-specific tax rates and Companies House benchmarks. Multi-currency support for GBP, USD, and EUR. International users can select their country and currency during signup. Local tax rates apply automatically.",
  },
  {
    q: "Can I share models with my accountant / investor / auditor?",
    a: "Yes. Export to Excel and send. Vendor Pro tier lets accounting firms brand exports with their own logo, colours, and disclaimer text — so you can deliver models under your firm's name.",
  },
  {
    q: "Is my data secure?",
    a: "Yes. All data is stored in Supabase (SOC 2 Type II certified) with row-level security. Every user only sees their own data. Payment processing via Stripe (PCI DSS Level 1 certified). We never see or store your card details.",
  },
  {
    q: "What if I don't like it?",
    a: "The free tier lets you build 1 complete model to fully evaluate the platform before paying. No time limit, no credit card required. If you're a paying customer, cancel anytime — no annual commitment.",
  },
  {
    q: "How does the AI work?",
    a: "We use Claude (Anthropic) to extract data from financial documents you upload and to suggest intelligent defaults based on your industry, business stage, and revenue model. All AI operations are transparent — you see and can override every suggested value.",
  },
]

export function LandingFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="border-b border-border py-16">
      <div className="max-w-3xl mx-auto px-6">

        <div className="text-center mb-10">
          <Badge variant="outline" className="mb-3">Common questions</Badge>
          <h2 className="text-3xl font-bold text-foreground mb-3">
            Everything you might be wondering.
          </h2>
        </div>

        <div className="space-y-2">
          {FAQ.map((item, i) => (
            <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/30 transition-colors"
              >
                <span className="font-medium text-foreground pr-8">{item.q}</span>
                {openIndex === i ? (
                  <MinusIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                ) : (
                  <PlusIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                )}
              </button>
              {openIndex === i && (
                <div className="px-5 pb-5">
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
