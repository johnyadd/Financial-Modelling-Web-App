import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { ModelDetail } from "@/components/models/model-detail"

interface ModelPageProps {
  params: Promise<{ id: string }>
}

export default async function ModelPage({ params }: ModelPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login?redirectTo=/models/" + id)
  }

  const { data: model, error } = await supabase
    .from("model_inputs")
    .select(`
      id,
      entity_type,
      source,
      model_type,
      goal_id,
      status,
      name,
      step1_business,
      step2_revenue,
      step3_costs,
      step4_funding,
      created_at,
      updated_at
    `)
    .eq("id", id)
    .single()

  if (error || !model) {
    notFound()
  }

  const { data: output } = await supabase
    .from("model_outputs")
    .select("*")
    .eq("model_input_id", id)
    .order("generated_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  return <ModelDetail model={model} output={output} />
}
