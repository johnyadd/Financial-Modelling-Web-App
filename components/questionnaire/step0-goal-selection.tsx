"use client"

import { useState } from "react"
import { useQuestionnaireStore } from "@/store/questionnaire-store"
import { BUSINESS_GOALS, GOAL_TO_MODEL_TYPE } from "@/lib/goals"
import { MODEL_TYPES } from "@/lib/questionnaire-data"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  ArrowRightIcon,
  CheckCircle2Icon,
  LightbulbIcon,
  SparklesIcon,
} from "lucide-react"

export function Step0GoalSelection() {
  const { updateStep2, setGoal, nextStep } = useQuestionnaireStore()
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null)
  const [overrideModelValue, setOverrideModelValue] = useState<string | null>(null)

  const selectedGoal = BUSINESS_GOALS.find((g) => g.id === selectedGoalId)
  const autoModelValue = selectedGoalId ? GOAL_TO_MODEL_TYPE[selectedGoalId] : null
  const autoModel = MODEL_TYPES.find((m) => m.value === autoModelValue)
  const activeModelValue = overrideModelValue ?? autoModelValue
  const activeModel = MODEL_TYPES.find((m) => m.value === activeModelValue)
  const alternativeModels = MODEL_TYPES.filter(
    (m) =>
      selectedGoal?.recommendedModels.includes(m.label) &&
      m.value !== autoModelValue
  )

  function handleGoalSelect(goalId: string) {
    setSelectedGoalId(goalId)
    setOverrideModelValue(null)
  }

  function handleContinue() {
    if (!selectedGoal || !activeModelValue) return
    setGoal(selectedGoalId!)
    updateStep2({ modelType: activeModelValue })
    nextStep()
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <LightbulbIcon className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">What are you trying to achieve?</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Select your primary goal — we will automatically recommend the right
          financial model and tailor the questionnaire to what matters most.
        </p>
      </div>

      {/* goal cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {BUSINESS_GOALS.map((goal) => {
          const isSelected = selectedGoalId === goal.id
          return (
            <button
              key={goal.id}
              type="button"
              onClick={() => handleGoalSelect(goal.id)}
              className={cn(
                "text-left p-4 rounded-xl border-2 transition-all duration-150",
                "hover:border-primary/40 hover:shadow-sm",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isSelected
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border bg-background"
              )}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-lg" aria-hidden="true">{goal.icon}</span>
                  <span className="font-medium text-sm text-foreground">
                    {goal.title}
                  </span>
                </div>
                {isSelected && (
                  <CheckCircle2Icon className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                )}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed pl-7">
                {goal.description}
              </p>
            </button>
          )
        })}
      </div>

      {/* model confirmation panel — appears after goal selected */}
      {selectedGoal && activeModel && (
        <div className="rounded-xl border border-primary/25 bg-primary/5 overflow-hidden">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <SparklesIcon className="w-4 h-4 text-primary" />
              <p className="text-xs font-semibold text-primary uppercase tracking-wide">
                Recommended financial model
              </p>
            </div>

            {/* active model card */}
            <div className="rounded-lg border-2 border-primary bg-background p-4">
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="font-semibold text-sm text-foreground">
                  {activeModel.label}
                </span>
                <CheckCircle2Icon className="w-4 h-4 text-primary flex-shrink-0" />
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                {activeModel.description}
              </p>
              <div className="flex flex-wrap gap-1">
                {activeModel.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs px-2 py-0">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* questionnaire focus */}
            <div className="mt-3 pt-3 border-t border-primary/15">
              <p className="text-xs font-medium text-foreground mb-1.5">
                Questionnaire will focus on:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {selectedGoal.questionnaireFocus.map((f) => (
                  <span
                    key={f}
                    className="text-xs px-2 py-0.5 rounded-full bg-background border border-border text-muted-foreground"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* alternative models */}
          {alternativeModels.length > 0 && (
            <div className="border-t border-primary/15 px-4 pb-4 pt-3">
              <p className="text-xs text-muted-foreground mb-2">
                Alternatively, you can switch to one of these models:
              </p>
              <div className="flex flex-wrap gap-2">
                {alternativeModels.map((m) => {
                  const isActive = activeModelValue === m.value
                  return (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() =>
                        setOverrideModelValue(isActive ? null : m.value)
                      }
                      className={cn(
                        "text-xs px-3 py-1.5 rounded-lg border transition-all",
                        isActive
                          ? "border-primary bg-primary/10 text-primary font-medium"
                          : "border-border bg-background text-muted-foreground hover:border-primary/40"
                      )}
                    >
                      {isActive && "✓ "}{m.label}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end pt-2">
        <Button
          onClick={handleContinue}
          disabled={!selectedGoalId}
          className="gap-2"
        >
          Continue to business details
          <ArrowRightIcon className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
