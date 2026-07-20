"use client"

import { useActionState, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ImageUploadField } from "@/components/ui/image-upload-field"
import { CategoryIcon } from "@/components/categories/category-icon"
import { completeOnboarding } from "@/server/actions/onboarding.actions"
import { Loader2, ArrowRight, ArrowLeft, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Category } from "@prisma/client"

type OnboardingUser = {
  name: string | null
  bio: string | null
  department: string | null
  year: number | null
  phone: string | null
  image: string | null
}

export function OnboardingFlow({
  user,
  categories,
}: {
  user: OnboardingUser
  categories: Category[]
}) {
  const [step, setStep] = useState<1 | 2>(1)
  const [name, setName] = useState(user.name ?? "")
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([])

  const [state, formAction, isPending] = useActionState(
    async (_prev: { error?: string } | undefined, formData: FormData) => {
      return await completeOnboarding(formData)
    },
    undefined
  )

  const canContinue = name.trim().length >= 2
  const canFinish = selectedCategoryIds.length > 0

  function toggleCategory(id: string) {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="mb-2 flex items-center gap-2">
          <div
            className={cn(
              "h-1.5 flex-1 rounded-full",
              step >= 1 ? "bg-primary" : "bg-muted"
            )}
          />
          <div
            className={cn(
              "h-1.5 flex-1 rounded-full",
              step >= 2 ? "bg-primary" : "bg-muted"
            )}
          />
        </div>
        <CardTitle>
          {step === 1 ? "Tell us about yourself" : "What are you into?"}
        </CardTitle>
        <CardDescription>
          {step === 1
            ? "This helps organizers and other students get to know you."
            : "Pick at least one category so we can tailor event recommendations for you."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          {state?.error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {state.error}
            </div>
          )}

          {/* Step 1: Profile */}
          <div className={cn("space-y-4", step !== 1 && "hidden")}>
            <ImageUploadField
              name="image"
              label="Profile Picture"
              defaultValue={user.image}
              folder="avatars"
              round
            />
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
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

            <Button
              type="button"
              className="w-full"
              disabled={!canContinue}
              onClick={() => setStep(2)}
            >
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {/* Step 2: Interests */}
          <div className={cn("space-y-4", step !== 2 && "hidden")}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {categories.map((category) => {
                const isSelected = selectedCategoryIds.includes(category.id)
                return (
                  <label
                    key={category.id}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-lg border p-3 text-center cursor-pointer transition-colors hover:bg-accent",
                      isSelected && "border-primary bg-primary/5"
                    )}
                  >
                    <input
                      type="checkbox"
                      name="categoryIds"
                      value={category.id}
                      checked={isSelected}
                      onChange={() => toggleCategory(category.id)}
                      className="sr-only"
                    />
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${category.color || "#888"}20` }}
                    >
                      <CategoryIcon
                        name={category.icon}
                        className="h-4 w-4"
                        style={{ color: category.color || undefined }}
                      />
                    </div>
                    <span className="text-xs font-medium">{category.name}</span>
                    {isSelected && (
                      <Check className="h-3.5 w-3.5 text-primary" />
                    )}
                  </label>
                )
              })}
            </div>
            {!canFinish && (
              <p className="text-xs text-muted-foreground text-center">
                Select at least one category to continue.
              </p>
            )}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setStep(1)}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isPending || !canFinish}
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Finish Setup
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
