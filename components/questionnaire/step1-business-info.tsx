"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuestionnaireStore } from "@/store/questionnaire-store"
import { step1Schema, type Step1Data } from "@/lib/schemas"
import {
  INDUSTRIES,
  BUSINESS_STAGES,
  CURRENCIES,
  EMPLOYEE_RANGES,
} from "@/lib/questionnaire-data"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2Icon, ArrowRightIcon } from "lucide-react"

export function Step1BusinessInfo() {
  const { data, updateStep1, nextStep } = useQuestionnaireStore()

  const form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      businessName: data.step1.businessName ?? "",
      industry: data.step1.industry ?? "",
      subSector: data.step1.subSector ?? "",
      businessStage: data.step1.businessStage ?? "",
      country: data.step1.country ?? "",
      currency: data.step1.currency ?? "",
      foundedYear: data.step1.foundedYear ?? "",
      employeeCount: data.step1.employeeCount ?? "",
      businessDescription: data.step1.businessDescription ?? "",
    },
  })

  const selectedIndustry = form.watch("industry")
  const subSectors = selectedIndustry ? INDUSTRIES[selectedIndustry] ?? [] : []

  useEffect(() => {
    form.setValue("subSector", "")
  }, [selectedIndustry, form])

  function onSubmit(values: Step1Data) {
    updateStep1(values)
    nextStep()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex items-center gap-2 mb-2">
          <Building2Icon className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">Business information</h2>
        </div>
        <p className="text-sm text-muted-foreground -mt-4">
          Tell us about your business so we can tailor the financial model to your sector.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="businessName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Acme Fintech Ltd" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="foundedYear"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Year founded</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 2023" type="number" min="1900" max="2026" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="industry"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Industry</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-72">
                    {Object.keys(INDUSTRIES).map((ind) => (
                      <SelectItem key={ind} value={ind}>
                        {ind}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="subSector"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sub-sector</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={!selectedIndustry}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          selectedIndustry ? "Select sub-sector" : "Select an industry first"
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-72">
                    {subSectors.map((sub) => (
                      <SelectItem key={sub} value={sub}>
                        {sub}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="businessStage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business stage</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your current stage" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {BUSINESS_STAGES.map((stage) => (
                    <SelectItem key={stage} value={stage}>
                      {stage}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country of operation</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. United Kingdom" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reporting currency</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="employeeCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of employees</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {EMPLOYEE_RANGES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="businessDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Brief business description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe what your business does, who your customers are, and your core value proposition..."
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                {field.value?.length ?? 0}/500 characters
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end pt-2">
          <Button type="submit" className="gap-2">
            Next: Model & Revenue
            <ArrowRightIcon className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </Form>
  )
}
