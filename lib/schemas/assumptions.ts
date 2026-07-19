/**
 * FinModels UK — Central Assumptions Schema
 * ------------------------------------------
 * Single source of truth for every model assumption across the platform.
 *
 * This schema is read by:
 * - Frontend questionnaire forms (auto-generate fields)
 * - Vendor wizard (same fields, different layout)
 * - Zod validation schemas (derive validation rules)
 * - Python engine (reference by key, apply calculations)
 * - Excel export (Model Inputs sheet + named cells for formulas)
 * - Benchmark data (each assumption links to benchmark values)
 * - AI assistance (getAISuggestion returns intelligent defaults)
 *
 * Adding a new assumption:
 * 1. Add an entry below with the required metadata
 * 2. Frontend, engine, and export all pick it up automatically
 * 3. No other code changes needed
 */

// -- TYPE DEFINITIONS ----------------------------------------------------

export type AssumptionType = "number" | "percentage" | "currency" | "string" | "enum" | "days" | "years" | "multiple"
export type AssumptionSection = "business" | "revenue" | "costs" | "funding" | "valuation" | "workingCapital" | "tax" | "debt" | "exit"
export type ModelType = "dcf" | "three_statement" | "pre_revenue_dcf" | "lbo" | "saas" | "ma"
export type BusinessStage = "Pre-revenue" | "Early Revenue" | "Growth" | "Established" | "Mature"

export interface AISuggestionContext {
  industry?: string
  subSector?: string
  businessStage?: string
  modelType?: ModelType
  currency?: string
  country?: string
  currentValues?: Record<string, unknown>  // other assumption values already collected
}

export interface AISuggestionResult {
  value: number | string
  rationale: string          // "Why this suggestion" — shown to user
  confidence: "low" | "medium" | "high"
  source?: string            // e.g. "SaaS Capital 2024 benchmark data"
}

export interface AssumptionDefinition {
  // -- Identity --
  key: string                              // unique identifier used everywhere
  label: string                            // human-readable label for UI
  shortLabel?: string                      // shorter label for tables (e.g. Excel)
  description: string                      // one-line description
  helpText?: string                        // longer explanation for tooltips

  // -- Categorisation --
  section: AssumptionSection               // groups in UI and export sheets
  step?: number                            // which questionnaire step (1-6)
  applicableModels: ModelType[]            // which model types use this
  applicableStages?: BusinessStage[]       // filter by business stage
  applicableIndustries?: string[]          // filter by industry (empty = all)

  // -- Data type & validation --
  type: AssumptionType
  required: boolean
  min?: number
  max?: number
  allowedValues?: string[]                 // for enum types

  // -- UI display --
  placeholder?: string
  suffix?: string                          // e.g. "%", "days", "years"
  prefix?: string                          // e.g. currency symbol

  // -- Excel export --
  cellName?: string                        // named cell in Excel (e.g. "in_growthY1")
  excelFormat?: string                     // Excel number format (e.g. "0.0%")

  // -- Defaults & AI assistance --
  defaultValue?: number | string           // static default
  getAISuggestion?: (ctx: AISuggestionContext) => AISuggestionResult

  // -- Benchmark linkage --
  benchmarkKey?: string                    // links to benchmark data source

  // -- Audit trail --
  audit?: {
    industryTypical?: string               // e.g. "20-50% for mature SMEs"
    source?: string                        // e.g. "OECD SME data 2024"
    lastReviewed?: string                  // date last reviewed
  }
}

// -- ASSUMPTION SCHEMA ---------------------------------------------------
// The single source of truth. Every assumption is defined here.

export const ASSUMPTIONS: AssumptionDefinition[] = [

  // ═══ SECTION: BUSINESS INFORMATION ═══════════════════════════════════
  {
    key: "businessName",
    label: "Business / company name",
    description: "Legal name of the business being modelled",
    section: "business", step: 1, type: "string", required: true,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    placeholder: "Acme Ltd",
  },
  {
    key: "industry",
    label: "Industry",
    description: "Primary industry classification",
    section: "business", step: 1, type: "enum", required: true,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    allowedValues: [
      "Technology", "Financial Services", "Healthcare", "Retail & Consumer",
      "Manufacturing", "Real Estate", "Energy", "Media & Entertainment",
      "Professional Services", "Other",
    ],
  },
  {
    key: "subSector",
    label: "Sub-sector",
    description: "More specific business classification",
    section: "business", step: 1, type: "string", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    placeholder: "e.g. SaaS, Fintech, E-commerce",
  },
  {
    key: "currency",
    label: "Currency",
    description: "Base currency for the model",
    section: "business", step: 1, type: "enum", required: true,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    allowedValues: ["GBP", "USD", "EUR", "CHF", "SEK", "NOK", "DKK", "AUD", "CAD"],
    defaultValue: "GBP",
  },
  {
    key: "country",
    label: "Country of operation",
    description: "Primary country where the business operates",
    section: "business", step: 1, type: "string", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    defaultValue: "United Kingdom",
  },
  {
    key: "businessStage",
    label: "Business stage",
    description: "Maturity of the business",
    section: "business", step: 1, type: "enum", required: true,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    allowedValues: [
      "Pre-revenue", "Early Revenue (< £500k ARR)", "Growth (£500k-£5m ARR)",
      "Established (Profitable)", "Mature", "PE-backed", "Public",
    ],
  },

  // ═══ SECTION: REVENUE ASSUMPTIONS ═══════════════════════════════════
  {
    key: "revenueModel",
    label: "Revenue model",
    description: "How the business generates revenue",
    section: "revenue", step: 2, type: "enum", required: true,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "saas"],
    allowedValues: [
      "SaaS / Subscription", "Marketplace / Commission", "Product Sales (One-off)",
      "Professional Services", "Licensing", "Advertising", "Usage-based", "Freemium", "Other",
    ],
  },
  {
    key: "projectionYears",
    label: "Projection period",
    description: "How many years the model projects forward",
    section: "revenue", step: 2, type: "years", required: true,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    defaultValue: 5, min: 3, max: 10,
  },
  {
    key: "year1Revenue",
    label: "Year 1 revenue",
    shortLabel: "Y1 Revenue",
    description: "Total revenue in year 1",
    section: "revenue", step: 2, type: "currency", required: true,
    applicableModels: ["dcf", "three_statement", "lbo", "saas", "ma"],
    cellName: "in_year1Rev", excelFormat: "#,##0",
    min: 0,
  },
  {
    key: "year2Revenue",
    label: "Year 2 revenue",
    shortLabel: "Y2 Revenue",
    description: "Total revenue in year 2",
    section: "revenue", step: 2, type: "currency", required: false,
    applicableModels: ["dcf", "three_statement", "lbo", "saas", "ma"],
    cellName: "in_year2Rev", excelFormat: "#,##0",
    min: 0,
  },
  {
    key: "year3Revenue",
    label: "Year 3 revenue",
    shortLabel: "Y3 Revenue",
    description: "Total revenue in year 3",
    section: "revenue", step: 2, type: "currency", required: false,
    applicableModels: ["dcf", "three_statement", "lbo", "saas", "ma"],
    cellName: "in_year3Rev", excelFormat: "#,##0",
    min: 0,
  },
  {
    key: "revenueGrowthY1",
    label: "Year 1 revenue growth",
    shortLabel: "Y1 Growth",
    description: "Expected year-over-year revenue growth in year 1",
    helpText: "For SaaS at Series A: 100-200% typical. Mature SMEs: 10-30%. Established businesses: 5-15%.",
    section: "revenue", step: 2, type: "percentage", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "saas"],
    cellName: "in_growthY1", excelFormat: "0.0%",
    min: -50, max: 500, suffix: "%",
    getAISuggestion: (ctx) => {
      const stage = ctx.businessStage || ""
      if (stage.includes("Pre-revenue")) return { value: 300, rationale: "Pre-revenue startups target aggressive growth to prove product-market fit", confidence: "medium" }
      if (stage.includes("Early Revenue")) return { value: 150, rationale: "Early-revenue SaaS typically grows 100-200% at this stage", confidence: "high" }
      if (stage.includes("Growth")) return { value: 60, rationale: "Growth-stage businesses often maintain 40-80% growth", confidence: "high" }
      if (stage.includes("Established")) return { value: 20, rationale: "Established profitable businesses typically grow 10-30%", confidence: "high" }
      if (stage.includes("Mature")) return { value: 8, rationale: "Mature businesses grow in line with GDP+premium", confidence: "high" }
      return { value: 20, rationale: "Industry average", confidence: "low" }
    },
    benchmarkKey: "revenueGrowthY1",
    audit: { industryTypical: "10-50% for SMEs, 100%+ for early SaaS", source: "OECD SME data 2024" },
  },
  {
    key: "revenueGrowthY2",
    label: "Year 2 revenue growth",
    shortLabel: "Y2 Growth",
    description: "Expected year-over-year revenue growth in year 2",
    section: "revenue", step: 2, type: "percentage", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "saas"],
    cellName: "in_growthY2", excelFormat: "0.0%",
    min: -50, max: 500, suffix: "%",
    getAISuggestion: (ctx) => {
      const y1 = Number(ctx.currentValues?.revenueGrowthY1) || 20
      // Growth typically slows in year 2 as base grows
      return { value: Math.max(y1 * 0.75, 10), rationale: "Growth typically decelerates ~25% as revenue base scales", confidence: "medium" }
    },
  },
  {
    key: "revenueGrowthY3",
    label: "Year 3+ revenue growth",
    shortLabel: "Y3 Growth",
    description: "Sustainable growth rate for year 3 and beyond",
    section: "revenue", step: 2, type: "percentage", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "saas"],
    cellName: "in_growthY3", excelFormat: "0.0%",
    min: -50, max: 200, suffix: "%",
    getAISuggestion: (ctx) => {
      const y2 = Number(ctx.currentValues?.revenueGrowthY2) || 15
      return { value: Math.max(y2 * 0.6, 5), rationale: "Terminal growth trajectory — decelerating toward GDP+premium", confidence: "medium" }
    },
  },
  {
    key: "churnRate",
    label: "Annual customer churn",
    description: "Annual percentage of customers who leave",
    helpText: "For SaaS: 5-8% is best-in-class, 8-15% typical, >15% concerning",
    section: "revenue", step: 2, type: "percentage", required: false,
    applicableModels: ["saas", "pre_revenue_dcf"],
    cellName: "in_churnRate", excelFormat: "0.0%",
    min: 0, max: 100, suffix: "%",
    getAISuggestion: (ctx) => {
      if (ctx.subSector?.toLowerCase().includes("enterprise")) return { value: 6, rationale: "Enterprise SaaS: 5-8% typical", confidence: "high" }
      if (ctx.subSector?.toLowerCase().includes("smb")) return { value: 12, rationale: "SMB SaaS: 10-15% typical", confidence: "high" }
      return { value: 10, rationale: "SaaS average across segments", confidence: "medium" }
    },
  },

  // ═══ SECTION: COST STRUCTURE ═══════════════════════════════════════
  {
    key: "grossMargin",
    label: "Gross margin",
    description: "Gross profit as % of revenue",
    helpText: "SaaS: 70-85%. Marketplaces: 60-80%. Product sales: 30-50%. Services: 40-60%.",
    section: "costs", step: 3, type: "percentage", required: true,
    applicableModels: ["dcf", "three_statement", "lbo", "saas", "ma"],
    cellName: "in_grossMargin", excelFormat: "0.0%",
    min: 0, max: 100, defaultValue: 70, suffix: "%",
    getAISuggestion: (ctx) => {
      const model = ctx.currentValues?.revenueModel as string || ""
      if (model.includes("SaaS")) return { value: 78, rationale: "SaaS gross margin benchmark: 75-85%", confidence: "high", source: "SaaS Capital 2024" }
      if (model.includes("Product Sales")) return { value: 40, rationale: "Product businesses typically 30-50% GM", confidence: "high" }
      if (model.includes("Marketplace")) return { value: 65, rationale: "Marketplace commissions typically 60-80% GM", confidence: "high" }
      if (model.includes("Professional Services")) return { value: 50, rationale: "Services businesses typically 40-60% GM", confidence: "high" }
      return { value: 70, rationale: "Industry average", confidence: "low" }
    },
  },
  {
    key: "cogsPercent",
    label: "COGS %",
    description: "Cost of goods sold as % of revenue",
    section: "costs", step: 3, type: "percentage", required: true,
    applicableModels: ["dcf", "three_statement", "lbo", "saas", "ma"],
    cellName: "in_cogsPercent", excelFormat: "0.0%",
    min: 0, max: 100, defaultValue: 30, suffix: "%",
  },
  {
    key: "salariesTotal",
    label: "Total annual payroll",
    description: "Total headcount cost including benefits and taxes",
    section: "costs", step: 3, type: "currency", required: false,
    applicableModels: ["dcf", "three_statement", "lbo", "saas", "ma"],
    cellName: "in_salariesTotal", excelFormat: "#,##0",
    min: 0,
  },
  {
    key: "marketingBudgetPct",
    label: "Sales & marketing %",
    description: "Sales & marketing spend as % of revenue",
    helpText: "SaaS growth-stage: 40-60% of revenue. SaaS mature: 15-25%. Product businesses: 5-15%.",
    section: "costs", step: 3, type: "percentage", required: false,
    applicableModels: ["dcf", "three_statement", "lbo", "saas"],
    cellName: "in_marketingPct", excelFormat: "0.0%",
    min: 0, max: 100, suffix: "%",
    getAISuggestion: (ctx) => {
      const stage = ctx.businessStage || ""
      if (stage.includes("Early Revenue")) return { value: 50, rationale: "Early SaaS invests heavily in growth: 40-60% of revenue", confidence: "high" }
      if (stage.includes("Growth")) return { value: 35, rationale: "Growth stage: 30-40% of revenue", confidence: "high" }
      if (stage.includes("Established")) return { value: 15, rationale: "Established: 10-20% of revenue", confidence: "high" }
      return { value: 20, rationale: "Industry median", confidence: "low" }
    },
  },
  {
    key: "rdBudgetPct",
    label: "R&D %",
    description: "Research & development spend as % of revenue",
    section: "costs", step: 3, type: "percentage", required: false,
    applicableModels: ["dcf", "three_statement", "lbo", "saas"],
    cellName: "in_rdPct", excelFormat: "0.0%",
    min: 0, max: 100, suffix: "%",
  },
  {
    key: "cloudInfraMonthly",
    label: "Cloud / hosting (monthly)",
    description: "Monthly infrastructure and hosting costs",
    section: "costs", step: 3, type: "currency", required: false,
    applicableModels: ["dcf", "three_statement", "saas"],
    cellName: "in_cloudMonthly", excelFormat: "#,##0",
    min: 0,
  },
  {
    key: "officeRentMonthly",
    label: "Office rent (monthly)",
    description: "Monthly office / facilities cost",
    section: "costs", step: 3, type: "currency", required: false,
    applicableModels: ["dcf", "three_statement", "lbo"],
    cellName: "in_officeMonthly", excelFormat: "#,##0",
    min: 0,
  },
  {
    key: "otherOpexMonthly",
    label: "Other overheads (monthly)",
    description: "Miscellaneous monthly operating costs",
    section: "costs", step: 3, type: "currency", required: false,
    applicableModels: ["dcf", "three_statement", "lbo"],
    cellName: "in_otherOpexMonthly", excelFormat: "#,##0",
    min: 0,
  },
  {
    key: "ebitdaMarginY1",
    label: "Year 1 EBITDA margin",
    description: "Target EBITDA margin in year 1",
    section: "costs", step: 3, type: "percentage", required: false,
    applicableModels: ["dcf", "three_statement"],
    cellName: "in_ebitdaMarginY1", excelFormat: "0.0%",
    min: -100, max: 100, suffix: "%",
  },
  {
    key: "ebitdaMarginY3",
    label: "Year 3 EBITDA margin",
    description: "Target EBITDA margin in year 3",
    section: "costs", step: 3, type: "percentage", required: false,
    applicableModels: ["dcf", "three_statement"],
    cellName: "in_ebitdaMarginY3", excelFormat: "0.0%",
    min: -100, max: 100, suffix: "%",
  },
  {
    key: "capexY1",
    label: "Year 1 CAPEX",
    description: "Capital expenditure in year 1",
    section: "costs", step: 3, type: "currency", required: false,
    applicableModels: ["dcf", "three_statement", "lbo"],
    cellName: "in_capexY1", excelFormat: "#,##0",
    min: 0,
  },
  {
    key: "depreciationRate",
    label: "Depreciation rate",
    description: "Annual depreciation as % of fixed assets",
    section: "costs", step: 3, type: "percentage", required: false,
    applicableModels: ["dcf", "three_statement", "lbo"],
    cellName: "in_deprecRate", excelFormat: "0.0%",
    min: 0, max: 100, defaultValue: 25, suffix: "%",
  },

  // ═══ SECTION: WORKING CAPITAL ═══════════════════════════════════════
  {
    key: "accountsReceivableDays",
    label: "Debtor days (DSO)",
    description: "Days sales outstanding - how long customers take to pay",
    helpText: "B2B SaaS: 30-45 days. Consumer/retail: 0-15 days. Government contracts: 60-90 days.",
    section: "workingCapital", step: 4, type: "days", required: false,
    applicableModels: ["dcf", "three_statement", "lbo", "saas"],
    cellName: "in_arDays", excelFormat: "0",
    min: 0, max: 365, defaultValue: 30, suffix: "days",
  },
  {
    key: "accountsPayableDays",
    label: "Creditor days (DPO)",
    description: "Days payable outstanding - how long you take to pay suppliers",
    section: "workingCapital", step: 4, type: "days", required: false,
    applicableModels: ["dcf", "three_statement", "lbo"],
    cellName: "in_apDays", excelFormat: "0",
    min: 0, max: 365, defaultValue: 30, suffix: "days",
  },
  {
    key: "inventoryDays",
    label: "Inventory days",
    description: "Days inventory outstanding",
    section: "workingCapital", step: 4, type: "days", required: false,
    applicableModels: ["dcf", "three_statement", "lbo"],
    cellName: "in_inventoryDays", excelFormat: "0",
    min: 0, max: 365, defaultValue: 0, suffix: "days",
  },

  // ═══ SECTION: FUNDING & CASH ═══════════════════════════════════════
  {
    key: "currentCash",
    label: "Current cash balance",
    description: "Cash on hand at model start",
    section: "funding", step: 4, type: "currency", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas"],
    cellName: "in_currentCash", excelFormat: "#,##0",
    min: 0,
  },
  {
    key: "totalFundingRaised",
    label: "Total funding raised to date",
    description: "Cumulative equity and debt raised",
    section: "funding", step: 4, type: "currency", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "saas"],
    cellName: "in_totalRaised", excelFormat: "#,##0",
    min: 0,
  },
  {
    key: "monthlyBurnRate",
    label: "Monthly burn rate",
    description: "Net monthly cash consumption",
    section: "funding", step: 4, type: "currency", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "saas"],
    cellName: "in_monthlyBurn", excelFormat: "#,##0",
    min: 0,
  },

  // ═══ SECTION: DEBT & INTEREST ═════════════════════════════════════
  {
    key: "debtFunding",
    label: "Total debt",
    description: "Existing debt on the balance sheet",
    section: "debt", step: 4, type: "currency", required: false,
    applicableModels: ["dcf", "three_statement", "lbo"],
    cellName: "in_totalDebt", excelFormat: "#,##0",
    min: 0,
  },
  {
    key: "interestRate",
    label: "Interest rate on debt",
    description: "Annual interest rate on outstanding debt",
    helpText: "UK SME loans: 6-10%. LBO senior debt: 5-8%. Mezzanine: 10-15%.",
    section: "debt", step: 4, type: "percentage", required: false,
    applicableModels: ["dcf", "three_statement", "lbo"],
    cellName: "in_interestRate", excelFormat: "0.00%",
    min: 0, max: 30, defaultValue: 8, suffix: "%",
    audit: { industryTypical: "5-10% for UK SME term loans", source: "Bank of England SME lending data 2024" },
  },

  // ═══ SECTION: VALUATION ═══════════════════════════════════════════
  {
    key: "discountRate",
    label: "Discount rate / WACC",
    description: "Weighted average cost of capital for DCF discounting",
    helpText: "SME: 12-18%. Established mid-market: 10-15%. Public companies: 7-10%.",
    section: "valuation", step: 5, type: "percentage", required: true,
    applicableModels: ["dcf", "pre_revenue_dcf", "lbo", "ma"],
    cellName: "in_discountRate", excelFormat: "0.00%",
    min: 0, max: 50, defaultValue: 15, suffix: "%",
    getAISuggestion: (ctx) => {
      const stage = ctx.businessStage || ""
      if (stage.includes("Pre-revenue")) return { value: 25, rationale: "Pre-revenue: high risk premium, typically 20-30%", confidence: "medium" }
      if (stage.includes("Early Revenue")) return { value: 20, rationale: "Early revenue: 18-22%", confidence: "high" }
      if (stage.includes("Growth")) return { value: 15, rationale: "Growth-stage: 13-17%", confidence: "high" }
      if (stage.includes("Established")) return { value: 12, rationale: "Established: 10-14%", confidence: "high" }
      return { value: 15, rationale: "SME average", confidence: "medium" }
    },
    audit: { industryTypical: "12-18% for UK SMEs", source: "Damodaran WACC data + UK risk premium" },
  },
  {
    key: "terminalGrowthRate",
    label: "Terminal growth rate",
    description: "Perpetual growth rate after projection period",
    helpText: "Typically 2-3% (long-term GDP + inflation). Never above 5%.",
    section: "valuation", step: 5, type: "percentage", required: true,
    applicableModels: ["dcf", "pre_revenue_dcf"],
    cellName: "in_terminalGrowth", excelFormat: "0.00%",
    min: 0, max: 5, defaultValue: 2.5, suffix: "%",
  },

  // ═══ SECTION: TAX ══════════════════════════════════════════════════
  {
    key: "taxRate",
    label: "Corporation tax rate",
    description: "Effective corporation tax rate",
    section: "tax", step: 5, type: "percentage", required: false,
    applicableModels: ["dcf", "three_statement", "lbo", "ma"],
    cellName: "in_taxRate", excelFormat: "0.00%",
    min: 0, max: 50, defaultValue: 19, suffix: "%",
    getAISuggestion: (ctx) => {
      if (ctx.country === "United Kingdom") return { value: 25, rationale: "UK main rate 25% (marginal relief 19-25% for profits £50k-£250k)", confidence: "high" }
      if (ctx.country === "United States") return { value: 21, rationale: "US federal 21% (state adds 0-13%)", confidence: "high" }
      return { value: 20, rationale: "Global average", confidence: "low" }
    },
  },

  // ═══ SECTION: EXIT ═════════════════════════════════════════════════
  {
    key: "exitHorizonYears",
    label: "Exit horizon (years)",
    description: "Years to assumed exit event",
    section: "exit", step: 5, type: "years", required: false,
    applicableModels: ["dcf", "lbo"],
    defaultValue: 5, min: 3, max: 10, suffix: "years",
  },
  {
    key: "targetExitMultiple",
    label: "Target exit multiple",
    description: "EV/Revenue multiple at exit",
    section: "exit", step: 5, type: "multiple", required: false,
    applicableModels: ["dcf", "lbo"],
    cellName: "in_exitMultiple", excelFormat: "0.0\"x\"",
    min: 0, max: 50, defaultValue: 8, suffix: "x",
    getAISuggestion: (ctx) => {
      const model = ctx.currentValues?.revenueModel as string || ""
      if (model.includes("SaaS")) return { value: 8, rationale: "SaaS: 6-10x revenue at growth, 4-6x at maturity", confidence: "high", source: "SaaS Capital Index 2024" }
      if (model.includes("Marketplace")) return { value: 5, rationale: "Marketplaces: 4-6x revenue", confidence: "high" }
      if (model.includes("Product Sales")) return { value: 2, rationale: "Product businesses: 1.5-3x revenue", confidence: "high" }
      return { value: 4, rationale: "General mid-market multiple", confidence: "medium" }
    },
    audit: { industryTypical: "6-10x for SaaS, 1.5-3x for traditional SMEs" },
  },
]

// -- HELPER FUNCTIONS ----------------------------------------------------

/** Get all assumptions applicable to a specific model type */
export function getAssumptionsForModel(modelType: ModelType): AssumptionDefinition[] {
  return ASSUMPTIONS.filter((a) => a.applicableModels.includes(modelType))
}

/** Get assumptions for a specific section */
export function getAssumptionsBySection(section: AssumptionSection): AssumptionDefinition[] {
  return ASSUMPTIONS.filter((a) => a.section === section)
}

/** Get assumptions for a specific questionnaire step */
export function getAssumptionsByStep(step: number): AssumptionDefinition[] {
  return ASSUMPTIONS.filter((a) => a.step === step)
}

/** Look up a single assumption by key */
export function getAssumption(key: string): AssumptionDefinition | undefined {
  return ASSUMPTIONS.find((a) => a.key === key)
}

/** Get all assumptions that should appear in the Excel Model Inputs sheet */
export function getExportableAssumptions(): AssumptionDefinition[] {
  return ASSUMPTIONS.filter((a) => a.cellName !== undefined)
}

/** Get an AI-suggested value for an assumption */
export function getAISuggestion(
  key: string,
  ctx: AISuggestionContext
): AISuggestionResult | null {
  const assumption = getAssumption(key)
  if (!assumption?.getAISuggestion) return null
  return assumption.getAISuggestion(ctx)
}

/** Group assumptions by section for display */
export function groupBySection(assumptions: AssumptionDefinition[]): Record<AssumptionSection, AssumptionDefinition[]> {
  const grouped = {} as Record<AssumptionSection, AssumptionDefinition[]>
  assumptions.forEach((a) => {
    if (!grouped[a.section]) grouped[a.section] = []
    grouped[a.section].push(a)
  })
  return grouped
}

/** Human-readable section titles for display */
export const SECTION_TITLES: Record<AssumptionSection, string> = {
  business: "Business Information",
  revenue: "Revenue Assumptions",
  costs: "Cost Structure",
  workingCapital: "Working Capital",
  funding: "Funding & Cash",
  debt: "Debt & Interest",
  valuation: "Valuation",
  tax: "Tax",
  exit: "Exit Assumptions",
}
