"use client"

import { useRouter } from "next/navigation"
import { UploadIcon, FileTextIcon, SheetIcon, ArrowLeftIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const ACCEPTED_FORMATS = [
  { icon: <FileTextIcon className="w-5 h-5" />, label: "PDF", sub: "Income statement, balance sheet, cash flow" },
  { icon: <SheetIcon className="w-5 h-5" />, label: "Excel (.xlsx)", sub: "Management accounts, trial balance" },
  { icon: <FileTextIcon className="w-5 h-5" />, label: "CSV", sub: "Exported accounting data" },
]

export default function UploadPage() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-6 py-12">

        {/* Back link */}
        <button
          onClick={() => router.push("/")}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back
        </button>

        {/* Header */}
        <div className="mb-8">
          <Badge variant="outline" className="mb-3 text-emerald-600 border-emerald-300 dark:text-emerald-400 dark:border-emerald-800">
            Existing business
          </Badge>
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            Upload your financial statements
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Our AI will extract your revenue, costs, and balance sheet data — then
            ask you to review everything before generating your model.
          </p>
        </div>

        {/* Upload drop zone */}
        <Card className="border-2 border-dashed border-border hover:border-emerald-400 transition-colors cursor-pointer mb-6">
          <CardContent className="py-14 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center mb-4">
              <UploadIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="font-medium text-foreground mb-1">
              Drop your files here
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              or click to browse from your computer
            </p>
            <Button variant="outline" size="sm">
              Browse files
            </Button>
          </CardContent>
        </Card>

        {/* Accepted formats */}
        <div className="mb-8">
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-3">
            Accepted formats
          </p>
          <div className="grid grid-cols-3 gap-3">
            {ACCEPTED_FORMATS.map((f) => (
              <div
                key={f.label}
                className="rounded-lg border border-border bg-muted/30 p-3"
              >
                <div className="text-muted-foreground mb-1">{f.icon}</div>
                <p className="text-sm font-medium text-foreground">{f.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{f.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* What happens next */}
        <div className="rounded-xl border border-border bg-muted/20 p-5">
          <p className="text-sm font-medium text-foreground mb-3">What happens next</p>
          <ol className="space-y-2">
            {[
              "AI reads your statements and extracts key financials",
              "You review and confirm the extracted data",
              "We normalise it into a standardised model structure",
              "Your financial model is generated and ready to export",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-muted border border-border text-xs flex items-center justify-center text-foreground font-medium mt-0.5">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        {/* Coming soon notice */}
        <p className="text-xs text-center text-muted-foreground mt-6">
          AI parsing — coming soon. The startup questionnaire is fully live now.{" "}
          <button
            onClick={() => router.push("/questionnaire")}
            className="underline underline-offset-2 hover:text-foreground transition-colors"
          >
            Try the startup path instead
          </button>
        </p>

      </div>
    </main>
  )
}
