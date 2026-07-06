// ============================================================
// FinModels UK — Goal-Driven Path
// Maps business goals → recommended model types
// Used in the goal selection screen (Step 0) for
// non-financial / startup users
// ============================================================

export type BusinessGoal = {
  id: string
  icon: string
  title: string
  description: string
  whoItSuits: string
  recommendedModels: string[]
  primaryModel: string
  questionnaireFocus: string[]
}

export const BUSINESS_GOALS: BusinessGoal[] = [
  {
    id: "raise_investment",
    icon: "💰",
    title: "Raise investment or funding",
    description:
      "I need a financial model to present to investors, a bank, or an accelerator to secure funding for my business.",
    whoItSuits: "Pre-seed, seed and Series A founders seeking equity or debt funding",
    recommendedModels: ["Pre-revenue Startup DCF", "3-Statement Financial Model"],
    primaryModel: "pre_revenue_dcf",
    questionnaireFocus: [
      "Revenue projections and growth assumptions",
      "Funding requirements and runway",
      "Valuation and exit assumptions",
      "Key unit economics (CAC, LTV, churn)",
    ],
  },
  {
    id: "validate_idea",
    icon: "🔍",
    title: "Validate my business idea",
    description:
      "I want to know if my idea is financially viable — can it make money, and what does the path to profitability look like?",
    whoItSuits: "Early-stage founders testing assumptions before committing resources",
    recommendedModels: ["Pre-revenue Startup DCF", "SaaS Financial Model"],
    primaryModel: "pre_revenue_dcf",
    questionnaireFocus: [
      "Revenue model and pricing assumptions",
      "Cost structure and break-even point",
      "Customer acquisition assumptions",
      "Scenario planning (base, bear, bull)",
    ],
  },
  {
    id: "plan_first_year",
    icon: "📅",
    title: "Plan my first year of operations",
    description:
      "I'm launching soon and need a detailed financial plan covering costs, cash flow and hiring for Year 1.",
    whoItSuits: "Founders about to launch who need an operational budget and cash plan",
    recommendedModels: ["3-Statement Financial Model", "Pre-revenue Startup DCF"],
    primaryModel: "three_statement",
    questionnaireFocus: [
      "Monthly cost breakdown and headcount",
      "Cash flow and burn rate",
      "Revenue ramp-up assumptions",
      "Working capital requirements",
    ],
  },
  {
    id: "plan_growth",
    icon: "📈",
    title: "Plan and model my growth",
    description:
      "My business is generating revenue and I want to model different growth scenarios to guide hiring and investment decisions.",
    whoItSuits: "Early-revenue founders planning their next 3–5 years of growth",
    recommendedModels: ["3-Statement Financial Model", "DCF Valuation Model"],
    primaryModel: "three_statement",
    questionnaireFocus: [
      "Revenue growth drivers and assumptions",
      "Headcount and OPEX scaling",
      "EBITDA margin trajectory",
      "Scenario analysis (conservative vs aggressive)",
    ],
  },
  {
    id: "prepare_exit",
    icon: "🚪",
    title: "Prepare for an exit or acquisition",
    description:
      "I'm considering selling my business or being acquired and need a valuation model to understand what it's worth.",
    whoItSuits: "Founders or owners exploring M&A, trade sale or management buyout",
    recommendedModels: ["DCF Valuation Model", "M&A / Merger Model", "LBO Model"],
    primaryModel: "dcf",
    questionnaireFocus: [
      "Historical and projected financials",
      "EBITDA and free cash flow",
      "Comparable company multiples",
      "Exit horizon and valuation assumptions",
    ],
  },
  {
    id: "pitch_to_bank",
    icon: "🏦",
    title: "Apply for a business loan",
    description:
      "I need a financial model to support a bank loan or government grant application showing repayment capacity.",
    whoItSuits: "SME owners applying for bank finance, CBILS, or grant funding",
    recommendedModels: ["3-Statement Financial Model", "DCF Valuation Model"],
    primaryModel: "three_statement",
    questionnaireFocus: [
      "Revenue and profitability projections",
      "Debt service coverage and repayment",
      "Asset base and working capital",
      "Cash flow forecasting",
    ],
  },
  {
    id: "understand_unit_economics",
    icon: "🔢",
    title: "Understand my unit economics",
    description:
      "I want to understand my CAC, LTV, payback period and whether my business model is fundamentally sound.",
    whoItSuits: "SaaS founders and subscription businesses analysing product economics",
    recommendedModels: ["SaaS Financial Model", "Pre-revenue Startup DCF"],
    primaryModel: "saas",
    questionnaireFocus: [
      "Customer acquisition cost (CAC)",
      "Lifetime value (LTV) and LTV:CAC ratio",
      "Churn rate and net revenue retention",
      "MRR/ARR waterfall and cohort analysis",
    ],
  },
  {
    id: "board_reporting",
    icon: "📊",
    title: "Build a board or investor report",
    description:
      "I need a professional financial model and dashboard to present to my board, co-founders or existing investors.",
    whoItSuits: "Founders with investors who need structured monthly or quarterly reporting",
    recommendedModels: ["3-Statement Financial Model", "DCF Valuation Model"],
    primaryModel: "three_statement",
    questionnaireFocus: [
      "KPI dashboard and revenue metrics",
      "Budget vs actual variance",
      "Rolling forecast and updated projections",
      "Cash position and runway",
    ],
  },
]

// Maps goal id → model type value used in the questionnaire
export const GOAL_TO_MODEL_TYPE: Record<string, string> = {
  raise_investment:        "pre_revenue_dcf",
  validate_idea:           "pre_revenue_dcf",
  plan_first_year:         "three_statement",
  plan_growth:             "three_statement",
  prepare_exit:            "dcf",
  pitch_to_bank:           "three_statement",
  understand_unit_economics: "saas",
  board_reporting:         "three_statement",
}

// Maps goal id → which questionnaire sections to emphasise
export const GOAL_EMPHASIS: Record<string, string[]> = {
  raise_investment:        ["revenue", "funding", "valuation", "unitEconomics"],
  validate_idea:           ["revenue", "costs", "unitEconomics"],
  plan_first_year:         ["costs", "headcount", "cashflow"],
  plan_growth:             ["revenue", "costs", "scenarios"],
  prepare_exit:            ["revenue", "ebitda", "valuation"],
  pitch_to_bank:           ["revenue", "costs", "cashflow", "debt"],
  understand_unit_economics: ["unitEconomics", "revenue"],
  board_reporting:         ["revenue", "costs", "kpis"],
}
