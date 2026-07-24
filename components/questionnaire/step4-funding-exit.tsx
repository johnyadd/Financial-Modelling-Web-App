"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuestionnaireStore } from "@/store/questionnaire-store"
import { step4Schema, type Step4Data } from "@/lib/schemas"
import { FUNDING_ROUNDS } from "@/lib/questionnaire-data"
import { useBenchmarks } from "@/hooks/use-benchmarks"
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
import { ArrowLeftIcon, ArrowRightIcon, BanknoteIcon } from "lucide-react"

const EXIT_HORIZONS = ["2 years", "3 years", "5 years", "7 years", "10 years+"]

export function Step4FundingExit() {
  const { data, updateStep4, nextStep, prevStep } = useQuestionnaireStore()
  const currency = data.step1.currency ?? "GBP"
  const { hasBenchmarks, getFieldBenchmark, getPlaceholder } = useBenchmarks()

  const form = useForm<Step4Data>({
    resolver: zodResolver(step4Schema),
    defaultValues: {
      fundingStage:         data.step4.fundingStage ?? "",
      totalFundingRaised:   data.step4.totalFundingRaised ?? "",
      targetRaiseAmount:    data.step4.targetRaiseAmount ?? "",
      currentCash:          data.step4.currentCash ?? "",
      monthlyBurnRate:      data.step4.monthlyBurnRate ?? "",
      runwayMonths:         data.step4.runwayMonths ?? "",
      exitHorizonYears:     data.step4.exitHorizonYears ?? "",
      targetExitMultiple:   data.step4.targetExitMultiple ?? "",
      discountRate:         data.step4.discountRate ?? "",
      terminalGrowthRate:   data.step4.terminalGrowthRate ?? "",
      debtFunding:          data.step4.debtFunding ?? "",
      interestRate:         data.step4.interestRate ?? "",
    },
  })

  const w = {
    monthlyBurnRate:    form.watch("monthlyBurnRate"),
    runwayMonths:       form.watch("runwayMonths"),
    discountRate:       form.watch("discountRate"),
    terminalGrowthRate: form.watch("terminalGrowthRate"),
    targetExitMultiple: form.watch("targetExitMultiple"),
  }

  function onSubmit(values: Step4Data) {
    updateStep4(values)
    nextStep()
  }

  const plainInput = (placeholder: string) =>
    "flex h-9 w-full rounded-md border border-border bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

        {/* header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BanknoteIcon className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Funding, runway & exit</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Enter your funding position and valuation assumptions for the model output.
          </p>
        </div>

        {/* â”€â”€ funding position â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Current funding position</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <FormField
              control={form.control}
              name="fundingStage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Funding stage</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select stage" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {FUNDING_ROUNDS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="totalFundingRaised"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total funding raised to date ({currency})</FormLabel>
                  <FormControl>
                    <input type="number" min="0" placeholder="e.g. 250000" className={plainInput("")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="currentCash"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current cash balance ({currency})</FormLabel>
                  <FormControl>
                    <input type="number" min="0" placeholder="e.g. 180000" className={plainInput("")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* BENCHMARK WIRED â€” burn rate */}
            <FormField
              control={form.control}
              name="monthlyBurnRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly net burn rate ({currency})</FormLabel>
                  <FormControl>
                    <BenchmarkInput
                      type="number"
                      min="0"
                      placeholder={hasBenchmarks ? getPlaceholder("monthlyBurnRate") : "e.g. 25000"}
                      benchmark={getFieldBenchmark("monthlyBurnRate", w.monthlyBurnRate)}
                      showBar={false}
                      assumptionKey="monthlyBurnRate"
                      aiContext={{
                        industry: data.step1.industry,
                        subSector: data.step1.subSector,
                        businessStage: data.step1.businessStage,
                        currency: data.step1.currency,
                        country: data.step1.country,
                      }}
                      onAIAccept={(v) => form.setValue("monthlyBurnRate", String(v))}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Total monthly spend minus revenue collected</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* BENCHMARK WIRED â€” runway */}
            <FormField
              control={form.control}
              name="runwayMonths"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current runway (months)</FormLabel>
                  <FormControl>
                    <BenchmarkInput
                      type="number"
                      min="0"
                      placeholder={hasBenchmarks ? getPlaceholder("runwayMonths") : "e.g. 7"}
                      benchmark={getFieldBenchmark("runwayMonths", w.runwayMonths)}
                      showBar={false}
                      assumptionKey="runwayMonths"
                      aiContext={{
                        industry: data.step1.industry,
                        businessStage: data.step1.businessStage,
                      }}
                      onAIAccept={(v) => form.setValue("runwayMonths", String(v))}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Cash balance Ã· monthly burn</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="targetRaiseAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target raise amount ({currency})</FormLabel>
                  <FormControl>
                    <input type="number" min="0" placeholder="e.g. 1000000" className={plainInput("")} {...field} />
                  </FormControl>
                  <FormDescription>Next planned fundraise (leave blank if none)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        {/* â”€â”€ debt â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Debt financing (optional)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="debtFunding"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total debt / loans ({currency})</FormLabel>
                  <FormControl>
                    <input type="number" min="0" placeholder="e.g. 100000" className={plainInput("")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="interestRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Interest rate on debt (%)</FormLabel>
                  <FormControl>
                    <input type="number" min="0" max="100" placeholder="e.g. 8.5" className={plainInput("")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        {/* â”€â”€ valuation & exit â€” BENCHMARK WIRED â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Valuation & exit assumptions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <FormField
              control={form.control}
              name="exitHorizonYears"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target exit / liquidity horizon</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="When do you plan to exit?" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {EXIT_HORIZONS.map((h) => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="targetExitMultiple"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target exit multiple (x revenue)</FormLabel>
                  <FormControl>
                    <BenchmarkInput
                      type="number"
                      min="0"
                      placeholder={hasBenchmarks ? getPlaceholder("revenueMultiple") : "e.g. 5"}
                      benchmark={getFieldBenchmark("revenueMultiple", w.targetExitMultiple)}
                      showBar={false}
                      assumptionKey="targetExitMultiple"
                      aiContext={{
                        industry: data.step1.industry,
                        subSector: data.step1.subSector,
                        businessStage: data.step1.businessStage,
                        currentValues: {
                          revenueModel: data.step2.revenueModel,
                        },
                      }}
                      onAIAccept={(v) => form.setValue("targetExitMultiple", String(v))}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>e.g. 5x = 5Ã— annual revenue at exit</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* BENCHMARK WIRED â€” WACC */}
            <FormField
              control={form.control}
              name="discountRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Discount rate / WACC (%)</FormLabel>
                  <FormControl>
                    <BenchmarkInput
                      type="number"
                      min="0"
                      max="100"
                      placeholder={hasBenchmarks ? getPlaceholder("discountRate") : "e.g. 20"}
                      benchmark={getFieldBenchmark("discountRate", w.discountRate)}
                      assumptionKey="discountRate"
                      aiContext={{
                        industry: data.step1.industry,
                        subSector: data.step1.subSector,
                        businessStage: data.step1.businessStage,
                        country: data.step1.country,
                      }}
                      onAIAccept={(v) => form.setValue("discountRate", String(v))}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {hasBenchmarks
                      ? `Sector typical range shown above`
                      : "Typical range: 15â€“25% for early-stage startups"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* BENCHMARK WIRED â€” terminal growth rate */}
            <FormField
              control={form.control}
              name="terminalGrowthRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Terminal growth rate (%)</FormLabel>
                  <FormControl>
                    <BenchmarkInput
                      type="number"
                      min="0"
                      max="20"
                      placeholder={hasBenchmarks ? getPlaceholder("terminalGrowthRate") : "e.g. 3"}
                      benchmark={getFieldBenchmark("terminalGrowthRate", w.terminalGrowthRate)}
                      assumptionKey="terminalGrowthRate"
                      aiContext={{
                        industry: data.step1.industry,
                        country: data.step1.country,
                      }}
                      onAIAccept={(v) => form.setValue("terminalGrowthRate", String(v))}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Long-run perpetuity growth (typically 2â€“4%)</FormDescription>
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
            Review & submit <ArrowRightIcon className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </Form>
  )
}


