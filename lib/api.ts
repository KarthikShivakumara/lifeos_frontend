import { apiUrl } from "./utils"
import type {
  Assessment,
  AssistantResponse,
  ConversationDetail,
  ConversationSummary,
  DiabetesExplanationResponse,
  DiabetesPredictionRequest,
  DiabetesPredictionResponse,
  HealthHistoryResponse,
  HealthSnapshot,
  HealthTrendSummary,
  HeartExplanationResponse,
  HeartPredictionRequest,
  HeartPredictionResponse,
  HypertensionExplanationResponse,
  HypertensionPredictionRequest,
  HypertensionPredictionResponse,
  NotificationItem,
  NotificationListResponse,
  NotificationUnreadCountResponse,
  ObesityExplanationResponse,
  ObesityPredictionRequest,
  ObesityPredictionResponse,
  PredictResponse,
  Prediction,
  Recommendation,
  RecommendationEngineResponse,
  RecommendationRequest,
  Report,
  RiskFusionRequest,
  RiskFusionResult,
  SensorReading,
  TokenResponse,
  UserSummary,
} from "./types"

type ApiOptions = RequestInit & { token?: string }

async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const token = options.token || (typeof window !== "undefined" ? localStorage.getItem("lifeos_token") || undefined : undefined)
  const headers = new Headers(options.headers)
  headers.set("Content-Type", "application/json")
  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }
  const response = await fetch(apiUrl(path), { ...options, headers, cache: "no-store" })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || response.statusText)
  }
  if (response.status === 204) {
    return undefined as T
  }
  return response.json() as Promise<T>
}

export const authApi = {
  login: (email: string, password: string) =>
    apiFetch<TokenResponse>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  register: (full_name: string, email: string, password: string) =>
    apiFetch<UserSummary>("/auth/register", { method: "POST", body: JSON.stringify({ full_name, email, password }) }),
  forgotPassword: (email: string) =>
    apiFetch<{ message: string }>("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) }),
  me: (token?: string) => apiFetch<UserSummary>("/auth/me", { token }),
}

export const userApi = {
  profile: (token?: string) => apiFetch<UserSummary & Record<string, unknown>>("/users/me", { token }),
  updateProfile: (payload: Record<string, unknown>, token?: string) =>
    apiFetch("/users/me/profile", { method: "PUT", token, body: JSON.stringify(payload) }),
}

export const assessmentApi = {
  create: (payload: Record<string, unknown>, token?: string) =>
    apiFetch<Assessment>("/assessments", { method: "POST", token, body: JSON.stringify(payload) }),
  list: (token?: string) => apiFetch<Assessment[]>("/assessments", { token }),
}

export const predictApi = {
  run: (payload: Record<string, unknown>, token?: string) =>
    apiFetch<PredictResponse>("/predict", { method: "POST", token, body: JSON.stringify(payload) }),
}

export const heartApi = {
  predict: (payload: HeartPredictionRequest, token?: string) =>
    apiFetch<HeartPredictionResponse>("/predict/heart", { method: "POST", token, body: JSON.stringify(payload) }),
  explain: (payload: HeartPredictionRequest, token?: string) =>
    apiFetch<HeartExplanationResponse>("/explain/heart", { method: "POST", token, body: JSON.stringify(payload) }),
}

export const diabetesApi = {
  predict: (payload: DiabetesPredictionRequest, token?: string) =>
    apiFetch<DiabetesPredictionResponse>("/predict/diabetes", { method: "POST", token, body: JSON.stringify(payload) }),
  explain: (payload: DiabetesPredictionRequest, token?: string) =>
    apiFetch<DiabetesExplanationResponse>("/explain/diabetes", { method: "POST", token, body: JSON.stringify(payload) }),
}

export const hypertensionApi = {
  predict: (payload: HypertensionPredictionRequest, token?: string) =>
    apiFetch<HypertensionPredictionResponse>("/predict/hypertension", { method: "POST", token, body: JSON.stringify(payload) }),
  explain: (payload: HypertensionPredictionRequest, token?: string) =>
    apiFetch<HypertensionExplanationResponse>("/explain/hypertension", { method: "POST", token, body: JSON.stringify(payload) }),
}

export const obesityApi = {
  predict: (payload: ObesityPredictionRequest, token?: string) =>
    apiFetch<ObesityPredictionResponse>("/predict/obesity", { method: "POST", token, body: JSON.stringify(payload) }),
  explain: (payload: ObesityPredictionRequest, token?: string) =>
    apiFetch<ObesityExplanationResponse>("/explain/obesity", { method: "POST", token, body: JSON.stringify(payload) }),
}

export const riskFusionApi = {
  fuse: (payload: RiskFusionRequest, token?: string) =>
    apiFetch<RiskFusionResult>("/risk/fusion", { method: "POST", token, body: JSON.stringify(payload) }),
}

export const recommendationEngineApi = {
  generate: (payload: RecommendationRequest, token?: string) =>
    apiFetch<RecommendationEngineResponse>("/recommendations", { method: "POST", token, body: JSON.stringify(payload) }),
}

export const historyApi = {
  create: (snapshot: Partial<HealthSnapshot>, token?: string) =>
    apiFetch<HealthSnapshot>("/history", { method: "POST", token, body: JSON.stringify(snapshot) }),
  list: (token?: string) => apiFetch<HealthHistoryResponse>("/history", { token }),
  get: (snapshotId: string, token?: string) => apiFetch<HealthSnapshot>(`/history/${snapshotId}`, { token }),
  delete: (snapshotId: string, token?: string) => apiFetch<{ status: string; deleted_id: string }>(`/history/${snapshotId}`, { method: "DELETE", token }),
  clear: (token?: string) => apiFetch<{ status: string; cleared_count: number }>("/history", { method: "DELETE", token }),
  trends: (snapshots?: HealthSnapshot[], token?: string) =>
    apiFetch<HealthTrendSummary>("/history/trends", { method: "POST", token, body: JSON.stringify(snapshots || []) }),
}

export const notificationsApi = {
  list: (unreadOnly = false, limit = 50, token?: string) =>
    apiFetch<NotificationListResponse>(`/notifications?unread_only=${unreadOnly}&limit=${limit}`, { token }),
  unreadCount: (token?: string) => apiFetch<NotificationUnreadCountResponse>("/notifications/unread-count", { token }),
  markRead: (notificationId: string, token?: string) =>
    apiFetch<NotificationItem>(`/notifications/${notificationId}/read`, { method: "PUT", token }),
  markAllRead: (token?: string) =>
    apiFetch<NotificationUnreadCountResponse>("/notifications/read-all", { method: "PUT", token }),
  delete: (notificationId: string, token?: string) =>
    apiFetch<{ status: string; deleted_id: string }>(`/notifications/${notificationId}`, { method: "DELETE", token }),
  generate: (token?: string) =>
    apiFetch<{ status: string; generated_count: number; notifications: NotificationItem[] }>("/notifications/generate", {
      method: "POST",
      token,
    }),
}

export const assistantApi = {
  chat: (message: string, conversationId?: string, token?: string) =>
    apiFetch<AssistantResponse>("/assistant/chat", {
      method: "POST",
      token,
      body: JSON.stringify({ message, conversation_id: conversationId }),
    }),
  listConversations: (token?: string) => apiFetch<ConversationSummary[]>("/assistant/conversations", { token }),
  getConversation: (conversationId: string, token?: string) =>
    apiFetch<ConversationDetail>(`/assistant/conversations/${conversationId}`, { token }),
  deleteConversation: (conversationId: string, token?: string) =>
    apiFetch<{ status: string; deleted_id: string }>(`/assistant/conversations/${conversationId}`, {
      method: "DELETE",
      token,
    }),
}

export const twinApi = {
  get: (token?: string) => apiFetch<any>("/health-twin", { token }),
}

export const predictionApi = {
  list: (token?: string) => apiFetch<Prediction[]>("/predictions", { token }),
  create: (assessmentId: string, token?: string) =>
    apiFetch<{ prediction: Prediction; feature_importance: Record<string, number> }>(`/predictions/assessments/${assessmentId}`, {
      method: "POST",
      token,
    }),
}

export const recommendationApi = {
  list: (token?: string) => apiFetch<Recommendation[]>("/recommendations", { token }),
  create: (predictionId: string, token?: string) => apiFetch<Recommendation[]>(`/recommendations/predictions/${predictionId}`, { method: "POST", token }),
}

export const reportApi = {
  list: (token?: string) => apiFetch<Report[]>("/reports", { token }),
  create: (token: string, payload: { report_type: string; title: string; summary: string }) =>
    apiFetch<Report>("/reports", { method: "POST", token, body: JSON.stringify(payload) }),
  downloadPdf: async (snapshotId = "latest", token?: string) => {
    const activeToken = token || (typeof window !== "undefined" ? localStorage.getItem("lifeos_token") || undefined : undefined)
    const headers = new Headers()
    if (activeToken) {
      headers.set("Authorization", `Bearer ${activeToken}`)
    }
    const res = await fetch(apiUrl(`/reports/${snapshotId}/pdf`), { headers, cache: "no-store" })
    if (!res.ok) throw new Error("Failed to download PDF report")
    const blob = await res.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `LifeOS_Health_Report_${snapshotId}.pdf`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  },
}

export const sensorApi = {
  list: (token?: string) => apiFetch<SensorReading[]>("/sensors", { token }),
  ingest: (token: string, payload: Record<string, unknown>) => apiFetch<SensorReading>("/sensors", { method: "POST", token, body: JSON.stringify(payload) }),
}

export const coachApi = {
  chat: (token: string, message: string, context?: Record<string, unknown>) =>
    apiFetch<{ reply: string; safety_note: string }>("/coach/chat", { method: "POST", token, body: JSON.stringify({ message, context }) }),
}

export async function predictStroke(data: import("./types").StrokePredictionRequest): Promise<import("./types").StrokePredictionResponse> {
  return apiFetch<import("./types").StrokePredictionResponse>("/predict/stroke", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function explainStroke(data: import("./types").StrokePredictionRequest): Promise<import("./types").StrokeExplanationResponse> {
  return apiFetch<import("./types").StrokeExplanationResponse>("/explain/stroke", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function predictCKD(data: import("./types").CKDPredictionRequest): Promise<import("./types").CKDPredictionResponse> {
  return apiFetch<import("./types").CKDPredictionResponse>("/predict/ckd", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function explainCKD(data: import("./types").CKDPredictionRequest): Promise<import("./types").CKDExplanationResponse> {
  return apiFetch<import("./types").CKDExplanationResponse>("/explain/ckd", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function predictSleep(data: import("./types").SleepPredictionRequest): Promise<import("./types").SleepPredictionResponse> {
  return apiFetch<import("./types").SleepPredictionResponse>("/predict/sleep", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function explainSleep(data: import("./types").SleepPredictionRequest): Promise<import("./types").SleepExplanationResponse> {
  return apiFetch<import("./types").SleepExplanationResponse>("/explain/sleep", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export const adaptiveApi = {
  getBaseline: (token?: string) => apiFetch<import("./types").UserBaselineSummary>("/adaptive/baseline", { token }),
  getTrends: (token?: string) => apiFetch<Record<string, any>>("/adaptive/trends", { token }),
  getWeeklyReport: (token?: string) => apiFetch<import("./types").WeeklyHealthReport>("/adaptive/reports/weekly", { token }),
  getMonthlyReport: (token?: string) => apiFetch<import("./types").MonthlyHealthReport>("/adaptive/reports/monthly", { token }),
  logFeedback: (recommendationId: string, action: string, token?: string) =>
    apiFetch<{ id: string; action: string }>("/adaptive/feedback", {
      method: "POST",
      token,
      body: JSON.stringify({ recommendation_id: recommendationId, action }),
    }),
  logOutcome: (payload: Record<string, any>, token?: string) =>
    apiFetch<{ id: string; outcome_type: string }>("/adaptive/outcomes", {
      method: "POST",
      token,
      body: JSON.stringify(payload),
    }),
}

export const demoApi = {
  getUsers: () => apiFetch<import("./types").DemoUserSummary[]>("/demo/users"),
  getUserDetail: (userId: string) => apiFetch<import("./types").DemoUserDetail>(`/demo/users/${userId}`),
  getDaySimulation: (userId: string, day: number) => apiFetch<import("./types").DemoDayData>(`/demo/users/${userId}/simulation/${day}`),
  getWeeklyReport: (userId: string) => apiFetch<import("./types").DemoWeeklyReport>(`/demo/users/${userId}/weekly-report`),
}

export const nutritionApi = {
  search: (query: string, limit = 20, token?: string) =>
    apiFetch<import("./types").FoodSearchResponse>(`/nutrition/search?q=${encodeURIComponent(query)}&limit=${limit}`, { token }),
  calculateMeal: (payload: import("./types").MealCalculationRequest, token?: string) =>
    apiFetch<import("./types").MealCalculationResponse>("/nutrition/meal", {
      method: "POST",
      token,
      body: JSON.stringify(payload),
    }),
  calculateDaily: (payload: import("./types").DailyNutritionAggregationRequest, token?: string) =>
    apiFetch<import("./types").NutritionSignal>("/nutrition/daily", {
      method: "POST",
      token,
      body: JSON.stringify(payload),
    }),
}

export const activityApi = {
  estimateCalories: (payload: import("./types").ActivityPredictionRequest, token?: string) =>
    apiFetch<import("./types").ActivityCaloriePredictionResponse>("/activity/estimate-calories", {
      method: "POST",
      token,
      body: JSON.stringify(payload),
    }),
  evaluate: (payload: import("./types").ActivityEngineInput, token?: string) =>
    apiFetch<import("./types").ActivitySignal>("/activity/evaluate", {
      method: "POST",
      token,
      body: JSON.stringify(payload),
    }),
}

export const sleepApi = {
  predict: (payload: import("./types").SleepPredictionRequest, token?: string) =>
    apiFetch<import("./types").SleepPredictionResponse>("/predict/sleep", {
      method: "POST",
      token,
      body: JSON.stringify(payload),
    }),
  explain: (payload: import("./types").SleepPredictionRequest, token?: string) =>
    apiFetch<import("./types").SleepExplanationResponse>("/explain/sleep", {
      method: "POST",
      token,
      body: JSON.stringify(payload),
    }),
}

