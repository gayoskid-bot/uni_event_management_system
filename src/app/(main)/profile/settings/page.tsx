"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { updateProfile, changePassword } from "@/server/actions/profile.actions"
import { Loader2, Check } from "lucide-react"
import { toast } from "sonner"

export default function SettingsPage() {
  const [profileState, profileAction, profilePending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | undefined, formData: FormData) => {
      const result = await updateProfile(formData)
      if (result.success) toast.success("Profile updated!")
      return result
    },
    undefined
  )

  const [passwordState, passwordAction, passwordPending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | undefined, formData: FormData) => {
      const result = await changePassword(formData)
      if (result.success) toast.success("Password changed!")
      return result
    },
    undefined
  )

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      {/* Profile Settings */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={profileAction} className="space-y-4">
            {profileState?.error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {profileState.error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" name="bio" rows={3} placeholder="Tell us about yourself" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input id="department" name="department" placeholder="e.g., Computer Science" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input id="year" name="year" type="number" min={1} max={8} placeholder="e.g., 3" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" type="tel" placeholder="+1 (555) 000-0000" />
            </div>
            <Button type="submit" disabled={profilePending}>
              {profilePending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Password Change */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={passwordAction} className="space-y-4">
            {passwordState?.error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {passwordState.error}
              </div>
            )}
            {passwordState?.success && (
              <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">
                Password changed successfully!
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input id="currentPassword" name="currentPassword" type="password" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input id="newPassword" name="newPassword" type="password" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input id="confirmPassword" name="confirmPassword" type="password" required />
            </div>
            <Button type="submit" variant="outline" disabled={passwordPending}>
              {passwordPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Change Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
