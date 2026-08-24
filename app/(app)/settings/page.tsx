import { SiteShell } from "@/components/layout/site-shell"
import { Card, CardDescription, CardTitle } from "@/components/ui/card"

export default function SettingsPage() {
  return (
    <SiteShell>
      <Card className="space-y-2">
        <CardTitle>Settings</CardTitle>
        <CardDescription>Profile, notifications, theme, and security controls can be expanded here without changing the architecture.</CardDescription>
      </Card>
    </SiteShell>
  )
}

