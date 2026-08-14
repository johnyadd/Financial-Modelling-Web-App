import { QuestionnaireWizard } from "@/components/questionnaire/questionnaire-wizard"

export const metadata = {
  title: "Startup Financial Model Questionnaire | Finanyst",
  description: "Build your tailored startup financial model in minutes.",
}

// Model-limit enforcement lives in /api/models/save, on the insert branch only.
// Checking here would block editing too, since the wizard serves both paths.
export default function QuestionnairePage() {
  return (
    <main className="min-h-screen bg-background">
      <QuestionnaireWizard />
    </main>
  )
}
