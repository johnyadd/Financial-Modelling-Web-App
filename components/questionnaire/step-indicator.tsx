"use client"

import { useState, useEffect } from "react"
import { CheckIcon } from "lucide-react"
import { cn } from "@/lib/utils"

const STEPS = [
  { number: 0, label: "Your Goal" },
  { number: 1, label: "Business Info" },
  { number: 2, label: "Model & Revenue" },
  { number: 3, label: "Costs & Margins" },
  { number: 4, label: "Funding & Exit" },
  { number: 5, label: "Review" },
]

interface StepIndicatorProps {
  currentStep: number
  completedSteps: number[]
  onStepClick?: (step: number) => void
}

export function StepIndicator({
  currentStep,
  completedSteps,
  onStepClick,
}: StepIndicatorProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-4 left-0 right-0 h-[1px] bg-border z-0" />
          {STEPS.map((step) => (
            <div key={step.number} className="flex flex-col items-center z-10 gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 bg-background border-border text-muted-foreground">
                {step.number + 1}
              </div>
              <span className="text-xs font-medium hidden sm:block text-muted-foreground">
                {step.label}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 h-1 bg-muted rounded-full" />
        <p className="text-xs text-muted-foreground mt-2 text-right">
          Step 1 of {STEPS.length}
        </p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-4 left-0 right-0 h-[1px] bg-border z-0" />
        {STEPS.map((step) => {
          const isCompleted = completedSteps.includes(step.number)
          const isActive = currentStep === step.number
          const isClickable = isCompleted || step.number <= currentStep

          return (
            <div key={step.number} className="flex flex-col items-center z-10 gap-2">
              <button
                onClick={() => isClickable && onStepClick?.(step.number)}
                disabled={!isClickable}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-all",
                  isCompleted
                    ? "bg-primary border-primary text-primary-foreground cursor-pointer"
                    : isActive
                    ? "bg-background border-primary text-primary"
                    : "bg-background border-border text-muted-foreground cursor-not-allowed"
                )}
              >
                {isCompleted ? (
                  <CheckIcon className="w-4 h-4" />
                ) : (
                  step.number + 1
                )}
              </button>
              <span
                className={cn(
                  "text-xs font-medium hidden sm:block",
                  isActive
                    ? "text-primary"
                    : isCompleted
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>

      <div className="mt-4 h-1 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{
            width: `${(currentStep / (STEPS.length - 1)) * 100}%`,
          }}
        />
      </div>

      <p className="text-xs text-muted-foreground mt-2 text-right">
        Step {currentStep + 1} of {STEPS.length}
      </p>
    </div>
  )
}
