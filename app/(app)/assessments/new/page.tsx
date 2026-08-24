"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { SiteShell } from "@/components/layout/site-shell"
import { AssessmentForm } from "@/components/forms/assessment-form"

export default function NewAssessmentPage() {
  const router = useRouter()
  const [token, setToken] = useState("")

  useEffect(() => {
    const stored = localStorage.getItem("lifeos_token") ?? ""
    if (!stored) {
      router.push("/login")
      return
    }
    setToken(stored)
  }, [router])

  return (
    <SiteShell>
      <AssessmentForm token={token} onCreated={() => router.push("/dashboard")} />
    </SiteShell>
  )
}
