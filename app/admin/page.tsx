"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  BarChart3Icon,
  UsersIcon,
  FileTextIcon,
  PoundSterlingIcon,
  ExternalLinkIcon,
  RefreshCwIcon,
  LoaderIcon,
  CircleDollarSignIcon,
} from "lucide-react"

interface TierBreakdown {
  count: number
  revenue: number
}

interface Metrics {
  mrr: number
  activeSubscriptions: number
  totalUsers: number
  totalModels: number
  tierBreakdown: Record<string, TierBreakdown>
  recentActivity: Array<{
    type: string
    description: string
    timestamp: string
  }>
}

export default function AdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    checkAccessAndFetch()
  }, [])

  async function checkAccessAndFetch() {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      await fetchMetrics()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  async function fetchMetrics() {
    setRefreshing(true)
    try {
      const res = await fetch("/api/admin/metrics", { credentials: "include" })
      if (res.status === 403) {
        setError("Access denied. This page is only for administrators.")
        return
      }
      if (!res.ok) {
        throw new Error("Failed to fetch metrics")
      }
      const data = await res.json()
      setMetrics(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setRefreshing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoaderIcon className="w-6 h-6 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-background">
        <div className="max-w-3xl mx-auto px-6 py-24 text-center">
          <h1 className="font-display text-4xl text-foreground mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => router.push("/")}>Back to home</Button>
        </div>
      </main>
    )
  }

  if (!metrics) return null

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1 font-medium">Admin</p>
            <h1 className="font-display text-4xl text-foreground">
              Business <span className="italic text-primary">overview</span>
            </h1>
          </div>
          <Button
            onClick={fetchMetrics}
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={refreshing}
          >
            <RefreshCwIcon className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <MetricCard
            icon={<PoundSterlingIcon className="w-5 h-5" />}
            label="Monthly Recurring Revenue"
            value={`£${metrics.mrr.toLocaleString()}`}
            sublabel="Live MRR"
            highlight
          />
          <MetricCard
            icon={<CircleDollarSignIcon className="w-5 h-5" />}
            label="Active Subscriptions"
            value={metrics.activeSubscriptions.toString()}
            sublabel="Paying customers"
          />
          <MetricCard
            icon={<UsersIcon className="w-5 h-5" />}
            label="Total Users"
            value={metrics.totalUsers.toLocaleString()}
            sublabel="Registered accounts"
          />
          <MetricCard
            icon={<FileTextIcon className="w-5 h-5" />}
            label="Models Created"
            value={metrics.totalModels.toLocaleString()}
            sublabel="All time"
          />
        </div>

        {/* Two column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">

          {/* Subscription breakdown */}
          <div className="lg:col-span-2 rounded-2xl border border-border/60 bg-card p-6">
            <h2 className="font-display text-2xl text-foreground mb-1">Subscription Breakdown</h2>
            <p className="text-sm text-muted-foreground mb-6">Distribution of users across tiers</p>

            <div className="space-y-4">
              <TierRow
                label="Free"
                count={metrics.tierBreakdown.free.count}
                price="£0"
                revenue="£0"
              />
              <TierRow
                label="Founder"
                count={metrics.tierBreakdown.founder.count}
                price="£29/mo"
                revenue={`£${metrics.tierBreakdown.founder.revenue.toLocaleString()}/mo`}
                color="blue"
              />
              <TierRow
                label="Vendor Pro"
                count={metrics.tierBreakdown.vendor_pro.count}
                price="£99/mo"
                revenue={`£${metrics.tierBreakdown.vendor_pro.revenue.toLocaleString()}/mo`}
                color="coral"
              />
              <TierRow
                label="Enterprise"
                count={metrics.tierBreakdown.enterprise.count}
                price="Custom"
                revenue={`£${metrics.tierBreakdown.enterprise.revenue.toLocaleString()}/mo`}
                color="purple"
              />
            </div>
          </div>

          {/* Quick links */}
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-6">
            <h2 className="font-display text-2xl text-foreground mb-1">Quick Access</h2>
            <p className="text-sm text-muted-foreground mb-6">External dashboards</p>

            <div className="space-y-2">
              <ExternalLink
                href="https://dashboard.stripe.com"
                label="Stripe Dashboard"
                sublabel="Payments & customers"
              />
              <ExternalLink
                href="https://analytics.google.com"
                label="Google Analytics"
                sublabel="Traffic & behaviour"
              />
              <ExternalLink
                href="https://vercel.com/dashboard"
                label="Vercel Dashboard"
                sublabel="Deployments & logs"
              />
              <ExternalLink
                href="https://supabase.com/dashboard"
                label="Supabase Dashboard"
                sublabel="Database & auth"
              />
            </div>
          </div>

        </div>

        {/* Recent activity */}
        <div className="rounded-2xl border border-border/60 bg-card p-6">
          <h2 className="font-display text-2xl text-foreground mb-1">Recent Activity</h2>
          <p className="text-sm text-muted-foreground mb-6">Latest events across the platform</p>

          {metrics.recentActivity.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No recent activity yet</p>
          ) : (
            <div className="space-y-3">
              {metrics.recentActivity.map((event, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-3 border-b border-border/40 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <ActivityBadge type={event.type} />
                    <span className="text-sm text-foreground">{event.description}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeTime(event.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  )
}

function MetricCard({
  icon,
  label,
  value,
  sublabel,
  highlight = false,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sublabel: string
  highlight?: boolean
}) {
  return (
    <div
      className={`rounded-2xl border ${highlight ? "border-primary/40 shadow-md shadow-primary/5" : "border-border/60"} bg-card p-5`}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
          {icon}
        </div>
      </div>
      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
      <p className="font-display text-3xl text-foreground mb-1 leading-tight">{value}</p>
      <p className="text-xs text-muted-foreground">{sublabel}</p>
    </div>
  )
}

function TierRow({
  label,
  count,
  price,
  revenue,
  color = "gray",
}: {
  label: string
  count: number
  price: string
  revenue: string
  color?: string
}) {
  const colorClass =
    color === "coral"
      ? "bg-primary/10 text-primary"
      : color === "blue"
      ? "bg-blue-100 text-blue-700"
      : color === "purple"
      ? "bg-purple-100 text-purple-700"
      : "bg-gray-100 text-gray-700"

  return (
    <div className="flex items-center justify-between py-3 border-b border-border/40 last:border-0">
      <div className="flex items-center gap-3">
        <span className={`text-xs font-semibold px-2 py-1 rounded-md ${colorClass}`}>{label}</span>
        <span className="text-sm text-muted-foreground">{price}</span>
      </div>
      <div className="flex items-center gap-6">
        <span className="text-sm text-muted-foreground">{count} users</span>
        <span className="text-sm font-semibold text-foreground min-w-24 text-right">{revenue}</span>
      </div>
    </div>
  )
}

function ExternalLink({
  href,
  label,
  sublabel,
}: {
  href: string
  label: string
  sublabel: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between p-3 rounded-lg hover:bg-card transition-colors group"
    >
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{sublabel}</p>
      </div>
      <ExternalLinkIcon className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
    </a>
  )
}

function ActivityBadge({ type }: { type: string }) {
  const config: Record<string, { label: string; color: string }> = {
    signup: { label: "SIGNUP", color: "bg-emerald-100 text-emerald-700" },
    subscription: { label: "SUB", color: "bg-primary/10 text-primary" },
    model: { label: "MODEL", color: "bg-blue-100 text-blue-700" },
  }
  const c = config[type] ?? { label: type.toUpperCase(), color: "bg-gray-100 text-gray-700" }
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${c.color}`}>{c.label}</span>
  )
}

function formatRelativeTime(timestamp: string): string {
  const now = Date.now()
  const then = new Date(timestamp).getTime()
  const diff = now - then

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 30) return `${days}d ago`
  return new Date(timestamp).toLocaleDateString()
}
