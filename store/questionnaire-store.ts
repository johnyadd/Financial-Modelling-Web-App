"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { QuestionnaireData, Step1Data, Step2Data, Step3Data, Step4Data } from "@/lib/schemas"

interface QuestionnaireStore {
  currentStep: number
  selectedGoalId: string | null
  data: QuestionnaireData
  setStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  setGoal: (goalId: string) => void
  updateStep1: (data: Partial<Step1Data>) => void
  updateStep2: (data: Partial<Step2Data>) => void
  updateStep3: (data: Partial<Step3Data>) => void
  updateStep4: (data: Partial<Step4Data>) => void
  resetQuestionnaire: () => void
  isStepComplete: (step: number) => boolean
}

const initialData: QuestionnaireData = {
  step1: {},
  step2: {},
  step3: {},
  step4: {},
}

export const useQuestionnaireStore = create<QuestionnaireStore>()(
  persist(
    (set, get) => ({
      currentStep: 0,       // starts at 0 (goal selection)
      selectedGoalId: null,
      data: initialData,

      setStep: (step) => set({ currentStep: step }),

      nextStep: () =>
        set((s) => ({ currentStep: Math.min(s.currentStep + 1, 5) })),

      prevStep: () =>
        set((s) => ({ currentStep: Math.max(s.currentStep - 1, 0) })),

      setGoal: (goalId) => set({ selectedGoalId: goalId }),

      updateStep1: (data) =>
        set((s) => ({ data: { ...s.data, step1: { ...s.data.step1, ...data } } })),

      updateStep2: (data) =>
        set((s) => ({ data: { ...s.data, step2: { ...s.data.step2, ...data } } })),

      updateStep3: (data) =>
        set((s) => ({ data: { ...s.data, step3: { ...s.data.step3, ...data } } })),

      updateStep4: (data) =>
        set((s) => ({ data: { ...s.data, step4: { ...s.data.step4, ...data } } })),

      resetQuestionnaire: () =>
        set({ currentStep: 0, selectedGoalId: null, data: initialData }),

      isStepComplete: (step) => {
        const { data } = get()
        switch (step) {
          case 1:
            return !!(
              data.step1.businessName &&
              data.step1.industry &&
              data.step1.subSector &&
              data.step1.businessStage &&
              data.step1.currency
            )
          case 2:
            return !!(
              data.step2.modelType &&
              data.step2.year1Revenue &&
              data.step2.revenueModel
            )
          case 3:
            return !!(
              data.step3.grossMargin &&
              data.step3.totalHeadcount &&
              data.step3.salariesTotal
            )
          case 4:
            return !!(
              data.step4.fundingStage &&
              data.step4.currentCash &&
              data.step4.monthlyBurnRate
            )
          default:
            return false
        }
      },
    }),
    {
      name: "finmodels-questionnaire",
    }
  )
)
