import { SnapshotDetailClient } from "./detail-client"

export function generateStaticParams() {
  return [{ id: "latest" }]
}

export default function SnapshotDetailPage() {
  return <SnapshotDetailClient />
}
