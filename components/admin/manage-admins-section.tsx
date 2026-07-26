"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ShieldIcon, PlusIcon, TrashIcon, LoaderIcon } from "lucide-react"

interface AdminUser {
  id: string
  full_name: string | null
  auth_user_id: string
  admin_role: string
  created_at: string
}

export function ManageAdminsSection() {
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [addingEmail, setAddingEmail] = useState("")
  const [adding, setAdding] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    fetchAdmins()
  }, [])

  async function fetchAdmins() {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/manage", { credentials: "include" })
      const data = await res.json()
      if (data.admins) setAdmins(data.admins)
    } catch (err) {
      setMessage({ type: "error", text: "Failed to load admins" })
    } finally {
      setLoading(false)
    }
  }

  async function handleAddAdmin(e: React.FormEvent) {
    e.preventDefault()
    if (!addingEmail || !addingEmail.includes("@")) {
      setMessage({ type: "error", text: "Please enter a valid email" })
      return
    }

    setAdding(true)
    setMessage(null)
    try {
      const res = await fetch("/api/admin/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: addingEmail }),
      })
      const data = await res.json()
      if (res.ok) {
        setMessage({ type: "success", text: data.message })
        setAddingEmail("")
        fetchAdmins()
      } else {
        setMessage({ type: "error", text: data.error || "Failed to add admin" })
      }
    } catch (err) {
      setMessage({ type: "error", text: "Failed to add admin" })
    } finally {
      setAdding(false)
    }
  }

  async function handleRemoveAdmin(profileId: string, name: string | null) {
    if (!confirm(`Remove admin access from ${name || "this user"}?`)) return

    try {
      const res = await fetch("/api/admin/manage", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ profileId }),
      })
      const data = await res.json()
      if (res.ok) {
        setMessage({ type: "success", text: data.message })
        fetchAdmins()
      } else {
        setMessage({ type: "error", text: data.error || "Failed to remove admin" })
      }
    } catch (err) {
      setMessage({ type: "error", text: "Failed to remove admin" })
    }
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6">
      <div className="flex items-center gap-2 mb-1">
        <ShieldIcon className="w-5 h-5 text-primary" />
        <h2 className="font-display text-2xl text-foreground">Manage Admins</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        Users with admin access can view this dashboard and manage other admins.
      </p>

      {/* Add admin form */}
      <form onSubmit={handleAddAdmin} className="mb-6 flex gap-2">
        <input
          type="email"
          value={addingEmail}
          onChange={(e) => setAddingEmail(e.target.value)}
          placeholder="Enter email of existing user"
          className="flex-1 px-3 py-2 rounded-lg border border-border/60 bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          disabled={adding}
        />
        <Button type="submit" disabled={adding} className="gap-2">
          {adding ? (
            <LoaderIcon className="w-4 h-4 animate-spin" />
          ) : (
            <PlusIcon className="w-4 h-4" />
          )}
          Grant admin
        </Button>
      </form>

      {/* Message */}
      {message && (
        <div
          className={`mb-4 p-3 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Admins list */}
      {loading ? (
        <div className="py-8 text-center">
          <LoaderIcon className="w-5 h-5 animate-spin text-primary mx-auto" />
        </div>
      ) : admins.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">No admins yet</p>
      ) : (
        <div className="space-y-2">
          {admins.map((admin) => (
            <div
              key={admin.id}
              className="flex items-center justify-between py-3 border-b border-border/40 last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <ShieldIcon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {admin.full_name || "Admin User"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Since {new Date(admin.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveAdmin(admin.id, admin.full_name)}
                className="gap-1 text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <TrashIcon className="w-4 h-4" />
                Revoke
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
