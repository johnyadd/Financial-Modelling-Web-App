import { z } from "zod"

export const clientIntakeSchema = z.object({
  // Client identity
  clientBusinessName: z
    .string()
    .min(2, "Business name must be at least 2 characters"),
  clientContactName: z
    .string()
    .min(2, "Contact name must be at least 2 characters"),
  clientEmail: z
    .string()
    .email("Please enter a valid email address")
    .optional()
    .or(z.literal("")),
  industry: z.string().min(1, "Please select an industry"),
  subSector: z.string().min(1, "Please select a sub-sector"),
  country: z.string().min(2, "Please enter the country of operation"),
  currency: z.string().min(1, "Please select a reporting currency"),

  // Business profile
  businessStage: z.string().min(1, "Please select the business stage"),
  employeeCount: z.string().min(1, "Please select employee count"),
  businessDescription: z
    .string()
    .min(10, "Please provide at least 10 characters")
    .max(500, "Maximum 500 characters"),

  // Engagement details
  modelPurpose: z.string().min(1, "Please select the model purpose"),
  engagementReference: z.string().optional(),
})

export type ClientIntakeData = z.infer<typeof clientIntakeSchema>

export const MODEL_PURPOSES = [
  "Fundraising / investor pitch",
  "Bank loan or grant application",
  "Business valuation",
  "Annual financial planning",
  "Board / management reporting",
  "Scenario and sensitivity analysis",
  "Acquisition / M&A analysis",
  "Exit planning",
  "Operational budgeting",
  "Other",
]
