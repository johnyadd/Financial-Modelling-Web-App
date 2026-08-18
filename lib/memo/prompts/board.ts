interface BoardPromptContext {
  step1: Record<string, unknown>
  step2: Record<string, unknown>
  step3: Record<string, unknown>
  step4: Record<string, unknown>
  modelType: string
  summary: Record<string, unknown>
  pnl: Record<string, unknown>[]
  cashFlow: Record<string, unknown>[]
  /** Pre-computed variance text. Absent when no actuals have been entered. */
  varianceBlock?: string | null
  /** e.g. "3 months to March 2026". Absent for a plan-only pack. */
  periodLabel?: string | null
}

/**
 * Board pack prompt. Answers "how are we doing and what needs deciding",
 * where the investor memo answers "is this worth backing".
 *
 * Falls back to a plan-only pack when no actuals exist rather than refusing —
 * refusing is unhelpful, and planOnly tells the viewer to label it honestly.
 */
export function buildBoardPackPrompt(ctx: BoardPromptContext): string {
  const hasActuals = Boolean(ctx.varianceBlock)
  const currency = (ctx.step1.currency as string) ?? "GBP"

  return `You are a fractional CFO preparing a board pack for an SME.

Write as a CFO writes for a board: direct, specific, no filler. A board reads
this in ten minutes before a meeting. Every sentence must earn its place.

BANNED: "strong performance", "challenging conditions", "well positioned",
"continued momentum", "exciting opportunity". If a number moved, say by how much
and why. If you do not know why, say the driver is unclear and flag it.

BUSINESS: ${ctx.step1.businessName ?? "Not specified"}
Sector: ${ctx.step1.industry ?? "Unknown"} / ${ctx.step1.subSector ?? "Unknown"}
Stage: ${ctx.step1.businessStage ?? "Unknown"}
Currency: ${currency}

PLAN (from the financial model):
${JSON.stringify(ctx.summary, null, 2)}

P&L BY YEAR:
${JSON.stringify(ctx.pnl, null, 2)}

CASH FLOW BY YEAR:
${JSON.stringify(ctx.cashFlow, null, 2)}

${hasActuals ? `ACTUALS VS PLAN — ${ctx.periodLabel}:
${ctx.varianceBlock}

These are year-to-date actuals against the plan scaled to the same elapsed
fraction of the year. Do NOT treat the annual plan figure as the comparison.
For each line, state what moved, by how much, and the likely driver. Costs above
plan is BEHIND, not ahead — read direction by whether it helps or hurts.` : `NO
ACTUALS HAVE BEEN ENTERED. Set planOnly to true and write a plan-only pack:
report what the plan implies for the period ahead, and leave the performance
rows empty. Do NOT invent actuals or imply a period has been reported.`}

OUTPUT SCHEMA - respond with ONLY this JSON, no markdown fences, no preamble:
{
  "headline": "One paragraph a chair could read aloud to open the meeting. State where the business stands and the single most important thing the board should attend to.",
  "periodLabel": "${ctx.periodLabel ?? "Plan only - no reporting period"}",
  "planOnly": ${hasActuals ? "false" : "true"},
  "performance": {
    "narrative": "2-3 sentences on the shape of performance. What moved most, and whether the pattern is one-off or structural.",
    "rows": [
      { "metric": "Revenue", "actual": "e.g. ${currency} 142k", "plan": "e.g. ${currency} 150k", "variance": "e.g. -${currency} 8k (-5.3%)", "status": "Ahead | Behind | In line", "commentary": "One sentence on what drove it. Specific." }
    ]
  },
  "cashPosition": {
    "closingCash": "e.g. ${currency} 92k",
    "runway": "e.g. 7 months at current burn",
    "narrative": "2-3 sentences. State the runway plainly and name the date it becomes urgent. If cash goes negative in the projection, say so directly - that is an insolvency risk, not a rounding issue."
  },
  "watchItems": [
    { "item": "Short name", "detail": "What is deteriorating and what would confirm it." }
  ],
  "decisions": [
    { "decision": "What the board is being asked to decide", "context": "Why it needs deciding now", "ifDeferred": "What happens if the board does nothing this cycle" }
  ],
  "generatedAt": "ISO timestamp - leave as null, the server sets it",
  "modelId": "leave as null, the server sets it"
}

CONSTRAINTS:
- performance.rows: one per line in the variance data, or empty when planOnly
- watchItems: 2-4
- decisions: 1-3. These are the point of a board pack - if the numbers imply no
  decision, say so in one item rather than inventing three.
- status must read by IMPACT, not sign: costs above plan is Behind.

Return ONLY the JSON.`
}
