"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { historyApi } from "@/lib/api"
import { SiteShell } from "@/components/layout/site-shell"
import { Card, CardDescription, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { HealthSnapshot } from "@/lib/types"

export default function HistoryPage() {
  const router = useRouter()
  const [snapshots, setSnapshots] = useState<HealthSnapshot[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [confirmClear, setConfirmClear] = useState<boolean>(false)

  const loadHistory = () => {
    setLoading(true)
    const token = localStorage.getItem("lifeos_token") || undefined
    historyApi
      .list(token)
      .then((res) => setSnapshots(res.snapshots))
      .catch(() => {
        // Fallback to localStorage history array
        const cached: HealthSnapshot[] = JSON.parse(localStorage.getItem("lifeos_health_history") || "[]")
        setSnapshots(cached)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadHistory()
  }, [])

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const token = localStorage.getItem("lifeos_token") || undefined
    try {
      await historyApi.delete(id, token)
    } catch {
      // Local fallback
    }
    const updated = snapshots.filter((s) => s.id !== id)
    setSnapshots(updated)
    localStorage.setItem("lifeos_health_history", JSON.stringify(updated))
  }

  const handleClearAll = async () => {
    const token = localStorage.getItem("lifeos_token") || undefined
    try {
      await historyApi.clear(token)
    } catch {
      // Local fallback
    }
    setSnapshots([])
    localStorage.setItem("lifeos_health_history", "[]")
    setConfirmClear(false)
  }

  return (
    <SiteShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Health Assessment History</h1>
            <p className="text-sm text-slate-600 mt-1">
              Complete historical record of submitted health assessments, 4-disease model evaluations, Risk Fusion scores, and personalized recommendations.
            </p>
          </div>
          {snapshots.length > 0 ? (
            confirmClear ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-rose-600 font-semibold">Are you sure?</span>
                <Button variant="secondary" onClick={() => setConfirmClear(false)}>Cancel</Button>
                <Button variant="secondary" className="bg-rose-600 text-white hover:bg-rose-700" onClick={handleClearAll}>Confirm Clear</Button>
              </div>
            ) : (
              <Button variant="secondary" className="text-rose-600 hover:text-rose-700" onClick={() => setConfirmClear(true)}>
                Clear History
              </Button>
            )
          ) : null}
        </div>

        {loading ? (
          <Card><p className="text-sm text-slate-500">Loading health assessment history...</p></Card>
        ) : snapshots.length === 0 ? (
          <Card className="p-12 text-center space-y-3">
            <div className="text-4xl">📋</div>
            <CardTitle>No Health Assessments Yet</CardTitle>
            <CardDescription>
              Complete your first universal health assessment to start tracking 4-disease risks, fusion scores, and longitudinal health trends.
            </CardDescription>
            <div className="pt-2">
              <Button onClick={() => router.push("/assessments/new" as any)}>New Assessment</Button>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4">
            {snapshots.map((snap) => {
              const rf = snap.risk_fusion as any
              const dis = snap.disease_results as any
              const dateStr = snap.timestamp ? new Date(snap.timestamp).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "Snapshot"

              const overallPct = rf?.overall_risk_percentage ?? (rf?.overall_risk_score ? (rf.overall_risk_score * 100).toFixed(1) : "-")
              const riskLevel = rf?.overall_risk_level ?? "moderate"
              const topPriority = rf?.top_priority_display_name ?? "Cardiometabolic"
              const recCount = snap.recommendations ? snap.recommendations.length : 0

              return (
                <div
                  key={snap.id}
                  onClick={() => router.push(`/history/${snap.id}` as any)}
                  className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="font-bold text-slate-900 text-base">{dateStr}</div>
                      <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full font-mono">{snap.id}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        riskLevel === "very_high"
                          ? "bg-rose-100 text-rose-700 border border-rose-200"
                          : riskLevel === "high"
                          ? "bg-amber-100 text-amber-800 border border-amber-200"
                          : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                      }`}>
                        {riskLevel.replace("_", " ")} Risk
                      </span>
                      <Button
                        variant="secondary"
                        className="text-xs text-slate-500 hover:text-rose-600 hover:border-rose-300"
                        onClick={(e) => handleDelete(snap.id, e)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-4 pt-1">
                    <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                      <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Overall Risk</div>
                      <div className="text-xl font-bold text-slate-900 mt-0.5">{overallPct}%</div>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                      <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Top Priority</div>
                      <div className="text-base font-semibold text-rose-600 mt-0.5">{topPriority}</div>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                      <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Disease Models</div>
                      <div className="text-sm font-semibold text-slate-800 mt-0.5">
                        {dis?.heart ? "❤️ " : ""}{dis?.diabetes ? "🩸 " : ""}{dis?.hypertension ? "🫀 " : ""}{dis?.obesity ? "⚖️ " : ""}
                      </div>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                      <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Recommendations</div>
                      <div className="text-base font-semibold text-indigo-600 mt-0.5">{recCount} Actions</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </SiteShell>
  )
}
