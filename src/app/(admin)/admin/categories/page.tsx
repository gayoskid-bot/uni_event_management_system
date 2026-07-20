import { db } from "@/server/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createCategory } from "@/server/actions/admin.actions"
import { CategoryIcon } from "@/components/categories/category-icon"
import { IconPicker } from "@/components/categories/icon-picker"

export const metadata = { title: "Category Management" }

export default async function AdminCategoriesPage() {
  const categories = await db.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { events: true } } },
  })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Categories</h1>

      {/* Add Category */}
      <Card>
        <CardHeader>
          <CardTitle>Add Category</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createCategory} className="flex gap-3 items-end">
            <div className="flex-1 space-y-1">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" placeholder="Category name" required />
            </div>
            <div className="w-32 space-y-1">
              <Label htmlFor="color">Color</Label>
              <Input id="color" name="color" type="color" defaultValue="#3B82F6" />
            </div>
            <div className="w-44 space-y-1">
              <Label htmlFor="icon">Icon</Label>
              <IconPicker name="icon" />
            </div>
            <Button type="submit">Add</Button>
          </form>
        </CardContent>
      </Card>

      {/* Categories List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {categories.map((cat) => (
          <Card key={cat.id}>
            <CardContent className="flex items-center gap-3 p-4">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0"
                style={{ backgroundColor: `${cat.color || "#888"}20` }}
              >
                <CategoryIcon
                  name={cat.icon}
                  className="h-4 w-4"
                  style={{ color: cat.color || undefined }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium">{cat.name}</p>
                <p className="text-xs text-muted-foreground">
                  {cat.slug} · {cat._count.events} events
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
