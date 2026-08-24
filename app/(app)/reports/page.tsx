"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { SiteShell } from "@/components/layout/site-shell"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardTitle } from "@/components/ui/card"
import { reportApi, twinApi } from "@/lib/api"
import type { Report } from "@/lib/types"

export default function ReportsPage() {
  const router = useRouter()
  const [token, setToken] = useState("")
  const [reports, setReports] = useState<Report[]>([])
  const [status, setStatus] = useState("Generate a report from the latest health twin summary.")

  const loadReports = async (authToken: string) => {
    const items = await reportApi.list(authToken)
    setReports(items)
  }

  useEffect(() => {
    const stored = localStorage.getItem("lifeos_token") ?? ""
    if (!stored) {
      router.push("/login")
      return
    }
    setToken(stored)
    loadReports(stored)
  }, [router])

  const createReport = async () => {
    const twin = await twinApi.get(token)
    await reportApi.create(token, {
      report_type: "health-summary",
      title: "Latest Health Summary",
      summary: twin.summary || "A summary of the latest assessment was generated."
    })
    setStatus("Report generated successfully.")
    await loadReports(token)
  }

  return (
    <SiteShell>
      <div className="space-y-6">
        <Card className="space-y-4">
          <div>
            <CardTitle>Reports</CardTitle>
            <CardDescription>Generate, review, and export progress summaries for the health twin.</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={createReport} disabled={!token}>Generate Snapshot Report</Button>
            <span className="text-sm text-slate-600">{status}</span>
          </div>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          {reports.map((report) => (
            <Card key={report.id}>
              <CardTitle>{report.title}</CardTitle>
              <p className="mt-2 text-sm text-slate-600">{report.summary}</p>
              <div className="mt-3 text-xs uppercase tracking-wide text-slate-500">{report.report_type}</div>
            </Card>
          ))}
        </div>
      </div>
    </SiteShell>
  )
}
