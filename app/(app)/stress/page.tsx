"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  AlertCircle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  BatteryCharging,
  Brain,
  CheckCircle2,
  Clock,
  HeartHandshake,
  HelpCircle,
  Info,
  Minus,
  Moon,
  RefreshCw,
  Send,
  ShieldAlert,
  ShieldCheck,
  Smile,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Wind,
  Zap,
} from "lucide-react"
import { stressApi } from "@/lib/api"
import type {
  StressCheckin,
  StressCurrentResponse,
  StressRecommendationItem,
  StressSummaryResponse,
  StressTrendResponse,
} from "@/lib/types"

export default function StressPage() {
  const [loading, setLoading] = useState<boolean>(true)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false)
  const [trendDays, setTrendDays] = useState<number>(7)

  // Remote data state
  const [currentStatus, setCurrentStatus] = useState<StressCurrentResponse | null>(null)
  const [trends, setTrends] = useState<StressTrendResponse | null>(null)
  const [summary, setSummary] = useState<StressSummaryResponse | null>(null)
  const [recommendations, setRecommendations] = useState<StressRecommendationItem[]>([])

  // Form input state (0-10 sliders)
  const [perceivedStress, setPerceivedStress] = useState<number>(3)
  const [overwhelm, setOverwhelm] = useState<number>(2)
  const [difficultyRelaxing, setDifficultyRelaxing] = useState<number>(3)
  const [mood, setMood] = useState<number>(7)
  const [energy, setEnergy] = useState<number>(6)
  const [notes, setNotes] = useState<string>("")

  const fetchData = async () => {
    setLoading(true)
    try {
      const [curr, tr, sum, recs] = await Promise.all([
        stressApi.current().catch(() => null),
        stressApi.trends(trendDays).catch(() => null),
        stressApi.summary().catch(() => null),
        stressApi.recommendations().catch(() => []),
      ])
      if (curr) setCurrentStatus(curr)
      if (tr) setTrends(tr)
      if (sum) setSummary(sum)
      if (recs) setRecommendations(recs)
    } catch (err) {
      console.error("Failed to load stress intelligence data", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [trendDays])

  // Live preview calculation matching backend formula
  const previewScore = Math.round(
    ((perceivedStress * 0.35 +
      overwhelm * 0.2 +
      difficultyRelaxing * 0.15 +
      (10 - mood) * 0.1 +
      (10 - energy) * 0.1) /
      0.9) *
      10
  )

  const handleCheckinSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setSubmitSuccess(false)
    try {
      await stressApi.createCheckin({
        perceived_stress: perceivedStress,
        overwhelm,
        difficulty_relaxing: difficultyRelaxing,
        mood,
        energy,
        notes: notes.trim() || undefined,
      })
      setSubmitSuccess(true)
      await fetchData()
      setTimeout(() => setSubmitSuccess(false), 4000)
    } catch (err) {
      console.error("Failed to submit stress checkin", err)
    } finally {
      setSubmitting(false)
    }
  }

  const getLevelBadge = (level?: string | null) => {
    const l = (level || "low").toLowerCase()
    if (l === "high") {
      return {
        bg: "bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/50 dark:border-rose-800 dark:text-rose-300",
        label: "High Stress Strain",
        dot: "bg-rose-500",
      }
    }
    if (l === "moderate") {
      return {
        bg: "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/50 dark:border-amber-800 dark:text-amber-300",
        label: "Moderate Stress Strain",
        dot: "bg-amber-500",
      }
    }
    if (l === "mild") {
      return {
        bg: "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/50 dark:border-blue-800 dark:text-blue-300",
        label: "Mild Stress Strain",
        dot: "bg-blue-500",
      }
    }
    return {
      bg: "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-300",
      label: "Optimal / Low Stress",
      dot: "bg-emerald-500",
    }
  }

  const badge = getLevelBadge(currentStatus?.current_level)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-600 text-white shadow-lg shadow-purple-600/20">
            <Brain className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Stress Wellness Intelligence
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full border border-purple-200 bg-purple-50 px-2.5 py-0.5 text-[10px] font-bold text-purple-700 dark:border-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
                Layer B Subsystem
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Longitudinal stress tracking, observational lifestyle patterns, and restorative wellness decision support.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Mandatory Non-Diagnostic Safety Callout */}
      <div className="rounded-2xl border border-amber-200/80 bg-amber-50/70 p-4 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200 flex items-start gap-3">
        <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed">
          <span className="font-bold">Wellness Indicator — Not a Medical Diagnosis: </span>
          The LifeOS Stress Wellness Index is an observational self-reflection tool designed to help you track daily tension and lifestyle habits. It does not diagnose anxiety, depression, PTSD, or other mental health disorders. If you are experiencing overwhelming distress, please reach out to a healthcare provider.
        </div>
      </div>

      {/* Overview Cards Grid */}
      <div className="grid gap-6 md:grid-cols-4">
        {/* 1. Current Index Card */}
        <div className="md:col-span-2 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                Current Stress Index
              </span>
              <div className="mt-2 flex items-baseline gap-3">
                <span className="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  {currentStatus?.current_index !== undefined && currentStatus?.current_index !== null
                    ? currentStatus.current_index.toFixed(1)
                    : "—"}
                </span>
                <span className="text-sm font-semibold text-slate-400">/ 100</span>
              </div>
            </div>
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${badge.bg}`}>
              <span className={`h-2 w-2 rounded-full ${badge.dot}`} />
              {badge.label}
            </span>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-2.5">
              <div className="text-[10px] font-medium text-slate-400 uppercase">7-Day Avg</div>
              <div className="text-base font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                {currentStatus?.rolling_7d_avg !== undefined && currentStatus?.rolling_7d_avg !== null
                  ? `${currentStatus.rolling_7d_avg.toFixed(1)}`
                  : "N/A"}
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-2.5">
              <div className="text-[10px] font-medium text-slate-400 uppercase">30-Day Avg</div>
              <div className="text-base font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                {currentStatus?.rolling_30d_avg !== undefined && currentStatus?.rolling_30d_avg !== null
                  ? `${currentStatus.rolling_30d_avg.toFixed(1)}`
                  : "N/A"}
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-2.5">
              <div className="text-[10px] font-medium text-slate-400 uppercase">Trend</div>
              <div className="text-base font-bold text-slate-800 dark:text-slate-100 mt-0.5 flex items-center justify-center gap-1">
                {currentStatus?.trend === "INCREASING" && <TrendingUp className="h-4 w-4 text-rose-500" />}
                {currentStatus?.trend === "IMPROVING" && <TrendingDown className="h-4 w-4 text-emerald-500" />}
                {currentStatus?.trend === "STABLE" && <Minus className="h-4 w-4 text-blue-500" />}
                <span className="text-xs">{currentStatus?.trend || "Pending"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. 30-Day Checkin Consistency */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Check-in Consistency
            </span>
            <div className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">
              {summary ? `${summary.consistency_score.toFixed(0)}%` : "0%"}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {summary ? `${summary.total_checkins_30d} check-ins logged in past 30 days` : "Log daily for richer trends."}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
            Peak: <span className="font-bold text-slate-700 dark:text-slate-200">{summary?.highest_index_30d ?? "—"}</span> · Lowest: <span className="font-bold text-slate-700 dark:text-slate-200">{summary?.lowest_index_30d ?? "—"}</span>
          </div>
        </div>

        {/* 3. Subsystem Independence Card */}
        <div className="rounded-3xl border border-purple-200/80 bg-purple-50/40 p-6 shadow-sm dark:border-purple-900/50 dark:bg-purple-950/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-purple-800 dark:text-purple-300 font-bold text-xs">
              <ShieldCheck className="h-4 w-4 text-purple-600" />
              <span>Layer B Guaranteed</span>
            </div>
            <div className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-200 leading-snug">
              Isolated from Disease Models
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Stress scores never alter clinical disease risk probabilities (Heart, Diabetes, HTN, CKD, Stroke) or Risk Fusion.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="mt-4 text-xs font-semibold text-purple-700 dark:text-purple-300 hover:underline inline-flex items-center gap-1"
          >
            View Clinical Dashboard →
          </Link>
        </div>
      </div>

      {/* Main Content Grid: Check-in Form & Longitudinal Trends */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left Column: Daily Check-in Form */}
        <div className="lg:col-span-5 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-600" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Daily Stress Check-in</h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Rate your feelings today on a 0 to 10 scale. Check-ins are appended to your immutable history.
            </p>
          </div>

          <form onSubmit={handleCheckinSubmit} className="space-y-5">
            {/* 1. Perceived Stress (Mandatory) */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-slate-800 dark:text-slate-200">
                  Perceived Stress <span className="text-rose-500">*</span>
                </label>
                <span className="font-bold text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950 px-2 py-0.5 rounded-md">
                  {perceivedStress} / 10
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={perceivedStress}
                onChange={(e) => setPerceivedStress(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0 (None)</span>
                <span>5 (Moderate)</span>
                <span>10 (Extreme)</span>
              </div>
            </div>

            {/* 2. Overwhelm */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-slate-800 dark:text-slate-200">Feeling Overwhelmed</label>
                <span className="font-bold text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950 px-2 py-0.5 rounded-md">
                  {overwhelm} / 10
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={overwhelm}
                onChange={(e) => setOverwhelm(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0 (In control)</span>
                <span>10 (Completely overwhelmed)</span>
              </div>
            </div>

            {/* 3. Difficulty Relaxing */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-slate-800 dark:text-slate-200">Difficulty Unwinding</label>
                <span className="font-bold text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950 px-2 py-0.5 rounded-md">
                  {difficultyRelaxing} / 10
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={difficultyRelaxing}
                onChange={(e) => setDifficultyRelaxing(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0 (Easy to relax)</span>
                <span>10 (Constantly tense)</span>
              </div>
            </div>

            {/* 4. Mood */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-slate-800 dark:text-slate-200">Mood Balance</label>
                <span className="font-bold text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950 px-2 py-0.5 rounded-md">
                  {mood} / 10
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={mood}
                onChange={(e) => setMood(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0 (Very Low)</span>
                <span>10 (Upbeat / Calm)</span>
              </div>
            </div>

            {/* 5. Energy */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-slate-800 dark:text-slate-200">Physical & Mental Energy</label>
                <span className="font-bold text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950 px-2 py-0.5 rounded-md">
                  {energy} / 10
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={energy}
                onChange={(e) => setEnergy(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0 (Drained)</span>
                <span>10 (Fully Charged)</span>
              </div>
            </div>

            {/* Optional Reflection Notes */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Personal Note (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What factors influenced your stress today? (e.g. project deadline, poor sleep, long commute)"
                rows={2}
                maxLength={500}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-purple-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
              />
            </div>

            {/* Live Indicator Preview */}
            <div className="rounded-xl border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40 p-3 flex items-center justify-between">
              <div className="text-xs text-slate-600 dark:text-slate-300">
                Projected Stress Index: <span className="font-extrabold text-purple-700 dark:text-purple-400">{previewScore}</span> / 100
              </div>
              <span className="text-[10px] text-slate-400">Deterministic Formula</span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-3 text-xs font-bold text-white shadow-md hover:bg-purple-700 disabled:opacity-50 transition"
            >
              <Send className="h-4 w-4" />
              {submitting ? "Recording Check-in..." : "Save Today's Check-in"}
            </button>

            {submitSuccess && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Check-in recorded successfully! History and trends updated.
              </div>
            )}
          </form>
        </div>

        {/* Right Column: Longitudinal Trends & Pattern Insights */}
        <div className="lg:col-span-7 space-y-6">
          {/* Trend Chart Card */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Longitudinal Stress Trajectory</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Daily recorded index scores across evaluated period
                </p>
              </div>

              <div className="flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 p-1 self-start">
                <button
                  onClick={() => setTrendDays(7)}
                  className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                    trendDays === 7
                      ? "bg-white text-purple-700 shadow-xs dark:bg-slate-700 dark:text-purple-300"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  7 Days
                </button>
                <button
                  onClick={() => setTrendDays(30)}
                  className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                    trendDays === 30
                      ? "bg-white text-purple-700 shadow-xs dark:bg-slate-700 dark:text-purple-300"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  30 Days
                </button>
              </div>
            </div>

            {/* Visual Trend Bars */}
            {trends && trends.data_points.length > 0 ? (
              <div className="space-y-4">
                <div className="h-44 flex items-end gap-2 pt-6 pb-2 px-2 border-b border-slate-100 dark:border-slate-800 overflow-x-auto">
                  {trends.data_points.map((pt, idx) => {
                    const heightPct = Math.max(8, Math.min(100, pt.stress_index))
                    const barColor =
                      pt.stress_index >= 75
                        ? "bg-rose-500"
                        : pt.stress_index >= 50
                        ? "bg-amber-500"
                        : pt.stress_index >= 25
                        ? "bg-blue-500"
                        : "bg-emerald-500"
                    return (
                      <div key={idx} className="flex-1 min-w-[36px] flex flex-col items-center gap-1.5 group">
                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 opacity-0 group-hover:opacity-100 transition">
                          {pt.stress_index.toFixed(0)}
                        </span>
                        <div
                          style={{ height: `${heightPct}%` }}
                          className={`w-full rounded-t-lg ${barColor} transition-all duration-300 shadow-xs`}
                        />
                        <span className="text-[9px] font-medium text-slate-400 whitespace-nowrap">
                          {pt.date}
                        </span>
                      </div>
                    )
                  })}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span>
                    Average Period Index:{" "}
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {trends.average_index !== undefined && trends.average_index !== null
                        ? trends.average_index.toFixed(1)
                        : "N/A"}
                    </span>
                  </span>
                  <span className="flex items-center gap-3 text-[11px]">
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" /> Low (&lt;25)
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-blue-500" /> Mild (25-49)
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-amber-500" /> Mod (50-74)
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-rose-500" /> High (75+)
                    </span>
                  </span>
                </div>
              </div>
            ) : (
              <div className="h-44 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center p-4">
                <Brain className="h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  No longitudinal check-ins recorded yet
                </p>
                <p className="text-[11px] text-slate-400 max-w-xs mt-0.5">
                  Complete your first daily check-in to start building your stress trajectory.
                </p>
              </div>
            )}
          </div>

          {/* Observational Pattern Insights */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Observational Pattern Insights</h3>
            </div>
            <div className="space-y-2">
              {trends && trends.observed_patterns.length > 0 ? (
                trends.observed_patterns.map((pat, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-300"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                    <span>{pat}</span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400 italic">
                  Complete 2 or more check-ins to activate cross-metric pattern detection.
                </div>
              )}
            </div>
          </div>

          {/* Actionable Restorative Recommendations */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Personalized Wellness Recommendations</h3>
                <p className="text-xs text-slate-500">Non-prescriptive recovery and lifestyle guidance</p>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                Active
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {recommendations.length > 0 ? (
                recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 space-y-2 dark:border-slate-800 dark:bg-slate-800/30"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{rec.title}</span>
                      <span
                        className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                          rec.priority === "HIGH"
                            ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                            : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {rec.priority}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      {rec.description}
                    </p>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-xs text-slate-400 italic py-2">
                  Submit a check-in to receive tailored recommendations.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
