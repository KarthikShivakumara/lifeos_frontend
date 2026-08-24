"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface Option {
  label: string
  value: string
  description?: string
}

interface SegmentedControlProps {
  options: Option[]
  value: string
  onChange: (value: string) => void
  className?: string
  name?: string
}

export function SegmentedControl({ options, value, onChange, className, name }: SegmentedControlProps) {
  return (
    <div
      className={cn(
        "inline-flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/60 w-full",
        className
      )}
      role="radiogroup"
      aria-label={name}
    >
      {options.map((option) => {
        const isSelected = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex-1 px-3 py-2 text-xs md:text-sm font-medium rounded-lg transition-all duration-150 text-center flex flex-col items-center justify-center gap-0.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/40",
              isSelected
                ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm font-semibold border border-slate-200/60 dark:border-slate-700/80"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/40 dark:hover:bg-slate-700/40"
            )}
          >
            <span>{option.label}</span>
            {option.description && (
              <span className={cn("text-[10px] font-normal", isSelected ? "text-emerald-600/80 dark:text-emerald-400/80" : "text-slate-400")}>
                {option.description}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
