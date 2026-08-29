"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Activity,
  Bell,
  Bot,
  Brain,
  FileText,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Radar,
  Settings,
  ShieldCheck,
  Stethoscope,
  User,
  Utensils,
  X,
} from "lucide-react"
import { notificationsApi } from "@/lib/api"
import { cn } from "@/lib/utils"

interface NavGroup {
  group: string
  items: Array<{
    href: string
    label: string
    icon: any
  }>
}

const navGroups: NavGroup[] = [
  {
    group: "OVERVIEW",
    items: [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    group: "HEALTH",
    items: [
      { href: "/assessments/new", label: "Assessment", icon: Stethoscope },
      { href: "/assistant", label: "AI Assistant", icon: Bot },
      { href: "/history", label: "History & Trends", icon: History },
      { href: "/notifications", label: "Notifications", icon: Bell },
    ],
  },
  {
    group: "WELLNESS",
    items: [
      { href: "/nutrition", label: "Nutrition", icon: Utensils },
      { href: "/activity", label: "Activity", icon: Activity },
      { href: "/sleep", label: "Sleep", icon: Moon },
      { href: "/stress", label: "Stress", icon: Brain },
    ],
  },

  {
    group: "INSIGHTS",
    items: [
      { href: "/coach", label: "AI Coach", icon: Bot },
      { href: "/reports", label: "Reports & Demo", icon: FileText },
      { href: "/sensors", label: "Sensors", icon: Radar },
    ],
  },
  {
    group: "SYSTEM",
    items: [
      { href: "/settings", label: "Settings", icon: Settings },
      { href: "/admin", label: "Admin", icon: ShieldCheck },
    ],
  },
]

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [unreadCount, setUnreadCount] = useState<number>(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false)

  useEffect(() => {
    notificationsApi
      .unreadCount()
      .then((res) => setUnreadCount(res.unread_count))
      .catch(() => setUnreadCount(0))
  }, [pathname])

  const handleLogout = () => {
    localStorage.removeItem("lifeos_token")
    localStorage.removeItem("lifeos_user")
    window.location.href = "/login"
  }

  return (
    <div className="min-h-screen bg-slate-50/60 font-sans text-slate-900">
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 lg:hidden"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <Link href="/dashboard" className="flex items-center gap-2.5 font-bold tracking-tight text-slate-900">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-xs">
                <Activity className="h-5 w-5" />
              </span>
              <span className="text-xl">LifeOS</span>
              <span className="hidden rounded-md bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700 sm:inline-block">
                Clinical Intelligence
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {/* Top Quick Links for Desktop */}
            <nav className="hidden items-center gap-1.5 md:flex">
              <Link
                href="/dashboard"
                className={cn(
                  "rounded-xl px-3 py-1.5 text-xs font-semibold transition",
                  pathname === "/dashboard" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                )}
              >
                Dashboard
              </Link>
              <Link
                href="/assessments/new"
                className={cn(
                  "rounded-xl px-3 py-1.5 text-xs font-semibold transition",
                  pathname === "/assessments/new" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                )}
              >
                Assessment
              </Link>
              <Link
                href="/assistant"
                className={cn(
                  "rounded-xl px-3 py-1.5 text-xs font-semibold transition",
                  pathname === "/assistant" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                )}
              >
                AI Assistant
              </Link>
            </nav>

            <div className="h-5 w-[1px] bg-slate-200 hidden md:block" />

            {/* Notification Bell */}
            <Link
              href="/notifications"
              className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-xs">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"
              title="Sign Out"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="mx-auto grid max-w-[1440px] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[240px_1fr] lg:px-8">
        {/* Desktop Sidebar */}
        <aside className="hidden h-fit space-y-6 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs lg:block">
          <div className="rounded-xl border border-slate-100 bg-slate-900 px-4 py-3.5 text-white shadow-xs">
            <div className="text-[11px] font-medium tracking-wider text-slate-400 uppercase">System Status</div>
            <div className="mt-0.5 text-sm font-semibold text-white">LifeOS Control Center</div>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              6 Models Validated
            </div>
          </div>

          <nav className="space-y-5">
            {navGroups.map((group) => (
              <div key={group.group} className="space-y-1">
                <div className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  {group.group}
                </div>
                {group.items.map((item) => {
                  const Icon = item.icon
                  const active = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href as any}
                      className={cn(
                        "flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition relative",
                        active
                          ? "bg-brand-50 text-brand-700 font-bold"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        {active && (
                          <span className="absolute left-0 h-4 w-1 rounded-r-full bg-brand-600" />
                        )}
                        <Icon className={cn("h-4 w-4", active ? "text-brand-600" : "text-slate-400")} />
                        <span>{item.label}</span>
                      </div>
                      {item.href === "/notifications" && unreadCount > 0 && (
                        <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                          {unreadCount}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            ))}
          </nav>

          <div className="border-t border-slate-100 pt-3 text-center">
            <p className="text-[10px] leading-relaxed text-slate-400">
              Model-generated screening indicators. Not a medical diagnosis.
            </p>
          </div>
        </aside>

        {/* Mobile Sidebar Drawer Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setMobileMenuOpen(false)} />
            <div className="fixed inset-y-0 left-0 z-50 w-72 bg-white p-5 shadow-2xl space-y-6 overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <Link href="/dashboard" className="flex items-center gap-2 font-bold text-slate-900" onClick={() => setMobileMenuOpen(false)}>
                  <Activity className="h-5 w-5 text-brand-600" />
                  <span>LifeOS Platform</span>
                </Link>
                <button onClick={() => setMobileMenuOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="space-y-5">
                {navGroups.map((group) => (
                  <div key={group.group} className="space-y-1">
                    <div className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                      {group.group}
                    </div>
                    {group.items.map((item) => {
                      const Icon = item.icon
                      const active = pathname === item.href
                      return (
                        <Link
                          key={item.href}
                          href={item.href as any}
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            "flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition",
                            active ? "bg-brand-600 text-white font-semibold" : "text-slate-700 hover:bg-slate-100"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="h-4 w-4" />
                            <span>{item.label}</span>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                ))}
              </nav>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  )
}
