"use client"

import Link from "next/link"

export function FinanystFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border/60 bg-muted/20">
      <div className="max-w-6xl mx-auto px-6 py-16">

        {/* Top section - brand + columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">

          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <span className="font-display text-2xl tracking-tight text-foreground">Finanyst</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Institutional-quality financial models with AI-powered intelligence.
            </p>
          </div>

          {/* Product column */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-foreground mb-4">
              Product
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/auth/signup" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Get started
                </Link>
              </li>
            </ul>
          </div>

          {/* Company column */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-foreground mb-4">
              Company
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:hello@finanyst.com"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contact
                </a>
              </li>
              <li>
                <a
                  href="mailto:hello@finanyst.com?subject=Enterprise%20Enquiry"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Enterprise
                </a>
              </li>
            </ul>
          </div>

          {/* Legal column */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-foreground mb-4">
              Legal
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-border/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {currentYear} Finanyst. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground italic">
            Institutional financial models. AI-powered.
          </p>
        </div>

      </div>
    </footer>
  )
}
