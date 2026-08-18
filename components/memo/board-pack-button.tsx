"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ClipboardListIcon } from "lucide-react"

export function BoardPackButton({ modelInputId }: { modelInputId: string }) {
  const router = useRouter()
  return (
    <Button
      onClick={() => router.push(`/board/${modelInputId}`)}
      size="sm"
      variant="outline"
      className="gap-2"
    >
      <ClipboardListIcon className="w-4 h-4" />
      Board pack
    </Button>
  )
}
