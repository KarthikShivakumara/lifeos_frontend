"use client"

import type { FormEvent } from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { authApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError("")
    try {
      const formData = new FormData(event.currentTarget)
      const full_name = String(formData.get("full_name") || "")
      const email = String(formData.get("email") || "")
      const password = String(formData.get("password") || "")
      await authApi.register(full_name, email, password)
      router.push("/login")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to register")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-4 py-16">
      <Card className="w-full space-y-6">
        <div>
          <CardTitle>Create account</CardTitle>
          <CardDescription>Start your preventive health journey with a secure profile.</CardDescription>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <Input name="full_name" placeholder="Full name" required />
          <Input name="email" type="email" placeholder="Email" required />
          <Input name="password" type="password" placeholder="Password" required minLength={8} maxLength={72} />
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={loading}>{loading ? "Creating..." : "Register"}</Button>
        </form>
        <div className="text-sm text-slate-600">
          Already have an account? <Link href="/login">Login</Link>
        </div>
      </Card>
    </main>
  )
}
