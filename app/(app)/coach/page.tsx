"use client"

import type { FormEvent } from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { SiteShell } from "@/components/layout/site-shell"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { coachApi } from "@/lib/api"

export default function CoachPage() {
  const router = useRouter()
  const [token, setToken] = useState("")
  const [reply, setReply] = useState("Ask about sleep, diet, risk summaries, or your latest assessment.")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("lifeos_token") ?? ""
    if (!stored) {
      router.push("/login")
      return
    }
    setToken(stored)
  }, [router])

  const ask = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!token) {
      return
    }
    setLoading(true)
    const formData = new FormData(event.currentTarget)
    const message = String(formData.get("message") || "")
    const result = await coachApi.chat(token, message)
    setReply(`${result.reply} ${result.safety_note}`)
    setLoading(false)
  }

  return (
    <SiteShell>
      <Card className="space-y-5">
        <div>
          <CardTitle>Gemini AI Coach Interface</CardTitle>
          <CardDescription>Context-aware assistant layer with safe health guidance and report explanations.</CardDescription>
        </div>
        <form onSubmit={ask} className="flex gap-3">
          <Input name="message" placeholder="Ask a health question" />
          <Button type="submit" disabled={loading || !token}>{loading ? "..." : "Ask"}</Button>
        </form>
        <div className="rounded-3xl bg-slate-900 p-5 text-white">
          <p className="text-sm text-white/70">Coach response</p>
          <p className="mt-2 text-lg">{reply}</p>
        </div>
      </Card>
    </SiteShell>
  )
}
