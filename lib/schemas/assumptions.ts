/**
 * Finanyst — Central Assumptions Schema
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

// -- SESSION 1 ADDITIONS: driver-based revenue mode foundation ----------

export type RevenueEntryMode = "topLine" | "driverBased"

export type BusinessTypeMain =
  | "saas"
  | "ecommerce"
  | "services"
  | "product"
  | "realEstate"
  | "healthcare"
  | "education"
  | "hospitality"

export type BusinessTypeSub =
  // SaaS
  | "saas_b2b"
  | "saas_b2c"
  | "saas_usage"
  // E-commerce
  | "ecom_d2c"
  | "ecom_marketplace"
  // Services
  | "services_professional"
  | "services_agency"
  | "services_freelance"
  // Product
  | "product_manufacturing"
  | "product_retail"
  | "product_wholesale"
  // Real Estate
  | "realestate_development"
  | "realestate_rental"
  | "realestate_agency"
  | "realestate_reit"
  | "realestate_shorttermrental"
  // Healthcare
  | "health_clinic"
  | "health_hospital"
  | "health_device"
  | "health_saas"
  | "health_pharmacy"
  // Education
  | "edu_institution"
  | "edu_edtech"
  | "edu_tutoring"
  | "edu_corptraining"
  // Hospitality
  | "hosp_restaurant"
  | "hosp_hotel"
  | "hosp_catering"

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
  applicableBusinessSubTypes?: BusinessTypeSub[]  // Session 2a: driver fields only show for matching sub-types

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

// -- SESSION 1 ADDITIONS: business type hierarchy -----------------------
// Mapping of main types to their sub-categories (used by UI to filter sub-picker)
export const BUSINESS_TYPE_HIERARCHY: Record<
  BusinessTypeMain,
  { label: string; subs: { key: BusinessTypeSub; label: string }[] }
> = {
  saas: {
    label: "SaaS / Subscription software",
    subs: [
      { key: "saas_b2b",   label: "B2B SaaS" },
      { key: "saas_b2c",   label: "B2C SaaS" },
      { key: "saas_usage", label: "Usage-based SaaS" },
    ],
  },
  ecommerce: {
    label: "E-commerce",
    subs: [
      { key: "ecom_d2c",         label: "Direct-to-consumer product" },
      { key: "ecom_marketplace", label: "Marketplace platform" },
    ],
  },
  services: {
    label: "Services / Consulting",
    subs: [
      { key: "services_professional", label: "Professional services (consulting, legal, accounting)" },
      { key: "services_agency",       label: "Agency (marketing, creative)" },
      { key: "services_freelance",    label: "Freelance / individual services" },
    ],
  },
  product: {
    label: "Product / Physical goods",
    subs: [
      { key: "product_manufacturing", label: "Manufacturing" },
      { key: "product_retail",        label: "Retail (own store)" },
      { key: "product_wholesale",     label: "Wholesale / distribution" },
    ],
  },
  realEstate: {
    label: "Real Estate",
    subs: [
      { key: "realestate_development",     label: "Property development" },
      { key: "realestate_rental",          label: "Commercial rental / landlord" },
      { key: "realestate_agency",          label: "Real estate agency (broker)" },
      { key: "realestate_reit",            label: "REIT / property fund" },
      { key: "realestate_shorttermrental", label: "Short-term rental (Airbnb, B&B, holiday lets)" },
    ],
  },
  healthcare: {
    label: "Healthcare",
    subs: [
      { key: "health_clinic",   label: "Clinical practice (GP, dental, specialist)" },
      { key: "health_hospital", label: "Hospital / large facility" },
      { key: "health_device",   label: "Medical device / diagnostics" },
      { key: "health_saas",     label: "Health SaaS / telemedicine" },
      { key: "health_pharmacy", label: "Pharmacy" },
    ],
  },
  education: {
    label: "Education",
    subs: [
      { key: "edu_institution",  label: "K-12 or higher education institution" },
      { key: "edu_edtech",       label: "EdTech SaaS" },
      { key: "edu_tutoring",     label: "Tutoring / test prep" },
      { key: "edu_corptraining", label: "Corporate training" },
    ],
  },
  hospitality: {
    label: "Hospitality",
    subs: [
      { key: "hosp_restaurant", label: "Restaurant" },
      { key: "hosp_hotel",      label: "Hotel" },
      { key: "hosp_catering",   label: "Catering / events" },
    ],
  },
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

  // ═══ SECTION: REVENUE ASSUMPTIONS ════════════════════════════════════
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

  // ═══ SESSION 1 ADDITIONS: driver-based revenue foundation ═══════════
  {
    key: "revenueEntryMode",
    label: "Revenue entry mode",
    description: "How you'd like to enter revenue: as top-line yearly totals (simple) or via detailed business-specific drivers (recommended for investor-grade models)",
    section: "revenue", step: 2, type: "enum", required: true,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    allowedValues: ["topLine", "driverBased"],
    defaultValue: "topLine",
  },
  {
    key: "businessTypeMain",
    label: "Business type",
    description: "Main business category (used to select relevant revenue drivers)",
    section: "revenue", step: 2, type: "enum", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    allowedValues: ["saas", "ecommerce", "services", "product", "realEstate", "healthcare", "education", "hospitality"],
    helpText: "Only used when revenue entry mode = driverBased",
  },
  {
    key: "businessTypeSub",
    label: "Business sub-type",
    description: "Specific sub-category, drives which revenue drivers appear",
    section: "revenue", step: 2, type: "enum", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    allowedValues: [
      "saas_b2b", "saas_b2c", "saas_usage",
      "ecom_d2c", "ecom_marketplace",
      "services_professional", "services_agency", "services_freelance",
      "product_manufacturing", "product_retail", "product_wholesale",
      "realestate_development", "realestate_rental", "realestate_agency", "realestate_reit", "realestate_shorttermrental",
      "health_clinic", "health_hospital", "health_device", "health_saas", "health_pharmacy",
      "edu_institution", "edu_edtech", "edu_tutoring", "edu_corptraining",
      "hosp_restaurant", "hosp_hotel", "hosp_catering",
    ],
    helpText: "Only used when revenue entry mode = driverBased",
  },

  // ═══ SESSION 2a: SaaS B2B / E-commerce D2C / Professional Services ══
  // ─── SaaS B2B ────────────────────────────────────────────────────────
  {
    key: "saasB2b_startingCustomers",
    label: "Starting customer count",
    description: "Number of paying customers at model start (month 0)",
    helpText: "Only used for B2B SaaS driver mode",
    section: "revenue", step: 2, type: "number", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["saas_b2b"],
    min: 0,
    getAISuggestion: (ctx) => {
      const stage = ctx.businessStage || ""
      if (stage.includes("Pre-revenue")) return { value: 0, rationale: "Pre-revenue businesses start with zero paying customers", confidence: "high" }
      if (stage.includes("Early Revenue")) return { value: 20, rationale: "Early-revenue B2B SaaS typically has 10-50 customers", confidence: "medium" }
      if (stage.includes("Growth")) return { value: 100, rationale: "Growth-stage B2B SaaS typically has 50-500 customers", confidence: "medium" }
      return { value: 50, rationale: "General B2B SaaS starting point", confidence: "low" }
    },
  },
  {
    key: "saasB2b_newCustomersPerMonth",
    label: "New customers per month",
    description: "Average number of new paying customers acquired each month",
    helpText: "For B2B SaaS driver mode. Sales pipeline output — think about sales team capacity.",
    section: "revenue", step: 2, type: "number", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["saas_b2b"],
    min: 0,
  },
  {
    key: "saasB2b_monthlyChurnRate",
    label: "Monthly churn rate",
    description: "Percentage of customers who cancel each month",
    helpText: "B2B SaaS: 1-2% monthly is best-in-class. 2-4% is typical. Above 5% is concerning.",
    section: "revenue", step: 2, type: "percentage", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["saas_b2b"],
    min: 0, max: 100, suffix: "%",
    getAISuggestion: (ctx) => {
      if (ctx.subSector?.toLowerCase().includes("enterprise")) return { value: 0.5, rationale: "Enterprise B2B SaaS: 0.5% monthly (6% annual) is typical", confidence: "high", source: "SaaS Capital 2024" }
      return { value: 2, rationale: "Mid-market B2B SaaS: 2% monthly (~24% annual) is typical", confidence: "high" }
    },
  },
  {
    key: "saasB2b_arpu",
    label: "ARPU per customer per month",
    description: "Average revenue per user per month",
    helpText: "Blended MRR per customer. Include upsells, exclude one-off fees.",
    section: "revenue", step: 2, type: "currency", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["saas_b2b"],
    min: 0,
  },
  {
    key: "saasB2b_expansionRevenuePct",
    label: "Expansion revenue %",
    description: "Additional revenue from existing customers (upsells, seat expansion) as % of base",
    helpText: "Best-in-class B2B SaaS: 15-30%. NRR of 110-130% comes from this.",
    section: "revenue", step: 2, type: "percentage", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["saas_b2b"],
    min: 0, max: 100, suffix: "%",
    defaultValue: 15,
  },

  // ─── E-commerce D2C ──────────────────────────────────────────────────
  {
    key: "ecomD2c_monthlyTraffic",
    label: "Monthly website traffic (sessions)",
    description: "Total unique sessions per month across all channels",
    helpText: "For D2C e-commerce driver mode. Include paid + organic + referral traffic.",
    section: "revenue", step: 2, type: "number", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["ecom_d2c"],
    min: 0,
  },
  {
    key: "ecomD2c_conversionRate",
    label: "Conversion rate",
    description: "Percentage of sessions that result in a purchase",
    helpText: "D2C industry average: 2-3%. Best in class: 4-5%. Fashion/apparel often lower (1-2%).",
    section: "revenue", step: 2, type: "percentage", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["ecom_d2c"],
    min: 0, max: 100, suffix: "%",
    defaultValue: 2.5,
    getAISuggestion: () => ({ value: 2.5, rationale: "D2C e-commerce industry average is 2-3%", confidence: "high", source: "Shopify Commerce Report 2024" }),
  },
  {
    key: "ecomD2c_averageOrderValue",
    label: "Average order value (AOV)",
    description: "Average revenue per order",
    helpText: "Total revenue divided by number of orders. Focus on driving this up via bundling and upsells.",
    section: "revenue", step: 2, type: "currency", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["ecom_d2c"],
    min: 0,
  },
  {
    key: "ecomD2c_repeatPurchaseRate",
    label: "Repeat purchase rate",
    description: "Percentage of customers who purchase again within 12 months",
    helpText: "D2C benchmark: 20-30%. Consumables/subscription products can hit 60%+.",
    section: "revenue", step: 2, type: "percentage", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["ecom_d2c"],
    min: 0, max: 100, suffix: "%",
    defaultValue: 25,
  },

  // ─── Professional Services ───────────────────────────────────────────
  {
    key: "svcProf_billableStaffCount",
    label: "Billable staff count",
    description: "Number of consultants / professionals who bill clients",
    helpText: "For professional services driver mode. Exclude admin, ops, marketing headcount.",
    section: "revenue", step: 2, type: "number", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["services_professional"],
    min: 0,
  },
  {
    key: "svcProf_billableHoursPerMonth",
    label: "Billable hours per staff per month",
    description: "Target billable hours per person per month (before utilization)",
    helpText: "Consulting/legal norms: 160-180 hours/month capacity. Accounting: often 140-160.",
    section: "revenue", step: 2, type: "number", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["services_professional"],
    min: 0, max: 250,
    defaultValue: 160,
  },
  {
    key: "svcProf_utilizationRate",
    label: "Utilization rate",
    description: "Percentage of billable hours actually billed to clients",
    helpText: "Big 4 target: 75-85%. Boutique consultancies: 60-75%. Freelance: often 40-60%.",
    section: "revenue", step: 2, type: "percentage", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["services_professional"],
    min: 0, max: 100, suffix: "%",
    defaultValue: 70,
    getAISuggestion: () => ({ value: 70, rationale: "Mid-tier professional services target 65-75% utilization", confidence: "high" }),
  },
  {
    key: "svcProf_hourlyRate",
    label: "Blended hourly rate",
    description: "Average billed hourly rate across all staff levels",
    helpText: "UK mid-tier consulting: £150-300/hr. Boutique specialist: £300-800/hr. Freelance: £75-200/hr.",
    section: "revenue", step: 2, type: "currency", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["services_professional"],
    min: 0,
  },

  // ═══ SESSION 3a: Product + Real Estate ═══════════════════════════════
  // ─── Product Manufacturing ───────────────────────────────────────────
  {
    key: "productMfg_unitsPerMonth",
    label: "Units produced per month",
    description: "Total units manufactured per month at full production",
    helpText: "For manufacturing driver mode. Consider seasonal variation separately.",
    section: "revenue", step: 2, type: "number", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["product_manufacturing"],
    min: 0,
  },
  {
    key: "productMfg_unitPrice",
    label: "Unit selling price",
    description: "Average selling price per unit (before discounts)",
    section: "revenue", step: 2, type: "currency", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["product_manufacturing"],
    min: 0,
  },
  {
    key: "productMfg_capacityUtilization",
    label: "Capacity utilization",
    description: "Percentage of maximum manufacturing capacity actually used",
    helpText: "Well-run SME manufacturers: 70-85%. Startups: 40-60%.",
    section: "revenue", step: 2, type: "percentage", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["product_manufacturing"],
    min: 0, max: 100, suffix: "%",
    defaultValue: 75,
  },
  {
    key: "productMfg_sellThroughRate",
    label: "Sell-through rate",
    description: "Percentage of produced units actually sold (vs held as inventory)",
    helpText: "Fashion/apparel: 60-75%. Consumer goods: 85-95%. Fresh food: near 100%.",
    section: "revenue", step: 2, type: "percentage", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["product_manufacturing"],
    min: 0, max: 100, suffix: "%",
    defaultValue: 85,
  },

  // ─── Product Retail (own store) ──────────────────────────────────────
  {
    key: "productRetail_storeCount",
    label: "Store count",
    description: "Number of physical retail locations",
    helpText: "For own-store retail. Include only stores you operate (not franchisees).",
    section: "revenue", step: 2, type: "number", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["product_retail"],
    min: 0,
  },
  {
    key: "productRetail_revenuePerStore",
    label: "Revenue per store per month",
    description: "Average monthly revenue per store",
    helpText: "UK high street SME retail: £15k-£80k/mo typical. Prime location: £100k+.",
    section: "revenue", step: 2, type: "currency", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["product_retail"],
    min: 0,
  },
  {
    key: "productRetail_sameSalesGrowth",
    label: "Same-store sales growth",
    description: "Year-over-year growth in revenue per store (like-for-like)",
    helpText: "Established retail: 2-5% typical. Newer concepts: 10-20% in early years.",
    section: "revenue", step: 2, type: "percentage", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["product_retail"],
    min: -50, max: 100, suffix: "%",
    defaultValue: 3,
  },

  // ─── Product Wholesale / Distribution ────────────────────────────────
  {
    key: "productWhsl_activeAccounts",
    label: "Active accounts",
    description: "Number of active buyer accounts (retailers, resellers, distributors)",
    helpText: "For wholesale/distribution driver mode. Accounts that ordered in the last 90 days.",
    section: "revenue", step: 2, type: "number", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["product_wholesale"],
    min: 0,
  },
  {
    key: "productWhsl_ordersPerAccount",
    label: "Orders per account per month",
    description: "Average number of orders each active account places per month",
    section: "revenue", step: 2, type: "number", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["product_wholesale"],
    min: 0,
  },
  {
    key: "productWhsl_averageOrderValue",
    label: "Average order value",
    description: "Average revenue per wholesale order",
    section: "revenue", step: 2, type: "currency", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["product_wholesale"],
    min: 0,
  },

  // ─── Real Estate Development ─────────────────────────────────────────
  {
    key: "reDev_unitsBuiltYear",
    label: "Units built per year",
    description: "Number of dwelling/commercial units completed per year",
    helpText: "For property development driver mode. Include full completions only.",
    section: "revenue", step: 2, type: "number", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["realestate_development"],
    min: 0,
  },
  {
    key: "reDev_averageSellingPrice",
    label: "Average selling price per unit",
    description: "Average sale price achieved per completed unit",
    section: "revenue", step: 2, type: "currency", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["realestate_development"],
    min: 0,
  },
  {
    key: "reDev_sellThroughMonths",
    label: "Sell-through period (months)",
    description: "Average months from completion to sale",
    helpText: "London prime: 3-6 months. Regional: 6-12 months. Slow market: 12-24 months.",
    section: "revenue", step: 2, type: "number", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["realestate_development"],
    min: 0, max: 60,
    defaultValue: 9,
  },
  {
    key: "reDev_grossMargin",
    label: "Gross development margin",
    description: "Gross profit as % of gross development value",
    helpText: "Well-run UK developers: 18-25% target. Under 15% suggests problems.",
    section: "revenue", step: 2, type: "percentage", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["realestate_development"],
    min: 0, max: 60, suffix: "%",
    defaultValue: 20,
  },

  // ─── Real Estate Rental (commercial landlord) ────────────────────────
  {
    key: "reRent_rentableUnits",
    label: "Rentable units",
    description: "Total number of rentable units in portfolio",
    helpText: "Units, offices, or lettable space count. Not square footage.",
    section: "revenue", step: 2, type: "number", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["realestate_rental"],
    min: 0,
  },
  {
    key: "reRent_monthlyRent",
    label: "Monthly rent per unit",
    description: "Average monthly rent achieved per unit",
    section: "revenue", step: 2, type: "currency", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["realestate_rental"],
    min: 0,
  },
  {
    key: "reRent_occupancyRate",
    label: "Occupancy rate",
    description: "Percentage of units occupied by paying tenants",
    helpText: "UK commercial: 88-95% typical. Under 85% suggests demand/pricing issues.",
    section: "revenue", step: 2, type: "percentage", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["realestate_rental"],
    min: 0, max: 100, suffix: "%",
    defaultValue: 92,
  },
  {
    key: "reRent_otherIncomePct",
    label: "Other income %",
    description: "Additional income (parking, storage, service charges) as % of rent",
    helpText: "UK landlords: 5-15% typical for commercial, less for residential.",
    section: "revenue", step: 2, type: "percentage", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["realestate_rental"],
    min: 0, max: 100, suffix: "%",
    defaultValue: 8,
  },

  // ─── Real Estate Agency (broker) ─────────────────────────────────────
  {
    key: "reAgcy_monthlyTransactions",
    label: "Monthly transactions",
    description: "Average number of completed transactions (sales + lets) per month",
    section: "revenue", step: 2, type: "number", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["realestate_agency"],
    min: 0,
  },
  {
    key: "reAgcy_averageTransactionValue",
    label: "Average transaction value",
    description: "Average sale/let value per transaction",
    section: "revenue", step: 2, type: "currency", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["realestate_agency"],
    min: 0,
  },
  {
    key: "reAgcy_commissionRate",
    label: "Commission rate",
    description: "Commission as % of transaction value",
    helpText: "UK residential sales: 1-3% typical. Commercial: 1-2%. Lettings: 8-15% of annual rent.",
    section: "revenue", step: 2, type: "percentage", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["realestate_agency"],
    min: 0, max: 30, suffix: "%",
    defaultValue: 2,
  },

  // ─── Real Estate REIT / Property Fund ────────────────────────────────
  {
    key: "reReit_portfolioProperties",
    label: "Portfolio properties",
    description: "Number of properties held in the fund",
    section: "revenue", step: 2, type: "number", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["realestate_reit"],
    min: 0,
  },
  {
    key: "reReit_averageYield",
    label: "Average property yield",
    description: "Blended net rental yield across the portfolio",
    helpText: "UK REITs: 4-7% typical net yield. Commercial: 5-8%. Residential: 3-5%.",
    section: "revenue", step: 2, type: "percentage", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["realestate_reit"],
    min: 0, max: 20, suffix: "%",
    defaultValue: 5,
  },
  {
    key: "reReit_navGrowth",
    label: "NAV growth (annual)",
    description: "Expected annual growth in net asset value from capital appreciation",
    helpText: "Long-term UK property: 2-4% real growth. Recent decade averaged higher.",
    section: "revenue", step: 2, type: "percentage", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["realestate_reit"],
    min: -20, max: 30, suffix: "%",
    defaultValue: 3,
  },

  // ─── Real Estate Short-term Rental (Airbnb / B&B / holiday lets) ─────
  {
    key: "reStr_rentableUnits",
    label: "Rentable units / rooms",
    description: "Number of rooms/properties available for short-term letting",
    helpText: "For short-term rental driver mode. Single hosts might list 1-3 units.",
    section: "revenue", step: 2, type: "number", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["realestate_shorttermrental"],
    min: 0,
  },
  {
    key: "reStr_averageNightlyRate",
    label: "Average nightly rate",
    description: "Average nightly rate achieved (blended peak / off-peak)",
    helpText: "UK city short-let: £80-200. Coastal/holiday: £120-300. London prime: £200-500+.",
    section: "revenue", step: 2, type: "currency", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["realestate_shorttermrental"],
    min: 0,
  },
  {
    key: "reStr_occupancyRate",
    label: "Occupancy rate",
    description: "Percentage of nights booked (nights booked / nights available)",
    helpText: "UK Airbnb hosts: 45-65% typical. Prime city location: 70-85%.",
    section: "revenue", step: 2, type: "percentage", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["realestate_shorttermrental"],
    min: 0, max: 100, suffix: "%",
    defaultValue: 55,
  },
  {
    key: "reStr_cleaningFeePerBooking",
    label: "Cleaning fee per booking",
    description: "Average cleaning/service fee charged per booking (revenue passed to host)",
    helpText: "UK short-lets: £30-80 typical per booking.",
    section: "revenue", step: 2, type: "currency", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["realestate_shorttermrental"],
    min: 0,
  },

  // ═══ SESSION 3b: Healthcare + Education ══════════════════════════════

  // ─── Healthcare Clinic (GP, dental, specialist) ──────────────────────
  {
    key: "healthClinic_patientVisitsPerMonth",
    label: "Patient visits per month",
    description: "Total patient consultations/visits across all providers per month",
    helpText: "For clinical practice driver mode. UK GP: 150-200 visits/provider/mo typical. Specialist: 60-100.",
    section: "revenue", step: 2, type: "number", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["health_clinic"],
    min: 0,
  },
  {
    key: "healthClinic_averageFeePerVisit",
    label: "Average fee per visit",
    description: "Blended revenue per patient visit",
    helpText: "UK private GP: £80-150. Dental consult: £50-120. Specialist consult: £150-300.",
    section: "revenue", step: 2, type: "currency", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["health_clinic"],
    min: 0,
  },
  {
    key: "healthClinic_providerCount",
    label: "Provider count",
    description: "Number of clinicians/specialists providing billable care",
    helpText: "Include only those who bill patients (exclude admin, reception).",
    section: "revenue", step: 2, type: "number", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["health_clinic"],
    min: 0,
  },
  {
    key: "healthClinic_retentionRate",
    label: "Patient retention rate",
    description: "Percentage of patients who return within 12 months",
    helpText: "UK private clinics: 60-80% typical. Chronic care: higher.",
    section: "revenue", step: 2, type: "percentage", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["health_clinic"],
    min: 0, max: 100, suffix: "%",
    defaultValue: 70,
  },

  // ─── Healthcare Hospital / Large Facility ────────────────────────────
  {
    key: "healthHosp_bedCount",
    label: "Bed count",
    description: "Total inpatient beds available",
    helpText: "For hospital driver mode. UK small private hospital: 30-80 beds. Large: 150+.",
    section: "revenue", step: 2, type: "number", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["health_hospital"],
    min: 0,
  },
  {
    key: "healthHosp_occupancyRate",
    label: "Occupancy rate",
    description: "Percentage of beds occupied on average",
    helpText: "UK private hospitals: 60-80% typical. NHS: 85-95%.",
    section: "revenue", step: 2, type: "percentage", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["health_hospital"],
    min: 0, max: 100, suffix: "%",
    defaultValue: 70,
  },
  {
    key: "healthHosp_averageDailyRate",
    label: "Average daily rate per bed",
    description: "Blended revenue per occupied bed per day",
    helpText: "UK private: £800-1,500/day typical. Complex care/ICU: much higher.",
    section: "revenue", step: 2, type: "currency", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["health_hospital"],
    min: 0,
  },
  {
    key: "healthHosp_ancillaryRevenuePct",
    label: "Ancillary revenue %",
    description: "Non-bed revenue (imaging, labs, pharmacy, outpatient) as % of bed revenue",
    helpText: "UK private hospitals: 30-50% typical. Standalone outpatient facilities: higher.",
    section: "revenue", step: 2, type: "percentage", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["health_hospital"],
    min: 0, max: 200, suffix: "%",
    defaultValue: 40,
  },

  // ─── Healthcare Medical Device / Diagnostics ─────────────────────────
  {
    key: "healthDev_unitsSoldPerQuarter",
    label: "Units sold per quarter",
    description: "Devices sold per quarter (steady-state)",
    helpText: "For medical device driver mode. Quarters reflect longer sales cycles.",
    section: "revenue", step: 2, type: "number", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["health_device"],
    min: 0,
  },
  {
    key: "healthDev_unitPrice",
    label: "Unit selling price",
    description: "Average price per device sold",
    section: "revenue", step: 2, type: "currency", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["health_device"],
    min: 0,
  },
  {
    key: "healthDev_serviceRevenuePct",
    label: "Service revenue %",
    description: "Recurring service/maintenance/consumables revenue as % of hardware revenue",
    helpText: "Best-in-class med device: 30-50% recurring. High-value diagnostics: can exceed 100%.",
    section: "revenue", step: 2, type: "percentage", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["health_device"],
    min: 0, max: 200, suffix: "%",
    defaultValue: 30,
  },
  {
    key: "healthDev_installBase",
    label: "Installed base (units)",
    description: "Cumulative devices installed at customer sites",
    helpText: "Drives recurring service revenue over the projection period.",
    section: "revenue", step: 2, type: "number", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["health_device"],
    min: 0,
  },

  // ─── Healthcare SaaS / Telemedicine ──────────────────────────────────
  {
    key: "healthSaas_startingCustomers",
    label: "Starting customer count",
    description: "Number of paying customers (clinics/hospitals/patients) at model start",
    helpText: "For health SaaS driver mode. Enterprise sales: single-digit start typical.",
    section: "revenue", step: 2, type: "number", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["health_saas"],
    min: 0,
  },
  {
    key: "healthSaas_newCustomersPerMonth",
    label: "New customers per month",
    description: "Average new paying customers acquired each month",
    section: "revenue", step: 2, type: "number", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["health_saas"],
    min: 0,
  },
  {
    key: "healthSaas_arpu",
    label: "ARPU per customer per month",
    description: "Average monthly revenue per customer",
    helpText: "Health SaaS often bills per user/provider or per patient. Enterprise deals: £500-5,000/mo per organization.",
    section: "revenue", step: 2, type: "currency", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["health_saas"],
    min: 0,
  },
  {
    key: "healthSaas_monthlyChurnRate",
    label: "Monthly churn rate",
    description: "Percentage of customers who cancel each month",
    helpText: "Health SaaS: 1-2% is best-in-class (long procurement cycles favour retention).",
    section: "revenue", step: 2, type: "percentage", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["health_saas"],
    min: 0, max: 100, suffix: "%",
    defaultValue: 1.5,
  },

  // ─── Healthcare Pharmacy ─────────────────────────────────────────────
  {
    key: "healthPharm_dailyFootfall",
    label: "Daily footfall",
    description: "Average unique visitors per day",
    helpText: "UK community pharmacy: 200-500/day typical. High street prime: 500-1,000+.",
    section: "revenue", step: 2, type: "number", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["health_pharmacy"],
    min: 0,
  },
  {
    key: "healthPharm_conversionRate",
    label: "Conversion rate",
    description: "Percentage of visitors who make a purchase",
    helpText: "Pharmacy: 60-80% typical (higher than most retail due to prescription pickups).",
    section: "revenue", step: 2, type: "percentage", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["health_pharmacy"],
    min: 0, max: 100, suffix: "%",
    defaultValue: 70,
  },
  {
    key: "healthPharm_basketSize",
    label: "Average basket size",
    description: "Average revenue per transaction",
    helpText: "UK pharmacy: £10-25 typical. Includes retail products and dispensing fees.",
    section: "revenue", step: 2, type: "currency", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["health_pharmacy"],
    min: 0,
  },
  {
    key: "healthPharm_prescriptionRevenuePct",
    label: "Prescription revenue %",
    description: "NHS/private prescription revenue as % of total",
    helpText: "UK community pharmacy: typically 60-80% of revenue is NHS-funded prescriptions.",
    section: "revenue", step: 2, type: "percentage", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["health_pharmacy"],
    min: 0, max: 100, suffix: "%",
    defaultValue: 70,
  },

  // ─── Education Institution (K-12 / Higher Ed) ────────────────────────
  {
    key: "eduInst_enrolledStudents",
    label: "Enrolled students",
    description: "Total students currently enrolled",
    helpText: "For education institution driver mode. Full-time equivalent.",
    section: "revenue", step: 2, type: "number", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["edu_institution"],
    min: 0,
  },
  {
    key: "eduInst_tuitionPerStudent",
    label: "Tuition per student per year",
    description: "Average annual tuition revenue per enrolled student",
    helpText: "UK private secondary: £15k-£45k/yr. Independent primary: £10k-£25k. Higher ed varies widely.",
    section: "revenue", step: 2, type: "currency", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["edu_institution"],
    min: 0,
  },
  {
    key: "eduInst_capacity",
    label: "Capacity (max students)",
    description: "Maximum students the institution can serve at full capacity",
    helpText: "Drives fill-rate analysis and expansion CAPEX signals.",
    section: "revenue", step: 2, type: "number", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["edu_institution"],
    min: 0,
  },
  {
    key: "eduInst_retentionRate",
    label: "Student retention rate",
    description: "Percentage of students who continue year-over-year",
    helpText: "UK independent schools: 88-95% typical. Higher ed dropout rates vary by course.",
    section: "revenue", step: 2, type: "percentage", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["edu_institution"],
    min: 0, max: 100, suffix: "%",
    defaultValue: 90,
  },

  // ─── Education EdTech SaaS ───────────────────────────────────────────
  {
    key: "eduTech_monthlySignups",
    label: "Monthly signups",
    description: "New free or paid user signups per month",
    helpText: "For EdTech SaaS driver mode. Includes free tier if applicable.",
    section: "revenue", step: 2, type: "number", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["edu_edtech"],
    min: 0,
  },
  {
    key: "eduTech_paidConversionRate",
    label: "Free-to-paid conversion rate",
    description: "Percentage of signups who become paying users",
    helpText: "Freemium EdTech: 2-5% typical. Direct paid model: 100% by definition.",
    section: "revenue", step: 2, type: "percentage", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["edu_edtech"],
    min: 0, max: 100, suffix: "%",
    defaultValue: 3,
  },
  {
    key: "eduTech_arpu",
    label: "ARPU per paid user per month",
    description: "Average monthly revenue per paying user",
    helpText: "Consumer EdTech: £10-30/mo. K-12/institutional: often per-seat, £5-20/mo.",
    section: "revenue", step: 2, type: "currency", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["edu_edtech"],
    min: 0,
  },
  {
    key: "eduTech_monthlyChurnRate",
    label: "Monthly churn rate",
    description: "Percentage of paying users who cancel each month",
    helpText: "Consumer EdTech: 5-15% monthly typical (very churny). Institutional: 1-3%.",
    section: "revenue", step: 2, type: "percentage", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["edu_edtech"],
    min: 0, max: 100, suffix: "%",
    defaultValue: 8,
  },

  // ─── Education Tutoring / Test Prep ──────────────────────────────────
  {
    key: "eduTut_activeStudents",
    label: "Active students",
    description: "Number of students currently taking tutoring sessions",
    helpText: "For tutoring driver mode. Students who booked at least one session in the last 30 days.",
    section: "revenue", step: 2, type: "number", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["edu_tutoring"],
    min: 0,
  },
  {
    key: "eduTut_sessionsPerStudentPerMonth",
    label: "Sessions per student per month",
    description: "Average tutoring sessions each active student takes per month",
    helpText: "1:1 tutoring: 2-4 sessions/mo typical. Test prep intensive: 8+.",
    section: "revenue", step: 2, type: "number", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["edu_tutoring"],
    min: 0,
    defaultValue: 4,
  },
  {
    key: "eduTut_pricePerSession",
    label: "Price per session",
    description: "Average revenue per tutoring session",
    helpText: "UK online 1:1: £25-60. Premium/subject specialists: £60-150. In-person often higher.",
    section: "revenue", step: 2, type: "currency", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["edu_tutoring"],
    min: 0,
  },

  // ─── Education Corporate Training ────────────────────────────────────
  {
    key: "eduCorp_enterpriseContracts",
    label: "Enterprise contracts",
    description: "Number of active corporate customer contracts",
    helpText: "For corporate training driver mode. Active B2B relationships.",
    section: "revenue", step: 2, type: "number", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["edu_corptraining"],
    min: 0,
  },
  {
    key: "eduCorp_averageContractValue",
    label: "Average contract value (annual)",
    description: "Blended annual revenue per enterprise contract",
    helpText: "SME contracts: £5k-£25k/yr. Mid-market: £25k-£150k. Enterprise: £150k+.",
    section: "revenue", step: 2, type: "currency", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["edu_corptraining"],
    min: 0,
  },
  {
    key: "eduCorp_retentionRate",
    label: "Annual retention rate",
    description: "Percentage of contracts renewed year-over-year",
    helpText: "Corporate training: 70-85% typical. Best-in-class L&D: 90%+.",
    section: "revenue", step: 2, type: "percentage", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["edu_corptraining"],
    min: 0, max: 100, suffix: "%",
    defaultValue: 80,
  },
  {
    key: "eduCorp_expansionPct",
    label: "Expansion revenue %",
    description: "Additional revenue from existing accounts (seats added, modules upsold) as % of base",
    helpText: "Best-in-class corporate L&D: 10-25% net expansion. Enables NRR > 100%.",
    section: "revenue", step: 2, type: "percentage", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["edu_corptraining"],
    min: 0, max: 100, suffix: "%",
    defaultValue: 10,
  },

  // ═══ Existing top-line revenue fields (used when revenueEntryMode = "topLine") ═══
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
    helpText: "For SaaS: 5-8% is best-in-class, 8-15% typical, above 15% concerning",
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

  // ═══ SECTION: COST STRUCTURE ═════════════════════════════════════════
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

  // ═══ SECTION: WORKING CAPITAL ════════════════════════════════════════
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

  // ═══ SECTION: FUNDING & CASH ═════════════════════════════════════════
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

  // ═══ SECTION: DEBT & INTEREST ════════════════════════════════════════
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

  // ═══ SECTION: VALUATION ══════════════════════════════════════════════
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

  // ═══ SECTION: TAX ════════════════════════════════════════════════════
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

  // ═══ SECTION: EXIT ═══════════════════════════════════════════════════
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

/** Session 2a: Get driver fields applicable to a specific business sub-type */
export function getDriverFieldsForSubType(subType: BusinessTypeSub): AssumptionDefinition[] {
  return ASSUMPTIONS.filter((a) => a.applicableBusinessSubTypes?.includes(subType))
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
