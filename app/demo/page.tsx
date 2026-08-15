import Link from "next/link"
import { createAdminClient } from "@/lib/supabase/admin"
import { MemoViewer } from "@/components/memo/memo-viewer"
import type { InvestorMemo } from "@/lib/memo/types"
import { Button } from "@/components/ui/button"
import { ArrowRightIcon } from "lucide-react"

const DEMO_MODEL_ID = "6327a94b-5763-45b9-8b0d-0519fa492214"

export const metadata = {
  title: "See a real investor memo | Finanyst",
  description:
    "A real UK Seed SaaS financial model, read by Finanyst and written up as an investor memo with UK benchmark comparisons and cited sources.",
}

export const revalidate = 3600

export default async function DemoPage() {
  const supabase = createAdminClient()

  const { data: model } = await supabase
    .from("model_inputs")
    .select("id, name, step1_business, is_public")
    .eq("id", DEMO_MODEL_ID)
    .eq("is_public", true)
    .maybeSingle()

  const { data: memoRow } = await supabase
    .from("memos")
    .select("content")
    .eq("model_input_id", DEMO_MODEL_ID)
    .eq("audience", "investor")
    .maybeSingle()

  if (!model || !memoRow?.content) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-md">
          <h1 className="text-xl font-semibold">Demo unavailable</h1>
          <p className="text-sm text-muted-foreground">
            The sample memo is being refreshed. Please try again shortly.
          </p>
          <Button asChild><Link href="/">Back to home</Link></Button>
        </div>
      </main>
    )
  }

  const memo = memoRow.content as unknown as InvestorMemo
  const step1 = (model.step1_business ?? {}) as Record<string, unknown>
  const businessName = (step1.businessName as string) ?? undefined

  return (
    <main className="min-h-screen bg-background pb-28">
      <div className="max-w-3xl mx-auto px-6 pt-10">
        <div className="rounded-lg border border-border bg-muted/30 p-5 space-y-2">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
            Sample output
          </p>
          <h1 className="text-lg font-semibold">
            This is what Finanyst writes from a financial model.
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            A real UK Seed SaaS model, read end to end and written up in analyst voice.
            Every benchmark row names the source it was measured against. Nothing here
            was hand-written.
          </p>
        </div>
      </div>

      <MemoViewer memo={memo} businessName={businessName} />


      <div className="fixed bottom-0 inset-x-0 border-t border-border bg-background/95 backdrop-blur">
        <div className="max-w-3xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Want this for your own numbers?
          </p>
          <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href="/benchmarks">See the benchmarks</Link>
          </Button>
          <Button asChild className="gap-2">
            <Link href="/auth/signup">
              Build your model<ArrowRightIcon className="w-4 h-4" />
            </Link>
          </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
