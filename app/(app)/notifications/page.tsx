"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { notificationsApi } from "@/lib/api"
import { SiteShell } from "@/components/layout/site-shell"
import { Card, CardDescription, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { NotificationItem } from "@/lib/types"

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadOnly, setUnreadOnly] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)
  const [unreadCount, setUnreadCount] = useState<number>(0)

  const fetchNotifications = (filterUnread = unreadOnly) => {
    setLoading(true)
    notificationsApi
      .list(filterUnread)
      .then((res) => {
        setNotifications(res.notifications)
        setUnreadCount(res.unread_count)
      })
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchNotifications()
  }, [unreadOnly])

  const handleMarkRead = async (id: string) => {
    try {
      await notificationsApi.markRead(id)
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)))
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch {
      // Ignore
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch {
      // Ignore
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await notificationsApi.delete(id)
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    } catch {
      // Ignore
    }
  }

  // Group notifications visually by Today, Yesterday, Earlier
  const groupNotifications = (items: NotificationItem[]) => {
    const today: NotificationItem[] = []
    const yesterday: NotificationItem[] = []
    const earlier: NotificationItem[] = []

    const now = new Date()
    const todayStr = now.toDateString()
    const yest = new Date(now)
    yest.setDate(yest.getDate() - 1)
    const yestStr = yest.toDateString()

    items.forEach((item) => {
      const itemDate = new Date(item.created_at).toDateString()
      if (itemDate === todayStr) today.push(item)
      else if (itemDate === yestStr) yesterday.push(item)
      else earlier.push(item)
    })

    return { today, yesterday, earlier }
  }

  const groups = groupNotifications(notifications)

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-rose-100 text-rose-800 border-rose-200"
      case "high":
        return "bg-amber-100 text-amber-800 border-amber-200"
      case "moderate":
        return "bg-indigo-100 text-indigo-800 border-indigo-200"
      default:
        return "bg-slate-100 text-slate-700 border-slate-200"
    }
  }

  return (
    <SiteShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Health Notifications & Alerts</h1>
            <p className="text-sm text-slate-600 mt-1">
              Personalized, rule-based screening reminders and risk threshold notifications.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <Button variant="secondary" onClick={handleMarkAllRead} className="text-xs">
                ✓ Mark All Read
              </Button>
            )}
            <div className="flex items-center rounded-xl bg-slate-100 p-1 text-xs font-semibold">
              <button
                onClick={() => setUnreadOnly(false)}
                className={`rounded-lg px-3 py-1.5 transition-all ${!unreadOnly ? "bg-white shadow-xs text-slate-900" : "text-slate-500"}`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setUnreadOnly(true)}
                className={`rounded-lg px-3 py-1.5 transition-all ${unreadOnly ? "bg-white shadow-xs text-slate-900" : "text-slate-500"}`}
              >
                Unread ({unreadCount})
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <Card className="p-8 text-center text-slate-500 text-sm animate-pulse">Loading health notifications...</Card>
        ) : notifications.length === 0 ? (
          <Card className="p-12 text-center space-y-3">
            <div className="text-4xl">🔔</div>
            <CardTitle className="text-lg">No Notifications</CardTitle>
            <CardDescription className="max-w-md mx-auto text-xs">
              {unreadOnly ? "You have read all your health notifications." : "No health notifications have been generated yet. Complete an assessment to generate risk insights."}
            </CardDescription>
          </Card>
        ) : (
          <div className="space-y-6">
            {[
              { title: "Today", list: groups.today },
              { title: "Yesterday", list: groups.yesterday },
              { title: "Earlier", list: groups.earlier },
            ].map(
              (g) =>
                g.list.length > 0 && (
                  <div key={g.title} className="space-y-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500">{g.title}</div>
                    <div className="grid gap-3">
                      {g.list.map((n) => (
                        <Card
                          key={n.id}
                          className={`p-4 transition-all border ${
                            !n.is_read ? "bg-indigo-50/30 border-indigo-200/80 shadow-xs" : "bg-white border-slate-200/80 opacity-90"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1.5 flex-1">
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getPriorityBadgeClass(n.priority)}`}>
                                  {n.priority}
                                </span>
                                <span className="text-xs font-bold text-slate-900">{n.title}</span>
                                {!n.is_read && <span className="h-2 w-2 rounded-full bg-indigo-600"></span>}
                              </div>
                              <p className="text-xs text-slate-700 leading-relaxed">{n.message}</p>
                              <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1 font-mono">
                                <span>{new Date(n.created_at).toLocaleString()}</span>
                                {n.action_url && (
                                  <Link href={n.action_url as any} className="font-semibold text-indigo-600 hover:underline">
                                    View Action →
                                  </Link>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {!n.is_read && (
                                <button
                                  onClick={() => handleMarkRead(n.id)}
                                  className="text-xs text-indigo-600 font-medium hover:underline px-2 py-1"
                                >
                                  Mark Read
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(n.id)}
                                className="text-xs text-slate-400 hover:text-rose-600 px-2 py-1"
                                title="Dismiss notification"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )
            )}
          </div>
        )}
      </div>
    </SiteShell>
  )
}
