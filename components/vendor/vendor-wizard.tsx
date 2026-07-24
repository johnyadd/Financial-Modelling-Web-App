"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BenchmarkInput } from "@/components/ui/benchmark-input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import {
  BriefcaseIcon, BuildingIcon, TrendingUpIcon, ReceiptIcon,
  BanknoteIcon, CheckCircle2Icon, ChevronRightIcon, ChevronLeftIcon,
  LoaderIcon, SparklesIcon, LandmarkIcon,
} from "lucide-react"

// â”€â”€ Step indicator â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const STEPS = [
  { id: 0, label: "Client",    icon: <BuildingIcon className="w-4 h-4" /> },
  { id: 1, label: "Model",     icon: <SparklesIcon className="w-4 h-4" /> },
  { id: 2, label: "Revenue",   icon: <TrendingUpIcon className="w-4 h-4" /> },
  { id: 3, label: "Costs",     icon: <ReceiptIcon className="w-4 h-4" /> },
  { id: 4, label: "Balance",   icon: <LandmarkIcon className="w-4 h-4" /> },
  { id: 5, label: "Valuation", icon: <BanknoteIcon className="w-4 h-4" /> },
  { id: 6, label: "Review",    icon: <CheckCircle2Icon className="w-4 h-4" /> },
]

const MODEL_OPTIONS = [
  { value: "dcf",             label: "DCF Valuation",          desc: "Discounted cash flow â€” for businesses with revenue history" },
  { value: "three_statement", label: "3-Statement Model",      desc: "Integrated P&L, balance sheet and cash flow" },
  { value: "pre_revenue_dcf", label: "Pre-Revenue DCF",        desc: "Early-stage startup valuation from unit economics" },
  { value: "lbo",             label: "LBO Model",              desc: "Leveraged buyout â€” debt-funded acquisition analysis" },
  { value: "saas",            label: "SaaS Model",             desc: "ARR waterfall, cohort analysis and unit economics" },
]

const CURRENCIES = ["GBP", "USD", "EUR", "CHF", "SEK", "NOK", "DKK"]
const INDUSTRIES = ["Technology", "Financial Services", "Healthcare", "Retail & Consumer", "Manufacturing", "Real Estate", "Energy", "Media & Entertainment", "Professional Services", "Other"]
const FUNDING_STAGES = ["Pre-seed", "Seed", "Series A", "Series B", "Series C+", "Bootstrapped (Self-funded)", "Established (Profitable)", "PE-backed", "Public"]
const REVENUE_MODELS = ["SaaS / Subscription", "Marketplace / Commission", "Product Sales (One-off)", "Professional Services", "Licensing", "Advertising", "Usage-based", "Freemium", "Other"]

// â”€â”€ Schema â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const schema = z.object({
  // Client details
  clientName:      z.string().min(2, "Required"),
  industry:        z.string().min(1, "Required"),
  country:         z.string().default("United Kingdom"),
  currency:        z.string().default("GBP"),
  reportingPeriod: z.string().optional(),
  analystName:     z.string().optional(),
  modelNotes:      z.string().optional(),
  // Model type
  modelType:       z.string().min(1, "Select a model type"),
  projectionYears: z.string().default("5"),
  // Revenue
  revenueModel:    z.string().optional(),
  year1Revenue:    z.coerce.number().default(0),
  year2Revenue:    z.coerce.number().default(0),
  year3Revenue:    z.coerce.number().default(0),
  year4Revenue:    z.coerce.number().default(0),
  year5Revenue:    z.coerce.number().default(0),
  revenueGrowthY1: z.coerce.number().default(0),
  revenueGrowthY2: z.coerce.number().default(0),
  revenueGrowthY3: z.coerce.number().default(0),
  churnRate:       z.coerce.number().optional(),
  arpu:            z.coerce.number().optional(),
  // Costs
  grossMargin:        z.coerce.number().min(0).max(100).default(70),
  cogsPercent:        z.coerce.number().min(0).max(100).default(30),
  salariesTotal:      z.coerce.number().default(0),
  headcount:          z.coerce.number().optional(),
  avgSalary:          z.coerce.number().optional(),
  marketingBudgetPct: z.coerce.number().default(0),
  rdBudgetPct:        z.coerce.number().default(0),
  cloudInfraMonthly:  z.coerce.number().default(0),
  officeRentMonthly:  z.coerce.number().default(0),
  otherOpexMonthly:   z.coerce.number().default(0),
  capexY1:            z.coerce.number().default(0),
  depreciationRate:   z.coerce.number().default(25),
  ebitdaMarginY1:     z.coerce.number().optional(),
  ebitdaMarginY3:     z.coerce.number().optional(),
  // Balance sheet
  openingCash:        z.coerce.number().default(0),
  totalDebt:          z.coerce.number().default(0),
  interestRate:       z.coerce.number().default(0),
  accountsReceivableDays: z.coerce.number().default(30),
  accountsPayableDays:    z.coerce.number().default(30),
  inventoryDays:          z.coerce.number().default(0),
  // Valuation
  discountRate:        z.coerce.number().default(15),
  terminalGrowthRate:  z.coerce.number().default(2.5),
  exitHorizonYears:    z.string().default("5 years"),
  targetExitMultiple:  z.coerce.number().default(8),
  totalFundingRaised:  z.coerce.number().default(0),
  monthlyBurnRate:     z.coerce.number().default(0),
  taxRate:             z.coerce.number().default(19),
})

type FormData = z.infer<typeof schema>

// â”€â”€ Input helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function NumField({ control, name, label, placeholder, suffix, assumptionKey, aiContext, setValue }: {
  control: any; name: keyof FormData; label: string; placeholder?: string; suffix?: string;
  assumptionKey?: string; aiContext?: any; setValue?: (v: string | number) => void;
}) {
  return (
    <FormField control={control} name={name} render={({ field }) => (
      <FormItem>
        <FormLabel className="text-xs">{label}</FormLabel>
        <FormControl>
          <div className="relative">
            {assumptionKey && aiContext && setValue ? (
              <BenchmarkInput type="number" step="any" placeholder={placeholder ?? "0"} {...field} assumptionKey={assumptionKey} aiContext={aiContext} onAIAccept={setValue} className={suffix ? "pr-16" : ""} />
            ) : (
              <>
                <Input type="number" step="any" placeholder={placeholder ?? "0"} {...field} className={suffix ? "pr-10" : ""} />
                {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{suffix}</span>}
              </>
            )}
          </div>
        </FormControl>
        <FormMessage />
      </FormItem>
    )} />
  )
}

function TextField({ control, name, label, placeholder }: {
  control: any; name: keyof FormData; label: string; placeholder?: string
}) {
  return (
    <FormField control={control} name={name} render={({ field }) => (
      <FormItem>
        <FormLabel className="text-xs">{label}</FormLabel>
        <FormControl><Input placeholder={placeholder} {...field} value={field.value ?? ""} /></FormControl>
        <FormMessage />
      </FormItem>
    )} />
  )
}

function SelectField({ control, name, label, options }: {
  control: any; name: keyof FormData; label: string; options: string[]
}) {
  return (
    <FormField control={control} name={name} render={({ field }) => (
      <FormItem>
        <FormLabel className="text-xs">{label}</FormLabel>
        <FormControl>
          <select {...field} value={field.value ?? ""} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
            <option value="">Select...</option>
            {options.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </FormControl>
        <FormMessage />
      </FormItem>
    )} />
  )
}

function SectionTitle({ title }: { title: string }) {
  return <h3 className="font-semibold text-foreground text-sm mb-4 pb-2 border-b border-border">{title}</h3>
}

// â”€â”€ Wizard component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface VendorWizardProps {
  profile: { id: string; full_name: string | null } | null
}

export function VendorWizard({ profile }: VendorWizardProps) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<FormData>({
    // @ts-expect-error - Zod default types conflict with FormData
    resolver: zodResolver(schema),
    defaultValues: {
      currency: "GBP", country: "United Kingdom", projectionYears: "5",
      grossMargin: 70, cogsPercent: 30, depreciationRate: 25,
      discountRate: 15, terminalGrowthRate: 2.5, exitHorizonYears: "5 years",
      targetExitMultiple: 8, taxRate: 19, accountsReceivableDays: 30,
      accountsPayableDays: 30,
    },
  })

  const values = form.watch()

  async function onSubmit(data: FormData) {
    setIsSubmitting(true)
    setError(null)
    try {
      const payload = {
        entity_type: "existing_business",
        source: "vendor",
        modelType: data.modelType,
        name: `${data.clientName} â€” ${MODEL_OPTIONS.find(m => m.value === data.modelType)?.label ?? data.modelType}`,
        step1: {
          businessName: data.clientName, industry: data.industry, currency: data.currency,
          country: data.country, businessStage: "Established (Profitable)",
        },
        step2: {
          revenueModel: data.revenueModel, projectionYears: `${data.projectionYears} years`,
          year1Revenue: data.year1Revenue, year2Revenue: data.year2Revenue,
          year3Revenue: data.year3Revenue, year4Revenue: data.year4Revenue,
          year5Revenue: data.year5Revenue,
          revenueGrowthY1: data.revenueGrowthY1, revenueGrowthY2: data.revenueGrowthY2,
          revenueGrowthY3: data.revenueGrowthY3,
          churnRate: data.churnRate, averageRevenuePerUser: data.arpu,
        },
        step3: {
          grossMargin: data.grossMargin, cogsPercent: data.cogsPercent,
          salariesTotal: data.salariesTotal, totalHeadcount: data.headcount,
          marketingBudgetPct: data.marketingBudgetPct, rdBudgetPct: data.rdBudgetPct,
          cloudInfraMonthly: data.cloudInfraMonthly, officeRentMonthly: data.officeRentMonthly,
          otherOpexMonthly: data.otherOpexMonthly, capexY1: data.capexY1,
          depreciationRate: data.depreciationRate, ebitdaMarginY1: data.ebitdaMarginY1,
          ebitdaMarginY3: data.ebitdaMarginY3,
        },
        step4: {
          currentCash: data.openingCash, debtFunding: data.totalDebt,
          interestRate: data.interestRate, totalFundingRaised: data.totalFundingRaised,
          monthlyBurnRate: data.monthlyBurnRate, discountRate: data.discountRate,
          terminalGrowthRate: data.terminalGrowthRate, exitHorizonYears: data.exitHorizonYears,
          targetExitMultiple: data.targetExitMultiple, taxRate: data.taxRate,
          accountsReceivableDays: data.accountsReceivableDays,
          accountsPayableDays: data.accountsPayableDays,
        },
      }

      const res = await fetch("/api/models/save", {
        method: "POST", headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error ?? "Failed to save")
      router.push(`/models/${result.modelInputId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsSubmitting(false)
    }
  }

  function nextStep() { if (step < STEPS.length - 1) setStep(s => s + 1) }
  function prevStep() { if (step > 0) setStep(s => s - 1) }

  const currency = values.currency ?? "GBP"

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <BriefcaseIcon className="w-5 h-5 text-orange-600" />
          <Badge variant="outline" className="text-orange-600 border-orange-300">Vendor â€” Client model</Badge>
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-6">Build a client financial model</h1>

        {/* Step indicator */}
        <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-2">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => setStep(s.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                  step === s.id ? "bg-primary text-primary-foreground" :
                  step > s.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {step > s.id ? <CheckCircle2Icon className="w-3 h-3" /> : s.icon}
                {s.label}
              </button>
              {i < STEPS.length - 1 && <ChevronRightIcon className="w-3 h-3 text-muted-foreground flex-shrink-0" />}
            </div>
          ))}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit as any)}>

            {/* â”€â”€ STEP 0: Client details â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            {step === 0 && (
              <div className="space-y-6">
                <SectionTitle title="Client information" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextField control={form.control} name="clientName" label="Client / company name *" placeholder="Acme Ltd" />
                  <SelectField control={form.control} name="industry" label="Industry *" options={INDUSTRIES} />
                  <TextField control={form.control} name="country" label="Country" placeholder="United Kingdom" />
                  <SelectField control={form.control} name="currency" label="Currency" options={CURRENCIES} />
                  <TextField control={form.control} name="reportingPeriod" label="Reporting period" placeholder="FY2024 or Jan-Dec 2024" />
                  <TextField control={form.control} name="analystName" label="Analyst name" placeholder={profile?.full_name ?? "Your name"} />
                </div>
                <FormField control={form.control} name="modelNotes" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Model notes / context</FormLabel>
                    <FormControl>
                      <textarea {...field} value={field.value ?? ""} rows={3}
                        placeholder="Any context about this client or model that should be noted..."
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none" />
                    </FormControl>
                  </FormItem>
                )} />
              </div>
            )}

            {/* â”€â”€ STEP 1: Model type â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            {step === 1 && (
              <div className="space-y-4">
                <SectionTitle title="Select model type" />
                <div className="space-y-3">
                  {MODEL_OPTIONS.map((m) => {
                    const isSelected = values.modelType === m.value
                    return (
                      <button key={m.value} type="button" onClick={() => form.setValue("modelType", m.value)}
                        className={cn(
                          "w-full text-left rounded-xl border-2 p-4 transition-all",
                          isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                        )}>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-sm text-foreground">{m.label}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{m.desc}</p>
                          </div>
                          {isSelected && <CheckCircle2Icon className="w-5 h-5 text-primary flex-shrink-0" />}
                        </div>
                      </button>
                    )
                  })}
                </div>
                <div className="mt-4">
                  <FormLabel className="text-xs">Projection period (years)</FormLabel>
                  <div className="flex gap-2 mt-1">
                    {["3", "5", "7", "10"].map((y) => (
                      <button key={y} type="button" onClick={() => form.setValue("projectionYears", y)}
                        className={cn("px-4 py-2 rounded-lg border text-sm font-medium transition-all",
                          values.projectionYears === y ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/40"
                        )}>
                        {y} yrs
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* â”€â”€ STEP 2: Revenue â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            {step === 2 && (
              <div className="space-y-6">
                <SectionTitle title={`Revenue assumptions (${currency})`} />
                <SelectField control={form.control} name="revenueModel" label="Revenue model" options={REVENUE_MODELS} />

                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-3">EXPLICIT REVENUE BY YEAR ({currency} '000s)</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <NumField control={form.control} name="year1Revenue" label="Year 1 revenue" placeholder="500" />
                    <NumField control={form.control} name="year2Revenue" label="Year 2 revenue" placeholder="750" />
                    <NumField control={form.control} name="year3Revenue" label="Year 3 revenue" placeholder="1000" />
                    <NumField control={form.control} name="year4Revenue" label="Year 4 revenue" placeholder="1300" />
                    <NumField control={form.control} name="year5Revenue" label="Year 5 revenue" placeholder="1600" />
                  </div>
                </div>

                <Separator />
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-3">GROWTH RATES (% YoY â€” used for years beyond explicit inputs)</p>
                  <div className="grid grid-cols-3 gap-3">
                    <NumField control={form.control} name="revenueGrowthY1" label="Y1 growth %" suffix="%"
                      assumptionKey="revenueGrowthY1"
                      aiContext={{
                        industry: values.industry,
                        subSector: values.subSector,
                        businessStage: values.businessStage,
                        currency: values.currency,
                        country: values.country,
                      }}
                      setValue={(v) => form.setValue("revenueGrowthY1", Number(v))}
                    />
                    <NumField control={form.control} name="revenueGrowthY2" label="Y2 growth %" suffix="%"
                      assumptionKey="revenueGrowthY2"
                      aiContext={{
                        industry: values.industry,
                        subSector: values.subSector,
                        businessStage: values.businessStage,
                        currentValues: { revenueGrowthY1: values.revenueGrowthY1 },
                      }}
                      setValue={(v) => form.setValue("revenueGrowthY2", Number(v))}
                    />
                    <NumField control={form.control} name="revenueGrowthY3" label="Y3+ growth %" suffix="%"
                      assumptionKey="revenueGrowthY3"
                      aiContext={{
                        industry: values.industry,
                        subSector: values.subSector,
                        businessStage: values.businessStage,
                        currentValues: { revenueGrowthY1: values.revenueGrowthY1, revenueGrowthY2: values.revenueGrowthY2 },
                      }}
                      setValue={(v) => form.setValue("revenueGrowthY3", Number(v))}
                    />
                  </div>
                </div>

                {(values.modelType === "saas" || values.modelType === "pre_revenue_dcf") && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-3">UNIT ECONOMICS (SaaS / Pre-revenue)</p>
                      <div className="grid grid-cols-2 gap-3">
                        <NumField control={form.control} name="arpu" label={`ARPU (${currency} / year)`} placeholder="1200"
                          assumptionKey="arpu"
                          aiContext={{
                            industry: values.industry,
                            subSector: values.subSector,
                            currency: values.currency,
                            currentValues: { revenueModel: values.revenueModel },
                          }}
                          setValue={(v) => form.setValue("arpu", Number(v))}
                        />
                        <NumField control={form.control} name="churnRate" label="Annual churn %" suffix="%" placeholder="8"
                          assumptionKey="churnRate"
                          aiContext={{
                            industry: values.industry,
                            subSector: values.subSector,
                            businessStage: values.businessStage,
                            currentValues: { revenueModel: values.revenueModel },
                          }}
                          setValue={(v) => form.setValue("churnRate", Number(v))}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* â”€â”€ STEP 3: Costs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            {step === 3 && (
              <div className="space-y-6">
                <SectionTitle title={`Cost structure (${currency})`} />

                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-3">MARGINS</p>
                  <div className="grid grid-cols-2 gap-3">
                    <NumField control={form.control} name="grossMargin" label="Gross margin %" suffix="%" placeholder="70"
                      assumptionKey="grossMargin"
                      aiContext={{
                        industry: values.industry,
                        subSector: values.subSector,
                        businessStage: values.businessStage,
                        currentValues: { revenueModel: values.revenueModel },
                      }}
                      setValue={(v) => form.setValue("grossMargin", Number(v))}
                    />
                    <NumField control={form.control} name="cogsPercent" label="COGS %" suffix="%" placeholder="30"
                      assumptionKey="cogsPercent"
                      aiContext={{
                        industry: values.industry,
                        subSector: values.subSector,
                        currentValues: { grossMargin: values.grossMargin },
                      }}
                      setValue={(v) => form.setValue("cogsPercent", Number(v))}
                    />
                    <NumField control={form.control} name="ebitdaMarginY1" label="EBITDA margin Y1 %" suffix="%" placeholder="15"
                      assumptionKey="ebitdaMarginY1"
                      aiContext={{
                        industry: values.industry,
                        subSector: values.subSector,
                        businessStage: values.businessStage,
                      }}
                      setValue={(v) => form.setValue("ebitdaMarginY1", Number(v))}
                    />
                    <NumField control={form.control} name="ebitdaMarginY3" label="EBITDA margin Y3 %" suffix="%" placeholder="25"
                      assumptionKey="ebitdaMarginY3"
                      aiContext={{
                        industry: values.industry,
                        subSector: values.subSector,
                        businessStage: values.businessStage,
                        currentValues: { ebitdaMarginY1: values.ebitdaMarginY1 },
                      }}
                      setValue={(v) => form.setValue("ebitdaMarginY3", Number(v))}
                    />
                  </div>
                </div>

                <Separator />
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-3">HEADCOUNT & PAYROLL</p>
                  <div className="grid grid-cols-2 gap-3">
                    <NumField control={form.control} name="headcount"     label="Total headcount (FTE)" placeholder="20" />
                    <NumField control={form.control} name="avgSalary"     label={`Avg salary (${currency})`} placeholder="45000" />
                    <NumField control={form.control} name="salariesTotal" label={`Total payroll (${currency})`} placeholder="900000" />
                  </div>
                </div>

                <Separator />
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-3">OPERATING EXPENSES (% OF REVENUE)</p>
                  <div className="grid grid-cols-2 gap-3">
                    <NumField control={form.control} name="marketingBudgetPct" label="Sales & marketing %" suffix="%" placeholder="20"
                      assumptionKey="marketingBudgetPct"
                      aiContext={{
                        industry: values.industry,
                        subSector: values.subSector,
                        businessStage: values.businessStage,
                      }}
                      setValue={(v) => form.setValue("marketingBudgetPct", Number(v))}
                    />
                    <NumField control={form.control} name="rdBudgetPct" label="R&D %" suffix="%" placeholder="15"
                      assumptionKey="rdBudgetPct"
                      aiContext={{
                        industry: values.industry,
                        subSector: values.subSector,
                        businessStage: values.businessStage,
                      }}
                      setValue={(v) => form.setValue("rdBudgetPct", Number(v))}
                    />
                  </div>
                </div>

                <Separator />
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-3">FIXED COSTS (MONTHLY, {currency})</p>
                  <div className="grid grid-cols-2 gap-3">
                    <NumField control={form.control} name="cloudInfraMonthly" label="Cloud / hosting" placeholder="5000" />
                    <NumField control={form.control} name="officeRentMonthly" label="Office rent" placeholder="3000" />
                    <NumField control={form.control} name="otherOpexMonthly"  label="Other overheads" placeholder="2000" />
                  </div>
                </div>

                <Separator />
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-3">CAPEX & DEPRECIATION</p>
                  <div className="grid grid-cols-2 gap-3">
                    <NumField control={form.control} name="capexY1"          label={`CAPEX Year 1 (${currency})`} placeholder="50000" />
                    <NumField control={form.control} name="depreciationRate"  label="Depreciation rate %" suffix="%" placeholder="25" />
                  </div>
                </div>
              </div>
            )}

            {/* â”€â”€ STEP 4: Balance sheet â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            {step === 4 && (
              <div className="space-y-6">
                <SectionTitle title={`Balance sheet & debt (${currency})`} />

                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-3">OPENING BALANCES</p>
                  <div className="grid grid-cols-2 gap-3">
                    <NumField control={form.control} name="openingCash"        label={`Opening cash (${currency})`} placeholder="500000" />
                    <NumField control={form.control} name="totalFundingRaised" label={`Total funding raised (${currency})`} placeholder="1000000" />
                    <NumField control={form.control} name="monthlyBurnRate"    label={`Monthly burn rate (${currency})`} placeholder="80000" />
                  </div>
                </div>

                <Separator />
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-3">DEBT SCHEDULE</p>
                  <div className="grid grid-cols-2 gap-3">
                    <NumField control={form.control} name="totalDebt"     label={`Total debt (${currency})`} placeholder="200000" />
                    <NumField control={form.control} name="interestRate"  label="Interest rate %" suffix="%" placeholder="8" />
                  </div>
                </div>

                <Separator />
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-3">WORKING CAPITAL (DAYS)</p>
                  <div className="grid grid-cols-3 gap-3">
                    <NumField control={form.control} name="accountsReceivableDays" label="Debtor days" placeholder="30" />
                    <NumField control={form.control} name="accountsPayableDays"    label="Creditor days" placeholder="30" />
                    <NumField control={form.control} name="inventoryDays"          label="Inventory days" placeholder="0" />
                  </div>
                </div>
              </div>
            )}

            {/* â”€â”€ STEP 5: Valuation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            {step === 5 && (
              <div className="space-y-6">
                <SectionTitle title="Valuation parameters" />

                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-3">DCF ASSUMPTIONS</p>
                  <div className="grid grid-cols-2 gap-3">
                    <NumField control={form.control} name="discountRate" label="Discount rate / WACC %" suffix="%" placeholder="15"
                      assumptionKey="discountRate"
                      aiContext={{
                        industry: values.industry,
                        subSector: values.subSector,
                        businessStage: values.businessStage,
                        country: values.country,
                      }}
                      setValue={(v) => form.setValue("discountRate", Number(v))}
                    />
                    <NumField control={form.control} name="terminalGrowthRate" label="Terminal growth rate %" suffix="%" placeholder="2.5"
                      assumptionKey="terminalGrowthRate"
                      aiContext={{
                        industry: values.industry,
                        country: values.country,
                      }}
                      setValue={(v) => form.setValue("terminalGrowthRate", Number(v))}
                    />
                    <NumField control={form.control} name="taxRate" label="Corporation tax rate %" suffix="%" placeholder="19"
                      assumptionKey="taxRate"
                      aiContext={{
                        country: values.country,
                      }}
                      setValue={(v) => form.setValue("taxRate", Number(v))}
                    />
                  </div>
                </div>

                <Separator />
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-3">EXIT ASSUMPTIONS</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <FormLabel className="text-xs">Exit horizon</FormLabel>
                      <div className="flex gap-2 mt-1">
                        {["3 years", "5 years", "7 years", "10 years"].map((y) => (
                          <button key={y} type="button" onClick={() => form.setValue("exitHorizonYears", y)}
                            className={cn("px-3 py-1.5 rounded-lg border text-xs font-medium transition-all",
                              values.exitHorizonYears === y ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground"
                            )}>
                            {y}
                          </button>
                        ))}
                      </div>
                    </div>
                    <NumField control={form.control} name="targetExitMultiple" label="Exit EV/Revenue multiple" suffix="x" placeholder="8"
                      assumptionKey="targetExitMultiple"
                      aiContext={{
                        industry: values.industry,
                        subSector: values.subSector,
                        businessStage: values.businessStage,
                        currentValues: { revenueModel: values.revenueModel },
                      }}
                      setValue={(v) => form.setValue("targetExitMultiple", Number(v))}
                    />
                  </div>
                </div>

                {values.modelType === "lbo" && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-3">LBO SPECIFIC</p>
                      <div className="grid grid-cols-2 gap-3">
                        <NumField control={form.control} name="totalDebt"    label={`Acquisition debt (${currency})`} placeholder="5000000" />
                        <NumField control={form.control} name="interestRate" label="Debt interest rate %" suffix="%" placeholder="8" />
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* â”€â”€ STEP 6: Review â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            {step === 6 && (
              <div className="space-y-6">
                <SectionTitle title="Review & generate" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-border bg-card p-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Client</p>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Company</span><span className="font-medium">{values.clientName}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Industry</span><span className="font-medium">{values.industry}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Currency</span><span className="font-medium">{values.currency}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Country</span><span className="font-medium">{values.country}</span></div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border bg-card p-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Model</p>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span className="font-medium">{MODEL_OPTIONS.find(m => m.value === values.modelType)?.label}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Projection</span><span className="font-medium">{values.projectionYears} years</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Discount rate</span><span className="font-medium">{values.discountRate}%</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Terminal growth</span><span className="font-medium">{values.terminalGrowthRate}%</span></div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border bg-card p-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Revenue ({currency})</p>
                    <div className="space-y-1.5 text-sm">
                      {[1,2,3,4,5].map(y => {
                        const v = values[`year${y}Revenue` as keyof FormData] as number
                        return v > 0 ? (
                          <div key={y} className="flex justify-between"><span className="text-muted-foreground">Year {y}</span><span className="font-medium">{Number(v).toLocaleString()}</span></div>
                        ) : null
                      })}
                    </div>
                  </div>

                  <div className="rounded-xl border border-border bg-card p-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Costs & margins</p>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Gross margin</span><span className="font-medium">{values.grossMargin}%</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Total payroll</span><span className="font-medium">{currency} {Number(values.salariesTotal).toLocaleString()}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Marketing %</span><span className="font-medium">{values.marketingBudgetPct}%</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">R&D %</span><span className="font-medium">{values.rdBudgetPct}%</span></div>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 px-4 py-3 text-sm text-red-700 dark:text-red-300">
                    {error}
                  </div>
                )}
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              <Button type="button" variant="outline" onClick={prevStep} disabled={step === 0} className="gap-2">
                <ChevronLeftIcon className="w-4 h-4" />Back
              </Button>

              {step < STEPS.length - 1 ? (
                <Button type="button" onClick={nextStep} className="gap-2">
                  Continue<ChevronRightIcon className="w-4 h-4" />
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting} className="gap-2">
                  {isSubmitting ? <><LoaderIcon className="w-4 h-4 animate-spin" />Saving...</> : <><SparklesIcon className="w-4 h-4" />Generate model</>}
                </Button>
              )}
            </div>

          </form>
        </Form>
      </div>
    </main>
  )
}














