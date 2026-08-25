import { LocalNotifications } from "@capacitor/local-notifications"
import { Capacitor } from "@capacitor/core"

export async function requestDeviceNotificationPermission(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false
  try {
    const status = await LocalNotifications.checkPermissions()
    if (status.display !== "granted") {
      const request = await LocalNotifications.requestPermissions()
      return request.display === "granted"
    }
    return true
  } catch (err) {
    console.warn("Notification permission check failed:", err)
    return false
  }
}

export async function sendDevicePushNotification(options: {
  title: string
  body: string
  id?: number
}) {
  if (!Capacitor.isNativePlatform()) return
  try {
    const hasPermission = await requestDeviceNotificationPermission()
    if (!hasPermission) return

    await LocalNotifications.schedule({
      notifications: [
        {
          title: options.title,
          body: options.body,
          id: options.id || Math.floor(Math.random() * 100000),
          schedule: { at: new Date(Date.now() + 300) },
          sound: undefined,
          attachments: undefined,
          actionTypeId: "",
          extra: null,
        },
      ],
    })
  } catch (err) {
    console.warn("Failed to schedule device notification:", err)
  }
}
