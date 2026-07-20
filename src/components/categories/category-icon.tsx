import type { CSSProperties } from "react"
import { getCategoryIcon } from "@/lib/category-icons"

export function CategoryIcon({
  name,
  className,
  style,
}: {
  name: string | null | undefined
  className?: string
  style?: CSSProperties
}) {
  const Icon = getCategoryIcon(name)
  return <Icon className={className} style={style} />
}
