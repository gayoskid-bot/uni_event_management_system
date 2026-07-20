"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronDown } from "lucide-react"
import { CATEGORY_ICON_NAMES, getCategoryIcon, type CategoryIconName } from "@/lib/category-icons"
import { cn } from "@/lib/utils"

export function IconPicker({
  name,
  defaultValue,
}: {
  name: string
  defaultValue?: CategoryIconName
}) {
  const [selected, setSelected] = useState<CategoryIconName | undefined>(defaultValue)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open])

  const SelectedIcon = getCategoryIcon(selected)

  return (
    <div className="relative" ref={containerRef}>
      <input type="hidden" name={name} value={selected ?? ""} />
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs transition-colors hover:bg-accent"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 truncate">
          <SelectedIcon className="h-4 w-4 shrink-0" />
          <span className="truncate text-muted-foreground">
            {selected ?? "Choose icon"}
          </span>
        </span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-50" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-72 rounded-md border bg-popover p-2 shadow-md">
          <div className="grid grid-cols-6 gap-1">
            {CATEGORY_ICON_NAMES.map((iconName) => {
              const Icon = getCategoryIcon(iconName)
              const isSelected = iconName === selected
              return (
                <button
                  key={iconName}
                  type="button"
                  title={iconName}
                  onClick={() => {
                    setSelected(iconName)
                    setOpen(false)
                  }}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-accent",
                    isSelected && "bg-primary text-primary-foreground hover:bg-primary"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
