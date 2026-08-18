// Types for the memo generator system
// v1 supports investor audience only. Founder and advisor audiences come in v2 and v3.

export type MemoAudience = "investor" | "board" | "founder" | "advisor"

export interface InvestorMemo {
  executiveSummary: {
    businessOneLiner: string
    financialPunchline: string
    ask: string | null // null when the model is not for a fundraise
  }
  businessSnapshot: {
    sector: string
    subSector: string
    stage: string
    location: string
    currentState: string
    modelArchetype: string
  }
  financialHighlights: {
    metricsTable: MetricRow[]
    narrative: string
  }
  benchmarkComparison: BenchmarkRow[]
  /** Present only when the model has upside or downside cases computed. */
  scenarioComparison?: ScenarioComparison | null
  assumptions: {
    keyAssumptions: KeyAssumption[]
  }
  sensitivity: {
    topSensitivities: SensitivityItem[]
    revenueRange: {
      bear: string
      base: string
      bull: string
    }
  }
  risks: Risk[]
  capitalAsk: CapitalAsk | null // null when the model is not for a fundraise
  // Metadata added server-side after LLM response parsed
  generatedAt: string
  modelId: string
}

export interface MetricRow {
  metric: string
  y1: string
  y2: string
  y3: string
}

export interface BenchmarkRow {
  metric: string
  thisModel: string
  benchmark: string
  delta: "In range" | "Above" | "Below"
  /** Named source for the benchmark figure, e.g. "Beauhurst UK Startup Report 2024" */
  source?: string
}

export interface KeyAssumption {
  assumption: string
  value: string
  rationale: string
  benchmarkContext: string
}

export interface SensitivityItem {
  variable: string
  impact: string
}

export interface Risk {
  risk: string
  mitigation: string
}

export interface CapitalAsk {
  roundSize: string
  useOfFunds: string[]
  runway: string
  nextMilestone: string
}

// API contract
export interface MemoGenerateRequest {
  modelId: string
  audience?: MemoAudience // defaults to "investor" if omitted
}

export interface MemoGenerateResponse {
  memo: InvestorMemo
  audience: MemoAudience
  generatedAt: string
}

export interface MemoGenerateErrorResponse {
  error: string
  detail?: string
  rawText?: string // included when JSON parsing fails, so you can debug
}

export interface ScenarioCaseSummary {
  /** "Upside" or "Downside". */
  label: string
  /** What was changed from base, in plain language. */
  inputsChanged: string
  /** Equity value under this case, formatted with currency. */
  equityValue: string
  /** The single most consequential movement, named with figures. */
  keyMovement: string
}

export interface ScenarioComparison {
  /** What the spread means for the raise. The part a spreadsheet cannot produce. */
  narrative: string
  cases: ScenarioCaseSummary[]
}

// ── Board pack ──────────────────────────────────────────────────────────
// Second memo audience. Answers "how are we doing and what needs deciding",
// where the investor memo answers "is this worth backing".

export interface BoardVarianceRow {
  metric: string
  actual: string
  plan: string
  variance: string
  /** "Ahead", "Behind" or "In line" — direction already interpreted. */
  status: string
  /** Why it moved. One sentence, specific, no filler. */
  commentary: string
}

export interface BoardDecision {
  decision: string
  context: string
  /** What happens if the board does nothing this cycle. */
  ifDeferred: string
}

export interface BoardWatchItem {
  item: string
  detail: string
}

export interface BoardPack {
  /** One paragraph a chair could read aloud to open the meeting. */
  headline: string
  periodLabel: string
  /** True when no actuals exist and this is a plan-only pack. */
  planOnly: boolean
  performance: {
    narrative: string
    rows: BoardVarianceRow[]
  }
  cashPosition: {
    closingCash: string
    runway: string
    narrative: string
  }
  watchItems: BoardWatchItem[]
  decisions: BoardDecision[]
  generatedAt: string
  modelId: string
}
