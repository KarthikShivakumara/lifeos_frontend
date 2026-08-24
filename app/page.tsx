"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Brain, ShieldCheck, Sparkles, Waves } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

const features = [
  { title: "Multi-Agent Intelligence", desc: "Prediction, coaching, recommendation, and IoT ingestion are split into clean service boundaries.", icon: Brain },
  { title: "Explainable Health Risk", desc: "Built-in feature attribution and transparent risk breakdowns keep the system decision-support only.", icon: ShieldCheck },
  { title: "Premium SaaS UX", desc: "Glassmorphism, motion, dashboards, and responsive layouts tuned for a polished presentation.", icon: Sparkles }
]

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("lifeos_token")
    if (token) {
      router.push("/dashboard")
    }
  }, [router])

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <section className="glass overflow-hidden rounded-[36px] p-8 md:p-12">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-slate-700">
              <Waves className="h-4 w-4 text-brand-600" />
              LifeOS: preventive health intelligence
            </div>
            <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-slate-950 md:text-7xl">
              Predict lifestyle risk before disease patterns take hold.
            </h1>
            <p className="max-w-2xl text-lg text-slate-600">
              LifeOS combines health assessments, digital health twins, explainable prediction models, and an AI coach into one production-ready preventive care platform.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/login"><Button>Enter Platform</Button></Link>
              <Link href="/register"><Button variant="ghost" className="bg-white/75">Create Account</Button></Link>
            </div>
          </div>
          <div className="grid gap-4">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={feature.title} className="animate-floaty" style={{ animationDelay: `${index * 0.6}s` }}>
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900">{feature.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{feature.desc}</p>
                </Card>
              )
            })}
          </div>
        </div>
      </section>
    </main>
  )
}
