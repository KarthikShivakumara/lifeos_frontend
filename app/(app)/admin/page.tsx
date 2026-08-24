"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { SiteShell } from "@/components/layout/site-shell"
import { Card, CardTitle } from "@/components/ui/card"
import { apiUrl } from "@/lib/utils"

export default function AdminPage() {
  const router = useRouter()
  const [data, setData] = useState<{ users: number; predictions: number; reports: number; activity_logs: number } | null>(null)
  useEffect(() => {
    const token = localStorage.getItem("lifeos_token") ?? ""
    if (!token) {
      router.push("/login")
      return
    }
    fetch(apiUrl("/admin/dashboard"), { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then(setData)
  }, [router])
  return (
    <SiteShell>
      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardTitle>Users</CardTitle><p className="mt-2 text-3xl font-semibold">{data?.users ?? 0}</p></Card>
        <Card><CardTitle>Predictions</CardTitle><p className="mt-2 text-3xl font-semibold">{data?.predictions ?? 0}</p></Card>
        <Card><CardTitle>Reports</CardTitle><p className="mt-2 text-3xl font-semibold">{data?.reports ?? 0}</p></Card>
        <Card><CardTitle>Logs</CardTitle><p className="mt-2 text-3xl font-semibold">{data?.activity_logs ?? 0}</p></Card>
      </div>
    </SiteShell>
  )
}
