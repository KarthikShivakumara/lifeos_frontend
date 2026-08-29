"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Activity,
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Database,
  Download,
  FileSpreadsheet,
  FileText,
  FlaskConical,
  LineChart,
  Shield,
  Sliders,
} from "lucide-react"
import { adaptiveApi, reportApi } from "@/lib/api"
import type { MonthlyHealthReport, UserBaselineItem, WeeklyHealthReport } from "@/lib/types"

export default function ReportsPortalPage() {
  const [weeklyReport, setWeeklyReport] = useState<WeeklyHealthReport | null>(null)
  const [monthlyReport, setMonthlyReport] = useState<MonthlyHealthReport | null>(null)
  const [baselines, setBaselines] = useState<UserBaselineItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [downloadingPdf, setDownloadingPdf] = useState<boolean>(false)
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
        setError("Failed to load personal health reports.")
      } finally {
        setLoading(false)
      }
    }
    loadReports()
  }, [])

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20">
            <LineChart className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">LifeOS Reporting & Intelligence Center</h1>
              <span className="text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded-full">
                Phase 5G.10
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Personal health reports, academic model audits, dataset metadata, system checks & 7-day synthetic simulation lab.
            </p>
          </div>
        </div>

        <Link
          href="/reports/demo-lab"
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:from-emerald-700 hover:to-teal-700 transition-all self-start md:self-auto"
        >
          <FlaskConical className="h-4 w-4" />
          <span>Launch 7-Day Demo Lab</span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Primary Navigation Hub */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        <button
          onClick={() => setActiveTab("weekly")}
          className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border text-xs font-semibold transition-all ${
            activeTab === "weekly"
              ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 shadow-xs"
              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300"
          }`}
        >
          <Calendar className="h-4 w-4" />
          <span>My Health</span>
        </button>

        <button
          onClick={() => setActiveTab("weekly")}
          className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300 text-xs font-semibold"
        >
          <FileText className="h-4 w-4" />
          <span>Weekly Report</span>
        </button>

        <button
          onClick={() => setActiveTab("monthly")}
          className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300 text-xs font-semibold"
        >
          <FileSpreadsheet className="h-4 w-4" />
          <span>Monthly Review</span>
        </button>

        <button
          onClick={() => setActiveTab("baselines")}
          className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300 text-xs font-semibold"
        >
          <Activity className="h-4 w-4" />
          <span>Health Trends</span>
        </button>

        <Link
          href="/reports/models"
          className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-emerald-500 hover:text-emerald-600 text-xs font-semibold transition-all"
        >
          <Sliders className="h-4 w-4 text-emerald-600" />
          <span>Model Audits</span>
        </Link>

        <Link
          href="/reports/datasets"
          className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-teal-500 hover:text-teal-600 text-xs font-semibold transition-all"
        >
          <Database className="h-4 w-4 text-teal-600" />
          <span>Dataset Center</span>
        </Link>

        <Link
          href="/reports/system"
          className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-indigo-500 hover:text-indigo-600 text-xs font-semibold transition-all"
        >
          <Shield className="h-4 w-4 text-indigo-600" />
          <span>System Audit</span>
        </Link>

        <Link
          href="/reports/demo-lab"
          className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100 text-xs font-bold transition-all shadow-xs"
        >
          <FlaskConical className="h-4 w-4 text-amber-600" />
          <span>Demo Lab</span>
        </Link>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center gap-3 text-slate-500 font-medium text-sm">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
            Synthesizing longitudinal health intelligence...
          </div>
        </div>
      ) : activeTab === "weekly" && weeklyReport ? (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-950 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  7-Day Longitudinal Synthesis
                </span>
                <h2 className="mt-2 text-xl font-bold text-slate-900 dark:text-slate-100">Personal Weekly Health Summary</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Period: {weeklyReport.period_start} to {weeklyReport.period_end}</p>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={async () => {
                    try {
                      setDownloadingPdf(true)
                      await reportApi.downloadPdf("latest")
                    } catch (e) {
                      alert("Could not generate PDF. Please ensure your backend is running.")
                    } finally {
                      setDownloadingPdf(false)
                    }
                  }}
                  disabled={downloadingPdf}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>{downloadingPdf ? "Generating PDF..." : "Download Official PDF"}</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Print View
                </button>
              </div>
            </div>

            {/* Wellness Summary Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">7-Day Sleep Avg</div>
                <div className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">{weeklyReport.wellness_summary.sleep_7d_avg_hours} hrs</div>
                <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">Trend: <span className="font-semibold text-emerald-600">{weeklyReport.sleep_trend}</span></div>
              </div>

              <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">7-Day Steps Avg</div>
                <div className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">{weeklyReport.wellness_summary.steps_7d_avg.toLocaleString()} steps</div>
                <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">Trend: <span className="font-semibold text-emerald-600">{weeklyReport.activity_trend}</span></div>
              </div>

              <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Report Status</div>
                <div className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">Validated</div>
                <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">Layer E Adaptive Baseline</div>
              </div>
            </div>

            {/* Recommendations List */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Adaptive Lifestyle Guidance</h3>
              <ul className="space-y-2">
                {weeklyReport.personalized_recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-3.5 text-xs text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Non-Diagnostic Disclaimer */}
            <div className="flex items-start gap-3 rounded-xl border border-amber-200/80 dark:border-amber-800 bg-amber-50/60 dark:bg-amber-950/40 p-4 text-xs text-amber-900 dark:text-amber-200">
              <Shield className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <span>{weeklyReport.disclaimer}</span>
            </div>
          </div>
        </div>
      ) : activeTab === "monthly" && monthlyReport ? (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-950 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  30-Day Longitudinal Synthesis
                </span>
                <h2 className="mt-2 text-xl font-bold text-slate-900 dark:text-slate-100">Monthly Health Review - {monthlyReport.month_name}</h2>
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-4 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {monthlyReport.summary_text}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Adherence Rate</div>
                <div className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">{Math.round(monthlyReport.recommendation_adherence_rate * 100)}%</div>
              </div>
              <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Consistency Score</div>
                <div className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">{Math.round(monthlyReport.consistency_score * 100)}%</div>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-amber-200/80 dark:border-amber-800 bg-amber-50/60 dark:bg-amber-950/40 p-4 text-xs text-amber-900 dark:text-amber-200">
              <Shield className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <span>{monthlyReport.disclaimer}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {baselines.map((b) => (
            <div key={b.metric} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">{b.metric.replace(/_/g, " ").toUpperCase()}</span>
                <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                  b.trend === "IMPROVING" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                }`}>
                  {b.trend}
                </span>
              </div>
              <div className="mt-3 text-2xl font-black text-slate-900 dark:text-slate-100">{b.baseline_value.toFixed(1)}</div>
              <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                7d Avg: {b.rolling_7_day_avg ? b.rolling_7_day_avg.toFixed(1) : "N/A"} | 30d Avg: {b.rolling_30_day_avg ? b.rolling_30_day_avg.toFixed(1) : "N/A"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
