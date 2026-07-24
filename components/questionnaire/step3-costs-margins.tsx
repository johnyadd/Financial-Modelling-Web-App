"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuestionnaireStore } from "@/store/questionnaire-store"
import { step3Schema, type Step3Data } from "@/lib/schemas"
import { COST_DRIVERS } from "@/lib/questionnaire-data"
import { useBenchmarks } from "@/hooks/use-benchmarks"
import { BenchmarkPanel } from "@/components/ui/benchmark-panel"
import { BenchmarkInput } from "@/components/ui/benchmark-input"
import {
  Form, FormControl, FormField, FormItem,
  FormLabel, FormMessage, FormDescription,
} from "@/components/ui/form"
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowLeftIcon, ArrowRightIcon, ReceiptIcon } from "lucide-react"

export function Step3CostsMargins() {
  const { data, updateStep3, nextStep, prevStep } = useQuestionnaireStore()
  const currency = data.step1.currency ?? "GBP"
  const { benchmarks, hasBenchmarks, industry, subSector, getFieldBenchmark, getPlaceholder } = useBenchmarks()

  const form = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      grossMargin:          data.step3.grossMargin ?? "",
      primaryCostDriver:    data.step3.primaryCostDriver ?? "",
      totalHeadcount:       data.step3.totalHeadcount ?? "",
      avgSalary:            data.step3.avgSalary ?? "",
      salariesTotal:        data.step3.salariesTotal ?? "",
      cloudInfraMonthly:    data.step3.cloudInfraMonthly ?? "",
      marketingBudgetPct:   data.step3.marketingBudgetPct ?? "",
      cogsPercent:          data.step3.cogsPercent ?? "",
      rdBudgetPct:          data.step3.rdBudgetPct ?? "",
      officeRentMonthly:    data.step3.officeRentMonthly ?? "",
      otherOpexMonthly:     data.step3.otherOpexMonthly ?? "",
      ebitdaMarginY1:       data.step3.ebitdaMarginY1 ?? "",
      ebitdaMarginY3:       data.step3.ebitdaMarginY3 ?? "",
      capexY1:              data.step3.capexY1 ?? "",
      depreciationPct:      data.step3.depreciationPct ?? "",
    },
  })

  // watch live values for benchmark colouring
  const w = {
    grossMargin:        form.watch("grossMargin"),
    ebitdaMarginY1:     form.watch("ebitdaMarginY1"),
    ebitdaMarginY3:     form.watch("ebitdaMarginY3"),
    cogsPercent:        form.watch("cogsPercent"),
    marketingBudgetPct: form.watch("marketingBudgetPct"),
    rdBudgetPct:        form.watch("rdBudgetPct"),
    capexY1:            form.watch("capexY1"),
    depreciationPct:    form.watch("depreciationPct"),
  }

  function onSubmit(values: Step3Data) {
    updateStep3(values)
    nextStep()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

        {/* header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ReceiptIcon className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Cost structure & margins</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Enter your cost assumptions to build the P&L and cash flow projections.
          </p>
        </div>

        {/* benchmark panel */}
        {hasBenchmarks && benchmarks && (
          <BenchmarkPanel
            benchmarks={benchmarks}
            industry={industry}
            subSector={subSector}
          />
        )}

        {/* â”€â”€ gross margin + cost driver â€” BENCHMARK WIRED â”€â”€ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="grossMargin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gross margin (%)</FormLabel>
                <FormControl>
                  <BenchmarkInput
                    type="number"
                    min="0"
                    max="100"
                    placeholder={hasBenchmarks ? getPlaceholder("grossMargin") : "e.g. 72"}
                    benchmark={getFieldBenchmark("grossMargin", w.grossMargin)}
                    assumptionKey="grossMargin"
                    aiContext={{
                      industry: data.step1.industry,
                      subSector: data.step1.subSector,
                      businessStage: data.step1.businessStage,
                      currentValues: {
                        revenueModel: data.step2.revenueModel,
                      },
                    }}
                    onAIAccept={(v) => form.setValue("grossMargin", String(v))}
                    {...field}
                  />
                </FormControl>
                <FormDescription>Revenue minus direct costs / Revenue Ã— 100</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="primaryCostDriver"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Primary cost driver</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Biggest cost category?" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {COST_DRIVERS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        {/* â”€â”€ headcount & salaries â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div>
          <h3 className="text-sm font-semibold mb-1">Headcount & payroll</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Typically the largest cost line for early-stage businesses.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(["totalHeadcount", "avgSalary", "salariesTotal"] as const).map((key, i) => {
              const labels = ["Total headcount (FTE)", `Avg. annual salary (${currency})`, `Total annual payroll (${currency})`]
              const placeholders = ["e.g. 8", "e.g. 45000", "e.g. 360000"]
              const descriptions = [undefined, undefined, "Including employer taxes & benefits"]
              return (
                <FormField
                  key={key}
                  control={form.control}
                  name={key}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{labels[i]}</FormLabel>
                      <FormControl>
                        <input
                          type="number"
                          min="0"
                          placeholder={placeholders[i]}
                          className="flex h-9 w-full rounded-md border border-border bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          {...field}
                        />
                      </FormControl>
                      {descriptions[i] && <FormDescription>{descriptions[i]}</FormDescription>}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )
            })}
          </div>
        </div>

        <Separator />

        {/* â”€â”€ operating expenses â€” BENCHMARK WIRED â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div>
          <h3 className="text-sm font-semibold mb-1">Operating expenses</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Percentages are % of revenue. Monthly figures in {currency}.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <FormField
              control={form.control}
              name="cogsPercent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>COGS as % of revenue</FormLabel>
                  <FormControl>
                    <BenchmarkInput
                      type="number"
                      min="0"
                      max="100"
                      placeholder={hasBenchmarks ? getPlaceholder("cogsPercent") : "e.g. 28"}
                      benchmark={getFieldBenchmark("cogsPercent", w.cogsPercent)}
                      assumptionKey="cogsPercent"
                      aiContext={{
                        industry: data.step1.industry,
                        subSector: data.step1.subSector,
                        businessStage: data.step1.businessStage,
                        currentValues: {
                          grossMargin: w.grossMargin,
                        },
                      }}
                      onAIAccept={(v) => form.setValue("cogsPercent", String(v))}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Direct costs of delivering your product/service</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="marketingBudgetPct"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Marketing spend as % of revenue</FormLabel>
                  <FormControl>
                    <BenchmarkInput
                      type="number"
                      min="0"
                      max="100"
                      placeholder={hasBenchmarks ? getPlaceholder("salesMarketingPercent") : "e.g. 20"}
                      benchmark={getFieldBenchmark("salesMarketingPercent", w.marketingBudgetPct)}
                      assumptionKey="marketingBudgetPct"
                      aiContext={{
                        industry: data.step1.industry,
                        subSector: data.step1.subSector,
                        businessStage: data.step1.businessStage,
                      }}
                      onAIAccept={(v) => form.setValue("marketingBudgetPct", String(v))}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rdBudgetPct"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>R&D spend as % of revenue</FormLabel>
                  <FormControl>
                    <BenchmarkInput
                      type="number"
                      min="0"
                      max="100"
                      placeholder={hasBenchmarks ? getPlaceholder("rdPercent") : "e.g. 15"}
                      benchmark={getFieldBenchmark("rdPercent", w.rdBudgetPct)}
                      assumptionKey="rdBudgetPct"
                      aiContext={{
                        industry: data.step1.industry,
                        subSector: data.step1.subSector,
                        businessStage: data.step1.businessStage,
                      }}
                      onAIAccept={(v) => form.setValue("rdBudgetPct", String(v))}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cloudInfraMonthly"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cloud / infrastructure (monthly, {currency})</FormLabel>
                  <FormControl>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 3500"
                      className="flex h-9 w-full rounded-md border border-border bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="officeRentMonthly"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Office / facilities (monthly, {currency})</FormLabel>
                  <FormControl>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 2000"
                      className="flex h-9 w-full rounded-md border border-border bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="otherOpexMonthly"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Other OPEX (monthly, {currency})</FormLabel>
                  <FormControl>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 1500"
                      className="flex h-9 w-full rounded-md border border-border bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Legal, insurance, software subscriptions</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        {/* â”€â”€ profitability & capex â€” BENCHMARK WIRED â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div>
          <h3 className="text-sm font-semibold mb-1">Profitability & capital expenditure</h3>
          <p className="text-xs text-muted-foreground mb-3">Target margins and capital investment needed.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <FormField
              control={form.control}
              name="ebitdaMarginY1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target EBITDA margin â€“ Year 1 (%)</FormLabel>
                  <FormControl>
                    <BenchmarkInput
                      type="number"
                      placeholder={hasBenchmarks ? getPlaceholder("ebitdaMargin") : "e.g. -45"}
                      benchmark={getFieldBenchmark("ebitdaMargin", w.ebitdaMarginY1)}
                      assumptionKey="ebitdaMarginY1"
                      aiContext={{
                        industry: data.step1.industry,
                        subSector: data.step1.subSector,
                        businessStage: data.step1.businessStage,
                      }}
                      onAIAccept={(v) => form.setValue("ebitdaMarginY1", String(v))}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Negative is expected for early-stage</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ebitdaMarginY3"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target EBITDA margin â€“ Year 3 (%)</FormLabel>
                  <FormControl>
                    <BenchmarkInput
                      type="number"
                      placeholder={hasBenchmarks ? getPlaceholder("ebitdaMargin") : "e.g. 12"}
                      benchmark={getFieldBenchmark("ebitdaMargin", w.ebitdaMarginY3)}
                      assumptionKey="ebitdaMarginY3"
                      aiContext={{
                        industry: data.step1.industry,
                        subSector: data.step1.subSector,
                        businessStage: data.step1.businessStage,
                        currentValues: {
                          ebitdaMarginY1: w.ebitdaMarginY1,
                        },
                      }}
                      onAIAccept={(v) => form.setValue("ebitdaMarginY3", String(v))}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="capexY1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CAPEX â€“ Year 1 ({currency})</FormLabel>
                  <FormControl>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 50000"
                      className="flex h-9 w-full rounded-md border border-border bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Equipment, hardware, leasehold improvements</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="depreciationPct"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Depreciation rate (%)</FormLabel>
                  <FormControl>
                    <BenchmarkInput
                      type="number"
                      min="0"
                      max="100"
                      placeholder={hasBenchmarks ? getPlaceholder("depreciationRate") : "e.g. 25"}
                      benchmark={getFieldBenchmark("depreciationRate", w.depreciationPct)}
                      showBar={false}
                      assumptionKey="depreciationPct"
                      aiContext={{
                        industry: data.step1.industry,
                        subSector: data.step1.subSector,
                      }}
                      onAIAccept={(v) => form.setValue("depreciationPct", String(v))}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Annual % of asset value depreciated</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* nav */}
        <div className="flex justify-between pt-2">
          <Button type="button" variant="outline" onClick={prevStep} className="gap-2">
            <ArrowLeftIcon className="w-4 h-4" /> Back
          </Button>
          <Button type="submit" className="gap-2">
            Next: Funding & Exit <ArrowRightIcon className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </Form>
  )
}


