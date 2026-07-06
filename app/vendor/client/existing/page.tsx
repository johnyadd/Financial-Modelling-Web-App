import { ClientIntakeForm } from "@/components/vendor/client-intake-form"

export const metadata = {
  title: "New Existing Business Client | FinModels UK Vendor Portal",
}

export default function VendorExistingClientPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">New existing business client</h1>
          <p className="text-muted-foreground text-sm">
            Enter your client business details before uploading their financial
            statements. This creates a client record and feeds the model with
            sector and location context.
          </p>
        </div>
        <ClientIntakeForm
          clientType="existing"
          nextRoute="/vendor/client/existing/upload"
          backRoute="/vendor"
        />
      </div>
    </main>
  )
}
