"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { InfoTooltip } from "./info-tooltip"

interface SmartInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  explanation?: string
  unit?: string
  rangeHint?: string
  tooltipContent?: string
  error?: string
  requiredBadge?: boolean
  readOnlyBadge?: string
}

export const SmartInput = React.forwardRef<HTMLInputElement, SmartInputProps>(
  (
    {
      className,
      type = "text",
      label,
      explanation,
      unit,
      rangeHint,
      tooltipContent,
      error,
      requiredBadge = false,
      readOnlyBadge,
      ...props
    },
    ref
  ) => {
    return (
      <div className="space-y-1.5 w-full">
        <div className="flex items-center justify-between gap-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <span>{label}</span>
            {requiredBadge ? (
              <span className="text-rose-500 font-bold text-sm" title="Required field">*</span>
            ) : (
              <span className="text-[10px] lowercase font-normal text-slate-400 dark:text-slate-500">(optional)</span>
            )}
            {readOnlyBadge && (
              <span className="text-[10px] font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 px-1.5 py-0.5 rounded">
                {readOnlyBadge}
              </span>
            )}
          </label>

          {tooltipContent && <InfoTooltip content={tooltipContent} title={label} />}
        </div>

        {explanation && <p className="text-xs text-slate-500 dark:text-slate-400">{explanation}</p>}

        <div className="relative flex items-center">
          <input
            type={type}
            className={cn(
              "flex h-11 w-full rounded-xl border bg-white dark:bg-slate-900/90 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 disabled:cursor-not-allowed disabled:opacity-60",
              unit ? "pr-16" : "",
              error
                ? "border-rose-400 dark:border-rose-500 focus-visible:ring-rose-500/50"
                : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700",
              className
            )}
            ref={ref}
            {...props}
          />

          {unit && (
            <div className="absolute right-3 pointer-events-none flex items-center">
              <span className="text-xs font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                {unit}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-[11px] gap-2 pt-0.5">
          {error ? (
            <p className="text-rose-500 font-medium">{error}</p>
          ) : rangeHint ? (
            <p className="text-slate-400 dark:text-slate-500 font-normal">Range: {rangeHint}</p>
          ) : (
            <span />
          )}
        </div>
      </div>
    )
  }
)

SmartInput.displayName = "SmartInput"
