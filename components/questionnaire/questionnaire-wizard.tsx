"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQuestionnaireStore } from "@/store/questionnaire-store"
import { StepIndicator } from "./step-indicator"
import { Step0GoalSelection } from "./step0-goal-selection"
import { Step1BusinessInfo } from "./step1-business-info"
import { Step2ModelRevenue } from "./step2-model-revenue"
import { Step3CostsMargins } from "./step3-costs-margins"
import { Step4FundingExit } from "./step4-funding-exit"
import { Step5Review } from "./step5-review"
import { Card, CardContent } from "@/components/ui/card"

export function QuestionnaireWizard() {
  const router = useRouter()
  const { currentStep, isStepComplete, setStep, data, selectedGoalId, resetQuestionnaire } =
    useQuestionnaireStore()
  const [mounted, setMounted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const completedSteps = [0, 1, 2, 3, 4].filter((s) => isStepComplete(s))

  async function handleSubmit() {
    setSubmitting(true)
    setSubmitError(null)

    try {
      const response = await fetch("/api/models/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityType:        "startup",
          source:            "questionnaire",
          modelType:         data.step2.modelType,
          goalId:            selectedGoalId,
          step1:             data.step1,
          step2:             data.step2,
          step3:             data.step3,
          step4:             data.step4,
          benchmarkSnapshot: {},
          name:              data.step1.businessName
            ? `${data.step1.businessName} — ${data.step2.modelType}`
            : null,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        // If unauthorised, redirect to login
        if (response.status === 401) {
          router.push("/auth/login?redirectTo=/questionnaire")
          return
        }
        throw new Error(result.error ?? "Failed to save model")
      }

      // Success — clear store and redirect to model output page
      resetQuestionnaire()
      router.push(`/models/${result.modelInputId}`)

    } catch (error) {
      console.error("Submit error:", error)
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (!mounted) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">Startup financial model</h1>
          <p className="text-muted-foreground text-sm">
            Complete the questionnaire to generate your tailored financial model.
          </p>
        </div>
        <div className="mb-8">
          <StepIndicator currentStep={0} completedSteps={[]} />
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
              Loading...
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Startup financial model</h1>
        <p className="text-muted-foreground text-sm">
          Complete the questionnaire to generate your tailored financial model.
        </p>
      </div>

      <div className="mb-8">
        <StepIndicator
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepClick={setStep}
        />
      </div>

      <Card>
        <CardContent className="pt-6">
          {submitError && (
            <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-300">
              {submitError}
            </div>
          )}
          {currentStep === 0 && <Step0GoalSelection />}
          {currentStep === 1 && <Step1BusinessInfo />}
          {currentStep === 2 && <Step2ModelRevenue />}
          {currentStep === 3 && <Step3CostsMargins />}
          {currentStep === 4 && <Step4FundingExit />}
          {currentStep === 5 && (
            <Step5Review
              onSubmit={handleSubmit}
              submitting={submitting}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
