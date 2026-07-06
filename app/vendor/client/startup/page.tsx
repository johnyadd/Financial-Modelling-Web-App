import { ClientIntakeForm } from "@/components/vendor/client-intake-form"

export const metadata = {
  title: "New Startup Client | FinModels UK Vendor Portal",
}

export default function VendorStartupClientPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">New startup client</h1>
          <p className="text-muted-foreground text-sm">
            Enter your client business details. This information feeds directly
            into the financial model and creates a client record for your portal.
          </p>
        </div>
        <ClientIntakeForm
          clientType="startup"
          nextRoute="/vendor/client/startup/model"
          backRoute="/vendor"
        />
      </div>
    </main>
  )
}
