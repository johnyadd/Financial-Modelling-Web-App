// Maps one extracted entity onto questionnaire step data.
//
// Shared deliberately: extract/trigger maps the first entity so a model exists
// immediately, and upload/approve re-maps when the user picks a different one.
// Two copies of this logic would drift, which is how the tier check and the
// navbar badge ended up disagreeing about who was on what plan.

export type ExtractedEntity = Record<string, Record<string, unknown[]>> & {
  company_name?: string
  sector_hint?: string
  years?: string[]
}

const lastOf = (a: unknown[] | undefined, i: number) =>
  typeof a?.[i] === "number" ? (a[i] as number) : 0

/** Trailing growth, capped so a one-off historical spike cannot become a forecast. */
function growth(a: unknown[] | undefined): number {
  if (!a || a.length < 2) return 0
  const pv = Number(a[a.length - 2])
  const cv = Number(a[a.length - 1])
  if (!pv) return 0
  return Math.max(Math.min(((cv - pv) / Math.abs(pv)) * 100, 100), -50)
}

export function mapEntityToSteps(
  ent: ExtractedEntity,
  currency: string,
  coverage: string[]
): Record<string, unknown> {
  const is = ent.income_statement ?? {}
  const bs = ent.balance_sheet ?? {}
  const cf = ent.cash_flow ?? {}
  const years = ent.years ?? []
  const li = Math.max(years.length - 1, 0)
  const last = (a: unknown[] | undefined) => lastOf(a, li)

  const rev = (is.revenue as number[]) ?? []
  const cogs = (is.cost_of_goods_sold as number[]) ?? []
  const ebitda = (is.ebitda as number[]) ?? []
  const base = last(rev)

  // Project forward from the last actual so revenues and growth rates agree.
  const g1 = growth(rev)
  const g2 = g1 * 0.9
  const g3 = g1 * 0.8
  const y1 = Math.round(base * (1 + g1 / 100))
  const y2 = Math.round(y1 * (1 + g2 / 100))
  const y3 = Math.round(y2 * (1 + g3 / 100))

  const modelType = coverage.includes("three_statement")
    ? "three_statement"
    : (coverage[0] ?? "three_statement")

  const salaries = (is.salaries as number[]) ?? []
  const opex = (is.operating_expenses as number[]) ?? []
  const salaryTotal = salaries.length ? last(salaries) : Math.round(last(opex) * 0.6)

  return {
    name: ent.company_name ? ent.company_name + " \u2014 3-Statement Model" : null,
    step1_business: {
      businessName: ent.company_name ?? "",
      currency,
      industry: ent.sector_hint ?? "",
      subSector: "",
      businessStage: "Established (Profitable)",
      country: "United Kingdom",
    },
    step2_revenue: {
      modelType,
      projectionYears: "5 years",
      revenueModel: "Product Sales",
      revenueEntryMode: "topLine",
      year1Revenue: y1, year2Revenue: y2, year3Revenue: y3,
      revenueGrowthY1: Math.round(g1 * 10) / 10,
      revenueGrowthY2: Math.round(g2 * 10) / 10,
      revenueGrowthY3: Math.round(g3 * 10) / 10,
    },
    step3_costs: {
      grossMargin: base > 0 ? Math.round(((base - last(cogs)) / base) * 1000) / 10 : 70,
      cogsPercent: base > 0 ? Math.round((last(cogs) / base) * 1000) / 10 : 30,
      salariesTotal: salaryTotal,
      ebitdaMarginY1: base > 0 ? Math.round((last(ebitda) / base) * 1000) / 10 : 0,
      capexY1: Math.abs(last((cf.capex as number[]) ?? [])),
      depreciationPct: 25,
    },
    step4_funding: {
      fundingStage: "Established (Profitable)",
      currentCash: last((bs.cash as number[]) ?? []),
      totalFundingRaised: 0,
      discountRate: 15,
      terminalGrowthRate: 2.5,
      exitHorizonYears: "5 years",
      targetExitMultiple: 5,
    },
  }
}
