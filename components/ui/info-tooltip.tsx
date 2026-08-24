"use client"

import * as React from "react"
import { HelpCircle } from "lucide-react"

interface InfoTooltipProps {
  content: string
  title?: string
}

export function InfoTooltip({ content, title }: InfoTooltipProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="text-slate-400 hover:text-emerald-600 transition-colors p-0.5 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
        aria-label="Information help"
      >
        <HelpCircle className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900 text-slate-100 text-xs rounded-xl shadow-xl border border-slate-700 z-50 animate-in fade-in duration-150 pointer-events-none">
          {title && <div className="font-semibold text-emerald-400 mb-1">{title}</div>}
          <p className="leading-relaxed text-slate-300">{content}</p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900" />
        </div>
      )}
    </div>
  )
}
