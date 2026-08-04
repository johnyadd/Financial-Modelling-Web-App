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

// Sub-types that have driver UI blocks built — all 27 sub-types as of Session 3c
const BUILT_SUB_TYPES = [
  // Session 2a
  "saas_b2b", "ecom_d2c", "services_professional",
  // Session 3a — Product
  "product_manufacturing", "product_retail", "product_wholesale",
  // Session 3a — Real Estate
  "realestate_development", "realestate_rental", "realestate_agency",
  "realestate_reit", "realestate_shorttermrental",
  // Session 3b — Healthcare
  "health_clinic", "health_hospital", "health_device", "health_saas", "health_pharmacy",
  // Session 3b — Education
  "edu_institution", "edu_edtech", "edu_tutoring", "edu_corptraining",
  // Session 3c — SaaS remaining, E-com, Services remaining, Hospitality
  "saas_b2c", "saas_usage",
  "ecom_marketplace",
  "services_agency", "services_freelance",
  "hosp_restaurant", "hosp_hotel", "hosp_catering",
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

      revenueEntryMode:      data.step2.revenueEntryMode ?? "topLine",
      businessTypeMain:      data.step2.businessTypeMain ?? "",
      businessTypeSub:       data.step2.businessTypeSub ?? "",

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

      // Session 2a
      saasB2b_startingCustomers:    data.step2.saasB2b_startingCustomers ?? "",
      saasB2b_newCustomersPerMonth: data.step2.saasB2b_newCustomersPerMonth ?? "",
      saasB2b_monthlyChurnRate:     data.step2.saasB2b_monthlyChurnRate ?? "",
      saasB2b_arpu:                 data.step2.saasB2b_arpu ?? "",
      saasB2b_expansionRevenuePct:  data.step2.saasB2b_expansionRevenuePct ?? "",

      ecomD2c_monthlyTraffic:     data.step2.ecomD2c_monthlyTraffic ?? "",
      ecomD2c_conversionRate:     data.step2.ecomD2c_conversionRate ?? "",
      ecomD2c_averageOrderValue:  data.step2.ecomD2c_averageOrderValue ?? "",
      ecomD2c_repeatPurchaseRate: data.step2.ecomD2c_repeatPurchaseRate ?? "",

      svcProf_billableStaffCount:    data.step2.svcProf_billableStaffCount ?? "",
      svcProf_billableHoursPerMonth: data.step2.svcProf_billableHoursPerMonth ?? "",
      svcProf_utilizationRate:       data.step2.svcProf_utilizationRate ?? "",
      svcProf_hourlyRate:            data.step2.svcProf_hourlyRate ?? "",

      // Session 3a
      productMfg_unitsPerMonth:        data.step2.productMfg_unitsPerMonth ?? "",
      productMfg_unitPrice:            data.step2.productMfg_unitPrice ?? "",
      productMfg_capacityUtilization:  data.step2.productMfg_capacityUtilization ?? "",
      productMfg_sellThroughRate:      data.step2.productMfg_sellThroughRate ?? "",

      productRetail_storeCount:      data.step2.productRetail_storeCount ?? "",
      productRetail_revenuePerStore: data.step2.productRetail_revenuePerStore ?? "",
      productRetail_sameSalesGrowth: data.step2.productRetail_sameSalesGrowth ?? "",

      productWhsl_activeAccounts:    data.step2.productWhsl_activeAccounts ?? "",
      productWhsl_ordersPerAccount:  data.step2.productWhsl_ordersPerAccount ?? "",
      productWhsl_averageOrderValue: data.step2.productWhsl_averageOrderValue ?? "",

      reDev_unitsBuiltYear:      data.step2.reDev_unitsBuiltYear ?? "",
      reDev_averageSellingPrice: data.step2.reDev_averageSellingPrice ?? "",
      reDev_sellThroughMonths:   data.step2.reDev_sellThroughMonths ?? "",
      reDev_grossMargin:         data.step2.reDev_grossMargin ?? "",

      reRent_rentableUnits:  data.step2.reRent_rentableUnits ?? "",
      reRent_monthlyRent:    data.step2.reRent_monthlyRent ?? "",
      reRent_occupancyRate:  data.step2.reRent_occupancyRate ?? "",
      reRent_otherIncomePct: data.step2.reRent_otherIncomePct ?? "",

      reAgcy_monthlyTransactions:    data.step2.reAgcy_monthlyTransactions ?? "",
      reAgcy_averageTransactionValue: data.step2.reAgcy_averageTransactionValue ?? "",
      reAgcy_commissionRate:         data.step2.reAgcy_commissionRate ?? "",

      reReit_portfolioProperties: data.step2.reReit_portfolioProperties ?? "",
      reReit_averageYield:        data.step2.reReit_averageYield ?? "",
      reReit_navGrowth:           data.step2.reReit_navGrowth ?? "",

      reStr_rentableUnits:         data.step2.reStr_rentableUnits ?? "",
      reStr_averageNightlyRate:    data.step2.reStr_averageNightlyRate ?? "",
      reStr_occupancyRate:         data.step2.reStr_occupancyRate ?? "",
      reStr_cleaningFeePerBooking: data.step2.reStr_cleaningFeePerBooking ?? "",

      // Session 3b
      healthClinic_patientVisitsPerMonth: data.step2.healthClinic_patientVisitsPerMonth ?? "",
      healthClinic_averageFeePerVisit:    data.step2.healthClinic_averageFeePerVisit ?? "",
      healthClinic_providerCount:         data.step2.healthClinic_providerCount ?? "",
      healthClinic_retentionRate:         data.step2.healthClinic_retentionRate ?? "",

      healthHosp_bedCount:            data.step2.healthHosp_bedCount ?? "",
      healthHosp_occupancyRate:       data.step2.healthHosp_occupancyRate ?? "",
      healthHosp_averageDailyRate:    data.step2.healthHosp_averageDailyRate ?? "",
      healthHosp_ancillaryRevenuePct: data.step2.healthHosp_ancillaryRevenuePct ?? "",

      healthDev_unitsSoldPerQuarter: data.step2.healthDev_unitsSoldPerQuarter ?? "",
      healthDev_unitPrice:           data.step2.healthDev_unitPrice ?? "",
      healthDev_serviceRevenuePct:   data.step2.healthDev_serviceRevenuePct ?? "",
      healthDev_installBase:         data.step2.healthDev_installBase ?? "",

      healthSaas_startingCustomers:    data.step2.healthSaas_startingCustomers ?? "",
      healthSaas_newCustomersPerMonth: data.step2.healthSaas_newCustomersPerMonth ?? "",
      healthSaas_arpu:                 data.step2.healthSaas_arpu ?? "",
      healthSaas_monthlyChurnRate:     data.step2.healthSaas_monthlyChurnRate ?? "",

      healthPharm_dailyFootfall:          data.step2.healthPharm_dailyFootfall ?? "",
      healthPharm_conversionRate:         data.step2.healthPharm_conversionRate ?? "",
      healthPharm_basketSize:             data.step2.healthPharm_basketSize ?? "",
      healthPharm_prescriptionRevenuePct: data.step2.healthPharm_prescriptionRevenuePct ?? "",

      eduInst_enrolledStudents:   data.step2.eduInst_enrolledStudents ?? "",
      eduInst_tuitionPerStudent:  data.step2.eduInst_tuitionPerStudent ?? "",
      eduInst_capacity:           data.step2.eduInst_capacity ?? "",
      eduInst_retentionRate:      data.step2.eduInst_retentionRate ?? "",

      eduTech_monthlySignups:       data.step2.eduTech_monthlySignups ?? "",
      eduTech_paidConversionRate:   data.step2.eduTech_paidConversionRate ?? "",
      eduTech_arpu:                 data.step2.eduTech_arpu ?? "",
      eduTech_monthlyChurnRate:     data.step2.eduTech_monthlyChurnRate ?? "",

      eduTut_activeStudents:             data.step2.eduTut_activeStudents ?? "",
      eduTut_sessionsPerStudentPerMonth: data.step2.eduTut_sessionsPerStudentPerMonth ?? "",
      eduTut_pricePerSession:            data.step2.eduTut_pricePerSession ?? "",

      eduCorp_enterpriseContracts:  data.step2.eduCorp_enterpriseContracts ?? "",
      eduCorp_averageContractValue: data.step2.eduCorp_averageContractValue ?? "",
      eduCorp_retentionRate:        data.step2.eduCorp_retentionRate ?? "",
      eduCorp_expansionPct:         data.step2.eduCorp_expansionPct ?? "",

      // Session 3c — SaaS B2C drivers
      saasB2c_monthlySignups:     data.step2.saasB2c_monthlySignups ?? "",
      saasB2c_paidConversionRate: data.step2.saasB2c_paidConversionRate ?? "",
      saasB2c_arpu:               data.step2.saasB2c_arpu ?? "",
      saasB2c_monthlyChurnRate:   data.step2.saasB2c_monthlyChurnRate ?? "",
      saasB2c_viralCoefficient:   data.step2.saasB2c_viralCoefficient ?? "",

      // Session 3c — SaaS Usage-based drivers
      saasUsage_activeAccounts:             data.step2.saasUsage_activeAccounts ?? "",
      saasUsage_avgUnitsPerAccountPerMonth: data.step2.saasUsage_avgUnitsPerAccountPerMonth ?? "",
      saasUsage_pricePerUnit:               data.step2.saasUsage_pricePerUnit ?? "",
      saasUsage_monthlyAccountChurnRate:    data.step2.saasUsage_monthlyAccountChurnRate ?? "",

      // Session 3c — E-commerce Marketplace drivers
      ecomMkt_monthlyGmv:                    data.step2.ecomMkt_monthlyGmv ?? "",
      ecomMkt_takeRate:                      data.step2.ecomMkt_takeRate ?? "",
      ecomMkt_activeSellers:                 data.step2.ecomMkt_activeSellers ?? "",
      ecomMkt_transactionsPerSellerPerMonth: data.step2.ecomMkt_transactionsPerSellerPerMonth ?? "",

      // Session 3c — Services Agency drivers
      svcAgcy_retainedClients:     data.step2.svcAgcy_retainedClients ?? "",
      svcAgcy_arpaPerMonth:        data.step2.svcAgcy_arpaPerMonth ?? "",
      svcAgcy_newProjectsPerMonth: data.step2.svcAgcy_newProjectsPerMonth ?? "",
      svcAgcy_averageProjectValue: data.step2.svcAgcy_averageProjectValue ?? "",

      // Session 3c — Services Freelance drivers
      svcFree_chargeableHoursPerWeek: data.step2.svcFree_chargeableHoursPerWeek ?? "",
      svcFree_weeklyRate:             data.step2.svcFree_weeklyRate ?? "",
      svcFree_weeksWorkedPerYear:     data.step2.svcFree_weeksWorkedPerYear ?? "",

      // Session 3c — Hospitality Restaurant drivers
      hospRest_seatCount:            data.step2.hospRest_seatCount ?? "",
      hospRest_tableTurnsPerDay:     data.step2.hospRest_tableTurnsPerDay ?? "",
      hospRest_averageSpendPerCover: data.step2.hospRest_averageSpendPerCover ?? "",
      hospRest_operatingDaysPerYear: data.step2.hospRest_operatingDaysPerYear ?? "",

      // Session 3c — Hospitality Hotel drivers
      hospHotel_roomCount:              data.step2.hospHotel_roomCount ?? "",
      hospHotel_occupancyRate:          data.step2.hospHotel_occupancyRate ?? "",
      hospHotel_averageDailyRate:       data.step2.hospHotel_averageDailyRate ?? "",
      hospHotel_foodBeverageRevenuePct: data.step2.hospHotel_foodBeverageRevenuePct ?? "",

      // Session 3c — Hospitality Catering drivers
      hospCater_eventsPerMonth:    data.step2.hospCater_eventsPerMonth ?? "",
      hospCater_averageEventValue: data.step2.hospCater_averageEventValue ?? "",
      hospCater_growthRate:        data.step2.hospCater_growthRate ?? "",
    },
  })

  const watchedGrowthY1 = form.watch("revenueGrowthY1")
  const watchedGrowthY2 = form.watch("revenueGrowthY2")
  const watchedGrowthY3 = form.watch("revenueGrowthY3")
  const watchedChurn    = form.watch("churnRate")
  const watchedARPU     = form.watch("averageRevenuePerUser")

  const watchedMode     = form.watch("revenueEntryMode")
  const watchedTypeMain = form.watch("businessTypeMain")
  const watchedTypeSub  = form.watch("businessTypeSub")

  const isTopLine = watchedMode !== "driverBased"
  const isDriver  = watchedMode === "driverBased"

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

        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUpIcon className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Revenue assumptions</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Enter your revenue projections and growth assumptions.
          </p>
        </div>

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

        {hasBenchmarks && benchmarks && (
          <BenchmarkPanel benchmarks={benchmarks} industry={industry} subSector={subSector} />
        )}

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

        {/* Session 2a — SaaS B2B */}
        {isDriver && watchedTypeSub === "saas_b2b" && (
          <div>
            <h3 className="text-sm font-semibold mb-1">SaaS B2B drivers</h3>
            <p className="text-xs text-muted-foreground mb-3">Year 1-3 revenue will be computed from these drivers in the next release.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="saasB2b_startingCustomers" render={({ field }) => (<FormItem><FormLabel>Starting customer count</FormLabel><FormControl><input type="number" min="0" placeholder="e.g. 20" className={plain} {...field} /></FormControl><FormDescription>Paying customers at month 0</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="saasB2b_newCustomersPerMonth" render={({ field }) => (<FormItem><FormLabel>New customers per month</FormLabel><FormControl><input type="number" min="0" placeholder="e.g. 5" className={plain} {...field} /></FormControl><FormDescription>Sales pipeline output per month</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="saasB2b_monthlyChurnRate" render={({ field }) => (<FormItem><FormLabel>Monthly churn rate (%)</FormLabel><FormControl><input type="number" min="0" max="100" step="0.1" placeholder="e.g. 2" className={plain} {...field} /></FormControl><FormDescription>B2B benchmark: 1-2% is best-in-class</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="saasB2b_arpu" render={({ field }) => (<FormItem><FormLabel>ARPU ({currency} per customer/month)</FormLabel><FormControl><input type="number" min="0" placeholder="e.g. 150" className={plain} {...field} /></FormControl><FormDescription>Blended MRR per customer</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="saasB2b_expansionRevenuePct" render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel>Expansion revenue (%)</FormLabel><FormControl><input type="number" min="0" max="100" placeholder="e.g. 15" className={plain} {...field} /></FormControl><FormDescription>Upsells and seat expansion. Best-in-class: 15-30%</FormDescription><FormMessage /></FormItem>)} />
            </div>
          </div>
        )}

        {/* Session 2a — E-commerce D2C */}
        {isDriver && watchedTypeSub === "ecom_d2c" && (
          <div>
            <h3 className="text-sm font-semibold mb-1">E-commerce D2C drivers</h3>
            <p className="text-xs text-muted-foreground mb-3">Year 1-3 revenue will be computed from these drivers in the next release.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="ecomD2c_monthlyTraffic" render={({ field }) => (<FormItem><FormLabel>Monthly website traffic</FormLabel><FormControl><input type="number" min="0" placeholder="e.g. 25000" className={plain} {...field} /></FormControl><FormDescription>Unique sessions/month across all channels</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="ecomD2c_conversionRate" render={({ field }) => (<FormItem><FormLabel>Conversion rate (%)</FormLabel><FormControl><input type="number" min="0" max="100" step="0.1" placeholder="e.g. 2.5" className={plain} {...field} /></FormControl><FormDescription>D2C average: 2-3%. Best-in-class: 4-5%</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="ecomD2c_averageOrderValue" render={({ field }) => (<FormItem><FormLabel>Average order value ({currency})</FormLabel><FormControl><input type="number" min="0" placeholder="e.g. 65" className={plain} {...field} /></FormControl><FormDescription>Total revenue divided by number of orders</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="ecomD2c_repeatPurchaseRate" render={({ field }) => (<FormItem><FormLabel>Repeat purchase rate (%)</FormLabel><FormControl><input type="number" min="0" max="100" placeholder="e.g. 25" className={plain} {...field} /></FormControl><FormDescription>Purchase again within 12mo. Benchmark: 20-30%</FormDescription><FormMessage /></FormItem>)} />
            </div>
          </div>
        )}

        {/* Session 2a — Professional Services */}
        {isDriver && watchedTypeSub === "services_professional" && (
          <div>
            <h3 className="text-sm font-semibold mb-1">Professional services drivers</h3>
            <p className="text-xs text-muted-foreground mb-3">Year 1-3 revenue will be computed from these drivers in the next release.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="svcProf_billableStaffCount" render={({ field }) => (<FormItem><FormLabel>Billable staff count</FormLabel><FormControl><input type="number" min="0" placeholder="e.g. 8" className={plain} {...field} /></FormControl><FormDescription>Consultants who bill clients (exclude ops/admin)</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="svcProf_billableHoursPerMonth" render={({ field }) => (<FormItem><FormLabel>Billable hours per staff/month</FormLabel><FormControl><input type="number" min="0" max="250" placeholder="e.g. 160" className={plain} {...field} /></FormControl><FormDescription>Capacity before utilization. Consulting: 160-180</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="svcProf_utilizationRate" render={({ field }) => (<FormItem><FormLabel>Utilization rate (%)</FormLabel><FormControl><input type="number" min="0" max="100" placeholder="e.g. 70" className={plain} {...field} /></FormControl><FormDescription>% of capacity actually billed. Boutique: 60-75%</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="svcProf_hourlyRate" render={({ field }) => (<FormItem><FormLabel>Blended hourly rate ({currency})</FormLabel><FormControl><input type="number" min="0" placeholder="e.g. 200" className={plain} {...field} /></FormControl><FormDescription>Average across all staff levels</FormDescription><FormMessage /></FormItem>)} />
            </div>
          </div>
        )}

        {/* Session 3a — Product Manufacturing */}
        {isDriver && watchedTypeSub === "product_manufacturing" && (
          <div>
            <h3 className="text-sm font-semibold mb-1">Manufacturing drivers</h3>
            <p className="text-xs text-muted-foreground mb-3">Year 1-3 revenue will be computed from these drivers in the next release.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="productMfg_unitsPerMonth" render={({ field }) => (<FormItem><FormLabel>Units produced per month</FormLabel><FormControl><input type="number" min="0" placeholder="e.g. 5000" className={plain} {...field} /></FormControl><FormDescription>Units at full production</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="productMfg_unitPrice" render={({ field }) => (<FormItem><FormLabel>Unit selling price ({currency})</FormLabel><FormControl><input type="number" min="0" placeholder="e.g. 45" className={plain} {...field} /></FormControl><FormDescription>Average selling price before discounts</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="productMfg_capacityUtilization" render={({ field }) => (<FormItem><FormLabel>Capacity utilization (%)</FormLabel><FormControl><input type="number" min="0" max="100" placeholder="e.g. 75" className={plain} {...field} /></FormControl><FormDescription>SME manufacturers: 70-85% typical</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="productMfg_sellThroughRate" render={({ field }) => (<FormItem><FormLabel>Sell-through rate (%)</FormLabel><FormControl><input type="number" min="0" max="100" placeholder="e.g. 85" className={plain} {...field} /></FormControl><FormDescription>% of units sold vs held as inventory</FormDescription><FormMessage /></FormItem>)} />
            </div>
          </div>
        )}

        {/* Session 3a — Product Retail */}
        {isDriver && watchedTypeSub === "product_retail" && (
          <div>
            <h3 className="text-sm font-semibold mb-1">Retail (own store) drivers</h3>
            <p className="text-xs text-muted-foreground mb-3">Year 1-3 revenue will be computed from these drivers in the next release.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="productRetail_storeCount" render={({ field }) => (<FormItem><FormLabel>Store count</FormLabel><FormControl><input type="number" min="0" placeholder="e.g. 4" className={plain} {...field} /></FormControl><FormDescription>Physical locations you operate</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="productRetail_revenuePerStore" render={({ field }) => (<FormItem><FormLabel>Revenue per store per month ({currency})</FormLabel><FormControl><input type="number" min="0" placeholder="e.g. 40000" className={plain} {...field} /></FormControl><FormDescription>UK high street SME: £15k-£80k/mo</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="productRetail_sameSalesGrowth" render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel>Same-store sales growth (%)</FormLabel><FormControl><input type="number" step="0.1" placeholder="e.g. 3" className={plain} {...field} /></FormControl><FormDescription>Year-over-year like-for-like growth. Established retail: 2-5%</FormDescription><FormMessage /></FormItem>)} />
            </div>
          </div>
        )}

        {/* Session 3a — Product Wholesale */}
        {isDriver && watchedTypeSub === "product_wholesale" && (
          <div>
            <h3 className="text-sm font-semibold mb-1">Wholesale / distribution drivers</h3>
            <p className="text-xs text-muted-foreground mb-3">Year 1-3 revenue will be computed from these drivers in the next release.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="productWhsl_activeAccounts" render={({ field }) => (<FormItem><FormLabel>Active accounts</FormLabel><FormControl><input type="number" min="0" placeholder="e.g. 80" className={plain} {...field} /></FormControl><FormDescription>Accounts that ordered in last 90 days</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="productWhsl_ordersPerAccount" render={({ field }) => (<FormItem><FormLabel>Orders per account per month</FormLabel><FormControl><input type="number" min="0" step="0.1" placeholder="e.g. 1.5" className={plain} {...field} /></FormControl><FormDescription>Average order frequency per account</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="productWhsl_averageOrderValue" render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel>Average order value ({currency})</FormLabel><FormControl><input type="number" min="0" placeholder="e.g. 1200" className={plain} {...field} /></FormControl><FormDescription>Average revenue per wholesale order</FormDescription><FormMessage /></FormItem>)} />
            </div>
          </div>
        )}

        {/* Session 3a — Real Estate Development */}
        {isDriver && watchedTypeSub === "realestate_development" && (
          <div>
            <h3 className="text-sm font-semibold mb-1">Property development drivers</h3>
            <p className="text-xs text-muted-foreground mb-3">Year 1-3 revenue will be computed from these drivers in the next release.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="reDev_unitsBuiltYear" render={({ field }) => (<FormItem><FormLabel>Units built per year</FormLabel><FormControl><input type="number" min="0" placeholder="e.g. 12" className={plain} {...field} /></FormControl><FormDescription>Full completions only</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="reDev_averageSellingPrice" render={({ field }) => (<FormItem><FormLabel>Avg selling price per unit ({currency})</FormLabel><FormControl><input type="number" min="0" placeholder="e.g. 450000" className={plain} {...field} /></FormControl><FormDescription>Average sale price achieved</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="reDev_sellThroughMonths" render={({ field }) => (<FormItem><FormLabel>Sell-through period (months)</FormLabel><FormControl><input type="number" min="0" max="60" placeholder="e.g. 9" className={plain} {...field} /></FormControl><FormDescription>London prime: 3-6mo. Regional: 6-12mo</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="reDev_grossMargin" render={({ field }) => (<FormItem><FormLabel>Gross development margin (%)</FormLabel><FormControl><input type="number" min="0" max="60" placeholder="e.g. 20" className={plain} {...field} /></FormControl><FormDescription>UK developers: 18-25% target</FormDescription><FormMessage /></FormItem>)} />
            </div>
          </div>
        )}

        {/* Session 3a — Real Estate Rental */}
        {isDriver && watchedTypeSub === "realestate_rental" && (
          <div>
            <h3 className="text-sm font-semibold mb-1">Commercial rental / landlord drivers</h3>
            <p className="text-xs text-muted-foreground mb-3">Year 1-3 revenue will be computed from these drivers in the next release.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="reRent_rentableUnits" render={({ field }) => (<FormItem><FormLabel>Rentable units</FormLabel><FormControl><input type="number" min="0" placeholder="e.g. 24" className={plain} {...field} /></FormControl><FormDescription>Total lettable units (not sq ft)</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="reRent_monthlyRent" render={({ field }) => (<FormItem><FormLabel>Monthly rent per unit ({currency})</FormLabel><FormControl><input type="number" min="0" placeholder="e.g. 1800" className={plain} {...field} /></FormControl><FormDescription>Average monthly rent achieved</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="reRent_occupancyRate" render={({ field }) => (<FormItem><FormLabel>Occupancy rate (%)</FormLabel><FormControl><input type="number" min="0" max="100" placeholder="e.g. 92" className={plain} {...field} /></FormControl><FormDescription>UK commercial: 88-95% typical</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="reRent_otherIncomePct" render={({ field }) => (<FormItem><FormLabel>Other income %</FormLabel><FormControl><input type="number" min="0" max="100" placeholder="e.g. 8" className={plain} {...field} /></FormControl><FormDescription>Parking, storage, service charges as % of rent</FormDescription><FormMessage /></FormItem>)} />
            </div>
          </div>
        )}

        {/* Session 3a — Real Estate Agency */}
        {isDriver && watchedTypeSub === "realestate_agency" && (
          <div>
            <h3 className="text-sm font-semibold mb-1">Real estate agency (broker) drivers</h3>
            <p className="text-xs text-muted-foreground mb-3">Year 1-3 revenue will be computed from these drivers in the next release.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="reAgcy_monthlyTransactions" render={({ field }) => (<FormItem><FormLabel>Monthly transactions</FormLabel><FormControl><input type="number" min="0" placeholder="e.g. 8" className={plain} {...field} /></FormControl><FormDescription>Completed sales + lets per month</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="reAgcy_averageTransactionValue" render={({ field }) => (<FormItem><FormLabel>Avg transaction value ({currency})</FormLabel><FormControl><input type="number" min="0" placeholder="e.g. 350000" className={plain} {...field} /></FormControl><FormDescription>Average sale/let value per transaction</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="reAgcy_commissionRate" render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel>Commission rate (%)</FormLabel><FormControl><input type="number" min="0" max="30" step="0.1" placeholder="e.g. 2" className={plain} {...field} /></FormControl><FormDescription>UK residential sales: 1-3%. Lettings: 8-15% of annual rent</FormDescription><FormMessage /></FormItem>)} />
            </div>
          </div>
        )}

        {/* Session 3a — Real Estate REIT */}
        {isDriver && watchedTypeSub === "realestate_reit" && (
          <div>
            <h3 className="text-sm font-semibold mb-1">REIT / property fund drivers</h3>
            <p className="text-xs text-muted-foreground mb-3">Year 1-3 revenue will be computed from these drivers in the next release.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="reReit_portfolioProperties" render={({ field }) => (<FormItem><FormLabel>Portfolio properties</FormLabel><FormControl><input type="number" min="0" placeholder="e.g. 15" className={plain} {...field} /></FormControl><FormDescription>Number of properties held</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="reReit_averageYield" render={({ field }) => (<FormItem><FormLabel>Average property yield (%)</FormLabel><FormControl><input type="number" min="0" max="20" step="0.1" placeholder="e.g. 5" className={plain} {...field} /></FormControl><FormDescription>UK REITs: 4-7% net. Commercial: 5-8%. Residential: 3-5%</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="reReit_navGrowth" render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel>NAV growth (annual, %)</FormLabel><FormControl><input type="number" step="0.1" placeholder="e.g. 3" className={plain} {...field} /></FormControl><FormDescription>Long-term UK property: 2-4% real growth</FormDescription><FormMessage /></FormItem>)} />
            </div>
          </div>
        )}

        {/* Session 3a — Real Estate Short-term Rental */}
        {isDriver && watchedTypeSub === "realestate_shorttermrental" && (
          <div>
            <h3 className="text-sm font-semibold mb-1">Short-term rental drivers</h3>
            <p className="text-xs text-muted-foreground mb-3">Year 1-3 revenue will be computed from these drivers in the next release.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="reStr_rentableUnits" render={({ field }) => (<FormItem><FormLabel>Rentable units / rooms</FormLabel><FormControl><input type="number" min="0" placeholder="e.g. 3" className={plain} {...field} /></FormControl><FormDescription>Rooms or properties available for short-term letting</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="reStr_averageNightlyRate" render={({ field }) => (<FormItem><FormLabel>Average nightly rate ({currency})</FormLabel><FormControl><input type="number" min="0" placeholder="e.g. 130" className={plain} {...field} /></FormControl><FormDescription>UK city: £80-200. Coastal: £120-300. London prime: £200-500+</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="reStr_occupancyRate" render={({ field }) => (<FormItem><FormLabel>Occupancy rate (%)</FormLabel><FormControl><input type="number" min="0" max="100" placeholder="e.g. 55" className={plain} {...field} /></FormControl><FormDescription>UK Airbnb hosts: 45-65% typical. Prime location: 70-85%</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="reStr_cleaningFeePerBooking" render={({ field }) => (<FormItem><FormLabel>Cleaning fee per booking ({currency})</FormLabel><FormControl><input type="number" min="0" placeholder="e.g. 45" className={plain} {...field} /></FormControl><FormDescription>UK short-lets: £30-80 typical per booking</FormDescription><FormMessage /></FormItem>)} />
            </div>
          </div>
        )}

        {/* Session 3b — Healthcare Clinic */}
        {isDriver && watchedTypeSub === "health_clinic" && (
          <div>
            <h3 className="text-sm font-semibold mb-1">Clinical practice drivers</h3>
            <p className="text-xs text-muted-foreground mb-3">Year 1-3 revenue will be computed from these drivers in the next release.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="healthClinic_patientVisitsPerMonth" render={({ field }) => (<FormItem><FormLabel>Patient visits per month</FormLabel><FormControl><input type="number" min="0" placeholder="e.g. 800" className={plain} {...field} /></FormControl><FormDescription>UK GP: 150-200/provider/mo. Specialist: 60-100</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="healthClinic_averageFeePerVisit" render={({ field }) => (<FormItem><FormLabel>Average fee per visit ({currency})</FormLabel><FormControl><input type="number" min="0" placeholder="e.g. 120" className={plain} {...field} /></FormControl><FormDescription>UK private GP: £80-150. Specialist: £150-300</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="healthClinic_providerCount" render={({ field }) => (<FormItem><FormLabel>Provider count</FormLabel><FormControl><input type="number" min="0" placeholder="e.g. 4" className={plain} {...field} /></FormControl><FormDescription>Clinicians who bill patients (exclude admin)</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="healthClinic_retentionRate" render={({ field }) => (<FormItem><FormLabel>Patient retention rate (%)</FormLabel><FormControl><input type="number" min="0" max="100" placeholder="e.g. 70" className={plain} {...field} /></FormControl><FormDescription>UK private clinics: 60-80% typical</FormDescription><FormMessage /></FormItem>)} />
            </div>
          </div>
        )}

        {/* Session 3b — Healthcare Hospital */}
        {isDriver && watchedTypeSub === "health_hospital" && (
          <div>
            <h3 className="text-sm font-semibold mb-1">Hospital drivers</h3>
            <p className="text-xs text-muted-foreground mb-3">Year 1-3 revenue will be computed from these drivers in the next release.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="healthHosp_bedCount" render={({ field }) => (<FormItem><FormLabel>Bed count</FormLabel><FormControl><input type="number" min="0" placeholder="e.g. 60" className={plain} {...field} /></FormControl><FormDescription>UK private small: 30-80 beds. Large: 150+</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="healthHosp_occupancyRate" render={({ field }) => (<FormItem><FormLabel>Occupancy rate (%)</FormLabel><FormControl><input type="number" min="0" max="100" placeholder="e.g. 70" className={plain} {...field} /></FormControl><FormDescription>UK private: 60-80%. NHS: 85-95%</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="healthHosp_averageDailyRate" render={({ field }) => (<FormItem><FormLabel>Average daily rate per bed ({currency})</FormLabel><FormControl><input type="number" min="0" placeholder="e.g. 1200" className={plain} {...field} /></FormControl><FormDescription>UK private: £800-1,500/day typical</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="healthHosp_ancillaryRevenuePct" render={({ field }) => (<FormItem><FormLabel>Ancillary revenue (%)</FormLabel><FormControl><input type="number" min="0" max="200" placeholder="e.g. 40" className={plain} {...field} /></FormControl><FormDescription>Imaging, labs, pharmacy, outpatient as % of bed revenue</FormDescription><FormMessage /></FormItem>)} />
            </div>
          </div>
        )}

        {/* Session 3b — Healthcare Device */}
        {isDriver && watchedTypeSub === "health_device" && (
          <div>
            <h3 className="text-sm font-semibold mb-1">Medical device / diagnostics drivers</h3>
            <p className="text-xs text-muted-foreground mb-3">Year 1-3 revenue will be computed from these drivers in the next release.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="healthDev_unitsSoldPerQuarter" render={({ field }) => (<FormItem><FormLabel>Units sold per quarter</FormLabel><FormControl><input type="number" min="0" placeholder="e.g. 15" className={plain} {...field} /></FormControl><FormDescription>Steady-state sales cadence</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="healthDev_unitPrice" render={({ field }) => (<FormItem><FormLabel>Unit selling price ({currency})</FormLabel><FormControl><input type="number" min="0" placeholder="e.g. 25000" className={plain} {...field} /></FormControl><FormDescription>Average price per device</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="healthDev_serviceRevenuePct" render={({ field }) => (<FormItem><FormLabel>Service revenue (%)</FormLabel><FormControl><input type="number" min="0" max="200" placeholder="e.g. 30" className={plain} {...field} /></FormControl><FormDescription>Recurring service/consumables as % of hardware revenue</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="healthDev_installBase" render={({ field }) => (<FormItem><FormLabel>Installed base (units)</FormLabel><FormControl><input type="number" min="0" placeholder="e.g. 200" className={plain} {...field} /></FormControl><FormDescription>Cumulative devices at customer sites</FormDescription><FormMessage /></FormItem>)} />
            </div>
          </div>
        )}

        {/* Session 3b — Healthcare SaaS */}
        {isDriver && watchedTypeSub === "health_saas" && (
          <div>
            <h3 className="text-sm font-semibold mb-1">Health SaaS / telemedicine drivers</h3>
            <p className="text-xs text-muted-foreground mb-3">Year 1-3 revenue will be computed from these drivers in the next release.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="healthSaas_startingCustomers" render={({ field }) => (<FormItem><FormLabel>Starting customer count</FormLabel><FormControl><input type="number" min="0" placeholder="e.g. 8" className={plain} {...field} /></FormControl><FormDescription>Clinics / hospitals / patients at month 0</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="healthSaas_newCustomersPerMonth" render={({ field }) => (<FormItem><FormLabel>New customers per month</FormLabel><FormControl><input type="number" min="0" placeholder="e.g. 3" className={plain} {...field} /></FormControl><FormDescription>Sales pipeline output</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="healthSaas_arpu" render={({ field }) => (<FormItem><FormLabel>ARPU ({currency} per customer/month)</FormLabel><FormControl><input type="number" min="0" placeholder="e.g. 1200" className={plain} {...field} /></FormControl><FormDescription>Enterprise deals: £500-5,000/mo per organization</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="healthSaas_monthlyChurnRate" render={({ field }) => (<FormItem><FormLabel>Monthly churn rate (%)</FormLabel><FormControl><input type="number" min="0" max="100" step="0.1" placeholder="e.g. 1.5" className={plain} {...field} /></FormControl><FormDescription>Health SaaS: 1-2% is best-in-class</FormDescription><FormMessage /></FormItem>)} />
            </div>
          </div>
        )}

        {/* Session 3b — Healthcare Pharmacy */}
        {isDriver && watchedTypeSub === "health_pharmacy" && (
          <div>
            <h3 className="text-sm font-semibold mb-1">Pharmacy drivers</h3>
            <p className="text-xs text-muted-foreground mb-3">Year 1-3 revenue will be computed from these drivers in the next release.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="healthPharm_dailyFootfall" render={({ field }) => (<FormItem><FormLabel>Daily footfall</FormLabel><FormControl><input type="number" min="0" placeholder="e.g. 350" className={plain} {...field} /></FormControl><FormDescription>UK community: 200-500/day typical</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="healthPharm_conversionRate" render={({ field }) => (<FormItem><FormLabel>Conversion rate (%)</FormLabel><FormControl><input type="number" min="0" max="100" placeholder="e.g. 70" className={plain} {...field} /></FormControl><FormDescription>Pharmacy: 60-80% typical</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="healthPharm_basketSize" render={({ field }) => (<FormItem><FormLabel>Average basket size ({currency})</FormLabel><FormControl><input type="number" min="0" placeholder="e.g. 15" className={plain} {...field} /></FormControl><FormDescription>UK pharmacy: £10-25 typical</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="healthPharm_prescriptionRevenuePct" render={({ field }) => (<FormItem><FormLabel>Prescription revenue (%)</FormLabel><FormControl><input type="number" min="0" max="100" placeholder="e.g. 70" className={plain} {...field} /></FormControl><FormDescription>UK community: 60-80% of revenue typical</FormDescription><FormMessage /></FormItem>)} />
            </div>
          </div>
        )}

        {/* Session 3b — Education Institution */}
        {isDriver && watchedTypeSub === "edu_institution" && (
          <div>
            <h3 className="text-sm font-semibold mb-1">Education institution drivers</h3>
            <p className="text-xs text-muted-foreground mb-3">Year 1-3 revenue will be computed from these drivers in the next release.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="eduInst_enrolledStudents" render={({ field }) => (<FormItem><FormLabel>Enrolled students</FormLabel><FormControl><input type="number" min="0" placeholder="e.g. 450" className={plain} {...field} /></FormControl><FormDescription>Full-time equivalent</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="eduInst_tuitionPerStudent" render={({ field }) => (<FormItem><FormLabel>Tuition per student per year ({currency})</FormLabel><FormControl><input type="number" min="0" placeholder="e.g. 22000" className={plain} {...field} /></FormControl><FormDescription>UK private secondary: £15k-£45k/yr</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="eduInst_capacity" render={({ field }) => (<FormItem><FormLabel>Capacity (max students)</FormLabel><FormControl><input type="number" min="0" placeholder="e.g. 550" className={plain} {...field} /></FormControl><FormDescription>Full-capacity intake</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="eduInst_retentionRate" render={({ field }) => (<FormItem><FormLabel>Student retention rate (%)</FormLabel><FormControl><input type="number" min="0" max="100" placeholder="e.g. 90" className={plain} {...field} /></FormControl><FormDescription>UK independent: 88-95% typical</FormDescription><FormMessage /></FormItem>)} />
            </div>
          </div>
        )}

        {/* Session 3b — Education EdTech */}
        {isDriver && watchedTypeSub === "edu_edtech" && (
          <div>
            <h3 className="text-sm font-semibold mb-1">EdTech SaaS drivers</h3>
            <p className="text-xs text-muted-foreground mb-3">Year 1-3 revenue will be computed from these drivers in the next release.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="eduTech_monthlySignups" render={({ field }) => (<FormItem><FormLabel>Monthly signups</FormLabel><FormControl><input type="number" min="0" placeholder="e.g. 5000" className={plain} {...field} /></FormControl><FormDescription>Free or paid signups per month</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="eduTech_paidConversionRate" render={({ field }) => (<FormItem><FormLabel>Free-to-paid conversion (%)</FormLabel><FormControl><input type="number" min="0" max="100" step="0.1" placeholder="e.g. 3" className={plain} {...field} /></FormControl><FormDescription>Freemium EdTech: 2-5% typical</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="eduTech_arpu" render={({ field }) => (<FormItem><FormLabel>ARPU ({currency} per paid user/month)</FormLabel><FormControl><input type="number" min="0" placeholder="e.g. 18" className={plain} {...field} /></FormControl><FormDescription>Consumer: £10-30/mo. Institutional: £5-20/mo per seat</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="eduTech_monthlyChurnRate" render={({ field }) => (<FormItem><FormLabel>Monthly churn rate (%)</FormLabel><FormControl><input type="number" min="0" max="100" step="0.1" placeholder="e.g. 8" className={plain} {...field} /></FormControl><FormDescription>Consumer EdTech: 5-15%. Institutional: 1-3%</FormDescription><FormMessage /></FormItem>)} />
            </div>
          </div>
        )}

        {/* Session 3b — Education Tutoring */}
        {isDriver && watchedTypeSub === "edu_tutoring" && (
          <div>
            <h3 className="text-sm font-semibold mb-1">Tutoring / test prep drivers</h3>
            <p className="text-xs text-muted-foreground mb-3">Year 1-3 revenue will be computed from these drivers in the next release.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="eduTut_activeStudents" render={({ field }) => (<FormItem><FormLabel>Active students</FormLabel><FormControl><input type="number" min="0" placeholder="e.g. 120" className={plain} {...field} /></FormControl><FormDescription>Students who booked in last 30 days</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="eduTut_sessionsPerStudentPerMonth" render={({ field }) => (<FormItem><FormLabel>Sessions per student per month</FormLabel><FormControl><input type="number" min="0" placeholder="e.g. 4" className={plain} {...field} /></FormControl><FormDescription>1:1 tutoring: 2-4/mo. Test prep intensive: 8+</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="eduTut_pricePerSession" render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel>Price per session ({currency})</FormLabel><FormControl><input type="number" min="0" placeholder="e.g. 45" className={plain} {...field} /></FormControl><FormDescription>UK online 1:1: £25-60. Premium: £60-150</FormDescription><FormMessage /></FormItem>)} />
            </div>
          </div>
        )}

        {/* Session 3b — Education Corporate Training */}
        {isDriver && watchedTypeSub === "edu_corptraining" && (
          <div>
            <h3 className="text-sm font-semibold mb-1">Corporate training drivers</h3>
            <p className="text-xs text-muted-foreground mb-3">Year 1-3 revenue will be computed from these drivers in the next release.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="eduCorp_enterpriseContracts" render={({ field }) => (<FormItem><FormLabel>Enterprise contracts</FormLabel><FormControl><input type="number" min="0" placeholder="e.g. 25" className={plain} {...field} /></FormControl><FormDescription>Active B2B customer contracts</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="eduCorp_averageContractValue" render={({ field }) => (<FormItem><FormLabel>Average contract value / year ({currency})</FormLabel><FormControl><input type="number" min="0" placeholder="e.g. 45000" className={plain} {...field} /></FormControl><FormDescription>SME: £5k-£25k. Mid-market: £25k-£150k. Enterprise: £150k+</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="eduCorp_retentionRate" render={({ field }) => (<FormItem><FormLabel>Annual retention rate (%)</FormLabel><FormControl><input type="number" min="0" max="100" placeholder="e.g. 80" className={plain} {...field} /></FormControl><FormDescription>Corporate training: 70-85% typical. Best: 90%+</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="eduCorp_expansionPct" render={({ field }) => (<FormItem><FormLabel>Expansion revenue (%)</FormLabel><FormControl><input type="number" min="0" max="100" placeholder="e.g. 10" className={plain} {...field} /></FormControl><FormDescription>Best-in-class L&D: 10-25% net expansion</FormDescription><FormMessage /></FormItem>)} />
            </div>
          </div>
        )}

        {/* Session 3c — SaaS B2C */}
        {isDriver && watchedTypeSub === "saas_b2c" && (
          <div>
            <h3 className="text-sm font-semibold mb-1">SaaS B2C drivers</h3>
            <p className="text-xs text-muted-foreground mb-3">Year 1-3 revenue will be computed from these drivers in the next release.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="saasB2c_monthlySignups" render={({ field }) => (<FormItem><FormLabel>Monthly signups</FormLabel><FormControl><input type="number" min="0" placeholder="e.g. 5000" className={plain} {...field} /></FormControl><FormDescription>New user signups per month (free or paid)</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="saasB2c_paidConversionRate" render={({ field }) => (<FormItem><FormLabel>Free-to-paid conversion (%)</FormLabel><FormControl><input type="number" min="0" max="100" step="0.1" placeholder="e.g. 4" className={plain} {...field} /></FormControl><FormDescription>Freemium: 2-5%. Trial-to-paid: 15-30%</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="saasB2c_arpu" render={({ field }) => (<FormItem><FormLabel>ARPU ({currency} per paid user/month)</FormLabel><FormControl><input type="number" min="0" placeholder="e.g. 12" className={plain} {...field} /></FormControl><FormDescription>Consumer: £5-25/mo. Premium: £25-100/mo</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="saasB2c_monthlyChurnRate" render={({ field }) => (<FormItem><FormLabel>Monthly churn rate (%)</FormLabel><FormControl><input type="number" min="0" max="100" step="0.1" placeholder="e.g. 6" className={plain} {...field} /></FormControl><FormDescription>Consumer SaaS: 5-8% typical. Best: 3-5%</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="saasB2c_viralCoefficient" render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel>Viral coefficient (K-factor)</FormLabel><FormControl><input type="number" min="0" max="5" step="0.05" placeholder="e.g. 0.1" className={plain} {...field} /></FormControl><FormDescription>Most B2C: 0-0.3. Strong network effects: 0.3-0.7. Viral hits: 0.7+</FormDescription><FormMessage /></FormItem>)} />
            </div>
          </div>
        )}

        {/* Session 3c — SaaS Usage */}
        {isDriver && watchedTypeSub === "saas_usage" && (
          <div>
            <h3 className="text-sm font-semibold mb-1">Usage-based SaaS drivers</h3>
            <p className="text-xs text-muted-foreground mb-3">Year 1-3 revenue will be computed from these drivers in the next release.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="saasUsage_activeAccounts" render={({ field }) => (<FormItem><FormLabel>Active accounts</FormLabel><FormControl><input type="number" min="0" placeholder="e.g. 150" className={plain} {...field} /></FormControl><FormDescription>Accounts with paid usage last month</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="saasUsage_avgUnitsPerAccountPerMonth" render={({ field }) => (<FormItem><FormLabel>Avg units per account per month</FormLabel><FormControl><input type="number" min="0" placeholder="e.g. 10000" className={plain} {...field} /></FormControl><FormDescription>Units = API calls, GB, seats, transactions</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="saasUsage_pricePerUnit" render={({ field }) => (<FormItem><FormLabel>Price per unit ({currency})</FormLabel><FormControl><input type="number" min="0" step="0.001" placeholder="e.g. 0.05" className={plain} {...field} /></FormControl><FormDescription>Blended across pricing tiers</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="saasUsage_monthlyAccountChurnRate" render={({ field }) => (<FormItem><FormLabel>Monthly account churn rate (%)</FormLabel><FormControl><input type="number" min="0" max="100" step="0.1" placeholder="e.g. 4" className={plain} {...field} /></FormControl><FormDescription>Usage SaaS: 3-6% typical. Enterprise: 1-3%</FormDescription><FormMessage /></FormItem>)} />
            </div>
          </div>
        )}

        {/* Session 3c — E-commerce Marketplace */}
        {isDriver && watchedTypeSub === "ecom_marketplace" && (
          <div>
            <h3 className="text-sm font-semibold mb-1">Marketplace drivers</h3>
            <p className="text-xs text-muted-foreground mb-3">Year 1-3 revenue will be computed from these drivers in the next release.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="ecomMkt_monthlyGmv" render={({ field }) => (<FormItem><FormLabel>Monthly GMV ({currency})</FormLabel><FormControl><input type="number" min="0" placeholder="e.g. 250000" className={plain} {...field} /></FormControl><FormDescription>Gross merchandise value transacted per month</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="ecomMkt_takeRate" render={({ field }) => (<FormItem><FormLabel>Take rate (%)</FormLabel><FormControl><input type="number" min="0" max="50" step="0.1" placeholder="e.g. 10" className={plain} {...field} /></FormControl><FormDescription>eBay: 10-12%. Etsy: 7%. Uber Eats: 20-30%</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="ecomMkt_activeSellers" render={({ field }) => (<FormItem><FormLabel>Active sellers</FormLabel><FormControl><input type="number" min="0" placeholder="e.g. 200" className={plain} {...field} /></FormControl><FormDescription>Sellers with ≥1 transaction last month</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="ecomMkt_transactionsPerSellerPerMonth" render={({ field }) => (<FormItem><FormLabel>Transactions per seller per month</FormLabel><FormControl><input type="number" min="0" placeholder="e.g. 25" className={plain} {...field} /></FormControl><FormDescription>Average transaction count per active seller</FormDescription><FormMessage /></FormItem>)} />
            </div>
          </div>
        )}

        {/* Session 3c — Services Agency */}
        {isDriver && watchedTypeSub === "services_agency" && (
          <div>
            <h3 className="text-sm font-semibold mb-1">Agency drivers</h3>
            <p className="text-xs text-muted-foreground mb-3">Year 1-3 revenue will be computed from these drivers in the next release.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="svcAgcy_retainedClients" render={({ field }) => (<FormItem><FormLabel>Retained clients</FormLabel><FormControl><input type="number" min="0" placeholder="e.g. 12" className={plain} {...field} /></FormControl><FormDescription>Recurring retainer contracts</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="svcAgcy_arpaPerMonth" render={({ field }) => (<FormItem><FormLabel>ARPA per month ({currency})</FormLabel><FormControl><input type="number" min="0" placeholder="e.g. 8000" className={plain} {...field} /></FormControl><FormDescription>Boutique: £3k-£15k/mo. Mid-market: £15k-£50k/mo</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="svcAgcy_newProjectsPerMonth" render={({ field }) => (<FormItem><FormLabel>New projects per month</FormLabel><FormControl><input type="number" min="0" placeholder="e.g. 3" className={plain} {...field} /></FormControl><FormDescription>New one-off project engagements</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="svcAgcy_averageProjectValue" render={({ field }) => (<FormItem><FormLabel>Average project value ({currency})</FormLabel><FormControl><input type="number" min="0" placeholder="e.g. 15000" className={plain} {...field} /></FormControl><FormDescription>Small: £3k-£15k. Mid: £15k-£75k. Large: £75k+</FormDescription><FormMessage /></FormItem>)} />
            </div>
          </div>
        )}

        {/* Session 3c — Services Freelance */}
        {isDriver && watchedTypeSub === "services_freelance" && (
          <div>
            <h3 className="text-sm font-semibold mb-1">Freelance drivers</h3>
            <p className="text-xs text-muted-foreground mb-3">Year 1-3 revenue will be computed from these drivers in the next release.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="svcFree_chargeableHoursPerWeek" render={({ field }) => (<FormItem><FormLabel>Chargeable hours per week</FormLabel><FormControl><input type="number" min="0" max="60" placeholder="e.g. 25" className={plain} {...field} /></FormControl><FormDescription>Realistic max ~30-35 hrs/wk after admin/sales</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="svcFree_weeklyRate" render={({ field }) => (<FormItem><FormLabel>Weekly rate ({currency})</FormLabel><FormControl><input type="number" min="0" placeholder="e.g. 3000" className={plain} {...field} /></FormControl><FormDescription>UK contractors: £2k-£5k/wk typical</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="svcFree_weeksWorkedPerYear" render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel>Weeks worked per year</FormLabel><FormControl><input type="number" min="0" max="52" placeholder="e.g. 44" className={plain} {...field} /></FormControl><FormDescription>Realistic solo: 42-46 weeks/year</FormDescription><FormMessage /></FormItem>)} />
            </div>
          </div>
        )}

        {/* Session 3c — Hospitality Restaurant */}
        {isDriver && watchedTypeSub === "hosp_restaurant" && (
          <div>
            <h3 className="text-sm font-semibold mb-1">Restaurant drivers</h3>
            <p className="text-xs text-muted-foreground mb-3">Year 1-3 revenue will be computed from these drivers in the next release.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="hospRest_seatCount" render={({ field }) => (<FormItem><FormLabel>Seat count</FormLabel><FormControl><input type="number" min="0" placeholder="e.g. 60" className={plain} {...field} /></FormControl><FormDescription>Actual seats in service</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="hospRest_tableTurnsPerDay" render={({ field }) => (<FormItem><FormLabel>Table turns per day</FormLabel><FormControl><input type="number" min="0" max="20" step="0.1" placeholder="e.g. 2.5" className={plain} {...field} /></FormControl><FormDescription>Casual: 2-3. Quick-service: 4-6. Fine dining: 1-1.5</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="hospRest_averageSpendPerCover" render={({ field }) => (<FormItem><FormLabel>Average spend per cover ({currency})</FormLabel><FormControl><input type="number" min="0" placeholder="e.g. 28" className={plain} {...field} /></FormControl><FormDescription>UK casual: £15-25. Mid-range: £25-50. Fine dining: £75+</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="hospRest_operatingDaysPerYear" render={({ field }) => (<FormItem><FormLabel>Operating days per year</FormLabel><FormControl><input type="number" min="0" max="365" placeholder="e.g. 350" className={plain} {...field} /></FormControl><FormDescription>Typical: 340-360 days. 7-day operations: ~365</FormDescription><FormMessage /></FormItem>)} />
            </div>
          </div>
        )}

        {/* Session 3c — Hospitality Hotel */}
        {isDriver && watchedTypeSub === "hosp_hotel" && (
          <div>
            <h3 className="text-sm font-semibold mb-1">Hotel drivers</h3>
            <p className="text-xs text-muted-foreground mb-3">Year 1-3 revenue will be computed from these drivers in the next release.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="hospHotel_roomCount" render={({ field }) => (<FormItem><FormLabel>Room count</FormLabel><FormControl><input type="number" min="0" placeholder="e.g. 80" className={plain} {...field} /></FormControl><FormDescription>Total lettable rooms</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="hospHotel_occupancyRate" render={({ field }) => (<FormItem><FormLabel>Occupancy rate (%)</FormLabel><FormControl><input type="number" min="0" max="100" placeholder="e.g. 72" className={plain} {...field} /></FormControl><FormDescription>UK regional: 65-75%. London: 75-85%</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="hospHotel_averageDailyRate" render={({ field }) => (<FormItem><FormLabel>Average daily rate ({currency})</FormLabel><FormControl><input type="number" min="0" placeholder="e.g. 120" className={plain} {...field} /></FormControl><FormDescription>UK budget: £70-100. Mid-scale: £100-180. Luxury: £250+</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="hospHotel_foodBeverageRevenuePct" render={({ field }) => (<FormItem><FormLabel>F&B revenue (%)</FormLabel><FormControl><input type="number" min="0" max="200" placeholder="e.g. 30" className={plain} {...field} /></FormControl><FormDescription>Room-only: 5-15%. Mid-scale w/ restaurant: 25-40%. Full-service: 40-70%</FormDescription><FormMessage /></FormItem>)} />
            </div>
          </div>
        )}

        {/* Session 3c — Hospitality Catering */}
        {isDriver && watchedTypeSub === "hosp_catering" && (
          <div>
            <h3 className="text-sm font-semibold mb-1">Catering / events drivers</h3>
            <p className="text-xs text-muted-foreground mb-3">Year 1-3 revenue will be computed from these drivers in the next release.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="hospCater_eventsPerMonth" render={({ field }) => (<FormItem><FormLabel>Events per month</FormLabel><FormControl><input type="number" min="0" placeholder="e.g. 8" className={plain} {...field} /></FormControl><FormDescription>Weddings, corporate, private — all sizes</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="hospCater_averageEventValue" render={({ field }) => (<FormItem><FormLabel>Average event value ({currency})</FormLabel><FormControl><input type="number" min="0" placeholder="e.g. 8000" className={plain} {...field} /></FormControl><FormDescription>Corporate lunch: £500-2k. Wedding: £5k-25k. Gala: £25k+</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="hospCater_growthRate" render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel>Growth rate (annual, %)</FormLabel><FormControl><input type="number" step="0.1" placeholder="e.g. 15" className={plain} {...field} /></FormControl><FormDescription>Established: 5-15%. Early stage: 30-100%+</FormDescription><FormMessage /></FormItem>)} />
            </div>
          </div>
        )}

        {/* Amber placeholder for sub-types not yet built (should never appear now — all 27 built) */}
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
