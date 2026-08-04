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

// -- Step 2: Revenue --
//
// Session 2b-1: driver-based revenue mode support.
// Top-line revenue fields (year1/2/3Revenue + growth rates) are now .optional().
// Conditional required-ness is enforced in .superRefine() at the bottom of this schema:
//   - revenueEntryMode "topLine"    → require year1/2/3 revenue + growth rates
//   - revenueEntryMode "driverBased" → require businessTypeMain + businessTypeSub
// If revenueEntryMode is undefined (not yet set by user), it's treated as "topLine".
//
// NOTE: revenueEntryMode is .optional() (not .default()) so that z.infer produces
// a Step2Data shape that matches React Hook Form's Resolver expectations.
// The default value is provided in the form's defaultValues, not in the schema.
export const step2Schema = z
  .object({
    // Existing top-of-step fields
    modelType: z.string().min(1, "Please select a model type"),
    projectionYears: z.string().min(1, "Please select projection period"),
    revenueModel: z.string().min(1, "Please select a revenue model"),
    currentARR: z.string().optional(),

    // Session 1 additions — entry mode + business type pickers
    revenueEntryMode: z.enum(["topLine", "driverBased"]).optional(),
    businessTypeMain: z.string().optional(),
    businessTypeSub: z.string().optional(),

    // Top-line revenue fields — now optional, conditionally required by superRefine
    year1Revenue: z.string().optional(),
    year2Revenue: z.string().optional(),
    year3Revenue: z.string().optional(),
    revenueGrowthY1: z.string().optional(),
    revenueGrowthY2: z.string().optional(),
    revenueGrowthY3: z.string().optional(),

    // Existing driver-ish fields (kept for backwards compatibility)
    primaryGrowthDriver: z.string().optional(),
    averageRevenuePerUser: z.string().optional(),
    expectedCustomersY1: z.string().optional(),
    churnRate: z.string().optional(),

    // Session 2a — SaaS B2B drivers
    saasB2b_startingCustomers: z.string().optional(),
    saasB2b_newCustomersPerMonth: z.string().optional(),
    saasB2b_monthlyChurnRate: z.string().optional(),
    saasB2b_arpu: z.string().optional(),
    saasB2b_expansionRevenuePct: z.string().optional(),

    // Session 2a — E-commerce D2C drivers
    ecomD2c_monthlyTraffic: z.string().optional(),
    ecomD2c_conversionRate: z.string().optional(),
    ecomD2c_averageOrderValue: z.string().optional(),
    ecomD2c_repeatPurchaseRate: z.string().optional(),

    // Session 2a — Professional Services drivers
    svcProf_billableStaffCount: z.string().optional(),
    svcProf_billableHoursPerMonth: z.string().optional(),
    svcProf_utilizationRate: z.string().optional(),
    svcProf_hourlyRate: z.string().optional(),

    // Session 3a — Product Manufacturing drivers
    productMfg_unitsPerMonth: z.string().optional(),
    productMfg_unitPrice: z.string().optional(),
    productMfg_capacityUtilization: z.string().optional(),
    productMfg_sellThroughRate: z.string().optional(),

    // Session 3a — Product Retail drivers
    productRetail_storeCount: z.string().optional(),
    productRetail_revenuePerStore: z.string().optional(),
    productRetail_sameSalesGrowth: z.string().optional(),

    // Session 3a — Product Wholesale drivers
    productWhsl_activeAccounts: z.string().optional(),
    productWhsl_ordersPerAccount: z.string().optional(),
    productWhsl_averageOrderValue: z.string().optional(),

    // Session 3a — Real Estate Development drivers
    reDev_unitsBuiltYear: z.string().optional(),
    reDev_averageSellingPrice: z.string().optional(),
    reDev_sellThroughMonths: z.string().optional(),
    reDev_grossMargin: z.string().optional(),

    // Session 3a — Real Estate Rental drivers
    reRent_rentableUnits: z.string().optional(),
    reRent_monthlyRent: z.string().optional(),
    reRent_occupancyRate: z.string().optional(),
    reRent_otherIncomePct: z.string().optional(),

    // Session 3a — Real Estate Agency drivers
    reAgcy_monthlyTransactions: z.string().optional(),
    reAgcy_averageTransactionValue: z.string().optional(),
    reAgcy_commissionRate: z.string().optional(),

    // Session 3a — Real Estate REIT drivers
    reReit_portfolioProperties: z.string().optional(),
    reReit_averageYield: z.string().optional(),
    reReit_navGrowth: z.string().optional(),

    // Session 3a — Real Estate Short-term Rental drivers
    reStr_rentableUnits: z.string().optional(),
    reStr_averageNightlyRate: z.string().optional(),
    reStr_occupancyRate: z.string().optional(),
    reStr_cleaningFeePerBooking: z.string().optional(),

    // Session 3b — Healthcare Clinic drivers
    healthClinic_patientVisitsPerMonth: z.string().optional(),
    healthClinic_averageFeePerVisit: z.string().optional(),
    healthClinic_providerCount: z.string().optional(),
    healthClinic_retentionRate: z.string().optional(),

    // Session 3b — Healthcare Hospital drivers
    healthHosp_bedCount: z.string().optional(),
    healthHosp_occupancyRate: z.string().optional(),
    healthHosp_averageDailyRate: z.string().optional(),
    healthHosp_ancillaryRevenuePct: z.string().optional(),

    // Session 3b — Healthcare Device drivers
    healthDev_unitsSoldPerQuarter: z.string().optional(),
    healthDev_unitPrice: z.string().optional(),
    healthDev_serviceRevenuePct: z.string().optional(),
    healthDev_installBase: z.string().optional(),

    // Session 3b — Healthcare SaaS drivers
    healthSaas_startingCustomers: z.string().optional(),
    healthSaas_newCustomersPerMonth: z.string().optional(),
    healthSaas_arpu: z.string().optional(),
    healthSaas_monthlyChurnRate: z.string().optional(),

    // Session 3b — Healthcare Pharmacy drivers
    healthPharm_dailyFootfall: z.string().optional(),
    healthPharm_conversionRate: z.string().optional(),
    healthPharm_basketSize: z.string().optional(),
    healthPharm_prescriptionRevenuePct: z.string().optional(),

    // Session 3b — Education Institution drivers
    eduInst_enrolledStudents: z.string().optional(),
    eduInst_tuitionPerStudent: z.string().optional(),
    eduInst_capacity: z.string().optional(),
    eduInst_retentionRate: z.string().optional(),

    // Session 3b — Education EdTech drivers
    eduTech_monthlySignups: z.string().optional(),
    eduTech_paidConversionRate: z.string().optional(),
    eduTech_arpu: z.string().optional(),
    eduTech_monthlyChurnRate: z.string().optional(),

    // Session 3b — Education Tutoring drivers
    eduTut_activeStudents: z.string().optional(),
    eduTut_sessionsPerStudentPerMonth: z.string().optional(),
    eduTut_pricePerSession: z.string().optional(),

    // Session 3b — Education Corporate Training drivers
    eduCorp_enterpriseContracts: z.string().optional(),
    eduCorp_averageContractValue: z.string().optional(),
    eduCorp_retentionRate: z.string().optional(),
    eduCorp_expansionPct: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // Default to "topLine" when revenueEntryMode is not yet set
    // (e.g. existing saved models from before Session 2b, or the form not yet mounted)
    const mode = data.revenueEntryMode ?? "topLine"

    if (mode === "topLine") {
      // Top-line mode: yearly revenue + growth rates required
      const topLineRequired: Array<{ key: keyof typeof data; message: string }> = [
        { key: "year1Revenue",    message: "Please enter Year 1 revenue estimate" },
        { key: "year2Revenue",    message: "Please enter Year 2 revenue estimate" },
        { key: "year3Revenue",    message: "Please enter Year 3 revenue estimate" },
        { key: "revenueGrowthY1", message: "Please enter Year 1 growth rate" },
        { key: "revenueGrowthY2", message: "Please enter Year 2 growth rate" },
        { key: "revenueGrowthY3", message: "Please enter Year 3 growth rate" },
      ]
      for (const { key, message } of topLineRequired) {
        const value = data[key]
        if (typeof value !== "string" || value.trim() === "") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [key as string],
            message,
          })
        }
      }
    } else {
      // Driver mode: business type + sub-type required
      if (!data.businessTypeMain || data.businessTypeMain.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["businessTypeMain"],
          message: "Please select a business type",
        })
      }
      if (!data.businessTypeSub || data.businessTypeSub.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["businessTypeSub"],
          message: "Please select a business sub-type",
        })
      }
    }
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
