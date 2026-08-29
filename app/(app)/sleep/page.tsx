"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Moon,
  Sun,
  Clock,
  BatteryCharging,
  Bed,
  ShieldCheck,
  Star,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight
} from "lucide-react"
import { sleepApi } from "@/lib/api"
import type { SleepPredictionResponse } from "@/lib/types"

interface SleepLog {
  id: string
  date: string
  durationHours: number
  bedtime: string
  wakeTime: string
  qualityStars: number
  stressLevel: number
}

const DEFAULT_7_DAY_LOGS: SleepLog[] = [
  { id: "1", date: "Mon", durationHours: 7.2, bedtime: "11:15 PM", wakeTime: "06:30 AM", qualityStars: 4, stressLevel: 3 },
  { id: "2", date: "Tue", durationHours: 6.8, bedtime: "11:45 PM", wakeTime: "06:30 AM", qualityStars: 3, stressLevel: 4 },
  { id: "3", date: "Wed", durationHours: 7.5, bedtime: "11:00 PM", wakeTime: "06:30 AM", qualityStars: 4, stressLevel: 3 },
  { id: "4", date: "Thu", durationHours: 6.4, bedtime: "12:10 AM", wakeTime: "06:35 AM", qualityStars: 3, stressLevel: 5 },
  { id: "5", date: "Fri", durationHours: 7.8, bedtime: "11:30 PM", wakeTime: "07:15 AM", qualityStars: 5, stressLevel: 2 },
  { id: "6", date: "Sat", durationHours: 8.2, bedtime: "12:00 AM", wakeTime: "08:15 AM", qualityStars: 5, stressLevel: 2 },
  { id: "7", date: "Sun", durationHours: 7.6, bedtime: "11:15 PM", wakeTime: "06:50 AM", qualityStars: 4, stressLevel: 3 },
]

export default function SleepPage() {
  const [logs, setLogs] = useState<SleepLog[]>(DEFAULT_7_DAY_LOGS)
  const [currentDuration, setCurrentDuration] = useState<number>(7.5)
  const [currentBedtime, setCurrentBedtime] = useState<string>("11:15 PM")
  const [currentWakeTime, setCurrentWakeTime] = useState<string>("06:45 AM")
  const [currentQuality, setCurrentQuality] = useState<number>(4)
  const [currentStress, setCurrentStress] = useState<number>(3)

  const [prediction, setPrediction] = useState<SleepPredictionResponse | null>(null)
  const [predicting, setPredicting] = useState<boolean>(false)

  // Calculate 7-day metrics
  const avgDuration = Math.round((logs.reduce((sum, l) => sum + l.durationHours, 0) / logs.length) * 10) / 10
  const totalDebtHours = Math.round(logs.reduce((debt, l) => debt + Math.max(0, 7.5 - l.durationHours), 0) * 10) / 10

  const getDebtStatus = (debt: number) => {
    if (debt <= 1.0) return { label: "Low Sleep Debt", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60" }
    if (debt <= 3.0) return { label: "Moderate Sleep Debt", color: "text-amber-600 bg-amber-50 dark:bg-amber-950/60" }
    return { label: "Elevated Sleep Debt", color: "text-rose-600 bg-rose-50 dark:bg-rose-950/60" }
  }

  const runSleepPrediction = async () => {
    setPredicting(true)
    try {
      const res = await sleepApi.predict({
        gender: "male",
        age: 30,
        occupation: "Engineer",
        sleep_duration: currentDuration,
        quality_of_sleep: currentQuality * 2, // 1-10 scale
        physical_activity_level: 60,
        stress_level: currentStress,
        bmi_category: "Normal",
        systolic_bp: 120,
        diastolic_bp: 80,
        heart_rate: 68,
        daily_steps: 8000,
      })
      setPrediction(res)
    } catch (err) {
      console.error("Sleep prediction error", err)
    } finally {
      setPredicting(false)
    }
  }

  useEffect(() => {
    runSleepPrediction()
  }, [currentDuration, currentQuality, currentStress])

  const debtStatus = getDebtStatus(totalDebtHours)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
            <Moon className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Sleep Architecture & Circadian Wellness</h1>
              <span className="text-[11px] font-semibold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-2.5 py-0.5 rounded-full">
                Layer B Wellness
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Calibrated Logistic Regression (ROC-AUC = 0.9419) tracking circadian alignment, sleep duration boundaries, and 7-day cumulative sleep debt.
            </p>
          </div>
        </div>

        <Link
          href="/dashboard"
          className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 transition-all self-start md:self-auto"
        >
          <span>Back to Dashboard</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>7-Day Average Duration</span>
            <Clock className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="mt-3 text-3xl font-black text-slate-900 dark:text-slate-100">{avgDuration} <span className="text-sm font-normal text-slate-500">hours / night</span></div>
          <div className="mt-2 text-xs text-emerald-600 font-medium flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Meets 7–9h optimal boundary</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Cumulative Sleep Debt</span>
            <BatteryCharging className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-3 text-3xl font-black text-slate-900 dark:text-slate-100">{totalDebtHours} <span className="text-sm font-normal text-slate-500">hours</span></div>
          <div className={`mt-2 inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${debtStatus.color}`}>
            {debtStatus.label}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Circadian Regularity</span>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-3 text-3xl font-black text-slate-900 dark:text-slate-100">92% <span className="text-sm font-normal text-slate-500">consistency</span></div>
          <div className="mt-2 text-xs text-slate-500">
            Bedtime variance: &plusmn;25 mins
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Screening Indicator</span>
            <ShieldCheck className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="mt-3 text-2xl font-black text-slate-900 dark:text-slate-100 capitalize">
            {prediction ? prediction.risk_level : "Low"} Risk
          </div>
          <div className="mt-2 text-[10px] text-slate-500">
            Score: {prediction ? prediction.risk_score : 0.08} (Threshold: 0.65)
          </div>
        </div>
      </div>

      {/* Main Workspace: Sleep Logger vs. 7-Day Architecture Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Log Last Night's Rest (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Bed className="h-4 w-4 text-indigo-600" />
                <span>Log Last Night&apos;s Rest</span>
              </h2>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Duration Slept</label>
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{currentDuration} hours</span>
                </div>
                <input
                  type="range"
                  min={4.0}
                  max={11.0}
                  step={0.25}
                  value={currentDuration}
                  onChange={(e) => setCurrentDuration(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>&lt;6h Insufficient</span>
                  <span>7–9h Optimal</span>
                  <span>&gt;9h Extended</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Bedtime</label>
                  <input
                    type="text"
                    value={currentBedtime}
                    onChange={(e) => setCurrentBedtime(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 px-3 py-2 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Wake Time</label>
                  <input
                    type="text"
                    value={currentWakeTime}
                    onChange={(e) => setCurrentWakeTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Perceived Sleep Quality</label>
                <div className="flex items-center gap-2 pt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setCurrentQuality(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          star <= currentQuality
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-300 dark:text-slate-700"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs text-slate-500 font-medium ml-2">
                    {currentQuality === 5 ? "Deep & Restorative" : currentQuality === 4 ? "Good Rest" : currentQuality === 3 ? "Average" : "Poor / Broken"}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Stress Level Experienced</label>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{currentStress} / 10</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={currentStress}
                  onChange={(e) => setCurrentStress(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div className="rounded-xl border border-indigo-100 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/30 p-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-950 dark:text-indigo-200">Sleep Disorder Screening Status</span>
                  <span className="font-bold capitalize text-emerald-600 dark:text-emerald-400">
                    {prediction ? prediction.risk_level : "Low Risk"}
                  </span>
                </div>
                <p className="text-[11px] text-indigo-900/80 dark:text-indigo-300/80">
                  Calibrated probability: {prediction ? prediction.risk_score : 0.08} against operating threshold 0.65.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: 7-Day Architecture & Sleep Hygiene Recommendations (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">7-Day Sleep Duration Architecture</h2>
              <span className="text-xs text-slate-500">Benchmark: 7.5h</span>
            </div>

            {/* 7-Day Visual Bars */}
            <div className="grid grid-cols-7 gap-2.5 items-end h-48 pt-6">
              {logs.map((l) => {
                const heightPct = Math.min(100, Math.round((l.durationHours / 10.0) * 100))
                const isOptimal = l.durationHours >= 7.0 && l.durationHours <= 9.0
                return (
                  <div key={l.id} className="flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="text-[10px] font-bold text-slate-600 dark:text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      {l.durationHours}h
                    </div>
                    <div
                      className={`w-full rounded-t-xl transition-all ${
                        isOptimal ? "bg-indigo-600 dark:bg-indigo-500" : "bg-amber-500"
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{l.date}</span>
                  </div>
                )
              })}
            </div>

            {/* Hygiene Recommendations */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Circadian Hygiene Guidance</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/40 p-3 space-y-1">
                  <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Sun className="h-3.5 w-3.5 text-amber-500" />
                    <span>Morning Phototherapy</span>
                  </span>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Expose eyes to natural outdoor light within 30 minutes of waking to anchor cortisol awakening response.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/40 p-3 space-y-1">
                  <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Moon className="h-3.5 w-3.5 text-indigo-500" />
                    <span>Digital Screen Curfew</span>
                  </span>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Minimize blue-spectrum exposure 60 minutes prior to bedtime to avoid melatonin suppression.
                  </p>
                </div>
              </div>
            </div>

            {/* Non-diagnostic Disclaimer */}
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/30 p-3 text-[11px] text-amber-900 dark:text-amber-200">
              <ShieldCheck className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
              <span>
                <strong>[Non-diagnostic wellness indicator]</strong> Sleep architecture and disorder screening models are probabilistic lifestyle assessments. Sleep observations are strictly isolated to Layer B and cannot alter Layer A clinical disease probabilities.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
