"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Activity,
  Flame,
  Heart,
  Timer,
  Footprints,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Sparkles,
  ArrowRight
} from "lucide-react"
import { activityApi } from "@/lib/api"
import type { ActivitySignal } from "@/lib/types"

export default function ActivityPage() {
  // Workout Calorie Calculator State
  const [gender, setGender] = useState<"male" | "female">("male")
  const [age, setAge] = useState<number>(28)
  const [height, setHeight] = useState<number>(175)
  const [weight, setWeight] = useState<number>(72)
  const [duration, setDuration] = useState<number>(30)
  const [heartRate, setHeartRate] = useState<number>(125)
  const [bodyTemp, setBodyTemp] = useState<number>(39.8)

  const [predictedCalories, setPredictedCalories] = useState<number | null>(null)
  const [calculatingCal, setCalculatingCal] = useState<boolean>(false)

  // Daily Activity Signal State
  const [dailySteps, setDailySteps] = useState<number>(8400)
  const [activeMins, setActiveMins] = useState<number>(42)
  const [sedentaryHours, setSedentaryHours] = useState<number>(7.5)
  const [activitySignal, setActivitySignal] = useState<ActivitySignal | null>(null)
  const [evaluating, setEvaluating] = useState<boolean>(false)

  // Run initial calorie calculation on mount
  useEffect(() => {
    runCaloriePrediction()
    runActivityEvaluation()
  }, [])

  const runCaloriePrediction = async () => {
    setCalculatingCal(true)
    try {
      const res = await activityApi.estimateCalories({
        gender,
        age,
        height,
        weight,
        duration,
        heart_rate: heartRate,
        body_temp: bodyTemp,
      })
      setPredictedCalories(res.estimated_calories)
    } catch (err) {
      console.error("Calorie estimation error", err)
    } finally {
      setCalculatingCal(false)
    }
  }

  const runActivityEvaluation = async () => {
    setEvaluating(true)
    try {
      const veryActive = Math.round(activeMins * 0.4)
      const fairlyActive = Math.round(activeMins * 0.6)
      const sedentaryMins = Math.round(sedentaryHours * 60)

      const res = await activityApi.evaluate({
        daily_steps: dailySteps,
        very_active_minutes: veryActive,
        fairly_active_minutes: fairlyActive,
        lightly_active_minutes: 60,
        sedentary_minutes: sedentaryMins,
        historical_steps: [dailySteps - 500, dailySteps + 200, dailySteps],
      })
      setActivitySignal(res)
    } catch (err) {
      console.error("Activity evaluation error", err)
    } finally {
      setEvaluating(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-500/20">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Physical Activity Intelligence</h1>
              <span className="text-[11px] font-semibold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2.5 py-0.5 rounded-full">
                Layer B Wellness
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              LightGBM Calorie Expenditure Regressor (R² = 0.9963) paired with deterministic sedentary risk scoring against WHO/CDC exercise guidelines.
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

      {/* Two Column Workspace: Workout Energy Expenditure vs. Daily Sedentary/Step Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: LightGBM Workout Calorie Regressor (6 cols) */}
        <div className="lg:col-span-6 space-y-5">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                  <Flame className="h-4 w-4" />
                  <span>LightGBM Regressor (MAE = 2.61 kcal)</span>
                </span>
                <h2 className="mt-1 text-base font-bold text-slate-900 dark:text-slate-100">Workout Energy Expenditure Estimator</h2>
              </div>
              <span className="text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-md">
                15,000 Trained Cohorts
              </span>
            </div>

            {/* Input Form */}
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Biological Sex</label>
                  <div className="flex rounded-xl bg-slate-100 dark:bg-slate-850 p-1 border border-slate-200 dark:border-slate-800">
                    <button
                      onClick={() => setGender("male")}
                      className={`flex-1 py-1.5 rounded-lg font-semibold transition-all ${gender === "male" ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs" : "text-slate-500"}`}
                    >
                      Male
                    </button>
                    <button
                      onClick={() => setGender("female")}
                      className={`flex-1 py-1.5 rounded-lg font-semibold transition-all ${gender === "female" ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs" : "text-slate-500"}`}
                    >
                      Female
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Age: <span className="text-amber-600">{age} years</span></label>
                  <input
                    type="range"
                    min={18}
                    max={80}
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Height: <span className="text-amber-600">{height} cm</span></label>
                  <input
                    type="range"
                    min={140}
                    max={210}
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Body Weight: <span className="text-amber-600">{weight} kg</span></label>
                  <input
                    type="range"
                    min={40}
                    max={140}
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center">
                  <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Timer className="h-3.5 w-3.5 text-slate-400" />
                    <span>Workout Duration</span>
                  </label>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{duration} minutes</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={120}
                  step={5}
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Heart className="h-3.5 w-3.5 text-rose-500" />
                    <span>Average Heart Rate</span>
                  </label>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{heartRate} bpm</span>
                </div>
                <input
                  type="range"
                  min={70}
                  max={185}
                  value={heartRate}
                  onChange={(e) => setHeartRate(Number(e.target.value))}
                  className="w-full accent-rose-500"
                />
              </div>

              <button
                onClick={runCaloriePrediction}
                disabled={calculatingCal}
                className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-2.5 shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
              >
                {calculatingCal ? "Estimating Expenditure..." : "Calculate Calorie Burn"}
              </button>
            </div>

            {/* Prediction Result Display */}
            {predictedCalories !== null && (
              <div className="rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/30 p-5 space-y-2 text-center animate-in zoom-in-95 duration-200">
                <span className="text-xs font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wider">Estimated Energy Expenditure</span>
                <div className="text-4xl font-black text-slate-900 dark:text-slate-100">
                  {predictedCalories} <span className="text-lg font-bold text-amber-600">kcal</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Based on {duration} mins workout @ {heartRate} bpm average heart rate for {weight}kg individual.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Daily Sedentary & Steps Lifestyle Evaluator (6 cols) */}
        <div className="lg:col-span-6 space-y-5">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <Footprints className="h-4 w-4" />
                  <span>WHO Physical Activity Standards</span>
                </span>
                <h2 className="mt-1 text-base font-bold text-slate-900 dark:text-slate-100">Daily Movement & Sedentary Risk Profile</h2>
              </div>
            </div>

            {/* Lifestyle Sliders */}
            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Footprints className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Daily Steps Count</span>
                  </label>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{dailySteps.toLocaleString()} steps</span>
                </div>
                <input
                  type="range"
                  min={1000}
                  max={20000}
                  step={500}
                  value={dailySteps}
                  onChange={(e) => setDailySteps(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Moderate-to-Vigorous Active Minutes</label>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{activeMins} mins</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={120}
                  step={5}
                  value={activeMins}
                  onChange={(e) => setActiveMins(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Daily Sedentary Duration</label>
                  <span className={`font-bold ${sedentaryHours >= 10 ? "text-rose-500" : sedentaryHours >= 8 ? "text-amber-500" : "text-emerald-600"}`}>
                    {sedentaryHours} hours
                  </span>
                </div>
                <input
                  type="range"
                  min={3}
                  max={16}
                  step={0.5}
                  value={sedentaryHours}
                  onChange={(e) => setSedentaryHours(Number(e.target.value))}
                  className="w-full accent-slate-500"
                />
              </div>

              <button
                onClick={runActivityEvaluation}
                disabled={evaluating}
                className="w-full rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 font-semibold py-2.5 transition-all"
              >
                {evaluating ? "Evaluating..." : "Evaluate Movement Profile"}
              </button>
            </div>

            {/* Evaluation Results */}
            {activitySignal && (
              <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800 animate-in fade-in duration-200">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
                  <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-3">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Activity Score</span>
                    <div className="mt-1 text-2xl font-black text-slate-900 dark:text-slate-100">{activitySignal.activity_score}</div>
                    <span className="text-[10px] text-slate-400">out of 100</span>
                  </div>

                  <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-3">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Activity Level</span>
                    <div className="mt-1 text-sm font-bold capitalize text-emerald-600 dark:text-emerald-400">
                      {activitySignal.activity_level}
                    </div>
                    <span className="text-[10px] text-slate-400">WHO target: &ge;7.5k</span>
                  </div>

                  <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-3">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Sedentary Risk</span>
                    <div className={`mt-1 text-sm font-bold capitalize ${activitySignal.sedentary_risk === "elevated" ? "text-rose-500" : activitySignal.sedentary_risk === "moderate" ? "text-amber-500" : "text-emerald-600"}`}>
                      {activitySignal.sedentary_risk}
                    </div>
                    <span className="text-[10px] text-slate-400">Threshold: &lt;8.0h</span>
                  </div>
                </div>

                {/* Recommendations List */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Actionable Feedback</span>
                  <div className="space-y-1.5">
                    {activitySignal.recommendation_triggers.length === 0 ? (
                      <div className="flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 p-3 text-xs text-emerald-800 dark:text-emerald-200">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                        <span>Excellent movement volume and low sedentary risk. Maintain your current active lifestyle.</span>
                      </div>
                    ) : (
                      activitySignal.recommendation_triggers.map((trig) => (
                        <div key={trig} className="flex items-center gap-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 p-2.5 text-xs text-amber-900 dark:text-amber-200">
                          <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                          <span>{trig.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}: Consider standing breaks and brisk walks.</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Non-diagnostic Disclaimer */}
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/30 p-3 text-[11px] text-amber-900 dark:text-amber-200">
              <ShieldCheck className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
              <span>
                <strong>[Non-diagnostic wellness indicator]</strong> Energy expenditure and sedentary risk scores represent lifestyle modeling. Physical activity observations reside strictly in Layer B and do not modify clinical disease probabilities.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
