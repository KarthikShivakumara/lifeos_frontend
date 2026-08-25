import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function apiUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || "https://lifeos-api-13dc.onrender.com/api/v1"
  return `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`
}

