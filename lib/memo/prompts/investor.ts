import { buildBenchmarkReferenceBlock } from "@/lib/benchmarks/ranges"
// Prompt builder for the investor memo generator.
// Voice: analyst (flags divergence), not advocate. This is critical - marketing copy destroys credibility.

interface PromptContext {
  // Model input (from model_inputs table)
  step1: Record<string, unknown> // business info
  step2: Record<string, unknown> // revenue assumptions
  step3: Record<string, unknown> // costs assumptions
  step4: Record<string, unknown> // funding assumptions
  modelType: string
  // Model output (from model_outputs table, dcf_output or three_statement)
  summary: Record<string, unknown>
  pnl: Record<string, unknown>[]
  balanceSheet: Record<string, unknown>[]
  cashFlow: Record<string, unknown>[]
  scenarios: Record<string, Record<string, unknown>> | null
  sensitivity: Record<string, unknown> | null
  /** Pre-computed bridge text per case. Absent when no scenarios are defined. */
  scenarioBridge?: string | null
}

/**
 * Builds the LLM prompt for investor memo generation.
 * The prompt enforces analyst voice, structured JSON output, and UK-market context.
 * Fundraising context is inferred by the LLM from model_type + funding data,
 * not hardcoded - the LLM has richer context than a simple heuristic.
 */
export function buildInvestorMemoPrompt(ctx: PromptContext): string {
  const modelTypeLabel = ({
    dcf: "DCF Valuation Model",
    three_statement: "3-Statement Financial Model",
    pre_revenue_dcf: "Pre-Revenue Startup DCF",
    lbo: "LBO Model",
    saas: "SaaS Financial Model",
    ma: "M&A Model",
  } as Record<string, string>)[ctx.modelType] || "Financial Model"

  return `You are a senior financial analyst at a top-tier UK venture capital firm. A portfolio company has provided its financial model. Write an investor memo about it.

VOICE REQUIREMENTS (critical - do not deviate):
- Analyst tone, not advocate tone. Present findings; do not sell.
- Flag divergences from benchmarks explicitly. Aggressive assumptions are NOTED, not celebrated.
- Name risks proactively without softening them.
- Use precise financial language. AVOID marketing terms: "compelling", "revolutionary", "disruptive", "game-changing", "innovative", "cutting-edge", "next-generation".
- Cite specific numbers with units and time periods.
- Assume the reader has read the underlying model and needs analysis, not description.
- When numbers diverge from UK sector benchmarks, name the divergence and give the plausible reason. Do not defend or justify.
- Prefer "Y1 revenue growth of 250% is above UK Seed+ SaaS benchmark of 100-140%" over "impressive Y1 growth of 250%".

BUSINESS CONTEXT:
- Business name: ${ctx.step1.businessName ?? "Not specified"}
- Sector: ${ctx.step1.industry ?? "Unknown"}
- Sub-sector: ${ctx.step1.subSector ?? "Unknown"}
- Stage: ${ctx.step1.businessStage ?? "Unknown"}
- Country: ${ctx.step1.country ?? "United Kingdom"}
- Currency: ${ctx.step1.currency ?? "GBP"}
- Business description: ${ctx.step1.businessDescription ?? "Not provided"}
- Model type: ${modelTypeLabel}

FUNDRAISING DETECTION:
Determine whether this model is being built for a fundraise based on:
1. Model type - DCF, LBO, SaaS, and Pre-Revenue DCF are typically fundraising models
2. Funding assumptions - check if step4 contains fundingStage, targetRaise, or similar signals
3. Business stage - Pre-seed/Seed/Series A/B typically fundraising; Established typically not
If fundraising signals are present, populate the "ask" and "capitalAsk" sections. If not, set both to null.

FINANCIAL MODEL INPUT (assumptions the user submitted):
Revenue assumptions:
${JSON.stringify(ctx.step2, null, 2)}

Costs assumptions:
${JSON.stringify(ctx.step3, null, 2)}

Funding assumptions:
${JSON.stringify(ctx.step4, null, 2)}

FINANCIAL MODEL OUTPUT (computed by the model engine):
Summary metrics:
${JSON.stringify(ctx.summary, null, 2)}

P&L schedule:
${JSON.stringify(ctx.pnl, null, 2)}

${ctx.balanceSheet.length > 0 ? `Balance sheet:
${JSON.stringify(ctx.balanceSheet, null, 2)}
` : ""}
${ctx.cashFlow.length > 0 ? `Cash flow:
${JSON.stringify(ctx.cashFlow, null, 2)}
` : ""}
${ctx.scenarios ? `Scenario analysis:
${JSON.stringify(ctx.scenarios, null, 2)}
` : ""}
${ctx.sensitivity ? `Sensitivity analysis:
${JSON.stringify(ctx.sensitivity, null, 2)}
` : ""}

${ctx.scenarioBridge ? `SCENARIO CASES (computed, not estimated - these are real engine runs):
${ctx.scenarioBridge}

Populate scenarioComparison. The narrative must say what the SPREAD means for
the raise - whether the ask still clears its cost of capital under downside, and
which single assumption the outcome hinges on. Do not merely restate the numbers;
a reader can see those.

You have exactly three computed points. Do NOT state a precise threshold or
breakeven value - three points cannot support one, and an interpolated figure
presented as derived is worse than an honest range. Say the turning point falls
BETWEEN the two cases that bracket it, naming both.

Identify the bracketing pair by SIGN: the crossing lies between the two cases
whose values have OPPOSITE signs. Never assert a crossing between two cases
that share a sign - if base is already positive, the crossing is toward the
downside, not the upside. Check the actual figures before writing this.

Name the metric you mean. Equity value, enterprise value and NPV differ and
can carry different signs in the same case; a claim about one is not a claim
about another.

When a base value is near zero, state movement in ABSOLUTE terms only.
Percentage change from a near-zero base is arithmetically valid and practically
meaningless - never write figures like "5,968% increase".` : ""}

BENCHMARK REFERENCE (use these when making comparisons - always cite the named source in your output):
${buildBenchmarkReferenceBlock()}

VALUATION FIELDS - these are distinct, do not conflate them:
- equity_value is the headline valuation. Lead with it.
- enterprise_value is equity value before financing adjustments.
- npv is the present value of forecast cash flows EXCLUDING terminal value.
  It is the most conservative figure and is normally negative for a
  pre-revenue company. Never present it as "the valuation".
- pv_terminal is the discounted terminal value; npv + pv_terminal =
  enterprise_value.
State the same figure consistently across every section. If you cite more
than one, name each explicitly and say how they relate.

${(ctx.step1.country ?? "United Kingdom") !== "United Kingdom" ? `
GEOGRAPHY LIMIT — this business is in ${ctx.step1.country}, but every benchmark
above is UK-derived. Do NOT present a UK range as if it applies here. For each
benchmarkComparison row either omit it, or state in the benchmark field that the
range is UK-derived and may not transfer to ${ctx.step1.country}. Say so plainly
rather than burying it. An unmarked UK benchmark applied to another country is
worse than no benchmark at all.
` : ""}

Use ONLY the ranges above when stating a benchmark. Do not substitute figures
from your own knowledge, even if you believe them more accurate. Quote the
range verbatim and name its source in the "source" field of every
benchmarkComparison entry.
Existing sector context:
- UK SaaS B2B Seed+: 100-140% Y1 revenue growth typical (US benchmarks of 200-300% don't apply due to post-2023 UK funding conditions and smaller TAM)
- UK SaaS Gross Margin: 75-85% best-in-class
- UK Fintech Series A+: FCA compliance overhead adds 15-20% to opex vs unregulated SaaS
- UK Retail: 25-40% gross margin typical
- UK Hospitality: 55-70% food cost is typical, 20-30% labor cost
- UK Healthcare Services: 40-60% gross margin
- UK Property Development: 18-25% gross development margin
- If the assumptions diverge materially from these benchmarks, flag it in benchmarkComparison and in the assumptions rationale.

OUTPUT SCHEMA - respond with ONLY this JSON object, no markdown code fences, no preamble:

{
  "executiveSummary": {
    "businessOneLiner": "One concrete sentence describing what the business does. Not abstract, not marketing.",
    "financialPunchline": "One sentence: revenue trajectory + key margin or growth signal + runway or valuation.",
    "ask": "Round size + use of funds + milestone target" OR null if not a fundraise
  },
  "businessSnapshot": {
    "sector": "e.g. Fintech",
    "subSector": "e.g. B2B SaaS - payment infrastructure",
    "stage": "e.g. Series A",
    "location": "e.g. London, UK",
    "currentState": "1-2 sentences: revenue today, team size, key metric.",
    "modelArchetype": "e.g. Driver-based revenue model with 3-year P&L, balance sheet, and cash flow"
  },
  "financialHighlights": {
    "metricsTable": [
      { "metric": "Revenue (GBP)", "y1": "value with currency", "y2": "value", "y3": "value" },
      { "metric": "Gross Margin", "y1": "% value", "y2": "% value", "y3": "% value" },
      { "metric": "EBITDA", "y1": "value with currency", "y2": "value", "y3": "value" },
      { "metric": "Net Income", "y1": "value with currency", "y2": "value", "y3": "value" }
    ],
    "narrative": "2-3 sentences on the trajectory. Highlight growth pattern, margin evolution, path to profitability. Analyst voice."
  },
  "benchmarkComparison": [
    { "metric": "e.g. Y1 Revenue Growth", "thisModel": "180%", "benchmark": "100-140% UK SaaS Seed+", "delta": "Above", "source": "e.g. Beauhurst UK Startup Report 2024" }
  ],
  "assumptions": {
    "keyAssumptions": [
      {
        "assumption": "e.g. Y1 Revenue Growth",
        "value": "e.g. 180%",
        "rationale": "One sentence on why this level was chosen or is implied by the drivers.",
        "benchmarkContext": "How this compares to UK sector benchmarks. Name the delta explicitly if it diverges."
      }
    ]
  },
  "sensitivity": {
    "topSensitivities": [
      { "variable": "e.g. Y1 Revenue Growth Assumption", "impact": "e.g. ±20% change moves Y3 revenue by GBP X-Y" }
    ],
    "revenueRange": {
      "bear": "GBP value + one-line assumption",
      "base": "GBP value (current model)",
      "bull": "GBP value + one-line assumption"
    }
  },
  "risks": [
    { "risk": "Specific risk the model surfaces (e.g. 'Churn at 8% monthly is above UK B2C SaaS median').", "mitigation": "How the founder is thinking about this or should think about it." }
  ],
  "capitalAsk": {
    "roundSize": "e.g. GBP 2M",
    "useOfFunds": ["e.g. Product development 40%", "Sales and marketing 35%", "Working capital 25%"],
    "runway": "e.g. 18 months",
    "nextMilestone": "e.g. GBP 1M ARR before Series A"
  } OR null if not a fundraise
}

  "scenarioComparison": {
    "narrative": "2-3 sentences on what the spread means for the raise, naming the assumption the outcome hinges on and the threshold where it turns.",
    "cases": [
      { "label": "Upside", "inputsChanged": "e.g. Churn 1.8% to 1.2%, acquisition 10 to 14/month", "equityValue": "e.g. GBP 488k", "keyMovement": "The single most consequential movement, with figures" }
    ]
  } OR null if no scenario cases were supplied above

CONSTRAINTS:
- benchmarkComparison: 3-5 rows
- keyAssumptions: 3-5 items
- topSensitivities: exactly 2
- risks: 2-3 items
- useOfFunds: 3-5 items when capitalAsk is non-null

Return ONLY the JSON. No markdown fences, no explanation before or after.`
}
