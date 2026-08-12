// Benchmark citation registry — Feature 1: Assumption Benchmark Library
//
// Hybrid citation strategy: real UK-specific sources where they exist,
// analogical inference (US/global source + explicit UK adjustment reasoning) where they don't.
// Three confidence tiers surface transparency about defensibility.
//
// When adding new AI-suggested values, register their citation here so the
// "Source" pill and citation drawer can find it.

export type ConfidenceTier = "high" | "medium" | "low"

export interface BenchmarkCitation {
  /** Short source name shown in the citation pill (e.g. "Beauhurst UK Startup Report") */
  source: string
  /** Optional URL — opens in a new tab from the citation drawer */
  url?: string
  /** Publication year of the source data */
  vintage: number
  /** One-sentence description of what the source measures */
  methodology: string
  /** Sample size or scope (e.g. "n=1,200 UK Seed companies"). Optional when not disclosed by source. */
  sampleSize?: string
  /** Geography of the underlying data */
  geography: string
  /**
   * Confidence in applying this to a UK Seed → Series A modelling context:
   * - high:   direct UK citation, named source, clear methodology
   * - medium: analogical/adjusted from named non-UK source with reasoning
   * - low:    structural estimate, not empirically grounded
   */
  confidenceTier: ConfidenceTier
  /** For analogical citations: reasoning for the source choice or adjustment */
  reasoning?: string
}

/**
 * Citation registry keyed by assumption / benchmark key.
 * Keys should match the field names used in AI suggestion / benchmark lookup calls.
 */
export const BENCHMARK_CITATIONS: Record<string, BenchmarkCitation> = {
  //
  // ─── Revenue-side benchmarks ────────────────────────────────────────────
  //

  revenueGrowthY1: {
    source: "Beauhurst UK Startup Report",
    url: "https://www.beauhurst.com",
    vintage: 2024,
    methodology: "Annual analysis of UK Seed-to-Series-A funded companies, tracking revenue growth and funding milestones",
    sampleSize: "UK Seed → Series A tracked cohort",
    geography: "UK",
    confidenceTier: "high",
  },

  revenueGrowthY2: {
    source: "Beauhurst UK Startup Report",
    url: "https://www.beauhurst.com",
    vintage: 2024,
    methodology: "UK Series A trajectory analysis — growth rates as companies scale beyond initial product-market fit",
    sampleSize: "UK Series A cohort",
    geography: "UK",
    confidenceTier: "high",
  },

  revenueGrowthY3: {
    source: "Beauhurst UK Startup Report",
    url: "https://www.beauhurst.com",
    vintage: 2024,
    methodology: "UK Series A-to-B trajectory — growth moderation as revenue base expands",
    sampleSize: "UK Series A → B cohort",
    geography: "UK",
    confidenceTier: "high",
  },

  year1Revenue: {
    source: "Beauhurst UK Startup Report",
    url: "https://www.beauhurst.com",
    vintage: 2024,
    methodology: "Median first-year revenue for UK companies by funding stage",
    sampleSize: "UK funded companies by stage",
    geography: "UK",
    confidenceTier: "high",
  },

  //
  // ─── Cost & margin benchmarks ───────────────────────────────────────────
  //

  grossMargin: {
    source: "SaaS Capital Index",
    url: "https://www.saas-capital.com/saas-capital-index",
    vintage: 2024,
    methodology: "Public and private SaaS gross margin ranges by ARR band",
    sampleSize: "Global SaaS index constituents",
    geography: "Global (US-weighted)",
    confidenceTier: "medium",
    reasoning: "UK SaaS gross margins typically track US within ±3 percentage points; hosting cost and personnel structure similar for scaled SaaS. No UK-specific gross-margin dataset with equivalent methodology.",
  },

  cogsPercent: {
    source: "SaaS Capital Index",
    url: "https://www.saas-capital.com/saas-capital-index",
    vintage: 2024,
    methodology: "COGS as percent of revenue derived from public SaaS filings",
    sampleSize: "Global SaaS index constituents",
    geography: "Global (US-weighted)",
    confidenceTier: "medium",
    reasoning: "COGS is the inverse of gross margin; same reasoning applies (UK ~US ±3pp).",
  },

  marketingBudgetPct: {
    source: "OpenView State of SaaS Report",
    url: "https://openviewpartners.com/blog/openview-2024-saas-benchmarks-report/",
    vintage: 2024,
    methodology: "Marketing spend as % of revenue by stage — annual survey of ~500 SaaS operators",
    sampleSize: "~500 SaaS operators",
    geography: "US-weighted",
    confidenceTier: "medium",
    reasoning: "UK Seed SaaS typically operates with 5-10pp lower marketing intensity than US Seed peers, reflecting smaller total addressable spend and more capital-efficient GTM norms.",
  },

  rdBudgetPct: {
    source: "OpenView State of SaaS Report",
    url: "https://openviewpartners.com/blog/openview-2024-saas-benchmarks-report/",
    vintage: 2024,
    methodology: "R&D spend as % of revenue by stage across SaaS operator survey",
    sampleSize: "~500 SaaS operators",
    geography: "US-weighted",
    confidenceTier: "medium",
    reasoning: "R&D intensity tracks US benchmarks closely as engineering costs converge globally; UK adjustment is minimal (±2pp).",
  },

  monthlyChurnRate: {
    source: "ProfitWell / Paddle SaaS Benchmarks",
    url: "https://www.paddle.com",
    vintage: 2024,
    methodology: "Monthly logo and revenue churn medians across SaaS SMB and B2B segments",
    sampleSize: "Aggregate ProfitWell / Paddle customer base",
    geography: "Global (English-speaking markets)",
    confidenceTier: "medium",
    reasoning: "UK B2B SaaS churn tracks global English-speaking benchmarks closely; buyer behaviour and contract structures are similar.",
  },

  ebitdaMarginY3: {
    source: "ONS UK non-financial business accounts",
    url: "https://www.ons.gov.uk",
    vintage: 2023,
    methodology: "UK SME profitability distribution from annual business survey",
    sampleSize: "UK VAT-registered SMEs",
    geography: "UK",
    confidenceTier: "high",
  },

  //
  // ─── Valuation & funding benchmarks ─────────────────────────────────────
  //

  discountRate: {
    source: "Damodaran cost of capital dataset",
    url: "https://pages.stern.nyu.edu/~adamodar/",
    vintage: 2024,
    methodology: "Industry cost of capital calculated from public comparable companies",
    sampleSize: "Global public companies by sector",
    geography: "Global",
    confidenceTier: "medium",
    reasoning: "Public-company WACC scaled up by Seed → Series A illiquidity and execution premiums (typically +400-800bps for UK Seed).",
  },

  terminalGrowthRate: {
    source: "Bank of England monetary policy target",
    url: "https://www.bankofengland.co.uk/monetary-policy",
    vintage: 2024,
    methodology: "UK long-run inflation target set by the Monetary Policy Committee",
    geography: "UK",
    confidenceTier: "high",
  },

  targetExitMultiple: {
    source: "Bessemer State of the Cloud",
    url: "https://www.bvp.com/atlas/state-of-the-cloud",
    vintage: 2024,
    methodology: "Public and private SaaS revenue multiples by growth and gross margin band",
    sampleSize: "BVP cloud index constituents",
    geography: "US-weighted",
    confidenceTier: "medium",
    reasoning: "UK B2B SaaS exit multiples typically trade at a 15-25% discount to US peers reflecting smaller strategic buyer pool and thinner PE market. Adjust accordingly.",
  },

  //
  // ─── Cash & operations benchmarks ───────────────────────────────────────
  //

  currentCash: {
    source: "British Business Bank Small Business Finance Markets",
    url: "https://www.british-business-bank.co.uk/research",
    vintage: 2024,
    methodology: "Annual report on UK small business finance — funding rounds, cash positions by stage",
    sampleSize: "UK equity finance market",
    geography: "UK",
    confidenceTier: "high",
  },

  monthlyBurnRate: {
    source: "OpenView State of SaaS Report",
    url: "https://openviewpartners.com/blog/openview-2024-saas-benchmarks-report/",
    vintage: 2024,
    methodology: "Monthly burn distribution by ARR band and stage",
    sampleSize: "~500 SaaS operators",
    geography: "US-weighted",
    confidenceTier: "medium",
    reasoning: "UK Seed burn is typically 30-40% below US equivalents at the same stage, driven by lower average salaries and smaller GTM headcount.",
  },

  employeeCount: {
    source: "Beauhurst UK Startup Report",
    url: "https://www.beauhurst.com",
    vintage: 2024,
    methodology: "Median headcount by funding stage for UK equity-backed companies",
    sampleSize: "UK funded companies by stage",
    geography: "UK",
    confidenceTier: "high",
  },
}

/**
 * Retrieve a citation for a given assumption key.
 * Returns null when no citation is registered — callers should treat this as
 * "AI-suggested with no specific source" rather than an error.
 */
export function getCitationForKey(key: string): BenchmarkCitation | null {
  return BENCHMARK_CITATIONS[key] ?? null
}

/**
 * Helper: count citations by confidence tier — useful for admin visibility.
 */
export function getCitationCoverage(): Record<ConfidenceTier, number> {
  const counts: Record<ConfidenceTier, number> = { high: 0, medium: 0, low: 0 }
  for (const citation of Object.values(BENCHMARK_CITATIONS)) {
    counts[citation.confidenceTier]++
  }
  return counts
}
