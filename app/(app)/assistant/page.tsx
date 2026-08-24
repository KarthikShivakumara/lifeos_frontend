"use client"

import { Suspense, useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { assistantApi, historyApi } from "@/lib/api"
import { SiteShell } from "@/components/layout/site-shell"
import { Card, CardDescription, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { AssistantResponse, ConversationSummary, HealthSnapshot, MessageItem } from "@/lib/types"

const SUGGESTED_QUESTIONS = [
  "Why is hypertension my highest priority?",
  "What does my overall risk score mean?",
  "What factors increased my diabetes risk?",
  "What has changed since my previous assessment?",
  "How can I improve my blood pressure risk?",
  "What do my HbA1c results mean?",
]

function AssistantContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryParam = searchParams.get("q")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [activeConvId, setActiveConvId] = useState<string | null>(null)
  const [messages, setMessages] = useState<MessageItem[]>([])

  const [inputText, setInputText] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [latestSnapshot, setLatestSnapshot] = useState<HealthSnapshot | null>(null)

  const loadConversations = () => {
    assistantApi
      .listConversations()
      .then((data) => {
        setConversations(data)
        if (data.length > 0 && !activeConvId) {
          loadThread(data[0].id)
        }
      })
      .catch(() => setConversations([]))
  }

  const loadThread = (convId: string) => {
    setActiveConvId(convId)
    assistantApi
      .getConversation(convId)
      .then((res) => setMessages(res.messages))
      .catch(() => setMessages([]))
  }

  useEffect(() => {
    loadConversations()

    if (queryParam) {
      handleSend(queryParam)
    }

    const cachedHistory: HealthSnapshot[] = JSON.parse(localStorage.getItem("lifeos_health_history") || "[]")
    if (cachedHistory.length > 0) {
      setLatestSnapshot(cachedHistory[0])
    } else {
      historyApi
        .list()
        .then((res) => {
          if (res.snapshots.length > 0) setLatestSnapshot(res.snapshots[0])
        })
        .catch(() => null)
    }
  }, [queryParam])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  const handleSend = async (textToSend?: string) => {
    const message = (textToSend || inputText).trim()
    if (!message || loading) return

    setInputText("")
    setLoading(true)

    const tempUserMsg: MessageItem = {
      id: `tmp-${Date.now()}`,
      role: "user",
      content: message,
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, tempUserMsg])

    try {
      const res: AssistantResponse = await assistantApi.chat(message, activeConvId || undefined)
      if (!activeConvId) {
        setActiveConvId(res.conversation_id)
        loadConversations()
      }

      const assistantMsg: MessageItem = {
        id: `asst-${Date.now()}`,
        role: "assistant",
        content: res.answer,
        citations: res.citations,
        safety_category: res.safety_category,
        created_at: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, assistantMsg])
    } catch {
      const errMsg: MessageItem = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: "Sorry, I am temporarily unable to connect to the Assistant service. Please try again.",
        created_at: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errMsg])
    } finally {
      setLoading(false)
    }
  }

  const handleNewChat = () => {
    setActiveConvId(null)
    setMessages([])
  }

  const handleDeleteConv = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await assistantApi.deleteConversation(convId)
      const updated = conversations.filter((c) => c.id !== convId)
      setConversations(updated)
      if (activeConvId === convId) {
        handleNewChat()
      }
    } catch {
      // Ignore
    }
  }

  const rf = latestSnapshot?.risk_fusion as any

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">LifeOS AI Health Assistant</h1>
          <p className="text-sm text-slate-600 mt-1">
            RAG-empowered educational decision support explaining risk models, TreeSHAP attributions, and clinical guidelines.
          </p>
        </div>
        <Button variant="secondary" onClick={handleNewChat} className="text-xs">
          + New Conversation
        </Button>
      </div>

      {latestSnapshot && rf ? (
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider">Active Health Context Attached</span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">Recorded: {new Date(latestSnapshot.timestamp).toLocaleDateString()}</span>
          </div>

          <div className="grid gap-3 md:grid-cols-4 text-xs pt-1">
            <div className="rounded-xl bg-white p-2.5 border border-indigo-100/80">
              <span className="text-slate-500 block text-[10px] uppercase">Overall Risk</span>
              <span className="font-bold text-slate-900 text-sm">{(rf.overall_risk_percentage ?? 0).toFixed(1)}% ({rf.overall_risk_level?.replace("_", " ")})</span>
            </div>
            <div className="rounded-xl bg-white p-2.5 border border-indigo-100/80">
              <span className="text-slate-500 block text-[10px] uppercase">Top Priority</span>
              <span className="font-bold text-rose-600 text-sm">{rf.top_priority_display_name}</span>
            </div>
            <div className="rounded-xl bg-white p-2.5 border border-indigo-100/80">
              <span className="text-slate-500 block text-[10px] uppercase">Health Score</span>
              <span className="font-bold text-slate-900 text-sm">{rf.overall_health_score} / 100</span>
            </div>
            <div className="rounded-xl bg-white p-2.5 border border-indigo-100/80">
              <span className="text-slate-500 block text-[10px] uppercase">Evaluated Models</span>
              <span className="font-semibold text-slate-700">Heart, Diabetes, HTN, Obesity</span>
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <Card className="space-y-3 p-4 h-[600px] flex flex-col justify-between">
          <div className="space-y-3">
            <div className="font-bold text-xs uppercase tracking-wider text-slate-500 border-b pb-2">
              Conversations ({conversations.length})
            </div>
            <div className="space-y-1.5 overflow-y-auto max-h-[480px]">
              {conversations.map((c) => (
                <div
                  key={c.id}
                  onClick={() => loadThread(c.id)}
                  className={`group flex items-center justify-between rounded-xl p-2.5 text-xs font-medium cursor-pointer transition-all ${
                    activeConvId === c.id ? "bg-indigo-600 text-white font-semibold shadow-xs" : "bg-slate-50 hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  <span className="truncate pr-2">{c.title}</span>
                  <button
                    onClick={(e) => handleDeleteConv(c.id, e)}
                    className={`text-[10px] opacity-0 group-hover:opacity-100 transition-opacity ${
                      activeConvId === c.id ? "text-white/80 hover:text-white" : "text-slate-400 hover:text-rose-600"
                    }`}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          <Button variant="secondary" onClick={handleNewChat} className="w-full text-xs">
            + New Conversation
          </Button>
        </Card>

        <Card className="flex flex-col justify-between h-[600px] p-5 space-y-4">
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 p-6">
                <div className="text-4xl">🤖</div>
                <CardTitle className="text-xl">How can I assist your health journey today?</CardTitle>
                <CardDescription className="max-w-md">
                  Ask about your multi-disease risk scores, TreeSHAP drivers, blood pressure/glucose guidelines, or lifestyle strategies.
                </CardDescription>

                <div className="w-full max-w-lg space-y-2 pt-2">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Suggested Questions</div>
                  <div className="grid gap-2 text-left">
                    {SUGGESTED_QUESTIONS.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(q)}
                        className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/40 hover:text-indigo-900 transition-all"
                      >
                        💬 "{q}"
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              messages.map((m) => (
                <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 space-y-2.5 text-sm ${
                      m.role === "user"
                        ? "bg-indigo-600 text-white rounded-br-none"
                        : "bg-slate-100 text-slate-900 border border-slate-200/80 rounded-bl-none shadow-2xs"
                    }`}
                  >
                    <div className="font-bold text-[11px] opacity-75 uppercase tracking-wider">
                      {m.role === "user" ? "You" : "LifeOS AI Assistant"}
                    </div>
                    <div className="leading-relaxed whitespace-pre-wrap">{m.content}</div>

                    {m.role === "assistant" && m.citations && m.citations.length > 0 ? (
                      <div className="pt-2 border-t border-slate-200/80 space-y-1.5 text-xs">
                        <div className="font-semibold text-slate-600 text-[11px] uppercase tracking-wider">Medical Sources Cited:</div>
                        <div className="grid gap-1.5">
                          {m.citations.map((cit, idx) => (
                            <a
                              key={idx}
                              href={cit.url}
                              target="_blank"
                              rel="noreferrer"
                              className="block rounded-lg bg-white p-2 border border-slate-200 text-[11px] hover:border-indigo-400 transition-colors"
                            >
                              <div className="font-bold text-slate-800">{cit.title}</div>
                              <div className="text-slate-500 text-[10px]">{cit.source}</div>
                            </a>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-slate-100 p-4 text-xs text-slate-500 animate-pulse">
                  Synthesizing health context & medical guidelines...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-200">
            <form
              className="flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
            >
              <Input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask a question about your risk score, hypertension, diabetes, or lifestyle..."
                className="flex-1"
                disabled={loading}
              />
              <Button type="submit" disabled={loading || !inputText.trim()}>
                Send
              </Button>
            </form>

            <div className="text-[10px] text-slate-500 text-center leading-tight">
              LifeOS AI Assistant is an educational decision-support tool. It does not provide medical diagnoses or replace professional clinical care.
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default function AssistantPage() {
  return (
    <SiteShell>
      <Suspense fallback={<div className="p-8 text-center text-sm text-slate-500">Loading Assistant...</div>}>
        <AssistantContent />
      </Suspense>
    </SiteShell>
  )
}
