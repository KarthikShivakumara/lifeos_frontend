"use client"

import type { FormEvent } from "react"
import { useState } from "react"
import Link from "next/link"
import { authApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setMessage("")
    try {
      const formData = new FormData(event.currentTarget)
      const email = String(formData.get("email") || "")
      const response = await authApi.forgotPassword(email)
      setMessage(response.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-4 py-16">
      <Card className="w-full space-y-6">
        <div>
          <CardTitle>Reset password</CardTitle>
          <CardDescription>We prepare a secure reset flow for the account you entered.</CardDescription>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <Input name="email" type="email" placeholder="Email" required />
          <Button type="submit" className="w-full" disabled={loading}>{loading ? "Sending..." : "Send reset instructions"}</Button>
        </form>
        {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
        <Link href="/login" className="text-sm text-slate-600">Back to login</Link>
      </Card>
    </main>
  )
}
