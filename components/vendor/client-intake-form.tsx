"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { clientIntakeSchema, type ClientIntakeData, MODEL_PURPOSES } from "@/lib/vendor-schemas"
import { useVendorStore, type ClientType } from "@/store/vendor-store"
import { INDUSTRIES, BUSINESS_STAGES, CURRENCIES, EMPLOYEE_RANGES } from "@/lib/questionnaire-data"
import {
  Form, FormControl, FormField, FormItem,
  FormLabel, FormMessage, FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeftIcon, ArrowRightIcon,
  UserIcon, BuildingIcon, BriefcaseIcon,
  RocketIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ClientIntakeFormProps {
  clientType: ClientType
  nextRoute: string
  backRoute: string
}

export function ClientIntakeForm({
  clientType,
  nextRoute,
  backRoute,
}: ClientIntakeFormProps) {
  const router = useRouter()
  const { clientData, updateClientData, setClientType, setIntakeComplete } = useVendorStore()

  const isStartup = clientType === "startup"

  const form = useForm<ClientIntakeData>({
    resolver: zodResolver(clientIntakeSchema),
    defaultValues: {
      clientBusinessName:  clientData.clientBusinessName ?? "",
      clientContactName:   clientData.clientContactName ?? "",
      clientEmail:         clientData.clientEmail ?? "",
      industry:            clientData.industry ?? "",
      subSector:           clientData.subSector ?? "",
      country:             clientData.country ?? "",
      currency:            clientData.currency ?? "",
      businessStage:       clientData.businessStage ?? "",
      employeeCount:       clientData.employeeCount ?? "",
      businessDescription: clientData.businessDescription ?? "",
      modelPurpose:        clientData.modelPurpose ?? "",
      engagementReference: clientData.engagementReference ?? "",
    },
  })

  const selectedIndustry = form.watch("industry")
  const subSectors = selectedIndustry ? INDUSTRIES[selectedIndustry] ?? [] : []

  // Reset sub-sector when industry changes
  useEffect(() => {
    form.setValue("subSector", "")
  }, [selectedIndustry, form])

  function onSubmit(values: ClientIntakeData) {
    updateClientData({ ...values, clientType })
    setClientType(clientType)
    setIntakeComplete(true)
    router.push(nextRoute)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

        {/* client type badge */}
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            isStartup
              ? "bg-violet-100 dark:bg-violet-950"
              : "bg-emerald-100 dark:bg-emerald-950"
          )}>
            {isStartup
              ? <RocketIcon className="w-4 h-4 text-violet-700 dark:text-violet-300" />
              : <BuildingIcon className="w-4 h-4 text-emerald-700 dark:text-emerald-300" />
            }
          </div>
          <div>
            <Badge variant="outline" className="text-orange-600 border-orange-300 dark:text-orange-400 text-xs">
              Vendor · {isStartup ? "Startup client" : "Existing business client"}
            </Badge>
          </div>
        </div>

        {/* ── SECTION 1: CLIENT IDENTITY ───────────────────── */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <UserIcon className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Client details</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="clientBusinessName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client business name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Acme Ventures Ltd" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="clientContactName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary contact name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. John Smith" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="clientEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client email (optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="e.g. john@acmeventures.com"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Used to share the completed model with your client
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="engagementReference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Engagement reference (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. ENG-2024-001" {...field} />
                  </FormControl>
                  <FormDescription>
                    Your internal project or client reference number
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        {/* ── SECTION 2: BUSINESS PROFILE ──────────────────── */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <BuildingIcon className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">
              Client business profile
            </h3>
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
                        <SelectItem key={ind} value={ind}>{ind}</SelectItem>
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
                            selectedIndustry
                              ? "Select sub-sector"
                              : "Select an industry first"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-72">
                      {subSectors.map((sub) => (
                        <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="businessStage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business stage</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select stage" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {BUSINESS_STAGES.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
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
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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
          </div>

          <div className="mt-4">
            <FormField
              control={form.control}
              name="businessDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brief business description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the client's business — what they do, who their customers are, and their core value proposition..."
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
          </div>
        </div>

        <Separator />

        {/* ── SECTION 3: ENGAGEMENT ────────────────────────── */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <BriefcaseIcon className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">
              Engagement details
            </h3>
          </div>

          <FormField
            control={form.control}
            name="modelPurpose"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purpose of this model</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Why is this model being built?" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {MODEL_PURPOSES.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  This helps tailor the model output and report format
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* navigation */}
        <div className="flex justify-between pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(backRoute)}
            className="gap-2"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back
          </Button>
          <Button type="submit" className="gap-2">
            Continue to model selection
            <ArrowRightIcon className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </Form>
  )
}
