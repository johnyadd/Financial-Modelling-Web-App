import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { ModelDetail } from "@/components/models/model-detail"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Review Model | FinModels UK",
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function UploadModelPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: model, error } = await supabase
    .from("model_inputs")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !model) notFound()

  const { data: output } = await supabase
    .from("model_outputs")
    .select("*")
    .eq("model_input_id", id)
    .order("generated_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  return <ModelDetail model={model} output={output} />
}
