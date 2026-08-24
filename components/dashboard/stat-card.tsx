import { Card } from "@/components/ui/card"

export function StatCard({ label, value, subtext }: { label: string; value: string; subtext: string }) {
  return (
    <Card className="space-y-2">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="text-3xl font-semibold text-slate-900">{value}</div>
      <div className="text-sm text-slate-600">{subtext}</div>
    </Card>
  )
}

