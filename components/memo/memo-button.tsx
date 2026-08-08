"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { FileTextIcon } from "lucide-react"

interface MemoButtonProps {
  modelInputId: string
}

/**
 * "Investor memo" action button. Navigates to /memo/{modelInputId} where the
 * memo is generated on mount via /api/memo/generate. Parent controls visibility
 * (should only render when model status === "complete" — memo needs computed output).
 */
export function MemoButton({ modelInputId }: MemoButtonProps) {
  const router = useRouter()

  return (
    <Button
      onClick={() => router.push(`/memo/${modelInputId}`)}
      size="sm"
      variant="outline"
      className="gap-2"
    >
      <FileTextIcon className="w-4 h-4" />
      Investor memo
    </Button>
  )
}
