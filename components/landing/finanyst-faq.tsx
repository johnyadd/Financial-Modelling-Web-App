"use client"

import { useState } from "react"
import { PlusIcon, MinusIcon } from "lucide-react"

const FAQ = [
  {
    q: "What makes Finanyst AI-native vs other tools?",
    a: "Fathom, Jirav, and Cube use static benchmarks per field. Finanyst uses Claude AI to reason about your specific business context — your industry, sub-sector, business stage, geography, and previously-entered assumptions — and provides tailored suggestions with rationale. Every AI suggestion shows its reasoning, cites sources, and rates its own confidence.",
  },
  {
    q: "Is my Excel export a real .xlsx file, or a cloud lock-in?",
    a: "Real Excel. Every export is a native .xlsx file with 9 sheets: Cover Page, Summary, P&L Schedule, Balance Sheet, Cash Flow Statement, Free Cash Flow, Model Checks, Model Inputs, and Scenarios. Open in Excel, LibreOffice, Google Sheets — anywhere.",
  },
  {
    q: "How is Finanyst different from Excel templates?",
    a: "Every calculation in our models passes 5 institutional integrity checks by construction. Excel templates rely on the person building them to check the maths — ours enforces the accounting identity automatically. Plus, assumptions are AI-suggested based on your industry and stage, saving hours of research.",
  },
  {
    q: "What countries and currencies do you support?",
    a: "UK-first with UK-specific tax rates and Companies House benchmarks. Multi-currency support for GBP, USD, and EUR. International users can select their country and currency during signup. Local tax rates apply automatically.",
  },
  {
    q: "Can accounting firms brand exports with their own identity?",
    a: "Yes. Vendor Pro tier ({{VENDOR_PRO_PRICE}}) lets firms upload their logo, set brand colours, and customize the disclaimer text — so every export ships under your firm's name. Perfect for accounting firms, fractional CFOs, and consultants serving mid-market deals.",
  },
  {
    q: "Is my data secure?",
    a: "Yes. All data is stored in Supabase (SOC 2 Type II certified) with row-level security. Every user only sees their own data. Payment processing via Stripe (PCI DSS Level 1 certified). We never see or store your card details.",
  },
  {
    q: "What if I don't like it?",
    a: "The free tier lets you build 1 complete model with full AI-powered defaults to evaluate the platform. No time limit, no credit card. If you're a paying customer, cancel anytime via the built-in Stripe billing portal — no annual commitment.",
  },
  {
    q: "How does the AI actually work?",
    a: "We use Claude (from Anthropic) to reason about your specific context and suggest intelligent defaults. Every AI suggestion is transparent — you see the reasoning, sources, and confidence level. You can accept, modify, or ignore any suggestion. You stay in full control of every number in your model.",
  },
]

export function FinanystFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="border-t border-border/60 py-24">
      <div className="max-w-3xl mx-auto px-6">

        <div className="text-center mb-16">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3 font-medium">Common questions</p>
          <h2 className="font-display text-4xl sm:text-5xl text-foreground leading-[1.1] mb-4">
            Everything you might be <span className="italic text-primary">wondering</span>.
          </h2>
        </div>

        <div className="space-y-3">
          {FAQ.map((item, i) => (
            <div key={i} className="rounded-xl border border-border/60 bg-card overflow-hidden transition-colors hover:border-border">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="font-medium text-foreground pr-8">{item.q}</span>
                {openIndex === i ? (
                  <MinusIcon className="w-4 h-4 text-primary flex-shrink-0" />
                ) : (
                  <PlusIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                )}
              </button>
              {openIndex === i && (
                <div className="px-5 pb-5 -mt-1">
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.a.replace('{{VENDOR_PRO_PRICE}}', '£99/mo')}</p>
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
