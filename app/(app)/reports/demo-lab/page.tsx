"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bot,
  Brain,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Database,
  FileText,
  FlaskConical,
  HeartPulse,
  Info,
  Moon,
  Pause,
  Play,
  Printer,
  RotateCcw,
  Shield,
  Sparkles,
  User,
  Zap,
} from "lucide-react"
import { SYNTHETIC_DEMO_USERS } from "@/lib/demo-lab-data"
import type { DemoDayData, DemoUserDetail } from "@/lib/types"

export default function DemoLabPage() {
  const [selectedUser, setSelectedUser] = useState<DemoUserDetail>(SYNTHETIC_DEMO_USERS[1]) // Default Priya
  const [selectedDayNum, setSelectedDayNum] = useState<number>(1)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [presentationMode, setPresentationMode] = useState<boolean>(false)
  const [showWeeklyReport, setShowWeeklyReport] = useState<boolean>(false)

  const currentDayData: DemoDayData =
    selectedUser.days.find((d) => d.day === selectedDayNum) || selectedUser.days[0]

  // Auto-play animation interval
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying) {
      interval = setInterval(() => {
        setSelectedDayNum((prev) => {
          if (prev >= 7) {
            setIsPlaying(false)
            return 7
          }
          return prev + 1
        })
      }, 1400)
    }
    return () => clearInterval(interval)
  }, [isPlaying])

  const handleUserChange = (user: DemoUserDetail) => {
    setSelectedUser(user)
    setSelectedDayNum(1)
    setIsPlaying(false)
    setShowWeeklyReport(false)
  }

  const handlePrevDay = () => {
    if (selectedDayNum > 1) setSelectedDayNum(selectedDayNum - 1)
  }

  const handleNextDay = () => {
    if (selectedDayNum < 7) setSelectedDayNum(selectedDayNum + 1)
  }

  const handleReset = () => {
    setSelectedDayNum(1)
    setIsPlaying(false)
    setShowWeeklyReport(false)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/reports"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FlaskConical className="w-6 h-6 text-amber-500" /> LIFEOS 7-DAY HEALTH SIMULATION LAB
              </h1>
              <span className="text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 px-3 py-1 rounded-full uppercase border border-amber-300 dark:border-amber-800">
                SYNTHETIC DEMONSTRATION DATA — NOT REAL PATIENT DATA
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Seven synthetic user scenarios demonstrating how LifeOS processes longitudinal health and lifestyle data over 7 days.
            </p>
          </div>
        </div>

        {/* Presentation Mode Toggle */}
        <button
          onClick={() => setPresentationMode(!presentationMode)}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-xs ${
            presentationMode
              ? "bg-indigo-600 text-white shadow-indigo-500/20"
              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
          }`}
        >
          <Sparkles className="h-4 w-4" />
          <span>{presentationMode ? "Exit Presentation Mode" : "Guide Presentation Mode"}</span>
        </button>
      </div>

      {/* Synthetic User Selector Bar (7 Synthetic Profiles) */}
      <div className="space-y-2">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <User className="w-4 h-4 text-emerald-600" /> Select Synthetic Demonstration User Profile (1 of 7)
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {SYNTHETIC_DEMO_USERS.map((u) => {
            const isSelected = u.id === selectedUser.id
            return (
              <button
                key={u.id}
                onClick={() => handleUserChange(u)}
                className={`flex flex-col items-start p-3 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/70 shadow-md ring-2 ring-emerald-500/30"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-black text-slate-900 dark:text-slate-100">{u.name.split(" ")[0]}</span>
                  <span className="text-[10px] font-bold text-slate-400">{u.age}y</span>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{u.tagline.split(" ")[0]}...</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected User Header Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 font-extrabold flex items-center justify-center text-sm">
              {selectedUser.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">{selectedUser.label}</h2>
                <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-0.5 rounded-full font-medium">
                  {selectedUser.age}y • {selectedUser.sex}
                </span>
              </div>
              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{selectedUser.tagline}</p>
            </div>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Scenario Purpose:</span> {selectedUser.purpose}
          </div>
        </div>

        {/* 7-Day Timeline Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          {/* Day Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {selectedUser.days.map((d) => (
              <button
                key={d.day}
                onClick={() => {
                  setSelectedDayNum(d.day)
                  setIsPlaying(false)
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  selectedDayNum === d.day
                    ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs scale-105"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                }`}
              >
                Day {d.day}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={handlePrevDay}
              disabled={selectedDayNum <= 1}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 disabled:opacity-40"
            >
              Previous Day
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-xs hover:bg-emerald-700 transition-colors"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? "Pause" : "Play 7-Day Simulation"}</span>
            </button>
            <button
              onClick={handleNextDay}
              disabled={selectedDayNum >= 7}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 disabled:opacity-40"
            >
              Next Day
            </button>
            <button
              onClick={handleReset}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700"
              title="Reset Simulation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Guide Presentation Mode Card (If active) */}
      {presentationMode && (
        <div className="rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/70 dark:bg-indigo-950/40 p-6 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-indigo-200 dark:border-indigo-800 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-indigo-950 dark:text-indigo-200">Guide Presentation View — Case Study: {selectedUser.name}</h3>
            </div>
            <span className="text-xs font-semibold bg-indigo-200 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-100 px-2.5 py-0.5 rounded-full">
              Day {selectedDayNum} of 7
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900">
              <span className="font-bold text-indigo-700 dark:text-indigo-300">1. Data Ingested</span>
              <p className="mt-1 text-slate-600 dark:text-slate-400">Vitals: {currentDayData.vitals.bp} BP, {currentDayData.vitals.glucose} mg/dL Glucose. Sleep: {currentDayData.sleep_hours}h, Steps: {currentDayData.steps.toLocaleString()}.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900">
              <span className="font-bold text-indigo-700 dark:text-indigo-300">2. Layer A & B Analysis</span>
              <p className="mt-1 text-slate-600 dark:text-slate-400">Layer A screening indicators evaluated. Layer B wellness signals processed for sleep, activity & nutrition.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900">
              <span className="font-bold text-indigo-700 dark:text-indigo-300">3. What LifeOS Did</span>
              <p className="mt-1 text-slate-600 dark:text-slate-400">{currentDayData.notification}</p>
            </div>
          </div>
        </div>
      )}

      {/* Part K — Animated Architecture Data Flow */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
          <span className="flex items-center gap-1.5"><Cpu className="w-4 h-4 text-emerald-600" /> LifeOS Architecture Data Flow</span>
          <span className="text-[10px] text-emerald-600 font-semibold">Live Simulation Active</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-center text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Input Data</span>
            <div className="font-bold text-slate-900 dark:text-slate-100 mt-1">User Inputs</div>
            <div className="text-[10px] text-slate-500 mt-0.5">{currentDayData.vitals.bp} BP</div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800">
            <span className="text-[10px] font-bold text-emerald-600 uppercase">Layer A</span>
            <div className="font-bold text-emerald-950 dark:text-emerald-200 mt-1">Clinical ML</div>
            <div className="text-[10px] text-emerald-700 dark:text-emerald-300 mt-0.5">6 Verticals</div>
          </div>
          <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800">
            <span className="text-[10px] font-bold text-teal-600 uppercase">Layer B</span>
            <div className="font-bold text-teal-950 dark:text-teal-200 mt-1">Wellness</div>
            <div className="text-[10px] text-teal-700 dark:text-teal-300 mt-0.5">Sleep/Activity</div>
          </div>
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800">
            <span className="text-[10px] font-bold text-indigo-600 uppercase">Layer C</span>
            <div className="font-bold text-indigo-950 dark:text-indigo-200 mt-1">Decision Support</div>
            <div className="text-[10px] text-indigo-700 dark:text-indigo-300 mt-0.5">Risk Fusion</div>
          </div>
          <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800">
            <span className="text-[10px] font-bold text-purple-600 uppercase">Layer D</span>
            <div className="font-bold text-purple-950 dark:text-purple-200 mt-1">AI Copilot</div>
            <div className="text-[10px] text-purple-700 dark:text-purple-300 mt-0.5">RAG Context</div>
          </div>
        </div>
      </div>

      {/* Main Simulation View for Selected Day */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Vitals & Wellness Metrics */}
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-emerald-600" /> Daily Vitals & Biomarkers (Day {selectedDayNum})
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Blood Pressure</span>
                <div className="text-base font-extrabold text-slate-900 dark:text-slate-100">{currentDayData.vitals.bp} mmHg</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Fasting Glucose</span>
                <div className="text-base font-extrabold text-slate-900 dark:text-slate-100">{currentDayData.vitals.glucose} mg/dL</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">HbA1c Level</span>
                <div className="text-base font-extrabold text-slate-900 dark:text-slate-100">{currentDayData.vitals.hba1c}%</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Cholesterol</span>
                <div className="text-base font-extrabold text-slate-900 dark:text-slate-100">{currentDayData.vitals.cholesterol} mg/dL</div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Moon className="w-4 h-4 text-indigo-500" /> Wellness Subsystems Data
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Sleep Duration:</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">{currentDayData.sleep_hours} hours</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Daily Steps:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{currentDayData.steps.toLocaleString()} steps</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Active / Sedentary:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{currentDayData.active_minutes}m active / {currentDayData.sedentary_hours}h sed</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Nutrition Pattern:</span>
                <span className="text-slate-600 dark:text-slate-400">{currentDayData.nutrition_summary}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Column: Clinical Screening Indicators (Layer A) */}
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Layer A — Model-Generated Screening Indicators</h3>
            </div>

            <div className="space-y-2.5">
              {Object.entries(currentDayData.screening_indicators).map(([key, val]) => {
                const isHigh = val.includes("High")
                const isMod = val.includes("Moderate")
                return (
                  <div key={key} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">{key.replace("_", " ")}</span>
                    <span
                      className={`font-bold px-2.5 py-0.5 rounded-full text-[11px] ${
                        isHigh
                          ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200 font-extrabold"
                          : isMod
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200 font-extrabold"
                          : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                      }`}
                    >
                      {val}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Recommendations & Notifications</h3>
            <div className="space-y-2 text-xs">
              {currentDayData.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Part L — RAG Assistant Context Demonstration */}
        <div className="space-y-5">
          <div className="rounded-2xl border border-purple-200 dark:border-purple-900 bg-purple-50/40 dark:bg-purple-950/30 p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-purple-200 dark:border-purple-900 pb-3">
              <Bot className="w-5 h-5 text-purple-600" />
              <div>
                <h3 className="text-sm font-bold text-purple-950 dark:text-purple-200">Layer D — RAG Copilot Context Preview</h3>
                <p className="text-[11px] text-purple-700 dark:text-purple-300">Enriched context supplied to the AI assistant for Day {selectedDayNum}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-900 font-mono text-[11px] text-slate-800 dark:text-slate-200 leading-relaxed">
              {currentDayData.rag_context}
            </div>

            <div className="text-[10px] text-purple-800 dark:text-purple-300 italic">
              * The RAG AI Copilot receives non-diagnostic framing and does not diagnose the user.
            </div>
          </div>

          {/* Generate Weekly Report Button */}
          {selectedDayNum === 7 && (
            <button
              onClick={() => setShowWeeklyReport(true)}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 p-4 text-sm font-extrabold text-white shadow-lg hover:from-emerald-700 hover:to-teal-700 transition-all animate-in fade-in"
            >
              <FileText className="w-5 h-5" />
              <span>Generate 7-Day Synthesized Weekly Report</span>
            </button>
          )}
        </div>
      </div>

      {/* Part M — Weekly Synthesized Report Modal / Panel */}
      {showWeeklyReport && (
        <div className="rounded-2xl border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-slate-900 p-6 shadow-xl space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <span className="inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-950 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                Synthetic 7-Day Weekly Synthesis Report
              </span>
              <h2 className="mt-2 text-xl font-black text-slate-900 dark:text-slate-100">{selectedUser.name} — Weekly Health Analysis</h2>
            </div>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 px-4 py-2 text-xs font-bold hover:bg-slate-800 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Export / Print Report</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 space-y-2">
              <span className="font-bold text-slate-900 dark:text-slate-100 uppercase">Day 1 Initial State</span>
              <div>Sleep: {selectedUser.days[0].sleep_hours}h | Steps: {selectedUser.days[0].steps.toLocaleString()}</div>
              <div>Vitals: {selectedUser.days[0].vitals.bp} BP, {selectedUser.days[0].vitals.glucose} mg/dL Glucose</div>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 space-y-2 border border-emerald-200 dark:border-emerald-800">
              <span className="font-bold text-emerald-950 dark:text-emerald-200 uppercase">Day 7 Final State</span>
              <div>Sleep: {selectedUser.days[6].sleep_hours}h | Steps: {selectedUser.days[6].steps.toLocaleString()}</div>
              <div>Vitals: {selectedUser.days[6].vitals.bp} BP, {selectedUser.days[6].vitals.glucose} mg/dL Glucose</div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Next-Week Priority Focus</h4>
            <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Maintain 7.0h+ consistent sleep duration.</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Sustain daily active movement target.</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Continue low-sodium, nutrient-dense nutrition structure.</li>
            </ul>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/60 dark:bg-amber-950/40 p-4 text-xs text-amber-900 dark:text-amber-200">
            <Shield className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <span>SYNTHETIC DEMONSTRATION DATA — Model-generated screening indicators & non-diagnostic wellness indicators for demonstration purposes only.</span>
          </div>
        </div>
      )}
    </div>
  )
}
