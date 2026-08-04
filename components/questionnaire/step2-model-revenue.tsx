"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuestionnaireStore } from "@/store/questionnaire-store"
import { step2Schema, type Step2Data } from "@/lib/schemas"
import { BUSINESS_TYPE_HIERARCHY, type BusinessTypeMain } from "@/lib/schemas/assumptions"
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

// Sub-types that have driver UI blocks built (used by amber placeholder filter)
const BUILT_SUB_TYPES = [
  // Session 2a
  "saas_b2b", "ecom_d2c", "services_professional",
  // Session 3a — Product
  "product_manufacturing", "product_retail", "product_wholesale",
  // Session 3a — Real Estate
  "realestate_development", "realestate_rental", "realestate_agency",
  "realestate_reit", "realestate_shorttermrental",
]

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

      // Session 1: entry mode + business type
      revenueEntryMode:      data.step2.revenueEntryMode ?? "topLine",
      businessTypeMain:      data.step2.businessTypeMain ?? "",
      businessTypeSub:       data.step2.businessTypeSub ?? "",

      // Top-line fields
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

      // Session 2a: SaaS B2B drivers
      saasB2b_startingCustomers:    data.step2.saasB2b_startingCustomers ?? "",
      saasB2b_newCustomersPerMonth: data.step2.saasB2b_newCustomersPerMonth ?? "",
      saasB2b_monthlyChurnRate:     data.step2.saasB2b_monthlyChurnRate ?? "",
      saasB2b_arpu:                 data.step2.saasB2b_arpu ?? "",
      saasB2b_expansionRevenuePct:  data.step2.saasB2b_expansionRevenuePct ?? "",

      // Session 2a: E-commerce D2C drivers
      ecomD2c_monthlyTraffic:     data.step2.ecomD2c_monthlyTraffic ?? "",
      ecomD2c_conversionRate:     data.step2.ecomD2c_conversionRate ?? "",
      ecomD2c_averageOrderValue:  data.step2.ecomD2c_averageOrderValue ?? "",
      ecomD2c_repeatPurchaseRate: data.step2.ecomD2c_repeatPurchaseRate ?? "",

      // Session 2a: Professional Services drivers
      svcProf_billableStaffCount:    data.step2.svcProf_billableStaffCount ?? "",
      svcProf_billableHoursPerMonth: data.step2.svcProf_billableHoursPerMonth ?? "",
      svcProf_utilizationRate:       data.step2.svcProf_utilizationRate ?? "",
      svcProf_hourlyRate:            data.step2.svcProf_hourlyRate ?? "",

      // Session 3a: Product Manufacturing drivers
      productMfg_unitsPerMonth:        data.step2.productMfg_unitsPerMonth ?? "",
      productMfg_unitPrice:            data.step2.productMfg_unitPrice ?? "",
      productMfg_capacityUtilization:  data.step2.productMfg_capacityUtilization ?? "",
      productMfg_sellThroughRate:      data.step2.productMfg_sellThroughRate ?? "",

      // Session 3a: Product Retail drivers
      productRetail_storeCount:      data.step2.productRetail_storeCount ?? "",
      productRetail_revenuePerStore: data.step2.productRetail_revenuePerStore ?? "",
      productRetail_sameSalesGrowth: data.step2.productRetail_sameSalesGrowth ?? "",

      // Session 3a: Product Wholesale drivers
      productWhsl_activeAccounts:    data.step2.productWhsl_activeAccounts ?? "",
      productWhsl_ordersPerAccount:  data.step2.productWhsl_ordersPerAccount ?? "",
      productWhsl_averageOrderValue: data.step2.productWhsl_averageOrderValue ?? "",

      // Session 3a: Real Estate Development drivers
      reDev_unitsBuiltYear:      data.step2.reDev_unitsBuiltYear ?? "",
      reDev_averageSellingPrice: data.step2.reDev_averageSellingPrice ?? "",
      reDev_sellThroughMonths:   data.step2.reDev_sellThroughMonths ?? "",
      reDev_grossMargin:         data.step2.reDev_grossMargin ?? "",

      // Session 3a: Real Estate Rental drivers
      reRent_rentableUnits:  data.step2.reRent_rentableUnits ?? "",
      reRent_monthlyRent:    data.step2.reRent_monthlyRent ?? "",
      reRent_occupancyRate:  data.step2.reRent_occupancyRate ?? "",
      reRent_otherIncomePct: data.step2.reRent_otherIncomePct ?? "",

      // Session 3a: Real Estate Agency drivers
      reAgcy_monthlyTransactions:    data.step2.reAgcy_monthlyTransactions ?? "",
      reAgcy_averageTransactionValue: data.step2.reAgcy_averageTransactionValue ?? "",
      reAgcy_commissionRate:         data.step2.reAgcy_commissionRate ?? "",

      // Session 3a: Real Estate REIT drivers
      reReit_portfolioProperties: data.step2.reReit_portfolioProperties ?? "",
      reReit_averageYield:        data.step2.reReit_averageYield ?? "",
      reReit_navGrowth:           data.step2.reReit_navGrowth ?? "",

      // Session 3a: Real Estate Short-term Rental drivers (new sub-type)
      reStr_rentableUnits:         data.step2.reStr_rentableUnits ?? "",
      reStr_averageNightlyRate:    data.step2.reStr_averageNightlyRate ?? "",
      reStr_occupancyRate:         data.step2.reStr_occupancyRate ?? "",
      reStr_cleaningFeePerBooking: data.step2.reStr_cleaningFeePerBooking ?? "",
    },
  })

  const watchedGrowthY1 = form.watch("revenueGrowthY1")
  const watchedGrowthY2 = form.watch("revenueGrowthY2")
  const watchedGrowthY3 = form.watch("revenueGrowthY3")
  const watchedChurn    = form.watch("churnRate")
  const watchedARPU     = form.watch("averageRevenuePerUser")

  // Mode + business type watches
  const watchedMode     = form.watch("revenueEntryMode")
  const watchedTypeMain = form.watch("businessTypeMain")
  const watchedTypeSub  = form.watch("businessTypeSub")

  const isTopLine = watchedMode !== "driverBased"
  const isDriver  = watchedMode === "driverBased"

  // When business type main changes, clear sub-type if it doesn't belong to the new main.
  useEffect(() => {
    if (!watchedTypeMain) return
    const validSubs = BUSINESS_TYPE_HIERARCHY[watchedTypeMain as BusinessTypeMain]?.subs || []
    const validSubKeys = validSubs.map((s) => s.key as string)
    if (watchedTypeSub && !validSubKeys.includes(watchedTypeSub)) {
      form.setValue("businessTypeSub", "")
    }
  }, [watchedTypeMain, watchedTypeSub, form])

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

        {/* revenue entry mode toggle */}
        <div className="rounded-lg border p-4 bg-muted/10">
          <div className="mb-3">
            <h3 className="text-sm font-semibold mb-1">Revenue entry mode</h3>
            <p className="text-xs text-muted-foreground">
              Top-line is faster. Detailed drivers are more granular and investor-grade — the questionnaire will ask for business-specific inputs, then compute yearly revenue automatically.
            </p>
          </div>
          <div className="flex gap-1 rounded-md border p-1 bg-background">
            <Button
              type="button"
              variant={isTopLine ? "default" : "ghost"}
              onClick={() => form.setValue("revenueEntryMode", "topLine")}
              className="flex-1 justify-center text-xs sm:text-sm"
            >
              Top-line yearly totals
            </Button>
            <Button
              type="button"
              variant={isDriver ? "default" : "ghost"}
              onClick={() => form.setValue("revenueEntryMode", "driverBased")}
              className="flex-1 justify-center text-xs sm:text-sm"
            >
              Detailed drivers
            </Button>
          </div>
        </div>

        {/* Driver mode: business type + sub-type pickers */}
        {isDriver && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="businessTypeMain"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select business type" /></SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-72">
                      {(Object.keys(BUSINESS_TYPE_HIERARCHY) as BusinessTypeMain[]).map((key) => (
                        <SelectItem key={key} value={key}>
                          {BUSINESS_TYPE_HIERARCHY[key].label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="businessTypeSub"
              render={({ field }) => {
                const subs = watchedTypeMain
                  ? BUSINESS_TYPE_HIERARCHY[watchedTypeMain as BusinessTypeMain]?.subs || []
                  : []
                return (
                  <FormItem>
                    <FormLabel>Business sub-type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!watchedTypeMain}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={watchedTypeMain ? "Select sub-type" : "Choose business type first"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-72">
                        {subs.map((s) => (
                          <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )
              }}
            />
          </div>
        )}

        {/* Driver mode: SaaS B2B drivers */}
        {isDriver && watchedTypeSub === "saas_b2b" && (
          <div>
            <h3 className="text-sm font-semibold mb-1">SaaS B2B drivers</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Year 1-3 revenue will be computed from these drivers in the next release.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="saasB2b_startingCustomers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Starting customer count</FormLabel>
                    <FormControl>
                      <input type="number" min="0" placeholder="e.g. 20" className={plain} {...field} />
                    </FormControl>
                    <FormDescription>Paying customers at month 0</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="saasB2b_newCustomersPerMonth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New customers per month</FormLabel>
                    <FormControl>
                      <input type="number" min="0" placeholder="e.g. 5" className={plain} {...field} />
                    </FormControl>
                    <FormDescription>Sales pipeline output per month</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="saasB2b_monthlyChurnRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly churn rate (%)</FormLabel>
                    <FormControl>
                      <input type="number" min="0" max="100" step="0.1" placeholder="e.g. 2" className={plain} {...field} />
                    </FormControl>
                    <FormDescription>B2B benchmark: 1-2% is best-in-class</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="saasB2b_arpu"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ARPU ({currency} per customer/month)</FormLabel>
                    <FormControl>
                      <input type="number" min="0" placeholder="e.g. 150" className={plain} {...field} />
                    </FormControl>
                    <FormDescription>Blended MRR per customer</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="saasB2b_expansionRevenuePct"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Expansion revenue (%)</FormLabel>
                    <FormControl>
                      <input type="number" min="0" max="100" placeholder="e.g. 15" className={plain} {...field} />
                    </FormControl>
                    <FormDescription>Upsells and seat expansion. Best-in-class: 15-30%</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        {/* Driver mode: E-commerce D2C drivers */}
        {isDriver && watchedTypeSub === "ecom_d2c" && (
          <div>
            <h3 className="text-sm font-semibold mb-1">E-commerce D2C drivers</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Year 1-3 revenue will be computed from these drivers in the next release.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="ecomD2c_monthlyTraffic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly website traffic</FormLabel>
                    <FormControl>
                      <input type="number" min="0" placeholder="e.g. 25000" className={plain} {...field} />
                    </FormControl>
                    <FormDescription>Unique sessions/month across all channels</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="ecomD2c_conversionRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conversion rate (%)</FormLabel>
                    <FormControl>
                      <input type="number" min="0" max="100" step="0.1" placeholder="e.g. 2.5" className={plain} {...field} />
                    </FormControl>
                    <FormDescription>D2C average: 2-3%. Best-in-class: 4-5%</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="ecomD2c_averageOrderValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Average order value ({currency})</FormLabel>
                    <FormControl>
                      <input type="number" min="0" placeholder="e.g. 65" className={plain} {...field} />
                    </FormControl>
                    <FormDescription>Total revenue divided by number of orders</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="ecomD2c_repeatPurchaseRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Repeat purchase rate (%)</FormLabel>
                    <FormControl>
                      <input type="number" min="0" max="100" placeholder="e.g. 25" className={plain} {...field} />
                    </FormControl>
                    <FormDescription>Purchase again within 12mo. Benchmark: 20-30%</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        {/* Driver mode: Professional Services drivers */}
        {isDriver && watchedTypeSub === "services_professional" && (
          <div>
            <h3 className="text-sm font-semibold mb-1">Professional services drivers</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Year 1-3 revenue will be computed from these drivers in the next release.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="svcProf_billableStaffCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Billable staff count</FormLabel>
                    <FormControl>
                      <input type="number" min="0" placeholder="e.g. 8" className={plain} {...field} />
                    </FormControl>
                    <FormDescription>Consultants who bill clients (exclude ops/admin)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="svcProf_billableHoursPerMonth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Billable hours per staff/month</FormLabel>
                    <FormControl>
                      <input type="number" min="0" max="250" placeholder="e.g. 160" className={plain} {...field} />
                    </FormControl>
                    <FormDescription>Capacity before utilization. Consulting: 160-180</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="svcProf_utilizationRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Utilization rate (%)</FormLabel>
                    <FormControl>
                      <input type="number" min="0" max="100" placeholder="e.g. 70" className={plain} {...field} />
                    </FormControl>
                    <FormDescription>% of capacity actually billed. Boutique: 60-75%</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="svcProf_hourlyRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Blended hourly rate ({currency})</FormLabel>
                    <FormControl>
                      <input type="number" min="0" placeholder="e.g. 200" className={plain} {...field} />
                    </FormControl>
                    <FormDescription>Average across all staff levels</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        {/* Driver mode: Product Manufacturing drivers */}
        {isDriver && watchedTypeSub === "product_manufacturing" && (
          <div>
            <h3 className="text-sm font-semibold mb-1">Manufacturing drivers</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Year 1-3 revenue will be computed from these drivers in the next release.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="productMfg_unitsPerMonth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Units produced per month</FormLabel>
                    <FormControl>
                      <input type="number" min="0" placeholder="e.g. 5000" className={plain} {...field} />
                    </FormControl>
                    <FormDescription>Units at full production</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="productMfg_unitPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit selling price ({currency})</FormLabel>
                    <FormControl>
                      <input type="number" min="0" placeholder="e.g. 45" className={plain} {...field} />
                    </FormControl>
                    <FormDescription>Average selling price before discounts</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="productMfg_capacityUtilization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacity utilization (%)</FormLabel>
                    <FormControl>
                      <input type="number" min="0" max="100" placeholder="e.g. 75" className={plain} {...field} />
                    </FormControl>
                    <FormDescription>SME manufacturers: 70-85% typical</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="productMfg_sellThroughRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sell-through rate (%)</FormLabel>
                    <FormControl>
                      <input type="number" min="0" max="100" placeholder="e.g. 85" className={plain} {...field} />
                    </FormControl>
                    <FormDescription>% of units sold vs held as inventory</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        {/* Driver mode: Product Retail drivers */}
        {isDriver && watchedTypeSub === "product_retail" && (
          <div>
            <h3 className="text-sm font-semibold mb-1">Retail (own store) drivers</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Year 1-3 revenue will be computed from these drivers in the next release.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="productRetail_storeCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Store count</FormLabel>
                    <FormControl>
                      <input type="number" min="0" placeholder="e.g. 4" className={plain} {...field} />
                    </FormControl>
                    <FormDescription>Physical locations you operate</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="productRetail_revenuePerStore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Revenue per store per month ({currency})</FormLabel>
                    <FormControl>
                      <input type="number" min="0" placeholder="e.g. 40000" className={plain} {...field} />
                    </FormControl>
                    <FormDescription>UK high street SME: £15k-£80k/mo</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="productRetail_sameSalesGrowth"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Same-store sales growth (%)</FormLabel>
                    <FormControl>
                      <input type="number" step="0.1" placeholder="e.g. 3" className={plain} {...field} />
                    </FormControl>
                    <FormDescription>Year-over-year like-for-like growth. Established retail: 2-5%</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        {/* Driver mode: Product Wholesale drivers */}
        {isDriver && watchedTypeSub === "product_wholesale" && (
          <div>
            <h3 className="text-sm font-semibold mb-1">Wholesale / distribution drivers</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Year 1-3 revenue will be computed from these drivers in the next release.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="productWhsl_activeAccounts"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Active accounts</FormLabel>
                    <FormControl>
                      <input type="number" min="0" placeholder="e.g. 80" className={plain} {...field} />
                    </FormControl>
                    <FormDescription>Accounts that ordered in last 90 days</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="productWhsl_ordersPerAccount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Orders per account per month</FormLabel>
                    <FormControl>
                      <input type="number" min="0" step="0.1" placeholder="e.g. 1.5" className={plain} {...field} />
                    </FormControl>
                    <FormDescription>Average order frequency per account</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="productWhsl_averageOrderValue"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Average order value ({currency})</FormLabel>
                    <FormControl>
                      <input type="number" min="0" placeholder="e.g. 1200" className={plain} {...field} />
                    </FormControl>
                    <FormDescription>Average revenue per wholesale order</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        {/* Driver mode: Real Estate Development drivers */}
        {isDriver && watchedTypeSub === "realestate_development" && (
          <div>
            <h3 className="text-sm font-semibold mb-1">Property development drivers</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Year 1-3 revenue will be computed from these drivers in the next release.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="reDev_unitsBuiltYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Units built per year</FormLabel>
                    <FormControl>
                      <input type="number" min="0" placeholder="e.g. 12" className={plain} {...field} />
                    </FormControl>
                    <FormDescription>Full completions only</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="reDev_averageSellingPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Avg selling price per unit ({currency})</FormLabel>
                    <FormControl>
                      <input type="number" min="0" placeholder="e.g. 450000" className={plain} {...field} />
                    </FormControl>
                    <FormDescription>Average sale price achieved</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="reDev_sellThroughMonths"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sell-through period (months)</FormLabel>
                    <FormControl>
                      <input type="number" min="0" max="60" placeholder="e.g. 9" className={plain} {...field} />
                    </FormControl>
                    <FormDescription>London prime: 3-6mo. Regional: 6-12mo</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="reDev_grossMargin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gross development margin (%)</FormLabel>
                    <FormControl>
                      <input type="number" min="0" max="60" placeholder="e.g. 20" className={plain} {...field} />
                    </FormControl>
                    <FormDescription>UK developers: 18-25% target</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        {/* Driver mode: Real Estate Rental drivers */}
        {isDriver && watchedTypeSub === "realestate_rental" && (
          <div>
            <h3 className="text-sm font-semibold mb-1">Commercial rental / landlord drivers</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Year 1-3 revenue will be computed from these drivers in the next release.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="reRent_rentableUnits"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rentable units</FormLabel>
                    <FormControl>
                      <input type="number" min="0" placeholder="e.g. 24" className={plain} {...field} />
                    </FormControl>
                    <FormDescription>Total lettable units (not sq ft)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="reRent_monthlyRent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly rent per unit ({currency})</FormLabel>
                    <FormControl>
                      <input type="number" min="0" placeholder="e.g. 1800" className={plain} {...field} />
                    </FormControl>
                    <FormDescription>Average monthly rent achieved</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="reRent_occupancyRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Occupancy rate (%)</FormLabel>
                    <FormControl>
                      <input type="number" min="0" max="100" placeholder="e.g. 92" className={plain} {...field} />
                    </FormControl>
                    <FormDescription>UK commercial: 88-95% typical</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="reRent_otherIncomePct"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Other income %</FormLabel>
                    <FormControl>
                      <input type="number" min="0" max="100" placeholder="e.g. 8" className={plain} {...field} />
                    </FormControl>
                    <FormDescription>Parking, storage, service charges as % of rent</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        {/* Driver mode: Real Estate Agency drivers */}
        {isDriver && watchedTypeSub === "realestate_agency" && (
          <div>
            <h3 className="text-sm font-semibold mb-1">Real estate agency (broker) drivers</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Year 1-3 revenue will be computed from these drivers in the next release.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="reAgcy_monthlyTransactions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly transactions</FormLabel>
                    <FormControl>
                      <input type="number" min="0" placeholder="e.g. 8" className={plain} {...field} />
                    </FormControl>
                    <FormDescription>Completed sales + lets per month</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="reAgcy_averageTransactionValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Avg transaction value ({currency})</FormLabel>
                    <FormControl>
                      <input type="number" min="0" placeholder="e.g. 350000" className={plain} {...field} />
                    </FormControl>
                    <FormDescription>Average sale/let value per transaction</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="reAgcy_commissionRate"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Commission rate (%)</FormLabel>
                    <FormControl>
                      <input type="number" min="0" max="30" step="0.1" placeholder="e.g. 2" className={plain} {...field} />
                    </FormControl>
                    <FormDescription>UK residential sales: 1-3%. Lettings: 8-15% of annual rent</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        {/* Driver mode: Real Estate REIT drivers */}
        {isDriver && watchedTypeSub === "realestate_reit" && (
          <div>
            <h3 className="text-sm font-semibold mb-1">REIT / property fund drivers</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Year 1-3 revenue will be computed from these drivers in the next release.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="reReit_portfolioProperties"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Portfolio properties</FormLabel>
                    <FormControl>
                      <input type="number" min="0" placeholder="e.g. 15" className={plain} {...field} />
                    </FormControl>
                    <FormDescription>Number of properties held</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="reReit_averageYield"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Average property yield (%)</FormLabel>
                    <FormControl>
                      <input type="number" min="0" max="20" step="0.1" placeholder="e.g. 5" className={plain} {...field} />
                    </FormControl>
                    <FormDescription>UK REITs: 4-7% net. Commercial: 5-8%. Residential: 3-5%</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="reReit_navGrowth"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>NAV growth (annual, %)</FormLabel>
                    <FormControl>
                      <input type="number" step="0.1" placeholder="e.g. 3" className={plain} {...field} />
                    </FormControl>
                    <FormDescription>Long-term UK property: 2-4% real growth</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        {/* Driver mode: Real Estate Short-term Rental drivers (Airbnb / B&B / holiday lets) */}
        {isDriver && watchedTypeSub === "realestate_shorttermrental" && (
          <div>
            <h3 className="text-sm font-semibold mb-1">Short-term rental drivers</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Year 1-3 revenue will be computed from these drivers in the next release.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="reStr_rentableUnits"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rentable units / rooms</FormLabel>
                    <FormControl>
                      <input type="number" min="0" placeholder="e.g. 3" className={plain} {...field} />
                    </FormControl>
                    <FormDescription>Rooms or properties available for short-term letting</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="reStr_averageNightlyRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Average nightly rate ({currency})</FormLabel>
                    <FormControl>
                      <input type="number" min="0" placeholder="e.g. 130" className={plain} {...field} />
                    </FormControl>
                    <FormDescription>UK city: £80-200. Coastal: £120-300. London prime: £200-500+</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="reStr_occupancyRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Occupancy rate (%)</FormLabel>
                    <FormControl>
                      <input type="number" min="0" max="100" placeholder="e.g. 55" className={plain} {...field} />
                    </FormControl>
                    <FormDescription>UK Airbnb hosts: 45-65% typical. Prime location: 70-85%</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="reStr_cleaningFeePerBooking"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cleaning fee per booking ({currency})</FormLabel>
                    <FormControl>
                      <input type="number" min="0" placeholder="e.g. 45" className={plain} {...field} />
                    </FormControl>
                    <FormDescription>UK short-lets: £30-80 typical per booking</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        {/* Driver mode: placeholder for sub-types not yet built */}
        {isDriver && watchedTypeSub && !BUILT_SUB_TYPES.includes(watchedTypeSub) && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
            <p className="text-sm">
              <SparklesIcon className="w-4 h-4 inline mr-1 -mt-0.5" />
              Driver fields for this sub-type are coming in the next release. For now, please switch to <strong>Top-line yearly totals</strong> mode.
            </p>
          </div>
        )}

        {/* Top-line mode only: revenue projections */}
        {isTopLine && (
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
        )}

        {/* Top-line mode only: revenue growth rates */}
        {isTopLine && (
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
                        benchmark={getFieldBenchmark("revenueGrowthY1", watchedGrowthY1)}
                        assumptionKey="revenueGrowthY1"
                        aiContext={{
                          industry: data.step1.industry,
                          subSector: data.step1.subSector,
                          businessStage: data.step1.businessStage,
                          currency: data.step1.currency,
                          country: data.step1.country,
                          currentValues: {
                            revenueModel: data.step2.revenueModel,
                            year1Revenue: data.step2.year1Revenue,
                          },
                        }}
                        onAIAccept={(v) => form.setValue("revenueGrowthY1", String(v))}
                        {...field} />
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
                        benchmark={getFieldBenchmark("revenueGrowthY2", watchedGrowthY2)}
                        assumptionKey="revenueGrowthY2"
                        aiContext={{
                          industry: data.step1.industry,
                          subSector: data.step1.subSector,
                          businessStage: data.step1.businessStage,
                          currency: data.step1.currency,
                          country: data.step1.country,
                          currentValues: {
                            revenueGrowthY1: watchedGrowthY1,
                          },
                        }}
                        onAIAccept={(v) => form.setValue("revenueGrowthY2", String(v))}
                        {...field} />
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
                        benchmark={getFieldBenchmark("revenueGrowthY3", watchedGrowthY3)}
                        assumptionKey="revenueGrowthY3"
                        aiContext={{
                          industry: data.step1.industry,
                          subSector: data.step1.subSector,
                          businessStage: data.step1.businessStage,
                          currency: data.step1.currency,
                          country: data.step1.country,
                          currentValues: {
                            revenueGrowthY2: watchedGrowthY2,
                          },
                        }}
                        onAIAccept={(v) => form.setValue("revenueGrowthY3", String(v))}
                        {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        {/* Top-line mode only: unit economics */}
        {isTopLine && (
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
                        showBar={false}
                        assumptionKey="arpu"
                        aiContext={{
                          industry: data.step1.industry,
                          subSector: data.step1.subSector,
                          businessStage: data.step1.businessStage,
                          currency: data.step1.currency,
                          currentValues: {
                            revenueModel: data.step2.revenueModel,
                          },
                        }}
                        onAIAccept={(v) => form.setValue("arpu", String(v))}
                        {...field} />
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
                        benchmark={getFieldBenchmark("churnRateAnnual", watchedChurn)}
                        assumptionKey="churnRate"
                        aiContext={{
                          industry: data.step1.industry,
                          subSector: data.step1.subSector,
                          businessStage: data.step1.businessStage,
                          currentValues: {
                            revenueModel: data.step2.revenueModel,
                          },
                        }}
                        onAIAccept={(v) => form.setValue("churnRate", String(v))}
                        {...field} />
                    </FormControl>
                    <FormDescription>% of customers lost per year</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        {/* primary growth driver — shown in both modes */}
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
