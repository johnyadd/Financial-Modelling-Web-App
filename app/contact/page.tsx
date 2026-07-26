"use client"

import { MailIcon, MessageCircleIcon, ShieldIcon, ArrowRightIcon } from "lucide-react"

const CONTACT_OPTIONS = [
  {
    icon: <MessageCircleIcon className="w-5 h-5" />,
    title: "General enquiries",
    description: "Questions about Finanyst, product feedback, or anything else. We read every message.",
    email: "hello@finanyst.com",
    responseTime: "Reply within 1 business day",
  },
  {
    icon: <MailIcon className="w-5 h-5" />,
    title: "Sales & enterprise",
    description: "Interested in Vendor Pro, Enterprise, or custom pricing for a larger team? Let's talk.",
    email: "sales@finanyst.com",
    responseTime: "Reply within 1 business day",
    highlighted: true,
  },
  {
    icon: <ShieldIcon className="w-5 h-5" />,
    title: "Technical support",
    description: "Existing customer with a technical question or issue? Our team is here to help.",
    email: "support@finanyst.com",
    responseTime: "Reply within 1 business day",
  },
]

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background">
      <section className="max-w-5xl mx-auto px-6 py-24">

        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3 font-medium">Get in touch</p>
          <h1 className="font-display text-5xl sm:text-6xl text-foreground leading-[1.1] mb-4">
            Let&apos;s <span className="italic text-primary">talk</span>.
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Pick the right route below. We&apos;ll get back to you within one business day.
          </p>
        </div>

        {/* Contact cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
          {CONTACT_OPTIONS.map((option, i) => (
            <a
              key={i}
              href={`mailto:${option.email}`}
              className={`group text-left rounded-2xl border ${option.highlighted ? 'border-primary/40 shadow-lg shadow-primary/5' : 'border-border/60'} bg-card p-6 hover:border-primary/40 hover:shadow-md transition-all flex flex-col`}
            >
              <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                {option.icon}
              </div>

              <h3 className="font-semibold text-foreground mb-2 leading-tight">{option.title}</h3>

              <p className="text-sm text-muted-foreground mb-4 leading-relaxed flex-grow">
                {option.description}
              </p>

              <div className="pt-4 border-t border-border/40">
                <div className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
                  {option.email}
                  <ArrowRightIcon className="w-3.5 h-3.5" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{option.responseTime}</p>
              </div>
            </a>
          ))}
        </div>

        {/* Additional info section */}
        <div className="rounded-2xl border border-border/60 bg-muted/20 p-8 text-center">
          <h2 className="font-display text-2xl text-foreground mb-3">Prefer another way?</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-2xl mx-auto">
            You can also reach us through your dashboard once signed in, or check our FAQ for quick answers to common questions.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <a
              href="/#faq"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border/60 text-sm text-foreground hover:border-primary/40 hover:bg-primary/5 transition-colors"
            >
              View FAQ
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </a>
            <a
              href="/auth/signup"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors"
            >
              Start using Finanyst
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

      </section>
    </main>
  )
}
