"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { createEvent, updateEvent } from "@/server/actions/event.actions"
import { Loader2 } from "lucide-react"
import type { Category, Event } from "@prisma/client"

interface EventFormProps {
  categories: Category[]
  event?: Event & { categories: { categoryId: string }[] }
}

export function EventForm({ categories, event }: EventFormProps) {
  const isEditing = !!event

  const [state, formAction, isPending] = useActionState(
    async (_prevState: { error?: string } | undefined, formData: FormData) => {
      if (isEditing && event) {
        return await updateEvent(event.id, formData)
      }
      return await createEvent(formData)
    },
    undefined
  )

  return (
    <form action={formAction} className="space-y-8">
      {state?.error && (
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          {state.error}
        </div>
      )}

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              name="title"
              placeholder="Enter a descriptive title"
              defaultValue={event?.title}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">Short Summary</Label>
            <Input
              id="summary"
              name="summary"
              placeholder="Brief one-line summary (max 300 chars)"
              maxLength={300}
              defaultValue={event?.summary || ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe your event in detail..."
              rows={8}
              defaultValue={event?.description}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverImage">Cover Image URL</Label>
            <Input
              id="coverImage"
              name="coverImage"
              type="url"
              placeholder="https://example.com/image.jpg"
              defaultValue={event?.coverImage || ""}
            />
          </div>
        </CardContent>
      </Card>

      {/* Date & Time */}
      <Card>
        <CardHeader>
          <CardTitle>Date & Time</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date & Time *</Label>
              <Input
                id="startDate"
                name="startDate"
                type="datetime-local"
                defaultValue={
                  event?.startDate
                    ? new Date(event.startDate).toISOString().slice(0, 16)
                    : ""
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date & Time *</Label>
              <Input
                id="endDate"
                name="endDate"
                type="datetime-local"
                defaultValue={
                  event?.endDate
                    ? new Date(event.endDate).toISOString().slice(0, 16)
                    : ""
                }
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader>
          <CardTitle>Location</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="isOnline"
                value="false"
                defaultChecked={!event?.isOnline}
                className="accent-primary"
              />
              <span className="text-sm">In-Person</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="isOnline"
                value="true"
                defaultChecked={event?.isOnline}
                className="accent-primary"
              />
              <span className="text-sm">Online</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="venue">Venue Name</Label>
              <Input
                id="venue"
                name="venue"
                placeholder="e.g., Main Auditorium"
                defaultValue={event?.venue || ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                placeholder="Full address"
                defaultValue={event?.address || ""}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="onlineLink">Meeting Link (for online events)</Label>
            <Input
              id="onlineLink"
              name="onlineLink"
              type="url"
              placeholder="https://zoom.us/j/..."
              defaultValue={event?.onlineLink || ""}
            />
          </div>
        </CardContent>
      </Card>

      {/* Capacity & Pricing */}
      <Card>
        <CardHeader>
          <CardTitle>Capacity & Pricing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="capacity">
                Max Capacity (leave empty for unlimited)
              </Label>
              <Input
                id="capacity"
                name="capacity"
                type="number"
                min={1}
                placeholder="e.g., 100"
                defaultValue={event?.capacity || ""}
              />
            </div>
            <div className="space-y-2">
              <Label>Pricing</Label>
              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="isFree"
                    value="true"
                    defaultChecked={event?.isFree !== false}
                    className="accent-primary"
                  />
                  <span className="text-sm">Free</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="isFree"
                    value="false"
                    defaultChecked={event?.isFree === false}
                    className="accent-primary"
                  />
                  <span className="text-sm">Paid</span>
                </label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Categories *</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {categories.map((category) => {
              const isSelected = event?.categories?.some(
                (c) => c.categoryId === category.id
              )
              return (
                <label
                  key={category.id}
                  className="flex items-center gap-2 rounded-lg border p-3 cursor-pointer hover:bg-accent transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                >
                  <input
                    type="checkbox"
                    name="categoryIds"
                    value={category.id}
                    defaultChecked={isSelected}
                    className="accent-primary"
                  />
                  <span className="text-sm">{category.name}</span>
                </label>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Submit */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline">
          Save as Draft
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? "Update Event" : "Create Event"}
        </Button>
      </div>
    </form>
  )
}
