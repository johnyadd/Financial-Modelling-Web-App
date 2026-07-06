import { QuestionnaireWizard } from "@/components/questionnaire/questionnaire-wizard"

export const metadata = {
  title: "Startup Financial Model Questionnaire | FinModels UK",
  description: "Build your tailored startup financial model in minutes.",
}

export default function QuestionnairePage() {
  return (
    <main className="min-h-screen bg-background">
      <QuestionnaireWizard />
    </main>
  )
}
