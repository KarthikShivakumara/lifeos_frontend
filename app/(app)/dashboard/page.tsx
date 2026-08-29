"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bot,
  Brain,
  CheckCircle2,
  ChevronRight,
  Clock,
  Heart,
  Info,
  Layers,
  Moon,
  RefreshCw,
  Scale,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  Utensils,
  Zap,
} from "lucide-react"
import {
  assessmentApi,
  historyApi,
  predictionApi,
  recommendationApi,
  reportApi,
  sensorApi,
  twinApi,
} from "@/lib/api"
import { SiteShell } from "@/components/layout/site-shell"
import { Card, CardDescription, CardTitle } from "@/components/ui/card"
import { RiskChart } from "@/components/charts/risk-chart"
import type {
  Assessment,
  CKDPredictionResponse,
  CombinedDiabetesResult,
  CombinedHeartResult,
  CombinedHypertensionResult,
  CombinedObesityResult,
  HealthSnapshot,
  HealthTrendSummary,
  Prediction,
  Recommendation,
  RecommendationEngineResponse,
  Report,
  RiskFusionResult,
  SensorReading,
  StrokePredictionResponse,
} from "@/lib/types"

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [twin, setTwin] = useState<any>(null)
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [sensors, setSensors] = useState<SensorReading[]>([])

  const [heartResult, setHeartResult] = useState<CombinedHeartResult | null>(null)
  const [diabetesResult, setDiabetesResult] = useState<CombinedDiabetesResult | null>(null)
  const [hypertensionResult, setHypertensionResult] = useState<CombinedHypertensionResult | null>(null)
  const [obesityResult, setObesityResult] = useState<CombinedObesityResult | null>(null)
  const [strokeResult, setStrokeResult] = useState<StrokePredictionResponse | null>(null)
  const [ckdResult, setCkdResult] = useState<CKDPredictionResponse | null>(null)

  const [fusionResult, setFusionResult] = useState<RiskFusionResult | null>(null)
  const [recommendationResult, setRecommendationResult] = useState<RecommendationEngineResponse | null>(null)
  const [trendSummary, setTrendSummary] = useState<HealthTrendSummary | null>(null)
  const [showAllRecs, setShowAllRecs] = useState<boolean>(false)
  const [aiQuestion, setAiQuestion] = useState<string>("")
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>("")

  useEffect(() => {
    const stored = localStorage.getItem("lifeos_token")
    if (!stored) {
      router.push("/login")
      return
    }

    setLastUpdatedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))

    const cachedHeart = localStorage.getItem("lifeos_heart_result")
    if (cachedHeart) {
      try { setHeartResult(JSON.parse(cachedHeart)) } catch { setHeartResult(null) }
    }

    const cachedDiabetes = localStorage.getItem("lifeos_diabetes_result")
    if (cachedDiabetes) {
      try { setDiabetesResult(JSON.parse(cachedDiabetes)) } catch { setDiabetesResult(null) }
    }

    const cachedHypertension = localStorage.getItem("lifeos_hypertension_result")
    if (cachedHypertension) {
      try { setHypertensionResult(JSON.parse(cachedHypertension)) } catch { setHypertensionResult(null) }
    }

    const cachedObesity = localStorage.getItem("lifeos_obesity_result")
    if (cachedObesity) {
      try { setObesityResult(JSON.parse(cachedObesity)) } catch { setObesityResult(null) }
    }

    const cachedStroke = localStorage.getItem("lifeos_stroke_result")
    if (cachedStroke) {
      try { setStrokeResult(JSON.parse(cachedStroke)) } catch { setStrokeResult(null) }
    }

    const cachedCKD = localStorage.getItem("lifeos_ckd_result")
    if (cachedCKD) {
      try { setCkdResult(JSON.parse(cachedCKD)) } catch { setCkdResult(null) }
    }

    const cachedFusion = localStorage.getItem("lifeos_risk_fusion_result")
    if (cachedFusion) {
      try { setFusionResult(JSON.parse(cachedFusion)) } catch { setFusionResult(null) }
    }

    const cachedRecs = localStorage.getItem("lifeos_recommendations_result")
    if (cachedRecs) {
      try { setRecommendationResult(JSON.parse(cachedRecs)) } catch { setRecommendationResult(null) }
    }

    const cachedHistory: HealthSnapshot[] = JSON.parse(localStorage.getItem("lifeos_health_history") || "[]")
    if (cachedHistory.length > 0) {
      historyApi.trends(cachedHistory).then(setTrendSummary).catch(() => null)
    }

    Promise.all([
      twinApi.get(stored).catch(() => null),
      assessmentApi.list(stored).catch(() => []),
      predictionApi.list(stored).catch(() => []),
      recommendationApi.list(stored).catch(() => []),
      reportApi.list(stored).catch(() => []),
      sensorApi.list(stored).catch(() => []),
    ])
      .then(([twinData, assessData, predData, recData, reportData, sensorData]) => {
        if (twinData) setTwin(twinData)
        if (assessData) setAssessments(assessData)
        if (predData) setPredictions(predData)
        if (recData) setRecommendations(recData)
        if (reportData) setReports(reportData)
        if (sensorData) setSensors(sensorData)
      })
      .finally(() => setLoading(false))
  }, [router])

  const chartSeries = trendSummary && trendSummary.trend_points.length > 0
    ? trendSummary.trend_points.map((pt, idx) => ({
        name: pt.timestamp ? new Date(pt.timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : `S${idx + 1}`,
        score: pt.overall_risk_score,
      }))
    : predictions.slice(0, 5).reverse().map((p, i) => ({
        name: p.created_at ? new Date(p.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : `P${i + 1}`,
        score: p.overall_health_risk,
      }))

  const heartPred = heartResult?.prediction
  const heartExplain = heartResult?.explanation

  const diabetesPred = diabetesResult?.prediction
  const diabetesExplain = diabetesResult?.explanation

  const htnPred = hypertensionResult?.prediction
  const htnExplain = hypertensionResult?.explanation

  const obesityPred = obesityResult?.prediction
  const obesityExplain = obesityResult?.explanation

  const strokePred = strokeResult
  const ckdPred = ckdResult

  const activeRecs = recommendationResult
    ? (showAllRecs ? recommendationResult.recommendations : recommendationResult.top_recommendations)
    : []

  const handleAskAI = (e: React.FormEvent) => {
    e.preventDefault()
    if (!aiQuestion.trim()) return
    router.push(`/assistant?q=${encodeURIComponent(aiQuestion)}` as any)
  }

  // Audited Sleep Classification Logic
  const rawSleep = Number(heartResult?.rawInput?.sleep_hours ?? 7.0)
  const getSleepClassification = (hours: number) => {
    if (hours < 6) return { label: "Insufficient Rest", color: "text-rose-700 bg-rose-50 border-rose-200" }
    if (hours <= 7) return { label: "Moderate Rest", color: "text-amber-700 bg-amber-50 border-amber-200" }
    if (hours <= 9) return { label: "Optimal Rest", color: "text-emerald-700 bg-emerald-50 border-emerald-200" }
    return { label: "Extended Rest", color: "text-indigo-700 bg-indigo-50 border-indigo-200" }
  }
  const sleepStatus = getSleepClassification(rawSleep)

  // Audited Physical Activity Classification Logic
  const rawFreq = String(heartResult?.rawInput?.exercise_frequency ?? "active").toLowerCase()
  const isPhysicallyActive = ["active", "high", "moderate", "regular"].includes(rawFreq)
  const activityLevelText = isPhysicallyActive ? "Physically Active" : "Sedentary"
  const activityRecommendationText = isPhysicallyActive ? "Active Lifestyle Maintained" : "Action: Increase Activity"
  const activityColor = isPhysicallyActive ? "text-emerald-700 bg-emerald-50 border-emerald-200" : "text-amber-700 bg-amber-50 border-amber-200"

  // Risk Color Mapping Helper
  const getRiskBadge = (level?: string) => {
    const l = (level || "low").toLowerCase()
    if (l === "very_high" || l === "very high") {
      return { bg: "bg-rose-50 border-rose-200 text-rose-700", dot: "bg-rose-500", label: "Very High" }
    }
    if (l === "high") {
      return { bg: "bg-orange-50 border-orange-200 text-orange-700", dot: "bg-orange-500", label: "High Risk" }
    }
    if (l === "moderate") {
      return { bg: "bg-amber-50 border-amber-200 text-amber-700", dot: "bg-amber-500", label: "Moderate" }
    }
    return { bg: "bg-emerald-50 border-emerald-200 text-emerald-700", dot: "bg-emerald-500", label: "Low Risk" }
  }

  return (
    <SiteShell>
      <div className="space-y-6">
        {/* Header Banner */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Preventive Health Intelligence
              </span>
              {lastUpdatedTime && (
                <span className="text-xs text-slate-400">· Updated {lastUpdatedTime}</span>
              )}
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Integrated Clinical Risk & Explainability Dashboard
            </h1>
            <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
              Screening 6 validated clinical risk models (Heart, Diabetes, Hypertension, Obesity, Stroke, CKD) using TreeSHAP attributions & Risk Fusion.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:self-start">
            <button
              onClick={() => router.push("/assessments/new")}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-brand-700 transition"
            >
              <Stethoscope className="h-4 w-4" />
              New Assessment
            </button>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition"
              title="Refresh Dashboard"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Quick Assistant Query Strip */}
        <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/80 via-white to-sky-50/50 p-4 shadow-xs">
          <form onSubmit={handleAskAI} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center gap-2 text-indigo-900 font-semibold text-xs whitespace-nowrap">
              <Bot className="h-4 w-4 text-brand-600" />
              <span>Ask AI Copilot:</span>
            </div>
            <input
              type="text"
              placeholder="Ask LifeOS why your hypertension or diabetes screening indicator is elevated..."
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
              className="flex-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
            <button
              type="submit"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition"
            >
              Query Assistant <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>

        {/* Quick System Summary Pills */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-xs">
            <div className="text-[11px] font-medium text-slate-500">Clinical Screening</div>
            <div className="mt-1 text-lg font-bold text-slate-900">6 Verticals</div>
            <div className="text-[10px] text-slate-400">Heart, Diabetes, HTN, Obesity, Stroke, CKD</div>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-xs">
            <div className="text-[11px] font-medium text-slate-500">Wellness Signals</div>
            <div className="mt-1 text-lg font-bold text-slate-900">3 Subsystems</div>
            <div className="text-[10px] text-slate-400">Sleep, Physical Activity, USDA Nutrition</div>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-xs">
            <div className="text-[11px] font-medium text-slate-500">Risk Fusion</div>
            <div className="mt-1 text-lg font-bold text-brand-700 capitalize">
              {fusionResult ? `${fusionResult.overall_risk_level.replace("_", " ")} (${fusionResult.overall_risk_percentage.toFixed(1)}%)` : "Evaluated"}
            </div>
            <div className="text-[10px] text-slate-400">Composite Screening Index</div>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-xs">
            <div className="text-[11px] font-medium text-slate-500">Recommendations</div>
            <div className="mt-1 text-lg font-bold text-slate-900">
              {recommendationResult ? `${recommendationResult.total_count} Actions` : "Active"}
            </div>
            <div className="text-[10px] text-slate-400">Priority-Graded Guidance</div>
          </div>
        </div>

        {/* Layer A — Clinical Disease Risk Screening (6 Verticals) */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div>
              <h2 className="text-base font-bold tracking-tight text-slate-900">
                Layer A — Clinical Disease Risk Screening (6 Verticals)
              </h2>
              <p className="text-xs text-slate-500">
                Model-generated screening indicators generated by validated ML disease models.
              </p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
              <Info className="h-3 w-3 text-slate-400" />
              Not a medical diagnosis
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* 1. Heart Disease */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 shadow-xs hover:border-slate-300 transition">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                    <Heart className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Heart Disease</div>
                    <div className="text-[10px] text-slate-400 font-mono">XGBoost @ 0.40</div>
                  </div>
                </div>
                {heartPred && (
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${getRiskBadge(heartPred.risk_level).bg}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${getRiskBadge(heartPred.risk_level).dot}`} />
                    {getRiskBadge(heartPred.risk_level).label}
                  </span>
                )}
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <div className="text-3xl font-extrabold tracking-tight text-slate-900">
                  {heartPred ? `${(heartPred.risk_score * 100).toFixed(1)}%` : "Pending"}
                </div>
                <button
                  onClick={() => router.push("/assessments/new")}
                  className="text-xs font-semibold text-brand-600 hover:text-brand-800 transition"
                >
                  {heartPred ? "Update →" : "Assess →"}
                </button>
              </div>
            </div>

            {/* 2. Diabetes */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 shadow-xs hover:border-slate-300 transition">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Diabetes Mellitus</div>
                    <div className="text-[10px] text-slate-400 font-mono">LightGBM @ 0.70</div>
                  </div>
                </div>
                {diabetesPred && (
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${getRiskBadge(diabetesPred.risk_level).bg}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${getRiskBadge(diabetesPred.risk_level).dot}`} />
                    {getRiskBadge(diabetesPred.risk_level).label}
                  </span>
                )}
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <div className="text-3xl font-extrabold tracking-tight text-slate-900">
                  {diabetesPred ? `${(diabetesPred.risk_score * 100).toFixed(1)}%` : "Pending"}
                </div>
                <button
                  onClick={() => router.push("/assessments/new")}
                  className="text-xs font-semibold text-brand-600 hover:text-brand-800 transition"
                >
                  {diabetesPred ? "Update →" : "Assess →"}
                </button>
              </div>
            </div>

            {/* 3. Hypertension */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 shadow-xs hover:border-slate-300 transition">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <Zap className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Hypertension</div>
                    <div className="text-[10px] text-slate-400 font-mono">XGBoost @ 0.60</div>
                  </div>
                </div>
                {htnPred && (
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${getRiskBadge(htnPred.risk_level).bg}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${getRiskBadge(htnPred.risk_level).dot}`} />
                    {getRiskBadge(htnPred.risk_level).label}
                  </span>
                )}
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <div className="text-3xl font-extrabold tracking-tight text-slate-900">
                  {htnPred ? `${(htnPred.risk_score * 100).toFixed(1)}%` : "Pending"}
                </div>
                <button
                  onClick={() => router.push("/assessments/new")}
                  className="text-xs font-semibold text-brand-600 hover:text-brand-800 transition"
                >
                  {htnPred ? "Update →" : "Assess →"}
                </button>
              </div>
            </div>

            {/* 4. Obesity Risk */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 shadow-xs hover:border-slate-300 transition">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <Scale className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Obesity (Lifestyle)</div>
                    <div className="text-[10px] text-slate-400 font-mono">LightGBM @ 0.50</div>
                  </div>
                </div>
                {obesityPred && (
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${getRiskBadge(obesityPred.risk_level).bg}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${getRiskBadge(obesityPred.risk_level).dot}`} />
                    {getRiskBadge(obesityPred.risk_level).label}
                  </span>
                )}
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <div className="text-3xl font-extrabold tracking-tight text-slate-900">
                  {obesityPred ? `${(obesityPred.risk_score * 100).toFixed(1)}%` : "Pending"}
                </div>
                <button
                  onClick={() => router.push("/assessments/new")}
                  className="text-xs font-semibold text-brand-600 hover:text-brand-800 transition"
                >
                  {obesityPred ? "Update →" : "Assess →"}
                </button>
              </div>
            </div>

            {/* 5. Stroke Risk */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 shadow-xs hover:border-slate-300 transition">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                    <Brain className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Stroke Risk</div>
                    <div className="text-[10px] text-slate-400 font-mono">LightGBM @ 0.50</div>
                  </div>
                </div>
                {strokePred && (
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${getRiskBadge(strokePred.risk_level).bg}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${getRiskBadge(strokePred.risk_level).dot}`} />
                    {getRiskBadge(strokePred.risk_level).label}
                  </span>
                )}
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <div className="text-3xl font-extrabold tracking-tight text-slate-900">
                  {strokePred ? `${(strokePred.risk_score * 100).toFixed(1)}%` : "Pending"}
                </div>
                <button
                  onClick={() => router.push("/assessments/new")}
                  className="text-xs font-semibold text-brand-600 hover:text-brand-800 transition"
                >
                  {strokePred ? "Update →" : "Assess →"}
                </button>
              </div>
            </div>

            {/* 6. Chronic Kidney Disease */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 shadow-xs hover:border-slate-300 transition">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                    <Layers className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Chronic Kidney Disease</div>
                    <div className="text-[10px] text-slate-400 font-mono">XGBoost @ 0.33</div>
                  </div>
                </div>
                {ckdPred && (
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${getRiskBadge(ckdPred.risk_level).bg}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${getRiskBadge(ckdPred.risk_level).dot}`} />
                    {getRiskBadge(ckdPred.risk_level).label}
                  </span>
                )}
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <div className="text-3xl font-extrabold tracking-tight text-slate-900">
                  {ckdPred ? `${(ckdPred.risk_score * 100).toFixed(1)}%` : "Pending"}
                </div>
                <button
                  onClick={() => router.push("/assessments/new")}
                  className="text-xs font-semibold text-brand-600 hover:text-brand-800 transition"
                >
                  {ckdPred ? "Update →" : "Assess →"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Fusion Summary Card */}
        {fusionResult && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-brand-600" />
                  Risk Fusion Composite Screening Summary
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Deterministic fusion score derived from Layer A model outputs.
                </p>
              </div>
              <span className={`self-start sm:self-auto rounded-full border px-3 py-0.5 text-xs font-bold uppercase tracking-wider ${getRiskBadge(fusionResult.overall_risk_level).bg}`}>
                {fusionResult.overall_risk_level.replace("_", " ")} Level
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
                <div className="text-[11px] font-semibold text-slate-500 uppercase">Composite Index</div>
                <div className="text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
                  {fusionResult.overall_risk_percentage.toFixed(1)}%
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Weighted Composite Score</div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
                <div className="text-[11px] font-semibold text-slate-500 uppercase">Top Priority Disease</div>
                <div className="text-xl font-bold tracking-tight text-rose-600 mt-0.5">
                  {fusionResult.top_priority_display_name}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Score: {(fusionResult.top_priority_score * 100).toFixed(1)}%
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
                <div className="text-[11px] font-semibold text-slate-500 uppercase">Evaluated Models</div>
                <div className="text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
                  {fusionResult.available_diseases_count} / 6
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Heart, Diabetes, HTN, Obesity, Stroke, CKD</div>
              </div>
            </div>

            {/* Disease Ranking Table */}
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 pt-1">
              {fusionResult.disease_ranking.map((item) => (
                <div key={item.disease} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-400">#{item.rank}</span>
                    <span className="font-semibold text-slate-800">{item.display_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{item.risk_percentage.toFixed(1)}%</span>
                    <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-extrabold uppercase ${getRiskBadge(item.risk_level).bg}`}>
                      {item.risk_level.replace("_", " ")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Layer B — Wellness Intelligence */}
        <div className="space-y-3">
          <div>
            <h2 className="text-base font-bold tracking-tight text-slate-900">
              Layer B — Wellness & Lifestyle Intelligence
            </h2>
            <p className="text-xs text-slate-500">
              Non-diagnostic lifestyle signals derived from reported daily habits.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {/* Sleep Card */}
            <div
              onClick={() => router.push("/sleep")}
              className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2 shadow-xs hover:border-indigo-400 cursor-pointer transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-900">
                  <Moon className="h-4 w-4 text-indigo-600" />
                  <span>Sleep Intelligence</span>
                </div>
                <span className="rounded-full border px-2 py-0.5 text-[10px] font-bold ${sleepStatus.color}">
                  {sleepStatus.label}
                </span>
              </div>
              <div className="text-2xl font-extrabold text-slate-900 pt-1">
                {rawSleep} hrs
              </div>
              <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
                <span className="text-indigo-600 font-semibold hover:underline">Open Sleep Lab →</span>
                <span className="text-[10px] text-slate-400">Non-diagnostic</span>
              </div>
            </div>

            {/* Activity Card */}
            <div
              onClick={() => router.push("/activity")}
              className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2 shadow-xs hover:border-sky-400 cursor-pointer transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-sky-900">
                  <Activity className="h-4 w-4 text-sky-600" />
                  <span>Physical Activity</span>
                </div>
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${activityColor}`}>
                  {activityLevelText}
                </span>
              </div>
              <div className="text-2xl font-extrabold text-slate-900 pt-1">
                {activityLevelText}
              </div>
              <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
                <span className="text-sky-600 font-semibold hover:underline">Calorie & Steps Engine →</span>
                <span className="text-[10px] text-slate-400">Non-diagnostic</span>
              </div>
            </div>

            {/* Nutrition Card */}
            <div
              onClick={() => router.push("/nutrition")}
              className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2 shadow-xs hover:border-emerald-400 cursor-pointer transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                  <Utensils className="h-4 w-4 text-emerald-600" />
                  <span>Nutrition Intelligence</span>
                </div>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  89k Foods
                </span>
              </div>
              <div className="text-2xl font-extrabold text-slate-900 pt-1 capitalize">
                {String(heartResult?.rawInput?.diet_quality || "Good Quality")}
              </div>
              <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
                <span className="text-emerald-600 font-semibold hover:underline">Open Meal Diary →</span>
                <span className="text-[10px] text-slate-400">Non-diagnostic</span>
              </div>
            </div>
          </div>
        </div>

        {/* TreeSHAP Feature Attribution Insights */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-xs">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-brand-600" />
              TreeSHAP Feature Attribution Insights
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Quantitative feature attributions explaining model behavior. Attributions indicate feature contribution, not clinical causation.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Heart Model SHAP */}
            {heartExplain?.top_contributors && (
              <div className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                  <span className="text-xs font-bold text-slate-900">❤️ Heart Model Attributions</span>
                  <span className="text-[10px] font-mono text-slate-400">XGBoost</span>
                </div>
                <div className="space-y-2.5 text-xs">
                  {heartExplain.top_contributors.slice(0, 4).map((contrib, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center justify-between font-medium text-slate-700 text-[11px]">
                        <span>{contrib.human_readable}</span>
                        <span className={`font-mono font-bold ${contrib.direction === "increases_risk" ? "text-rose-600" : "text-emerald-600"}`}>
                          {contrib.direction === "increases_risk" ? "+" : ""}{contrib.contribution.toFixed(4)}
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${contrib.direction === "increases_risk" ? "bg-rose-500" : "bg-emerald-500"}`}
                          style={{ width: `${Math.min(Math.abs(contrib.contribution) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hypertension Model SHAP */}
            {htnExplain?.top_contributors && (
              <div className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                  <span className="text-xs font-bold text-slate-900">🫀 Hypertension Model Attributions</span>
                  <span className="text-[10px] font-mono text-slate-400">XGBoost</span>
                </div>
                <div className="space-y-2.5 text-xs">
                  {htnExplain.top_contributors.slice(0, 4).map((contrib, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center justify-between font-medium text-slate-700 text-[11px]">
                        <span>{contrib.human_readable}</span>
                        <span className={`font-mono font-bold ${contrib.direction === "increases_risk" ? "text-rose-600" : "text-emerald-600"}`}>
                          {contrib.direction === "increases_risk" ? "+" : ""}{contrib.contribution.toFixed(4)}
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${contrib.direction === "increases_risk" ? "bg-rose-500" : "bg-emerald-500"}`}
                          style={{ width: `${Math.min(Math.abs(contrib.contribution) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Personalized Recommendations */}
        {recommendationResult && activeRecs.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Personalized Health Recommendations</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Actionable guidance generated from risk priorities, SHAP attributions, and lifestyle inputs.
                </p>
              </div>
              <button
                onClick={() => setShowAllRecs(!showAllRecs)}
                className="text-xs font-semibold text-brand-600 hover:text-brand-800 transition"
              >
                {showAllRecs ? "Show Top 5" : `View All (${recommendationResult.total_count})`}
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {activeRecs.map((rec) => (
                <div key={rec.id} className="rounded-xl border border-slate-200/80 bg-slate-50/40 p-4 space-y-2.5 shadow-2xs hover:border-slate-300 transition">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded-md">
                      {rec.category.replace("_", " ")}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      rec.priority === "urgent"
                        ? "bg-rose-100 text-rose-700 border border-rose-200"
                        : rec.priority === "high"
                        ? "bg-amber-100 text-amber-800 border border-amber-200"
                        : "bg-indigo-100 text-indigo-700 border border-indigo-200"
                    }`}>
                      {rec.priority} Priority
                    </span>
                  </div>

                  <div className="font-bold text-slate-900 text-xs sm:text-sm">{rec.title}</div>
                  <div className="text-xs text-slate-600 leading-snug">{rec.description}</div>

                  <div className="rounded-lg bg-white p-2.5 text-xs space-y-1 border border-slate-100">
                    <div className="font-semibold text-slate-800 text-[11px]">Recommended Action:</div>
                    <div className="text-slate-600 text-[11px] leading-relaxed">{rec.action}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Longitudinal Risk Chart & System Overview */}
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <RiskChart data={chartSeries} />

          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900">System Architecture Overview</h3>
            <div className="space-y-3 text-xs">
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 space-y-1">
                <div className="font-bold text-slate-900">6 Validated Disease Models</div>
                <div className="text-slate-600 leading-relaxed">
                  Heart (XGBoost @ 0.40), Diabetes (LightGBM @ 0.70), Hypertension (XGBoost @ 0.60), Obesity (LightGBM @ 0.50), Stroke (LightGBM @ 0.50), CKD (XGBoost @ 0.33).
                </div>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 space-y-1">
                <div className="font-bold text-slate-900">Attached RAG Context</div>
                <div className="text-slate-600 leading-relaxed">
                  Active user health snapshot attached to Gemini AI Assistant queries for personalized, safety-guardrailed responses.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SiteShell>
  )
}
