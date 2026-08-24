"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { SiteShell } from "@/components/layout/site-shell"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { sensorApi } from "@/lib/api"

export default function SensorsPage() {
  const router = useRouter()
  const [token, setToken] = useState("")
  const [status, setStatus] = useState("Prepare an ESP32 or wearable gateway to send readings here.")
  const [reading, setReading] = useState({
    sensor_type: "heart_rate",
    value: "72",
    unit: "bpm",
    device_id: "esp32-lab-01"
  })

  useEffect(() => {
    const stored = localStorage.getItem("lifeos_token") ?? ""
    if (!stored) {
      router.push("/login")
      return
    }
    setToken(stored)
  }, [router])

  const submit = async () => {
    await sensorApi.ingest(token, {
      sensor_type: reading.sensor_type,
      value: Number(reading.value),
      unit: reading.unit,
      device_id: reading.device_id
    })
    setStatus("Sensor reading stored.")
  }

  return (
    <SiteShell>
      <div className="space-y-6">
        <Card className="space-y-4">
          <div>
            <CardTitle>IoT Sensor Gateway</CardTitle>
            <CardDescription>ESP32, MAX30102, MPU6050, and temperature data can post to the sensor API.</CardDescription>
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            <Input value={reading.device_id} onChange={(e) => setReading({ ...reading, device_id: e.target.value })} placeholder="Device ID" />
            <Input value={reading.sensor_type} onChange={(e) => setReading({ ...reading, sensor_type: e.target.value })} placeholder="Sensor Type" />
            <Input value={reading.value} onChange={(e) => setReading({ ...reading, value: e.target.value })} placeholder="Value" />
            <Input value={reading.unit} onChange={(e) => setReading({ ...reading, unit: e.target.value })} placeholder="Unit" />
          </div>
          <div className="flex items-center justify-between">
            <Button onClick={submit} disabled={!token}>Store Reading</Button>
            <span className="text-sm text-slate-600">{status}</span>
          </div>
        </Card>
      </div>
    </SiteShell>
  )
}
