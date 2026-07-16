"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MODEL_TYPES } from "@/lib/questionnaire-data"
import { BUSINESS_GOALS } from "@/lib/goals"
import {
  PlusIcon,
  FileSpreadsheetIcon,
  ClockIcon,
  CheckCircle2Icon,
  TrendingUpIcon,
  RocketIcon,
  BuildingIcon,
  BriefcaseIcon,
  ArrowRightIcon,
  BarChart2Icon,
  AlertCircleIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Model {
  id: string
  entity_type: string
  source: string
  model_type: string
  goal_id: string | null
  input_status: string
  output_status: string | null
  name: string | null
  created_at: string
  updated_at: string
  summary_metrics: Record<string, unknown> | null
  generated_at: string | null
}

interface Profile {
  id: string
  full_name: string | null
  role: string
  plan: string
  created_at: string
}

interface DashboardViewProps {
  profile: Profile | null
  models: Model[]
}

const STATUS_CONFIG = {
  draft: {
    label: "Draft",
    icon: <ClockIcon className="w-3 h-3" />,
    cls: "text-muted-foreground border-border",
  },
  inputs_complete: {
    label: "Awaiting engine",
    icon: <ClockIcon className="w-3 h-3" />,
    cls: "text-amber-600 border-amber-300 dark:text-amber-400 dark:border-amber-800",
  },
  processing: {
    label: "Processing",
    icon: <ClockIcon className="w-3 h-3 animate-spin" />,
    cls: "text-blue-600 border-blue-300 dark:text-blue-400 dark:border-blue-800",
  },
  complete: {
    label: "Complete",
    icon: <CheckCircle2Icon className="w-3 h-3" />,
    cls: "text-emerald-600 border-emerald-300 dark:text-emerald-400 dark:border-emerald-800",
  },
  error: {
    label: "Error",
    icon: <AlertCircleIcon className="w-3 h-3" />,
    cls: "text-red-600 border-red-300 dark:text-red-400 dark:border-red-800",
  },
}

function ModelCard({ model }: { model: Model }) {
  const router = useRouter()
  const modelLabel = MODEL_TYPES.find((m) => m.value === model.model_type)?.label
  const goal = BUSINESS_GOALS.find((g) => g.id === model.goal_id)
  const status = STATUS_CONFIG[model.input_status as keyof typeof STATUS_CONFIG]
    ?? STATUS_CONFIG.draft

  const createdAt = new Date(model.created_at).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })

  const entityIcon = model.entity_type === "startup"
    ? <RocketIcon className="w-4 h-4 text-violet-600 dark:text-violet-400" />
    : <BuildingIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />

  return (
    <button
      onClick={() => router.push(`/models/${model.id}`)}
      className={cn(
        "group w-full text-left rounded-xl border border-border bg-card p-5",
        "hover:border-primary/40 hover:shadow-sm transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          {entityIcon}
          <span className="font-semibold text-sm text-foreground truncate">
            {model.name ?? modelLabel ?? "Financial model"}
          </span>
        </div>
        <Badge
          variant="outline"
          className={cn("text-xs flex-shrink-0 gap-1 flex items-center", status.cls)}
        >
          {status.icon}
          {status.label}
        </Badge>
      </div>

      <div className="flex items-center gap-2 flex-wrap mb-3">
        <Badge variant="secondary" className="text-xs">
          {modelLabel}
        </Badge>
        {goal && (
          <span className="text-xs text-muted-foreground">
            {goal.icon} {goal.title}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{createdAt}</span>
        <ArrowRightIcon className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
      </div>
    </button>
  )
}

function StatCard({
  label,
  value,
  icon,
  sub,
}: {
  label: string
  value: string | number
  icon: React.ReactNode
  sub?: string
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted-foreground">{label}</span>
        <div className="text-muted-foreground">{icon}</div>
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  )
}

export function DashboardView({ profile, models }: DashboardViewProps) {
  const router = useRouter()

  const totalModels = models.length
  const completeModels = models.filter((m) => m.input_status === "complete").length
  const pendingModels = models.filter((m) => m.input_status === "inputs_complete").length
  const startupModels = models.filter((m) => m.entity_type === "startup").length

  const firstName = profile?.full_name?.split(" ")[0] ?? "there"
  const isVendor = profile?.role === "vendor"

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* header */}
        <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">
              Welcome back, {firstName}
            </h1>
            <p className="text-sm text-muted-foreground">
              {totalModels === 0
                ? "You haven't built any models yet â€” start your first one below."
                : `You have ${totalModels} saved model${totalModels !== 1 ? "s" : ""}.`
              }
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isVendor && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => router.push("/vendor")}
              >
                <BriefcaseIcon className="w-4 h-4" />
                Vendor portal
              </Button>
            )}
            <Button
              size="sm"
              className="gap-2"
              onClick={() => router.push("/questionnaire")}
            >
              <PlusIcon className="w-4 h-4" />
              New model
            </Button>
          </div>
        </div>

        {/* stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total models"
            value={totalModels}
            icon={<FileSpreadsheetIcon className="w-4 h-4" />}
            sub="All time"
          />
          <StatCard
            label="Complete"
            value={completeModels}
            icon={<CheckCircle2Icon className="w-4 h-4" />}
            sub="Engine processed"
          />
          <StatCard
            label="Awaiting engine"
            value={pendingModels}
            icon={<ClockIcon className="w-4 h-4" />}
            sub="Inputs saved"
          />
          <StatCard
            label="Startup models"
            value={startupModels}
            icon={<TrendingUpIcon className="w-4 h-4" />}
            sub={`${totalModels - startupModels} existing business`}
          />
        </div>

        {/* models list */}
        {totalModels === 0 ? (
          // Empty state
          <div className="rounded-2xl border-2 border-dashed border-border p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <BarChart2Icon className="w-7 h-7 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">
              No models yet
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
              Build your first financial model in minutes. Answer a few questions
              about your business and we'll generate a tailored model for you.
            </p>
            <Button onClick={() => router.push("/questionnaire")} className="gap-2">
              <PlusIcon className="w-4 h-4" />
              Build your first model
            </Button>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground">Your models</h2>
              <span className="text-xs text-muted-foreground">
                Most recent first
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...new Map(models.map(m => [m.id, m])).values()].map((model) => (
                <ModelCard key={model.id} model={model} />
              ))}
            </div>
          </div>
        )}

        {/* quick actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => router.push("/questionnaire")}
            className="rounded-xl border border-border bg-card p-4 text-left hover:border-primary/40 hover:shadow-sm transition-all group"
          >
            <RocketIcon className="w-5 h-5 text-violet-600 dark:text-violet-400 mb-3" />
            <p className="font-medium text-sm text-foreground mb-1">
              Startup model
            </p>
            <p className="text-xs text-muted-foreground">
              Goal-driven questionnaire for founders
            </p>
          </button>

          <button
            onClick={() => router.push("/upload")}
            className="rounded-xl border border-border bg-card p-4 text-left hover:border-primary/40 hover:shadow-sm transition-all group"
          >
            <BuildingIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mb-3" />
            <p className="font-medium text-sm text-foreground mb-1">
              Existing business
            </p>
            <p className="text-xs text-muted-foreground">
              Upload financials for AI extraction
            </p>
          </button>

          <button
            onClick={() => router.push("/vendor")}
            className="rounded-xl border border-border bg-card p-4 text-left hover:border-primary/40 hover:shadow-sm transition-all group"
          >
            <BriefcaseIcon className="w-5 h-5 text-orange-600 dark:text-orange-400 mb-3" />
            <p className="font-medium text-sm text-foreground mb-1">
              Build for a client
            </p>
            <p className="text-xs text-muted-foreground">
              Vendor portal â€” template-first approach
            </p>
          </button>
        </div>

      </div>
    </main>
  )
}
