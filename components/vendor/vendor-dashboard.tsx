"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MODEL_TYPES } from "@/lib/questionnaire-data"
import {
  PlusIcon, BriefcaseIcon, CheckCircle2Icon,
  ClockIcon, ArrowRightIcon, BarChart2Icon,
  FileSpreadsheetIcon, AlertCircleIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface VendorDashboardProps {
  profile: { id: string; full_name: string | null; role: string } | null
  models: {
    id: string; name: string | null; model_type: string
    status: string; entity_type: string; created_at: string; goal_id: string | null
  }[]
}

const STATUS_CONFIG: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  draft:           { label: "Draft",          cls: "text-muted-foreground border-border",          icon: <ClockIcon className="w-3 h-3" /> },
  inputs_complete: { label: "Ready to run",   cls: "text-amber-600 border-amber-300",              icon: <ClockIcon className="w-3 h-3" /> },
  processing:      { label: "Processing",     cls: "text-blue-600 border-blue-300",                icon: <ClockIcon className="w-3 h-3 animate-spin" /> },
  complete:        { label: "Complete",       cls: "text-emerald-600 border-emerald-300",          icon: <CheckCircle2Icon className="w-3 h-3" /> },
  error:           { label: "Error",          cls: "text-red-600 border-red-300",                  icon: <AlertCircleIcon className="w-3 h-3" /> },
}

export function VendorDashboard({ profile, models }: VendorDashboardProps) {
  const router = useRouter()
  const firstName = profile?.full_name?.split(" ")[0] ?? "there"
  const complete = models.filter(m => m.status === "complete").length
  const pending = models.filter(m => m.status === "inputs_complete").length

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-6 py-10">

        <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BriefcaseIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              <Badge variant="outline" className="text-orange-600 border-orange-300 dark:text-orange-400 dark:border-orange-800">
                Vendor portal
              </Badge>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Welcome back, {firstName}</h1>
            <p className="text-sm text-muted-foreground">
              {models.length === 0 ? "Build your first client model below." : `${models.length} client model${models.length !== 1 ? "s" : ""} Â· ${complete} complete Â· ${pending} ready to run`}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={() => router.push("/vendor/settings")}>
              Branding
            </Button>
            <Button className="gap-2" onClick={() => router.push("/vendor/new")}>
              <PlusIcon className="w-4 h-4" />New client model
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total models",    value: models.length,  icon: <FileSpreadsheetIcon className="w-4 h-4" /> },
            { label: "Complete",        value: complete,        icon: <CheckCircle2Icon className="w-4 h-4" /> },
            { label: "Ready to run",    value: pending,         icon: <ClockIcon className="w-4 h-4" /> },
            { label: "In progress",     value: models.filter(m => m.status === "draft").length, icon: <BarChart2Icon className="w-4 h-4" /> },
          ].map(({ label, value, icon }) => (
            <div key={label} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground">{label}</span>
                <div className="text-muted-foreground">{icon}</div>
              </div>
              <p className="text-2xl font-bold text-foreground">{value}</p>
            </div>
          ))}
        </div>

        {/* Model list */}
        {models.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-border p-12 text-center">
            <BriefcaseIcon className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">No client models yet</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
              Build a detailed financial model for a client using the full-assumption vendor template.
            </p>
            <Button onClick={() => router.push("/vendor/new")} className="gap-2">
              <PlusIcon className="w-4 h-4" />Build first client model
            </Button>
          </div>
        ) : (
          <div>
            <h2 className="font-semibold text-foreground mb-4">Client models</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {models.map((model) => {
                const status = STATUS_CONFIG[model.status] ?? STATUS_CONFIG.draft
                const modelLabel = MODEL_TYPES.find(m => m.value === model.model_type)?.label
                const createdAt = new Date(model.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                return (
                  <button key={model.id} onClick={() => router.push(`/models/${model.id}`)}
                    className="group w-full text-left rounded-xl border border-border bg-card p-5 hover:border-primary/40 hover:shadow-sm transition-all">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <span className="font-semibold text-sm text-foreground truncate">
                        {model.name ?? modelLabel ?? "Client model"}
                      </span>
                      <Badge variant="outline" className={cn("text-xs flex-shrink-0 gap-1 flex items-center", status.cls)}>
                        {status.icon}{status.label}
                      </Badge>
                    </div>
                    <Badge variant="secondary" className="text-xs mb-3">{modelLabel}</Badge>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{createdAt}</span>
                      <ArrowRightIcon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

      </div>
    </main>
  )
}

