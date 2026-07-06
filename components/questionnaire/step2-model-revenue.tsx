"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuestionnaireStore } from "@/store/questionnaire-store"
import { step2Schema, type Step2Data } from "@/lib/schemas"
import { MODEL_TYPES, REVENUE_MODELS, PROJECTION_YEARS, GROWTH_DRIVERS } from "@/lib/questionnaire-data"
import { BUSINESS_GOALS } from "@/lib/goals"
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
import { Badge } from "@/components/ui/badge"
import { ArrowLeftIcon, ArrowRightIcon, TrendingUpIcon, SparklesIcon } from "lucide-react"

export function Step2ModelRevenue() {
  const { data, selectedGoalId, updateStep2, nextStep, prevStep } = useQuestionnaireStore()
  const currency = data.step1.currency ?? "GBP"
  const { benchmarks, hasBenchmarks, industry, subSector, getFieldBenchmark, getPlaceholder } = useBenchmarks()

  const selectedGoal = BUSINESS_GOALS.find((g) => g.id === selectedGoalId)
  const activeModel = MODEL_TYPES.find((m) => m.value === data.step2.modelType)

  const form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      modelType:             data.step2.modelType ?? "",
      projectionYears:       data.step2.projectionYears ?? "",
      revenueModel:          data.step2.revenueModel ?? "",
      currentARR:            data.step2.currentARR ?? "",
      year1Revenue:          data.step2.year1Revenue ?? "",
      year2Revenue:          data.step2.year2Revenue ?? "",
      year3Revenue:          data.step2.year3Revenue ?? "",
      revenueGrowthY1:       data.step2.revenueGrowthY1 ?? "",
      revenueGrowthY2:       data.step2.revenueGrowthY2 ?? "",
      revenueGrowthY3:       data.step2.revenueGrowthY3 ?? "",
      primaryGrowthDriver:   data.step2.primaryGrowthDriver ?? "",
      averageRevenuePerUser: data.step2.averageRevenuePerUser ?? "",
      expectedCustomersY1:   data.step2.expectedCustomersY1 ?? "",
      churnRate:             data.step2.churnRate ?? "",
    },
  })

  const watchedGrowthY1 = form.watch("revenueGrowthY1")
  const watchedGrowthY2 = form.watch("revenueGrowthY2")
  const watchedGrowthY3 = form.watch("revenueGrowthY3")
  const watchedChurn    = form.watch("churnRate")
  const watchedARPU     = form.watch("averageRevenuePerUser")

  function onSubmit(values: Step2Data) {
    updateStep2(values)
    nextStep()
  }

  const plain = "flex h-9 w-full rounded-md border border-border bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

        {/* header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUpIcon className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Revenue assumptions</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Enter your revenue projections and growth assumptions.
          </p>
        </div>

        {/* selected model reminder */}
        {activeModel && (
          <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
            <SparklesIcon className="w-4 h-4 text-primary flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">
                {selectedGoal ? `Goal: ${selectedGoal.icon} ${selectedGoal.title} · ` : ""}
                <span className="font-medium text-foreground">
                  Model: {activeModel.label}
                </span>
              </p>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              {activeModel.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0 hidden sm:inline-flex">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* benchmark panel */}
        {hasBenchmarks && benchmarks && (
          <BenchmarkPanel benchmarks={benchmarks} industry={industry} subSector={subSector} />
        )}

        {/* projection period + revenue model */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="projectionYears"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Projection period</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Select period" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PROJECTION_YEARS.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="revenueModel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Revenue model</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="How do you earn revenue?" /></SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-72">
                    {REVENUE_MODELS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* revenue projections */}
        <div>
          <h3 className="text-sm font-semibold mb-1">Revenue projections ({currency})</h3>
          <p className="text-xs text-muted-foreground mb-3">Enter projected annual revenue. Use 0 if pre-revenue.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(["year1Revenue", "year2Revenue", "year3Revenue"] as const).map((key, i) => (
              <FormField key={key} control={form.control} name={key}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year {i + 1} revenue</FormLabel>
                    <FormControl>
                      <input type="number" min="0" placeholder="e.g. 150000" className={plain} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>
        </div>

        {/* revenue growth rates — benchmark wired */}
        <div>
          <h3 className="text-sm font-semibold mb-1">Revenue growth rates (%)</h3>
          <p className="text-xs text-muted-foreground mb-3">Year-on-year revenue growth assumptions.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField control={form.control} name="revenueGrowthY1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Year 1 growth %</FormLabel>
                  <FormControl>
                    <BenchmarkInput type="number"
                      placeholder={hasBenchmarks ? getPlaceholder("revenueGrowthY1") : "e.g. 120"}
                      benchmark={getFieldBenchmark("revenueGrowthY1", watchedGrowthY1)} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField control={form.control} name="revenueGrowthY2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Year 2 growth %</FormLabel>
                  <FormControl>
                    <BenchmarkInput type="number"
                      placeholder={hasBenchmarks ? getPlaceholder("revenueGrowthY2") : "e.g. 80"}
                      benchmark={getFieldBenchmark("revenueGrowthY2", watchedGrowthY2)} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField control={form.control} name="revenueGrowthY3"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Year 3 growth %</FormLabel>
                  <FormControl>
                    <BenchmarkInput type="number"
                      placeholder={hasBenchmarks ? getPlaceholder("revenueGrowthY3") : "e.g. 50"}
                      benchmark={getFieldBenchmark("revenueGrowthY3", watchedGrowthY3)} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* unit economics — benchmark wired */}
        <div>
          <h3 className="text-sm font-semibold mb-1">Unit economics (optional)</h3>
          <p className="text-xs text-muted-foreground mb-3">Helps build a more detailed bottom-up revenue model.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField control={form.control} name="averageRevenuePerUser"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Avg. revenue per user ({currency})</FormLabel>
                  <FormControl>
                    <BenchmarkInput type="number" min="0"
                      placeholder={hasBenchmarks ? getPlaceholder("ltv") : "e.g. 1200"}
                      benchmark={getFieldBenchmark("ltv", watchedARPU)}
                      showBar={false} {...field} />
                  </FormControl>
                  <FormDescription>Annual ARPU or contract value</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField control={form.control} name="expectedCustomersY1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expected customers – Year 1</FormLabel>
                  <FormControl>
                    <input type="number" min="0" placeholder="e.g. 50" className={plain} {...field} />
                  </FormControl>
                  <FormDescription>Paying customers / accounts</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField control={form.control} name="churnRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Annual churn rate (%)</FormLabel>
                  <FormControl>
                    <BenchmarkInput type="number" min="0" max="100"
                      placeholder={hasBenchmarks ? getPlaceholder("churnRateAnnual") : "e.g. 5"}
                      benchmark={getFieldBenchmark("churnRateAnnual", watchedChurn)} {...field} />
                  </FormControl>
                  <FormDescription>% of customers lost per year</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* primary growth driver */}
        <FormField control={form.control} name="primaryGrowthDriver"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Primary growth driver</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger><SelectValue placeholder="What primarily drives your growth?" /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  {GROWTH_DRIVERS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between pt-2">
          <Button type="button" variant="outline" onClick={prevStep} className="gap-2">
            <ArrowLeftIcon className="w-4 h-4" /> Back
          </Button>
          <Button type="submit" className="gap-2">
            Next: Costs & Margins <ArrowRightIcon className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </Form>
  )
}
