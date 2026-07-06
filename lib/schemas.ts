import { z } from "zod"

export const step1Schema = z.object({
  businessName: z.string().min(2, "Business name must be at least 2 characters"),
  industry: z.string().min(1, "Please select an industry"),
  subSector: z.string().min(1, "Please select a sub-sector"),
  businessStage: z.string().min(1, "Please select your business stage"),
  country: z.string().min(2, "Please enter your country"),
  currency: z.string().min(1, "Please select a currency"),
  foundedYear: z
    .string()
    .min(1, "Please enter founding year")
    .refine((val) => {
      const year = parseInt(val)
      return year >= 1900 && year <= new Date().getFullYear() + 1
    }, "Please enter a valid year"),
  employeeCount: z.string().min(1, "Please select employee count"),
  businessDescription: z
    .string()
    .min(20, "Please provide at least 20 characters")
    .max(500, "Maximum 500 characters"),
})

export const step2Schema = z.object({
  modelType: z.string().min(1, "Please select a model type"),
  projectionYears: z.string().min(1, "Please select projection period"),
  revenueModel: z.string().min(1, "Please select a revenue model"),
  currentARR: z.string().optional(),
  year1Revenue: z.string().min(1, "Please enter Year 1 revenue estimate"),
  year2Revenue: z.string().min(1, "Please enter Year 2 revenue estimate"),
  year3Revenue: z.string().min(1, "Please enter Year 3 revenue estimate"),
  revenueGrowthY1: z.string().min(1, "Please enter Year 1 growth rate"),
  revenueGrowthY2: z.string().min(1, "Please enter Year 2 growth rate"),
  revenueGrowthY3: z.string().min(1, "Please enter Year 3 growth rate"),
  primaryGrowthDriver: z.string().min(1, "Please select primary growth driver"),
  averageRevenuePerUser: z.string().optional(),
  expectedCustomersY1: z.string().optional(),
  churnRate: z.string().optional(),
})

export const step3Schema = z.object({
  grossMargin: z
    .string()
    .min(1, "Please enter gross margin")
    .refine((val) => {
      const num = parseFloat(val)
      return !isNaN(num) && num >= 0 && num <= 100
    }, "Gross margin must be between 0 and 100"),
  primaryCostDriver: z.string().min(1, "Please select primary cost driver"),
  totalHeadcount: z.string().min(1, "Please enter headcount"),
  avgSalary: z.string().min(1, "Please enter average salary"),
  salariesTotal: z.string().min(1, "Please enter total salary cost"),
  cloudInfraMonthly: z.string().optional(),
  marketingBudgetPct: z.string().optional(),
  cogsPercent: z.string().optional(),
  rdBudgetPct: z.string().optional(),
  officeRentMonthly: z.string().optional(),
  otherOpexMonthly: z.string().optional(),
  ebitdaMarginY1: z.string().optional(),
  ebitdaMarginY3: z.string().optional(),
  capexY1: z.string().optional(),
  depreciationPct: z.string().optional(),
})

export const step4Schema = z.object({
  fundingStage: z.string().min(1, "Please select funding stage"),
  totalFundingRaised: z.string().optional(),
  targetRaiseAmount: z.string().optional(),
  currentCash: z.string().min(1, "Please enter current cash balance"),
  monthlyBurnRate: z.string().min(1, "Please enter monthly burn rate"),
  runwayMonths: z.string().optional(),
  exitHorizonYears: z.string().min(1, "Please select exit horizon"),
  targetExitMultiple: z.string().optional(),
  discountRate: z.string().optional(),
  terminalGrowthRate: z.string().optional(),
  debtFunding: z.string().optional(),
  interestRate: z.string().optional(),
})

export type Step1Data = z.infer<typeof step1Schema>
export type Step2Data = z.infer<typeof step2Schema>
export type Step3Data = z.infer<typeof step3Schema>
export type Step4Data = z.infer<typeof step4Schema>

export type QuestionnaireData = {
  step1: Partial<Step1Data>
  step2: Partial<Step2Data>
  step3: Partial<Step3Data>
  step4: Partial<Step4Data>
}
