"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ImageUploadField } from "@/components/ui/image-upload-field"
import { updateProfile, changePassword } from "@/server/actions/profile.actions"
import { Loader2, Check } from "lucide-react"
import { toast } from "sonner"

type ProfileUser = {
  name: string | null
  bio: string | null
  department: string | null
  year: number | null
  phone: string | null
  image: string | null
}

export function ProfileSettingsForm({
  user,
  canChangePassword,
}: {
  user: ProfileUser
  canChangePassword: boolean
}) {
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
    <>
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

            <ImageUploadField
              name="image"
              label="Profile Picture"
              defaultValue={user.image}
              folder="avatars"
              round
            />

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" defaultValue={user.name ?? ""} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                rows={3}
                placeholder="Tell us about yourself"
                defaultValue={user.bio ?? ""}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  name="department"
                  placeholder="e.g., Computer Science"
                  defaultValue={user.department ?? ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  name="year"
                  type="number"
                  min={1}
                  max={8}
                  placeholder="e.g., 3"
                  defaultValue={user.year ?? ""}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                defaultValue={user.phone ?? ""}
              />
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
      {canChangePassword && (
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
      )}
    </>
  )
}
