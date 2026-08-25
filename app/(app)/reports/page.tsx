"use client"

import { useEffect, useState } from "react"
import { Activity, AlertTriangle, Calendar, CheckCircle2, ChevronRight, FileText, LineChart, Shield, TrendingDown, TrendingUp } from "lucide-react"
import { adaptiveApi } from "@/lib/api"
import type { MonthlyHealthReport, UserBaselineItem, WeeklyHealthReport } from "@/lib/types"

export default function ReportsPage() {
  const [weeklyReport, setWeeklyReport] = useState<WeeklyHealthReport | null>(null)
  const [monthlyReport, setMonthlyReport] = useState<MonthlyHealthReport | null>(null)
  const [baselines, setBaselines] = useState<UserBaselineItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"weekly" | "monthly" | "baselines">("weekly")

  useEffect(() => {
    async function loadReports() {
      try {
        setLoading(true)
        const token = localStorage.getItem("lifeos_token") || undefined
        const [wk, mo, base] = await Promise.all([
          adaptiveApi.getWeeklyReport(token).catch(() => null),
          adaptiveApi.getMonthlyReport(token).catch(() => null),
          adaptiveApi.getBaseline(token).then((res) => res.baselines).catch(() => []),
        ])
        setWeeklyReport(wk)
        setMonthlyReport(mo)
        setBaselines(base)
      } catch (err: any) {
        setError("Failed to load adaptive health reports.")
      } finally {
        setLoading(false)
      }
    }
    loadReports()
  }, [])

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-500/20">
            <LineChart className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Adaptive Health Intelligence</h1>
            <p className="mt-1 text-sm text-slate-500">
              Layer E continuous longitudinal analysis, personal 7-day/30-day baselines & non-diagnostic summaries.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="mb-6 border-b border-slate-200">
        <nav className="-mb-px flex gap-6" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("weekly")}
            className={`flex items-center gap-2 border-b-2 pb-4 text-sm font-semibold transition-colors ${
              activeTab === "weekly"
                ? "border-brand-600 text-brand-600"
                : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
            }`}
          >
            <Calendar className="h-4 w-4" />
            Weekly Summary
          </button>
          <button
            onClick={() => setActiveTab("monthly")}
            className={`flex items-center gap-2 border-b-2 pb-4 text-sm font-semibold transition-colors ${
              activeTab === "monthly"
                ? "border-brand-600 text-brand-600"
                : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
            }`}
          >
            <FileText className="h-4 w-4" />
            Monthly Review
          </button>
          <button
            onClick={() => setActiveTab("baselines")}
            className={`flex items-center gap-2 border-b-2 pb-4 text-sm font-semibold transition-colors ${
              activeTab === "baselines"
                ? "border-brand-600 text-brand-600"
                : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
            }`}
          >
            <Activity className="h-4 w-4" />
            Personal Baselines ({baselines.length})
          </button>
        </nav>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center gap-3 text-slate-500 font-medium">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
            Synthesizing longitudinal health data...
          </div>
        </div>
      ) : activeTab === "weekly" && weeklyReport ? (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                  7-Day Longitudinal Synthesis
                </span>
                <h2 className="mt-2 text-xl font-bold text-slate-900">Weekly Health Summary</h2>
                <p className="text-xs text-slate-500">Period: {weeklyReport.period_start} to {weeklyReport.period_end}</p>
              </div>
            </div>

            {/* Wellness Metrics Grid */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">7-Day Sleep Avg</div>
                <div className="mt-1 text-2xl font-bold text-slate-900">{weeklyReport.wellness_summary.sleep_7d_avg_hours} hrs</div>
                <div className="mt-1 text-xs font-medium text-slate-600">Trend: <span className="font-semibold text-brand-600">{weeklyReport.sleep_trend}</span></div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">7-Day Steps Avg</div>
                <div className="mt-1 text-2xl font-bold text-slate-900">{weeklyReport.wellness_summary.steps_7d_avg.toLocaleString()} steps</div>
                <div className="mt-1 text-xs font-medium text-slate-600">Trend: <span className="font-semibold text-brand-600">{weeklyReport.activity_trend}</span></div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="mt-6">
              <h3 className="text-sm font-bold text-slate-900">Personalized Adaptive Recommendations</h3>
              <ul className="mt-3 space-y-2">
                {weeklyReport.personalized_recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-sm text-slate-700">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Disclaimer */}
            <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-200/80 bg-amber-50/50 p-4 text-xs text-amber-900">
              <Shield className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <span>{weeklyReport.disclaimer}</span>
            </div>
          </div>
        </div>
      ) : activeTab === "monthly" && monthlyReport ? (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                  30-Day Longitudinal Synthesis
                </span>
                <h2 className="mt-2 text-xl font-bold text-slate-900">Monthly Health Review - {monthlyReport.month_name}</h2>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50/50 p-4 text-sm text-slate-700">
              {monthlyReport.summary_text}
            </div>

            {/* Adherence & Consistency */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Adherence Rate</div>
                <div className="mt-1 text-2xl font-bold text-slate-900">{Math.round(monthlyReport.recommendation_adherence_rate * 100)}%</div>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Consistency Score</div>
                <div className="mt-1 text-2xl font-bold text-slate-900">{Math.round(monthlyReport.consistency_score * 100)}%</div>
              </div>
            </div>

            <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-200/80 bg-amber-50/50 p-4 text-xs text-amber-900">
              <Shield className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <span>{monthlyReport.disclaimer}</span>
            </div>
          </div>
        </div>
      ) : activeTab === "baselines" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {baselines.map((b) => (
            <div key={b.metric} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{b.metric.replace(/_/g, " ").toUpperCase()}</span>
                <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${
                  b.trend === "IMPROVING" ? "bg-emerald-50 text-emerald-700" : b.trend === "DECLINING" ? "bg-rose-50 text-rose-700" : "bg-slate-100 text-slate-600"
                }`}>
                  {b.trend}
                </span>
              </div>
              <div className="mt-3 text-2xl font-extrabold text-slate-900">{b.baseline_value.toFixed(1)}</div>
              <div className="mt-2 text-xs text-slate-500">
                7d Avg: {b.rolling_7_day_avg ? b.rolling_7_day_avg.toFixed(1) : "N/A"} | 30d Avg: {b.rolling_30_day_avg ? b.rolling_30_day_avg.toFixed(1) : "N/A"}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
