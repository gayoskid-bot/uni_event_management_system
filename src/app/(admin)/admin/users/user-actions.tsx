"use client"

import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import { changeUserRole, toggleUserActive } from "@/server/actions/admin.actions"
import { toast } from "sonner"
import { Loader2, Shield, UserCog, Ban, CheckCircle } from "lucide-react"

interface AdminUserActionsProps {
  userId: string
  role: string
  isActive: boolean
}

export function AdminUserActions({ userId, role, isActive }: AdminUserActionsProps) {
  const [isPending, startTransition] = useTransition()

  const handleRoleChange = (newRole: "STUDENT" | "ORGANIZER" | "ADMIN") => {
    startTransition(async () => {
      await changeUserRole(userId, newRole)
      toast.success(`Role changed to ${newRole}`)
    })
  }

  const handleToggleActive = () => {
    startTransition(async () => {
      const result = await toggleUserActive(userId)
      if (result.success) {
        toast.success(result.isActive ? "User unbanned" : "User banned")
      }
    })
  }

  return (
    <div className="flex items-center gap-1 shrink-0">
      {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
      {role !== "ORGANIZER" && role !== "ADMIN" && (
        <Button
          variant="ghost"
          size="sm"
          className="text-xs"
          onClick={() => handleRoleChange("ORGANIZER")}
          disabled={isPending}
        >
          <UserCog className="h-3.5 w-3.5 mr-1" />
          Make Organizer
        </Button>
      )}
      {role !== "ADMIN" && (
        <Button
          variant="ghost"
          size="sm"
          className="text-xs"
          onClick={() => handleRoleChange("ADMIN")}
          disabled={isPending}
        >
          <Shield className="h-3.5 w-3.5 mr-1" />
          Make Admin
        </Button>
      )}
      {role !== "STUDENT" && role !== "ADMIN" && (
        <Button
          variant="ghost"
          size="sm"
          className="text-xs"
          onClick={() => handleRoleChange("STUDENT")}
          disabled={isPending}
        >
          Demote
        </Button>
      )}
      <Button
        variant="ghost"
        size="sm"
        className={`text-xs ${isActive ? "text-destructive" : "text-green-600"}`}
        onClick={handleToggleActive}
        disabled={isPending}
      >
        {isActive ? <Ban className="h-3.5 w-3.5" /> : <CheckCircle className="h-3.5 w-3.5" />}
      </Button>
    </div>
  )
}
