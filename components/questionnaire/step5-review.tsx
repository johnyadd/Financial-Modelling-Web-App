"use client"

import { useQuestionnaireStore } from "@/store/questionnaire-store"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MODEL_TYPES } from "@/lib/questionnaire-data"
import {
  ArrowLeftIcon,
  CheckCircle2Icon,
  SendIcon,
  PencilIcon,
  LoaderIcon,
} from "lucide-react"

interface ReviewRowProps {
  label: string
  value?: string | null
}

function ReviewRow({ label, value }: ReviewRowProps) {
  if (!value) return null
  return (
    <div className="flex justify-between items-start py-1.5 text-sm">
      <span className="text-muted-foreground min-w-[180px]">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  )
}

interface SectionProps {
  title: string
  step: number
  onEdit: (step: number) => void
  children: React.ReactNode
}

function ReviewSection({ title, step, onEdit, children }: SectionProps) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">{title}</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(step)}
          className="h-7 px-2 text-xs gap-1"
        >
          <PencilIcon className="w-3 h-3" />
          Edit
        </Button>
      </div>
      <div className="divide-y divide-border/50">{children}</div>
    </div>
  )
}

interface Step5ReviewProps {
  onSubmit: () => void
  submitting?: boolean
}

export function Step5Review({ onSubmit, submitting = false }: Step5ReviewProps) {
  const { data, prevStep, setStep } = useQuestionnaireStore()
  const { step1, step2, step3, step4 } = data
  const currency = step1.currency ?? "GBP"

  const modelLabel = MODEL_TYPES.find((m) => m.value === step2.modelType)?.label

  function formatCurrency(val?: string) {
    if (!val) return undefined
    return `${currency} ${parseInt(val).toLocaleString()}`
  }

  function formatPct(val?: string) {
    if (!val) return undefined
    return `${val}%`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <CheckCircle2Icon className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-semibold">Review your inputs</h2>
      </div>
      <p className="text-sm text-muted-foreground -mt-4">
        Check everything looks correct before generating your model.
      </p>

      {modelLabel && (
        <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Selected model</p>
            <p className="font-semibold">{modelLabel}</p>
          </div>
          <Badge variant="outline" className="border-primary text-primary">
            {step2.projectionYears ?? "5 years"}
          </Badge>
        </div>
      )}

      <ReviewSection title="Business information" step={1} onEdit={setStep}>
        <ReviewRow label="Business name"   value={step1.businessName} />
        <ReviewRow label="Industry"        value={step1.industry} />
        <ReviewRow label="Sub-sector"      value={step1.subSector} />
        <ReviewRow label="Stage"           value={step1.businessStage} />
        <ReviewRow label="Country"         value={step1.country} />
        <ReviewRow label="Currency"        value={step1.currency} />
        <ReviewRow label="Founded"         value={step1.foundedYear} />
        <ReviewRow label="Employees"       value={step1.employeeCount} />
      </ReviewSection>

      <ReviewSection title="Revenue assumptions" step={2} onEdit={setStep}>
        <ReviewRow label="Revenue model"        value={step2.revenueModel} />
        <ReviewRow label="Primary growth driver" value={step2.primaryGrowthDriver} />
        <ReviewRow label="Year 1 revenue"       value={formatCurrency(step2.year1Revenue)} />
        <ReviewRow label="Year 2 revenue"       value={formatCurrency(step2.year2Revenue)} />
        <ReviewRow label="Year 3 revenue"       value={formatCurrency(step2.year3Revenue)} />
        <ReviewRow label="Y1 growth rate"       value={formatPct(step2.revenueGrowthY1)} />
        <ReviewRow label="Y2 growth rate"       value={formatPct(step2.revenueGrowthY2)} />
        <ReviewRow label="Y3 growth rate"       value={formatPct(step2.revenueGrowthY3)} />
        <ReviewRow label="Annual churn rate"    value={formatPct(step2.churnRate)} />
      </ReviewSection>

      <ReviewSection title="Cost structure & margins" step={3} onEdit={setStep}>
        <ReviewRow label="Gross margin"       value={formatPct(step3.grossMargin)} />
        <ReviewRow label="Primary cost driver" value={step3.primaryCostDriver} />
        <ReviewRow label="Total headcount"    value={step3.totalHeadcount && `${step3.totalHeadcount} FTE`} />
        <ReviewRow label="Total annual payroll" value={formatCurrency(step3.salariesTotal)} />
        <ReviewRow label="COGS %"             value={formatPct(step3.cogsPercent)} />
        <ReviewRow label="Marketing %"        value={formatPct(step3.marketingBudgetPct)} />
        <ReviewRow label="R&D %"              value={formatPct(step3.rdBudgetPct)} />
        <ReviewRow label="EBITDA margin Y1"   value={formatPct(step3.ebitdaMarginY1)} />
        <ReviewRow label="EBITDA margin Y3"   value={formatPct(step3.ebitdaMarginY3)} />
      </ReviewSection>

      <ReviewSection title="Funding & exit" step={4} onEdit={setStep}>
        <ReviewRow label="Funding stage"    value={step4.fundingStage} />
        <ReviewRow label="Current cash"     value={formatCurrency(step4.currentCash)} />
        <ReviewRow label="Monthly burn"     value={formatCurrency(step4.monthlyBurnRate)} />
        <ReviewRow label="Runway"           value={step4.runwayMonths && `${step4.runwayMonths} months`} />
        <ReviewRow label="Exit horizon"     value={step4.exitHorizonYears} />
        <ReviewRow label="Discount rate"    value={formatPct(step4.discountRate)} />
        <ReviewRow label="Terminal growth"  value={formatPct(step4.terminalGrowthRate)} />
      </ReviewSection>

      <div className="flex justify-between pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          disabled={submitting}
          className="gap-2"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back
        </Button>
        <Button
          onClick={onSubmit}
          disabled={submitting}
          size="lg"
          className="gap-2"
        >
          {submitting ? (
            <>
              <LoaderIcon className="w-4 h-4 animate-spin" />
              Saving model...
            </>
          ) : (
            <>
              <SendIcon className="w-4 h-4" />
              Generate financial model
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
