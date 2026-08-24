import "./globals.css"
import { Providers } from "@/components/layout/providers"

export const metadata = {
  title: "LifeOS",
  description: "Multi-agent AI system for early lifestyle risk prediction and personalized health intelligence."
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

