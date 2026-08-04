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
  currentValues?: Record<string, unknown>
}

export interface AISuggestionResult {
  value: number | string
  rationale: string
  confidence: "low" | "medium" | "high"
  source?: string
}

export interface AssumptionDefinition {
  key: string
  label: string
  shortLabel?: string
  description: string
  helpText?: string

  section: AssumptionSection
  step?: number
  applicableModels: ModelType[]
  applicableStages?: BusinessStage[]
  applicableIndustries?: string[]
  applicableBusinessSubTypes?: BusinessTypeSub[]

  type: AssumptionType
  required: boolean
  min?: number
  max?: number
  allowedValues?: string[]

  placeholder?: string
  suffix?: string
  prefix?: string

  cellName?: string
  excelFormat?: string

  defaultValue?: number | string
  getAISuggestion?: (ctx: AISuggestionContext) => AISuggestionResult

  benchmarkKey?: string

  audit?: {
    industryTypical?: string
    source?: string
    lastReviewed?: string
  }
}

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

  // ═══ SESSION 1: driver-based revenue foundation ═══════════════════════
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
    section: "revenue", step: 2, type: "number", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["saas_b2b"],
    min: 0,
  },
  {
    key: "saasB2b_newCustomersPerMonth",
    label: "New customers per month",
    description: "Average number of new paying customers acquired each month",
    section: "revenue", step: 2, type: "number", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["saas_b2b"],
    min: 0,
  },
  {
    key: "saasB2b_monthlyChurnRate",
    label: "Monthly churn rate",
    description: "Percentage of customers who cancel each month",
    section: "revenue", step: 2, type: "percentage", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["saas_b2b"],
    min: 0, max: 100, suffix: "%",
  },
  {
    key: "saasB2b_arpu",
    label: "ARPU per customer per month",
    description: "Average revenue per user per month",
    section: "revenue", step: 2, type: "currency", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["saas_b2b"],
    min: 0,
  },
  {
    key: "saasB2b_expansionRevenuePct",
    label: "Expansion revenue %",
    description: "Additional revenue from existing customers (upsells, seat expansion) as % of base",
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
    section: "revenue", step: 2, type: "number", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["ecom_d2c"],
    min: 0,
  },
  {
    key: "ecomD2c_conversionRate",
    label: "Conversion rate",
    description: "Percentage of sessions that result in a purchase",
    section: "revenue", step: 2, type: "percentage", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["ecom_d2c"],
    min: 0, max: 100, suffix: "%",
    defaultValue: 2.5,
  },
  {
    key: "ecomD2c_averageOrderValue",
    label: "Average order value (AOV)",
    description: "Average revenue per order",
    section: "revenue", step: 2, type: "currency", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["ecom_d2c"],
    min: 0,
  },
  {
    key: "ecomD2c_repeatPurchaseRate",
    label: "Repeat purchase rate",
    description: "Percentage of customers who purchase again within 12 months",
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
    section: "revenue", step: 2, type: "number", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["services_professional"],
    min: 0,
  },
  {
    key: "svcProf_billableHoursPerMonth",
    label: "Billable hours per staff per month",
    description: "Target billable hours per person per month (before utilization)",
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
    section: "revenue", step: 2, type: "percentage", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["services_professional"],
    min: 0, max: 100, suffix: "%",
    defaultValue: 70,
  },
  {
    key: "svcProf_hourlyRate",
    label: "Blended hourly rate",
    description: "Average billed hourly rate across all staff levels",
    section: "revenue", step: 2, type: "currency", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["services_professional"],
    min: 0,
  },

  // ═══ SESSION 3a: Product + Real Estate ═══════════════════════════════
  // ─── Product Manufacturing ───────────────────────────────────────────
  {
    key: "productMfg_unitsPerMonth", label: "Units produced per month",
    description: "Total units manufactured per month at full production",
    section: "revenue", step: 2, type: "number", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["product_manufacturing"], min: 0,
  },
  {
    key: "productMfg_unitPrice", label: "Unit selling price",
    description: "Average selling price per unit (before discounts)",
    section: "revenue", step: 2, type: "currency", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["product_manufacturing"], min: 0,
  },
  {
    key: "productMfg_capacityUtilization", label: "Capacity utilization",
    description: "Percentage of maximum manufacturing capacity actually used",
    section: "revenue", step: 2, type: "percentage", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["product_manufacturing"],
    min: 0, max: 100, suffix: "%", defaultValue: 75,
  },
  {
    key: "productMfg_sellThroughRate", label: "Sell-through rate",
    description: "Percentage of produced units actually sold (vs held as inventory)",
    section: "revenue", step: 2, type: "percentage", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["product_manufacturing"],
    min: 0, max: 100, suffix: "%", defaultValue: 85,
  },

  // ─── Product Retail ──────────────────────────────────────────────────
  {
    key: "productRetail_storeCount", label: "Store count",
    description: "Number of physical retail locations",
    section: "revenue", step: 2, type: "number", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["product_retail"], min: 0,
  },
  {
    key: "productRetail_revenuePerStore", label: "Revenue per store per month",
    description: "Average monthly revenue per store",
    section: "revenue", step: 2, type: "currency", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["product_retail"], min: 0,
  },
  {
    key: "productRetail_sameSalesGrowth", label: "Same-store sales growth",
    description: "Year-over-year growth in revenue per store (like-for-like)",
    section: "revenue", step: 2, type: "percentage", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["product_retail"],
    min: -50, max: 100, suffix: "%", defaultValue: 3,
  },

  // ─── Product Wholesale ───────────────────────────────────────────────
  {
    key: "productWhsl_activeAccounts", label: "Active accounts",
    description: "Number of active buyer accounts (retailers, resellers, distributors)",
    section: "revenue", step: 2, type: "number", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["product_wholesale"], min: 0,
  },
  {
    key: "productWhsl_ordersPerAccount", label: "Orders per account per month",
    description: "Average number of orders each active account places per month",
    section: "revenue", step: 2, type: "number", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["product_wholesale"], min: 0,
  },
  {
    key: "productWhsl_averageOrderValue", label: "Average order value",
    description: "Average revenue per wholesale order",
    section: "revenue", step: 2, type: "currency", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["product_wholesale"], min: 0,
  },

  // ─── Real Estate Development ─────────────────────────────────────────
  {
    key: "reDev_unitsBuiltYear", label: "Units built per year",
    description: "Number of dwelling/commercial units completed per year",
    section: "revenue", step: 2, type: "number", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["realestate_development"], min: 0,
  },
  {
    key: "reDev_averageSellingPrice", label: "Average selling price per unit",
    description: "Average sale price achieved per completed unit",
    section: "revenue", step: 2, type: "currency", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["realestate_development"], min: 0,
  },
  {
    key: "reDev_sellThroughMonths", label: "Sell-through period (months)",
    description: "Average months from completion to sale",
    section: "revenue", step: 2, type: "number", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["realestate_development"],
    min: 0, max: 60, defaultValue: 9,
  },
  {
    key: "reDev_grossMargin", label: "Gross development margin",
    description: "Gross profit as % of gross development value",
    section: "revenue", step: 2, type: "percentage", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["realestate_development"],
    min: 0, max: 60, suffix: "%", defaultValue: 20,
  },

  // ─── Real Estate Rental ──────────────────────────────────────────────
  {
    key: "reRent_rentableUnits", label: "Rentable units",
    description: "Total number of rentable units in portfolio",
    section: "revenue", step: 2, type: "number", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["realestate_rental"], min: 0,
  },
  {
    key: "reRent_monthlyRent", label: "Monthly rent per unit",
    description: "Average monthly rent achieved per unit",
    section: "revenue", step: 2, type: "currency", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["realestate_rental"], min: 0,
  },
  {
    key: "reRent_occupancyRate", label: "Occupancy rate",
    description: "Percentage of units occupied by paying tenants",
    section: "revenue", step: 2, type: "percentage", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["realestate_rental"],
    min: 0, max: 100, suffix: "%", defaultValue: 92,
  },
  {
    key: "reRent_otherIncomePct", label: "Other income %",
    description: "Additional income (parking, storage, service charges) as % of rent",
    section: "revenue", step: 2, type: "percentage", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["realestate_rental"],
    min: 0, max: 100, suffix: "%", defaultValue: 8,
  },

  // ─── Real Estate Agency ──────────────────────────────────────────────
  {
    key: "reAgcy_monthlyTransactions", label: "Monthly transactions",
    description: "Average number of completed transactions (sales + lets) per month",
    section: "revenue", step: 2, type: "number", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["realestate_agency"], min: 0,
  },
  {
    key: "reAgcy_averageTransactionValue", label: "Average transaction value",
    description: "Average sale/let value per transaction",
    section: "revenue", step: 2, type: "currency", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["realestate_agency"], min: 0,
  },
  {
    key: "reAgcy_commissionRate", label: "Commission rate",
    description: "Commission as % of transaction value",
    section: "revenue", step: 2, type: "percentage", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["realestate_agency"],
    min: 0, max: 30, suffix: "%", defaultValue: 2,
  },

  // ─── Real Estate REIT ────────────────────────────────────────────────
  {
    key: "reReit_portfolioProperties", label: "Portfolio properties",
    description: "Number of properties held in the fund",
    section: "revenue", step: 2, type: "number", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["realestate_reit"], min: 0,
  },
  {
    key: "reReit_averageYield", label: "Average property yield",
    description: "Blended net rental yield across the portfolio",
    section: "revenue", step: 2, type: "percentage", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["realestate_reit"],
    min: 0, max: 20, suffix: "%", defaultValue: 5,
  },
  {
    key: "reReit_navGrowth", label: "NAV growth (annual)",
    description: "Expected annual growth in net asset value from capital appreciation",
    section: "revenue", step: 2, type: "percentage", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["realestate_reit"],
    min: -20, max: 30, suffix: "%", defaultValue: 3,
  },

  // ─── Real Estate Short-term Rental ───────────────────────────────────
  {
    key: "reStr_rentableUnits", label: "Rentable units / rooms",
    description: "Number of rooms/properties available for short-term letting",
    section: "revenue", step: 2, type: "number", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["realestate_shorttermrental"], min: 0,
  },
  {
    key: "reStr_averageNightlyRate", label: "Average nightly rate",
    description: "Average nightly rate achieved (blended peak / off-peak)",
    section: "revenue", step: 2, type: "currency", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["realestate_shorttermrental"], min: 0,
  },
  {
    key: "reStr_occupancyRate", label: "Occupancy rate",
    description: "Percentage of nights booked (nights booked / nights available)",
    section: "revenue", step: 2, type: "percentage", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["realestate_shorttermrental"],
    min: 0, max: 100, suffix: "%", defaultValue: 55,
  },
  {
    key: "reStr_cleaningFeePerBooking", label: "Cleaning fee per booking",
    description: "Average cleaning/service fee charged per booking (revenue passed to host)",
    section: "revenue", step: 2, type: "currency", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["realestate_shorttermrental"], min: 0,
  },

  // ═══ SESSION 3b: Healthcare + Education ══════════════════════════════
  // ─── Healthcare Clinic ───────────────────────────────────────────────
  {
    key: "healthClinic_patientVisitsPerMonth", label: "Patient visits per month",
    description: "Total patient consultations/visits across all providers per month",
    section: "revenue", step: 2, type: "number", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["health_clinic"], min: 0,
  },
  {
    key: "healthClinic_averageFeePerVisit", label: "Average fee per visit",
    description: "Blended revenue per patient visit",
    section: "revenue", step: 2, type: "currency", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["health_clinic"], min: 0,
  },
  {
    key: "healthClinic_providerCount", label: "Provider count",
    description: "Number of clinicians/specialists providing billable care",
    section: "revenue", step: 2, type: "number", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["health_clinic"], min: 0,
  },
  {
    key: "healthClinic_retentionRate", label: "Patient retention rate",
    description: "Percentage of patients who return within 12 months",
    section: "revenue", step: 2, type: "percentage", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["health_clinic"],
    min: 0, max: 100, suffix: "%", defaultValue: 70,
  },

  // ─── Healthcare Hospital ─────────────────────────────────────────────
  {
    key: "healthHosp_bedCount", label: "Bed count",
    description: "Total inpatient beds available",
    section: "revenue", step: 2, type: "number", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["health_hospital"], min: 0,
  },
  {
    key: "healthHosp_occupancyRate", label: "Occupancy rate",
    description: "Percentage of beds occupied on average",
    section: "revenue", step: 2, type: "percentage", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["health_hospital"],
    min: 0, max: 100, suffix: "%", defaultValue: 70,
  },
  {
    key: "healthHosp_averageDailyRate", label: "Average daily rate per bed",
    description: "Blended revenue per occupied bed per day",
    section: "revenue", step: 2, type: "currency", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["health_hospital"], min: 0,
  },
  {
    key: "healthHosp_ancillaryRevenuePct", label: "Ancillary revenue %",
    description: "Non-bed revenue (imaging, labs, pharmacy, outpatient) as % of bed revenue",
    section: "revenue", step: 2, type: "percentage", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["health_hospital"],
    min: 0, max: 200, suffix: "%", defaultValue: 40,
  },

  // ─── Healthcare Device ───────────────────────────────────────────────
  {
    key: "healthDev_unitsSoldPerQuarter", label: "Units sold per quarter",
    description: "Devices sold per quarter (steady-state)",
    section: "revenue", step: 2, type: "number", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["health_device"], min: 0,
  },
  {
    key: "healthDev_unitPrice", label: "Unit selling price",
    description: "Average price per device sold",
    section: "revenue", step: 2, type: "currency", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["health_device"], min: 0,
  },
  {
    key: "healthDev_serviceRevenuePct", label: "Service revenue %",
    description: "Recurring service/maintenance/consumables revenue as % of hardware revenue",
    section: "revenue", step: 2, type: "percentage", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["health_device"],
    min: 0, max: 200, suffix: "%", defaultValue: 30,
  },
  {
    key: "healthDev_installBase", label: "Installed base (units)",
    description: "Cumulative devices installed at customer sites",
    section: "revenue", step: 2, type: "number", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["health_device"], min: 0,
  },

  // ─── Healthcare SaaS ─────────────────────────────────────────────────
  {
    key: "healthSaas_startingCustomers", label: "Starting customer count",
    description: "Number of paying customers (clinics/hospitals/patients) at model start",
    section: "revenue", step: 2, type: "number", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["health_saas"], min: 0,
  },
  {
    key: "healthSaas_newCustomersPerMonth", label: "New customers per month",
    description: "Average new paying customers acquired each month",
    section: "revenue", step: 2, type: "number", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["health_saas"], min: 0,
  },
  {
    key: "healthSaas_arpu", label: "ARPU per customer per month",
    description: "Average monthly revenue per customer",
    section: "revenue", step: 2, type: "currency", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["health_saas"], min: 0,
  },
  {
    key: "healthSaas_monthlyChurnRate", label: "Monthly churn rate",
    description: "Percentage of customers who cancel each month",
    section: "revenue", step: 2, type: "percentage", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["health_saas"],
    min: 0, max: 100, suffix: "%", defaultValue: 1.5,
  },

  // ─── Healthcare Pharmacy ─────────────────────────────────────────────
  {
    key: "healthPharm_dailyFootfall", label: "Daily footfall",
    description: "Average unique visitors per day",
    section: "revenue", step: 2, type: "number", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["health_pharmacy"], min: 0,
  },
  {
    key: "healthPharm_conversionRate", label: "Conversion rate",
    description: "Percentage of visitors who make a purchase",
    section: "revenue", step: 2, type: "percentage", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["health_pharmacy"],
    min: 0, max: 100, suffix: "%", defaultValue: 70,
  },
  {
    key: "healthPharm_basketSize", label: "Average basket size",
    description: "Average revenue per transaction",
    section: "revenue", step: 2, type: "currency", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["health_pharmacy"], min: 0,
  },
  {
    key: "healthPharm_prescriptionRevenuePct", label: "Prescription revenue %",
    description: "NHS/private prescription revenue as % of total",
    section: "revenue", step: 2, type: "percentage", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["health_pharmacy"],
    min: 0, max: 100, suffix: "%", defaultValue: 70,
  },

  // ─── Education Institution ───────────────────────────────────────────
  {
    key: "eduInst_enrolledStudents", label: "Enrolled students",
    description: "Total students currently enrolled",
    section: "revenue", step: 2, type: "number", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["edu_institution"], min: 0,
  },
  {
    key: "eduInst_tuitionPerStudent", label: "Tuition per student per year",
    description: "Average annual tuition revenue per enrolled student",
    section: "revenue", step: 2, type: "currency", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["edu_institution"], min: 0,
  },
  {
    key: "eduInst_capacity", label: "Capacity (max students)",
    description: "Maximum students the institution can serve at full capacity",
    section: "revenue", step: 2, type: "number", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["edu_institution"], min: 0,
  },
  {
    key: "eduInst_retentionRate", label: "Student retention rate",
    description: "Percentage of students who continue year-over-year",
    section: "revenue", step: 2, type: "percentage", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["edu_institution"],
    min: 0, max: 100, suffix: "%", defaultValue: 90,
  },

  // ─── Education EdTech ────────────────────────────────────────────────
  {
    key: "eduTech_monthlySignups", label: "Monthly signups",
    description: "New free or paid user signups per month",
    section: "revenue", step: 2, type: "number", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["edu_edtech"], min: 0,
  },
  {
    key: "eduTech_paidConversionRate", label: "Free-to-paid conversion rate",
    description: "Percentage of signups who become paying users",
    section: "revenue", step: 2, type: "percentage", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["edu_edtech"],
    min: 0, max: 100, suffix: "%", defaultValue: 3,
  },
  {
    key: "eduTech_arpu", label: "ARPU per paid user per month",
    description: "Average monthly revenue per paying user",
    section: "revenue", step: 2, type: "currency", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["edu_edtech"], min: 0,
  },
  {
    key: "eduTech_monthlyChurnRate", label: "Monthly churn rate",
    description: "Percentage of paying users who cancel each month",
    section: "revenue", step: 2, type: "percentage", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["edu_edtech"],
    min: 0, max: 100, suffix: "%", defaultValue: 8,
  },

  // ─── Education Tutoring ──────────────────────────────────────────────
  {
    key: "eduTut_activeStudents", label: "Active students",
    description: "Number of students currently taking tutoring sessions",
    section: "revenue", step: 2, type: "number", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["edu_tutoring"], min: 0,
  },
  {
    key: "eduTut_sessionsPerStudentPerMonth", label: "Sessions per student per month",
    description: "Average tutoring sessions each active student takes per month",
    section: "revenue", step: 2, type: "number", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["edu_tutoring"],
    min: 0, defaultValue: 4,
  },
  {
    key: "eduTut_pricePerSession", label: "Price per session",
    description: "Average revenue per tutoring session",
    section: "revenue", step: 2, type: "currency", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["edu_tutoring"], min: 0,
  },

  // ─── Education Corporate Training ────────────────────────────────────
  {
    key: "eduCorp_enterpriseContracts", label: "Enterprise contracts",
    description: "Number of active corporate customer contracts",
    section: "revenue", step: 2, type: "number", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["edu_corptraining"], min: 0,
  },
  {
    key: "eduCorp_averageContractValue", label: "Average contract value (annual)",
    description: "Blended annual revenue per enterprise contract",
    section: "revenue", step: 2, type: "currency", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["edu_corptraining"], min: 0,
  },
  {
    key: "eduCorp_retentionRate", label: "Annual retention rate",
    description: "Percentage of contracts renewed year-over-year",
    section: "revenue", step: 2, type: "percentage", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["edu_corptraining"],
    min: 0, max: 100, suffix: "%", defaultValue: 80,
  },
  {
    key: "eduCorp_expansionPct", label: "Expansion revenue %",
    description: "Additional revenue from existing accounts (seats added, modules upsold) as % of base",
    section: "revenue", step: 2, type: "percentage", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["edu_corptraining"],
    min: 0, max: 100, suffix: "%", defaultValue: 10,
  },

  // ═══ SESSION 3c: Remaining SaaS + E-com + Services + Hospitality ═════

  // ─── SaaS B2C ────────────────────────────────────────────────────────
  {
    key: "saasB2c_monthlySignups", label: "Monthly signups",
    description: "New user signups per month (free or paid)",
    helpText: "For B2C SaaS driver mode. Includes both free trial and direct paid signups.",
    section: "revenue", step: 2, type: "number", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["saas_b2c"], min: 0,
  },
  {
    key: "saasB2c_paidConversionRate", label: "Free-to-paid conversion rate",
    description: "Percentage of signups who become paying users",
    helpText: "Consumer SaaS freemium: 2-5% typical. Trial-to-paid: 15-30%.",
    section: "revenue", step: 2, type: "percentage", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["saas_b2c"],
    min: 0, max: 100, suffix: "%", defaultValue: 4,
  },
  {
    key: "saasB2c_arpu", label: "ARPU per paid user per month",
    description: "Average monthly revenue per paying user",
    helpText: "Consumer SaaS: £5-25/mo typical. Premium/prosumer: £25-100/mo.",
    section: "revenue", step: 2, type: "currency", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["saas_b2c"], min: 0,
  },
  {
    key: "saasB2c_monthlyChurnRate", label: "Monthly churn rate",
    description: "Percentage of paying users who cancel each month",
    helpText: "Consumer SaaS: 5-8% monthly typical. Best-in-class: 3-5%.",
    section: "revenue", step: 2, type: "percentage", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["saas_b2c"],
    min: 0, max: 100, suffix: "%", defaultValue: 6,
  },
  {
    key: "saasB2c_viralCoefficient", label: "Viral coefficient (K-factor)",
    description: "New users generated per existing user (0 = no virality, 1 = self-sustaining)",
    helpText: "Most B2C SaaS: 0-0.3. Strong network effects: 0.3-0.7. Viral hits: 0.7+.",
    section: "revenue", step: 2, type: "number", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["saas_b2c"],
    min: 0, max: 5, defaultValue: 0.1,
  },

  // ─── SaaS Usage-based ────────────────────────────────────────────────
  {
    key: "saasUsage_activeAccounts", label: "Active accounts",
    description: "Number of customer accounts consuming the service",
    helpText: "For usage-based SaaS driver mode. Accounts with at least one paid unit last month.",
    section: "revenue", step: 2, type: "number", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["saas_usage"], min: 0,
  },
  {
    key: "saasUsage_avgUnitsPerAccountPerMonth", label: "Avg units per account per month",
    description: "Average consumption unit count per account per month",
    helpText: "Units are the primary billing metric (API calls, GB, seats, transactions).",
    section: "revenue", step: 2, type: "number", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["saas_usage"], min: 0,
  },
  {
    key: "saasUsage_pricePerUnit", label: "Price per unit",
    description: "Revenue per billable unit",
    helpText: "Blended across pricing tiers. Ignore rate-card discounts.",
    section: "revenue", step: 2, type: "currency", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["saas_usage"], min: 0,
  },
  {
    key: "saasUsage_monthlyAccountChurnRate", label: "Monthly account churn rate",
    description: "Percentage of accounts that stop consuming each month",
    helpText: "Usage-based SaaS: 3-6% monthly typical. Enterprise usage: 1-3%.",
    section: "revenue", step: 2, type: "percentage", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["saas_usage"],
    min: 0, max: 100, suffix: "%", defaultValue: 4,
  },

  // ─── E-commerce Marketplace ──────────────────────────────────────────
  {
    key: "ecomMkt_monthlyGmv", label: "Monthly GMV",
    description: "Gross merchandise value transacted per month",
    helpText: "For marketplace driver mode. Total value of goods/services sold, not commission.",
    section: "revenue", step: 2, type: "currency", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["ecom_marketplace"], min: 0,
  },
  {
    key: "ecomMkt_takeRate", label: "Take rate",
    description: "Marketplace commission as % of GMV",
    helpText: "eBay: ~10-12%. Etsy: ~7%. Uber Eats: ~20-30%. Airbnb: ~13-15%.",
    section: "revenue", step: 2, type: "percentage", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["ecom_marketplace"],
    min: 0, max: 50, suffix: "%", defaultValue: 10,
  },
  {
    key: "ecomMkt_activeSellers", label: "Active sellers",
    description: "Number of sellers with at least one transaction last month",
    section: "revenue", step: 2, type: "number", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["ecom_marketplace"], min: 0,
  },
  {
    key: "ecomMkt_transactionsPerSellerPerMonth", label: "Transactions per seller per month",
    description: "Average transaction count per active seller per month",
    section: "revenue", step: 2, type: "number", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["ecom_marketplace"], min: 0,
  },

  // ─── Services Agency (marketing, creative) ───────────────────────────
  {
    key: "svcAgcy_retainedClients", label: "Retained clients",
    description: "Number of clients on recurring retainer contracts",
    helpText: "For agency driver mode. Long-term recurring clients (not project-only).",
    section: "revenue", step: 2, type: "number", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["services_agency"], min: 0,
  },
  {
    key: "svcAgcy_arpaPerMonth", label: "ARPA per month",
    description: "Average revenue per retained account per month",
    helpText: "Boutique agency retainers: £3k-£15k/mo. Mid-market: £15k-£50k/mo. Large: £50k+/mo.",
    section: "revenue", step: 2, type: "currency", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["services_agency"], min: 0,
  },
  {
    key: "svcAgcy_newProjectsPerMonth", label: "New projects per month",
    description: "Average number of new one-off projects won per month",
    helpText: "Excludes recurring retainer work. Fresh project engagements only.",
    section: "revenue", step: 2, type: "number", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["services_agency"], min: 0,
  },
  {
    key: "svcAgcy_averageProjectValue", label: "Average project value",
    description: "Average revenue per project",
    helpText: "Small project: £3k-£15k. Mid: £15k-£75k. Large: £75k+.",
    section: "revenue", step: 2, type: "currency", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["services_agency"], min: 0,
  },

  // ─── Services Freelance ──────────────────────────────────────────────
  {
    key: "svcFree_chargeableHoursPerWeek", label: "Chargeable hours per week",
    description: "Billable hours you plan to bill per week",
    helpText: "For freelance driver mode. Realistic max is ~30-35 hrs/wk after admin/sales/leave.",
    section: "revenue", step: 2, type: "number", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["services_freelance"],
    min: 0, max: 60, defaultValue: 25,
  },
  {
    key: "svcFree_weeklyRate", label: "Weekly rate",
    description: "Blended weekly revenue at target chargeable hours",
    helpText: "Alternative: enter hourly × chargeable hours. £2k-£5k/wk typical for UK contractors.",
    section: "revenue", step: 2, type: "currency", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["services_freelance"], min: 0,
  },
  {
    key: "svcFree_weeksWorkedPerYear", label: "Weeks worked per year",
    description: "Actual working weeks after holiday, sickness, gaps",
    helpText: "Realistic solo: 42-46 weeks/year (accounts for holiday, gaps between contracts).",
    section: "revenue", step: 2, type: "number", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["services_freelance"],
    min: 0, max: 52, defaultValue: 44,
  },

  // ─── Hospitality Restaurant ──────────────────────────────────────────
  {
    key: "hospRest_seatCount", label: "Seat count",
    description: "Total dining seats available",
    helpText: "For restaurant driver mode. Actual seats in service, not maximum capacity.",
    section: "revenue", step: 2, type: "number", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["hosp_restaurant"], min: 0,
  },
  {
    key: "hospRest_tableTurnsPerDay", label: "Table turns per day",
    description: "Average number of times each seat is filled per operating day",
    helpText: "Casual dining: 2-3 turns. Quick-service: 4-6 turns. Fine dining: 1-1.5 turns.",
    section: "revenue", step: 2, type: "number", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["hosp_restaurant"],
    min: 0, max: 20, defaultValue: 2.5,
  },
  {
    key: "hospRest_averageSpendPerCover", label: "Average spend per cover",
    description: "Blended revenue per customer (food + drink)",
    helpText: "UK casual: £15-25. Mid-range: £25-50. Fine dining: £75-200+.",
    section: "revenue", step: 2, type: "currency", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["hosp_restaurant"], min: 0,
  },
  {
    key: "hospRest_operatingDaysPerYear", label: "Operating days per year",
    description: "Actual days open for service per year",
    helpText: "Typical: 340-360 days (allows for closures, holidays). 7-day operations: closer to 365.",
    section: "revenue", step: 2, type: "number", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["hosp_restaurant"],
    min: 0, max: 365, defaultValue: 350,
  },

  // ─── Hospitality Hotel ───────────────────────────────────────────────
  {
    key: "hospHotel_roomCount", label: "Room count",
    description: "Total lettable rooms",
    helpText: "For hotel driver mode. Bed count differs — use room count for RevPAR-based math.",
    section: "revenue", step: 2, type: "number", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["hosp_hotel"], min: 0,
  },
  {
    key: "hospHotel_occupancyRate", label: "Occupancy rate",
    description: "Percentage of rooms occupied on average",
    helpText: "UK regional: 65-75%. London: 75-85%. Boutique: varies widely.",
    section: "revenue", step: 2, type: "percentage", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["hosp_hotel"],
    min: 0, max: 100, suffix: "%", defaultValue: 72,
  },
  {
    key: "hospHotel_averageDailyRate", label: "Average daily rate (ADR)",
    description: "Blended revenue per occupied room per night",
    helpText: "UK budget: £70-100. Mid-scale: £100-180. Luxury: £250-800+.",
    section: "revenue", step: 2, type: "currency", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["hosp_hotel"], min: 0,
  },
  {
    key: "hospHotel_foodBeverageRevenuePct", label: "F&B revenue %",
    description: "Food & beverage revenue as % of room revenue",
    helpText: "Room-only hotels: 5-15%. Mid-scale with restaurant: 25-40%. Full-service/resort: 40-70%.",
    section: "revenue", step: 2, type: "percentage", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["hosp_hotel"],
    min: 0, max: 200, suffix: "%", defaultValue: 30,
  },

  // ─── Hospitality Catering / Events ───────────────────────────────────
  {
    key: "hospCater_eventsPerMonth", label: "Events per month",
    description: "Average number of catered events per month",
    helpText: "For catering driver mode. Includes weddings, corporate, private, all sizes.",
    section: "revenue", step: 2, type: "number", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["hosp_catering"], min: 0,
  },
  {
    key: "hospCater_averageEventValue", label: "Average event value",
    description: "Blended revenue per event",
    helpText: "Small corporate lunch: £500-2k. Wedding: £5k-25k. Large gala: £25k+.",
    section: "revenue", step: 2, type: "currency", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["hosp_catering"], min: 0,
  },
  {
    key: "hospCater_growthRate", label: "Growth rate (annual)",
    description: "Expected year-over-year growth in event volume",
    helpText: "Established caterers: 5-15% typical. Early stage: 30-100%+.",
    section: "revenue", step: 2, type: "percentage", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "lbo", "saas", "ma"],
    applicableBusinessSubTypes: ["hosp_catering"],
    min: -50, max: 300, suffix: "%", defaultValue: 15,
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
    section: "revenue", step: 2, type: "percentage", required: false,
    applicableModels: ["dcf", "three_statement", "pre_revenue_dcf", "saas"],
    cellName: "in_growthY1", excelFormat: "0.0%",
    min: -50, max: 500, suffix: "%",
    benchmarkKey: "revenueGrowthY1",
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
  },
  {
    key: "churnRate",
    label: "Annual customer churn",
    description: "Annual percentage of customers who leave",
    section: "revenue", step: 2, type: "percentage", required: false,
    applicableModels: ["saas", "pre_revenue_dcf"],
    cellName: "in_churnRate", excelFormat: "0.0%",
    min: 0, max: 100, suffix: "%",
  },

  // ═══ SECTION: COST STRUCTURE ═════════════════════════════════════════
  {
    key: "grossMargin",
    label: "Gross margin",
    description: "Gross profit as % of revenue",
    section: "costs", step: 3, type: "percentage", required: true,
    applicableModels: ["dcf", "three_statement", "lbo", "saas", "ma"],
    cellName: "in_grossMargin", excelFormat: "0.0%",
    min: 0, max: 100, defaultValue: 70, suffix: "%",
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
    section: "costs", step: 3, type: "percentage", required: false,
    applicableModels: ["dcf", "three_statement", "lbo", "saas"],
    cellName: "in_marketingPct", excelFormat: "0.0%",
    min: 0, max: 100, suffix: "%",
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
    section: "debt", step: 4, type: "percentage", required: false,
    applicableModels: ["dcf", "three_statement", "lbo"],
    cellName: "in_interestRate", excelFormat: "0.00%",
    min: 0, max: 30, defaultValue: 8, suffix: "%",
  },

  // ═══ SECTION: VALUATION ══════════════════════════════════════════════
  {
    key: "discountRate",
    label: "Discount rate / WACC",
    description: "Weighted average cost of capital for DCF discounting",
    section: "valuation", step: 5, type: "percentage", required: true,
    applicableModels: ["dcf", "pre_revenue_dcf", "lbo", "ma"],
    cellName: "in_discountRate", excelFormat: "0.00%",
    min: 0, max: 50, defaultValue: 15, suffix: "%",
  },
  {
    key: "terminalGrowthRate",
    label: "Terminal growth rate",
    description: "Perpetual growth rate after projection period",
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
  },
]

// -- HELPER FUNCTIONS ----------------------------------------------------

export function getAssumptionsForModel(modelType: ModelType): AssumptionDefinition[] {
  return ASSUMPTIONS.filter((a) => a.applicableModels.includes(modelType))
}

export function getAssumptionsBySection(section: AssumptionSection): AssumptionDefinition[] {
  return ASSUMPTIONS.filter((a) => a.section === section)
}

export function getAssumptionsByStep(step: number): AssumptionDefinition[] {
  return ASSUMPTIONS.filter((a) => a.step === step)
}

export function getAssumption(key: string): AssumptionDefinition | undefined {
  return ASSUMPTIONS.find((a) => a.key === key)
}

export function getExportableAssumptions(): AssumptionDefinition[] {
  return ASSUMPTIONS.filter((a) => a.cellName !== undefined)
}

export function getAISuggestion(
  key: string,
  ctx: AISuggestionContext
): AISuggestionResult | null {
  const assumption = getAssumption(key)
  if (!assumption?.getAISuggestion) return null
  return assumption.getAISuggestion(ctx)
}

export function groupBySection(assumptions: AssumptionDefinition[]): Record<AssumptionSection, AssumptionDefinition[]> {
  const grouped = {} as Record<AssumptionSection, AssumptionDefinition[]>
  assumptions.forEach((a) => {
    if (!grouped[a.section]) grouped[a.section] = []
    grouped[a.section].push(a)
  })
  return grouped
}

export function getDriverFieldsForSubType(subType: BusinessTypeSub): AssumptionDefinition[] {
  return ASSUMPTIONS.filter((a) => a.applicableBusinessSubTypes?.includes(subType))
}

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
