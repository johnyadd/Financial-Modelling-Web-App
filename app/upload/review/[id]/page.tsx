import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { ReviewView } from "@/components/upload/review-view"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Review Extracted Data | FinModels UK",
}

interface ReviewPageProps {
  params: Promise<{ id: string }>
}

export default async function ReviewPage({ params }: ReviewPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login?redirectTo=/upload/review/" + id)
  }

  // Fetch model input
  const { data: modelInput, error } = await supabase
    .from("model_inputs")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !modelInput) notFound()

  // Fetch uploaded statements with extracted data
  const { data: statements } = await supabase
    .from("uploaded_statements")
    .select("*")
    .eq("model_input_id", id)
    .order("uploaded_at", { ascending: true })

  return (
    <ReviewView
      modelInput={modelInput}
      statements={statements ?? []}
    />
  )
}
