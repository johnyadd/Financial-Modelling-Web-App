"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { PencilIcon } from "lucide-react"
import { useQuestionnaireStore } from "@/store/questionnaire-store"

interface ModelInputForEdit {
  id: string
  goal_id?: string | null
  step1_business?: Record<string, unknown> | null
  step2_revenue?: Record<string, unknown> | null
  step3_costs?: Record<string, unknown> | null
  step4_funding?: Record<string, unknown> | null
}

interface EditModelButtonProps {
  model: ModelInputForEdit
}

export function EditModelButton({ model }: EditModelButtonProps) {
  const router = useRouter()
  const loadFromModel = useQuestionnaireStore((s) => s.loadFromModel)

  function handleClick() {
    loadFromModel({
      goalId: model.goal_id ?? null,
      step1:  model.step1_business ?? null,
      step2:  model.step2_revenue ?? null,
      step3:  model.step3_costs ?? null,
      step4:  model.step4_funding ?? null,
    })
    router.push("/questionnaire")
  }

  return (
    <Button variant="outline" size="sm" onClick={handleClick} className="gap-2">
      <PencilIcon className="w-4 h-4" />
      Edit inputs
    </Button>
  )
}