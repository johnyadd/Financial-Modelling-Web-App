import { QuestionnaireWizard } from "@/components/questionnaire/questionnaire-wizard"
import { getUserSubscription, canCreateAnotherModel } from "@/lib/subscription"
import { redirect } from "next/navigation"

export const metadata = {
  title: "Startup Financial Model Questionnaire | FinModels UK",
  description: "Build your tailored startup financial model in minutes.",
}

export default async function QuestionnairePage() {
  const subscription = await getUserSubscription()
  if (subscription && subscription.tier === "free") {
    const canCreate = await canCreateAnotherModel(subscription)
    if (!canCreate) {
      redirect("/pricing?reason=model_limit")
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <QuestionnaireWizard />
    </main>
  )
}


