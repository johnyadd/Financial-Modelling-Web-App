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
  editingModelId: string | null
  loadFromModel: (payload: {
    modelId?: string | null
    goalId?: string | null
    step1?: Record<string, unknown> | null
    step2?: Record<string, unknown> | null
    step3?: Record<string, unknown> | null
    step4?: Record<string, unknown> | null
  }) => void
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
      editingModelId: null,
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
        set({ currentStep: 0, selectedGoalId: null, editingModelId: null, data: initialData }),

      loadFromModel: (payload) =>
        set({
          currentStep: 1,
          selectedGoalId: payload.goalId ?? null,
          editingModelId: payload.modelId ?? null,
          data: {
            step1: (payload.step1 ?? {}) as Partial<Step1Data>,
            step2: (payload.step2 ?? {}) as Partial<Step2Data>,
            step3: (payload.step3 ?? {}) as Partial<Step3Data>,
            step4: (payload.step4 ?? {}) as Partial<Step4Data>,
          },
        }),

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
          case 2: {
            // Session 2b-2: revenue completion depends on entry mode.
            // Top-line mode requires year1Revenue.
            // Driver mode requires businessTypeSub (drivers computed downstream).
            // Missing revenueEntryMode is treated as "topLine" (existing saved models).
            const mode = data.step2.revenueEntryMode ?? "topLine"
            const revenueOK = mode === "topLine"
              ? !!data.step2.year1Revenue
              : !!data.step2.businessTypeSub
            return !!(
              data.step2.modelType &&
              data.step2.revenueModel &&
              revenueOK
            )
          }
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
