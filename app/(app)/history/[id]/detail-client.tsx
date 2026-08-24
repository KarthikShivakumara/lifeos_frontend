"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { historyApi } from "@/lib/api"
import { SiteShell } from "@/components/layout/site-shell"
import { Card, CardDescription, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { HealthSnapshot } from "@/lib/types"

export function SnapshotDetailClient() {
  const params = useParams()
  const router = useRouter()
  const snapshotId = params?.id as string

  const [snapshot, setSnapshot] = useState<HealthSnapshot | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    if (!snapshotId) return
    const token = localStorage.getItem("lifeos_token") || undefined
    historyApi
      .get(snapshotId, token)
      .then(setSnapshot)
      .catch(() => {
        const cached: HealthSnapshot[] = JSON.parse(localStorage.getItem("lifeos_health_history") || "[]")
        const found = cached.find((s) => s.id === snapshotId)
        setSnapshot(found || null)
      })
      .finally(() => setLoading(false))
  }, [snapshotId])

  if (loading) {
    return (
      <SiteShell>
        <Card><p className="text-sm text-slate-500">Loading assessment snapshot details...</p></Card>
      </SiteShell>
    )
  }

  if (!snapshot) {
    return (
      <SiteShell>
        <Card className="p-10 text-center space-y-3">
          <CardTitle>Snapshot Not Found</CardTitle>
          <CardDescription>The requested health assessment snapshot ({snapshotId}) could not be located.</CardDescription>
          <Button onClick={() => router.push("/history" as any)}>Back to History Log</Button>
        </Card>
      </SiteShell>
    )
  }

  const inp = snapshot.assessment_input || {}
  const dis = snapshot.disease_results || {}
  const rf = snapshot.risk_fusion as any
  const recs = snapshot.recommendations || []
  const dateStr = snapshot.timestamp ? new Date(snapshot.timestamp).toLocaleString(undefined, { dateStyle: "full", timeStyle: "medium" }) : snapshot.id

  return (
    <SiteShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <Button variant="secondary" onClick={() => router.push("/history" as any)} className="mb-2">
              ← Back to History
            </Button>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Health Snapshot Details</h1>
            <p className="text-xs text-slate-500 font-mono mt-0.5">{snapshot.id} • Recorded: {dateStr}</p>
          </div>
        </div>

        {rf ? (
          <Card className="bg-slate-900 text-white space-y-4 border-slate-800">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <CardTitle className="text-lg text-white">Snapshot Risk Fusion Summary</CardTitle>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {rf.overall_risk_level?.replace("_", " ")} Risk Level
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl bg-white/5 p-3.5 border border-white/10">
                <div className="text-xs text-white/60">Overall Risk Score</div>
                <div className="text-2xl font-bold mt-0.5">{rf.overall_risk_percentage?.toFixed(1) ?? (rf.overall_risk_score * 100).toFixed(1)}%</div>
              </div>
              <div className="rounded-xl bg-white/5 p-3.5 border border-white/10">
                <div className="text-xs text-white/60">Top Priority Disease</div>
                <div className="text-xl font-bold text-rose-400 mt-0.5">{rf.top_priority_display_name}</div>
              </div>
              <div className="rounded-xl bg-white/5 p-3.5 border border-white/10">
                <div className="text-xs text-white/60">Overall Health Score</div>
                <div className="text-2xl font-bold mt-0.5">{rf.overall_health_score} / 100</div>
              </div>
            </div>
          </Card>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          {["heart", "diabetes", "hypertension", "obesity"].map((key) => {
            const res = dis[key]
            if (!res) return null
            const nameMap: Record<string, string> = { heart: "Heart Disease", diabetes: "Diabetes", hypertension: "Hypertension", obesity: "Obesity" }
            const pred = res.prediction ?? res
            const explain = res.explanation

            return (
              <Card key={key} className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <CardTitle className="text-base">{nameMap[key] || key}</CardTitle>
                  <span className="text-xs text-slate-500 font-mono">{pred.model} @ {pred.threshold}</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-slate-500">Model Risk Score:</span>
                  <span className="text-2xl font-extrabold text-slate-900">{(pred.risk_score * 100).toFixed(1)}%</span>
                </div>

                {explain?.top_contributors && explain.top_contributors.length > 0 ? (
                  <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                    <div className="font-semibold text-slate-700">Top SHAP Contributors:</div>
                    {explain.top_contributors.slice(0, 3).map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-slate-600">
                        <span>{item.human_readable}</span>
                        <span className="font-mono text-slate-500">{item.contribution > 0 ? `+${item.contribution.toFixed(3)}` : item.contribution.toFixed(3)}</span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </Card>
            )
          })}
        </div>

        {recs.length > 0 ? (
          <Card className="space-y-4">
            <CardTitle className="text-lg">Generated Recommendations ({recs.length})</CardTitle>
            <div className="grid gap-3 md:grid-cols-2">
              {recs.map((rec: any, i: number) => (
                <div key={i} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-2 text-xs">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>{rec.title}</span>
                    <span className="uppercase text-[10px] bg-slate-200 px-2 py-0.5 rounded">{rec.priority}</span>
                  </div>
                  <div className="text-slate-600">{rec.description}</div>
                  <div className="text-indigo-900 font-medium">Action: {rec.action}</div>
                </div>
              ))}
            </div>
          </Card>
        ) : null}

        <Card className="space-y-3">
          <CardTitle className="text-base">Submitted Assessment Biomarkers</CardTitle>
          <div className="grid gap-2 text-xs md:grid-cols-4">
            {Object.entries(inp).map(([k, v]) => (
              <div key={k} className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                <span className="text-slate-500 block text-[10px] uppercase font-mono">{k}</span>
                <span className="font-semibold text-slate-900">{String(v)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </SiteShell>
  )
}
