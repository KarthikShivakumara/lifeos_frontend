export type UserSummary = {
  id: string
  email: string
  full_name: string
  role: string
}

export type TokenResponse = {
  access_token: string
  token_type: string
}

export type DashboardSnapshot = {
  user: UserSummary | null
  twin: {
    health_score: number
    lifestyle_score: number
    wellness_score: number
    risk_band: string
    summary: string
    last_updated: string
  }
  recommendations: Recommendation[]
  predictions: Prediction[]
  assessments: Assessment[]
  reports: Report[]
  sensors: SensorReading[]
}

export type Assessment = {
  id: string
  user_id: string
  bmi: number | null
  systolic_bp: number | null
  diastolic_bp: number | null
  heart_rate: number | null
  spo2: number | null
  smoking_status: string | null
  alcohol_use: string | null
  exercise_frequency: string | null
  diet_quality: string | null
  stress_level: string | null
  sleep_hours: number | null
  notes: string | null
  created_at: string
}

export type Prediction = {
  id: string
  user_id: string
  assessment_id: string | null
  model_name: string
  heart_disease_risk: number
  diabetes_risk: number
  hypertension_risk: number
  overall_health_risk: number
  explanation: string | null
  created_at: string
}

export type Recommendation = {
  id: string
  user_id: string
  assessment_id: string | null
  category: string
  title: string
  description: string
  priority: string
  created_at: string
}

export type Report = {
  id: string
  user_id: string
  report_type: string
  title: string
  summary: string
  file_url: string | null
  created_at: string
}

export type SensorReading = {
  id: string
  user_id: string
  device_id: string | null
  sensor_type: string
  value: number
  unit: string | null
  metadata_json: string | null
  recorded_at: string
}

export type PredictResponse = {
  overall_health_score: number
  overall_risk: string
  predictions: {
    heart: number
    diabetes: number
    hypertension: number
    obesity: number
  }
  priority: string[]
  recommendations: string[]
  feature_engineering: Record<string, number>
  health_twin: DashboardSnapshot["twin"] & Record<string, unknown>
  assessment_id: string | null
}

// Heart Disease API Contracts
export type HeartPredictionRequest = {
  age_years: number
  sex: number
  height_cm: number
  weight_kg: number
  bmi?: number
  systolic_bp_mmHg: number
  diastolic_bp_mmHg: number
  smoking_status?: number
  alcohol_status?: number
  physical_activity?: number
  cholesterol_ordinal?: number
  glucose_ordinal?: number
}

export type HeartPredictionResponse = {
  disease: string
  risk_score: number
  risk_level: "low" | "moderate" | "high"
  threshold: number
  prediction: number
  model: string
  model_version: string
}

export type FeatureContribution = {
  feature: string
  contribution: number
  direction: "increases_risk" | "decreases_risk"
  human_readable: string
}

export type HeartExplanationResponse = {
  disease: string
  risk_score: number
  risk_level: "low" | "moderate" | "high"
  threshold: number
  prediction: number
  model: string
  model_version: string
  top_contributors: FeatureContribution[]
}

export type CombinedHeartResult = {
  prediction: HeartPredictionResponse
  explanation?: HeartExplanationResponse | null
  explanationError?: string | null
  rawInput?: Record<string, unknown>
  payload?: HeartPredictionRequest
  evaluatedAt: string
}

// Diabetes API Contracts
export type DiabetesPredictionRequest = {
  age_years: number
  sex: number
  bmi?: number
  blood_glucose_level?: number
  hba1c_level?: number
  hypertension?: number
  heart_disease?: number
  smoking_status?: number
}

export type DiabetesPredictionResponse = {
  disease: string
  risk_score: number
  risk_level: "low" | "moderate" | "high"
  threshold: number
  prediction: number
  model: string
  model_version: string
}

export type DiabetesFeatureContribution = {
  feature: string
  contribution: number
  direction: "increases_risk" | "decreases_risk"
  human_readable: string
}

export type DiabetesExplanationResponse = {
  disease: string
  risk_score: number
  risk_level: "low" | "moderate" | "high"
  threshold: number
  prediction: number
  model: string
  model_version: string
  top_contributors: DiabetesFeatureContribution[]
}

export type CombinedDiabetesResult = {
  prediction: DiabetesPredictionResponse
  explanation?: DiabetesExplanationResponse | null
  explanationError?: string | null
  rawInput?: Record<string, unknown>
  payload?: DiabetesPredictionRequest
  evaluatedAt: string
}

// Hypertension API Contracts
export type HypertensionPredictionRequest = {
  age_years: number
  sex: number
  systolic_bp_mmHg: number
  diastolic_bp_mmHg: number
  bmi?: number
  heart_rate?: number
  cholesterol?: number
  glucose?: number
  smoking_status?: number
  physical_activity?: number
  stress_level?: number
}

export type HypertensionPredictionResponse = {
  disease: string
  risk_score: number
  risk_level: "low" | "moderate" | "high"
  threshold: number
  prediction: number
  model: string
  model_version: string
}

export type HypertensionFeatureContribution = {
  feature: string
  contribution: number
  direction: "increases_risk" | "decreases_risk"
  human_readable: string
}

export type HypertensionExplanationResponse = {
  disease: string
  risk_score: number
  risk_level: "low" | "moderate" | "high"
  threshold: number
  prediction: number
  model: string
  model_version: string
  top_contributors: HypertensionFeatureContribution[]
}

export type CombinedHypertensionResult = {
  prediction: HypertensionPredictionResponse
  explanation?: HypertensionExplanationResponse | null
  explanationError?: string | null
  rawInput?: Record<string, unknown>
  payload?: HypertensionPredictionRequest
  evaluatedAt: string
}

// Obesity API Contracts
export type ObesityPredictionRequest = {
  age_years: number
  sex: number
  family_history_obesity?: number
  frequent_high_calorie_food?: number
  vegetable_consumption?: number
  meals_per_day?: number
  between_meal_eating?: number
  smoking_status?: number
  water_intake_l?: number
  calorie_monitoring?: number
  physical_activity_frequency?: number
  technology_usage_hours?: number
  alcohol_use?: number
  transportation_mode?: number
}

export type ObesityPredictionResponse = {
  disease: string
  risk_score: number
  risk_level: "low" | "moderate" | "high"
  threshold: number
  prediction: number
  model: string
  model_version: string
}

export type ObesityFeatureContribution = {
  feature: string
  contribution: number
  direction: "increases_risk" | "decreases_risk"
  human_readable: string
}

export type ObesityExplanationResponse = {
  disease: string
  risk_score: number
  risk_level: "low" | "moderate" | "high"
  threshold: number
  prediction: number
  model: string
  model_version: string
  top_contributors: ObesityFeatureContribution[]
}

export type CombinedObesityResult = {
  prediction: ObesityPredictionResponse
  explanation?: ObesityExplanationResponse | null
  explanationError?: string | null
  rawInput?: Record<string, unknown>
  payload?: ObesityPredictionRequest
  evaluatedAt: string
}

// Risk Fusion API Contracts
export type DiseaseInputItem = {
  disease: string
  risk_score: number
  prediction: number
  threshold: number
  model: string
  model_version?: string
  top_contributors?: Record<string, any>[]
}

export type RiskFusionRequest = {
  heart?: DiseaseInputItem | null
  diabetes?: DiseaseInputItem | null
  hypertension?: DiseaseInputItem | null
  obesity?: DiseaseInputItem | null
}

export type RankedDiseaseItem = {
  rank: number
  disease: string
  display_name: string
  risk_score: number
  normalized_risk: number
  risk_percentage: number
  risk_level: "low" | "moderate" | "high" | "very_high"
  threshold: number
  model: string
}

export type RiskFusionResult = {
  overall_risk_score: number
  overall_risk_percentage: number
  overall_risk_level: "low" | "moderate" | "high" | "very_high"
  overall_health_score: number
  top_priority_disease: string
  top_priority_display_name: string
  top_priority_score: number
  disease_ranking: RankedDiseaseItem[]
  high_risk_diseases: string[]
  very_high_risk_diseases: string[]
  multiple_high_risk: boolean
  multiple_very_high_risk: boolean
  top_contributors_by_disease: Record<string, Record<string, any>[]>
  available_diseases_count: number
  missing_diseases: string[]
  disclaimer: string
}

// Recommendation Engine API Contracts
export type RecommendationCategory =
  | "nutrition"
  | "physical_activity"
  | "blood_pressure"
  | "blood_glucose"
  | "weight_management"
  | "smoking"
  | "alcohol"
  | "sleep"
  | "hydration"
  | "stress_management"
  | "medical_follow_up"

export type RecommendationPriority = "low" | "moderate" | "high" | "urgent"

export type RecommendationItem = {
  id: string
  category: RecommendationCategory
  priority: RecommendationPriority
  title: string
  description: string
  reason: string
  related_diseases: string[]
  source_feature?: string | null
  action: string
  disclaimer: string
}

export type RecommendationRequest = {
  assessment_input?: Record<string, any>
  heart?: Record<string, any> | null
  diabetes?: Record<string, any> | null
  hypertension?: Record<string, any> | null
  obesity?: Record<string, any> | null
  risk_fusion?: Record<string, any> | null
}

export type RecommendationEngineResponse = {
  recommendations: RecommendationItem[]
  top_recommendations: RecommendationItem[]
  total_count: number
  generated_from: Record<string, boolean>
  disclaimer: string
}

// Health History & Trend Tracking Contracts
export type HealthSnapshot = {
  id: string
  timestamp: string
  assessment_input: Record<string, any>
  disease_results: Record<string, any>
  risk_fusion?: RiskFusionResult | Record<string, any> | null
  recommendations?: RecommendationItem[] | Record<string, any>[]
  wellness_outputs?: Record<string, any> | null
  model_versions?: Record<string, string>
}

export type HealthHistoryResponse = {
  snapshots: HealthSnapshot[]
  total_count: number
}

export type TrendDirection = "increasing" | "decreasing" | "stable"

export type MetricTrendItem = {
  metric: string
  display_name: string
  current_value: number
  previous_value?: number | null
  absolute_change: number
  percentage_change?: number | null
  direction: TrendDirection
}

export type RiskTrendSummary = {
  overall: MetricTrendItem
  heart?: MetricTrendItem | null
  diabetes?: MetricTrendItem | null
  hypertension?: MetricTrendItem | null
  obesity?: MetricTrendItem | null
}

export type HealthTrendPoint = {
  snapshot_id: string
  timestamp: string
  overall_risk_score: number
  overall_health_score: number
  heart_risk?: number | null
  diabetes_risk?: number | null
  hypertension_risk?: number | null
  obesity_risk?: number | null
  bmi?: number | null
  systolic_bp?: number | null
  diastolic_bp?: number | null
  glucose?: number | null
  hba1c?: number | null
}

export type HealthTrendSummary = {
  trend_points: HealthTrendPoint[]
  risk_trends: RiskTrendSummary
  biomarker_trends: MetricTrendItem[]
  total_snapshots_evaluated: number
}

// AI Health Assistant & RAG Contracts
export type AssistantCitation = {
  title: string
  source: string
  url: string
  relevance_score: number
}

export type AssistantResponse = {
  conversation_id: string
  answer: string
  citations: AssistantCitation[]
  context_used: string[]
  safety_category: string
  disclaimer: string
}

export type ConversationSummary = {
  id: string
  title: string
  created_at: string
  updated_at: string
  message_count: number
}

export type MessageItem = {
  id: string
  role: "user" | "assistant"
  content: string
  citations?: AssistantCitation[]
  safety_category?: string
  created_at: string
}

export type ConversationDetail = {
  id: string
  title: string
  created_at: string
  messages: MessageItem[]
}

// Notifications Subsystem Contracts
export type NotificationType = "assessment_reminder" | "high_risk_alert" | "recommendation_reminder" | "trend_alert" | "system"
export type NotificationPriority = "low" | "moderate" | "high" | "urgent"

export type NotificationItem = {
  id: string
  type: NotificationType | string
  title: string
  message: string
  priority: NotificationPriority | string
  is_read: boolean
  created_at: string
  action_url?: string
  metadata?: Record<string, any>
}

export type NotificationListResponse = {
  notifications: NotificationItem[]
  total_count: number
  unread_count: number
}

export type NotificationUnreadCountResponse = {
  unread_count: number
}

// Stroke Subsystem Types
export type StrokePredictionRequest = {
  gender: string
  age: number
  hypertension: number
  heart_disease: number
  ever_married: string
  work_type: string
  Residence_type: string
  avg_glucose_level: number
  bmi?: number | null
  smoking_status: string
}

export type StrokePredictionResponse = {
  disease: "stroke"
  risk_score: number
  risk_level: "low" | "moderate" | "high" | "very_high"
  threshold: number
  prediction: number
  model: string
  model_version: string
}

export type StrokeExplanationResponse = {
  disease: "stroke"
  base_value: number
  top_contributions: Array<{
    feature: string
    contribution: number
    direction: "increases_risk" | "decreases_risk"
    human_readable: string
  }>
  explanation_summary: string
}

// CKD Subsystem Types
export type CKDPredictionRequest = {
  age: number
  bp: number
  sg: number
  al: number
  su: number
  bgr: number
  bu: number
  sc: number
  sod: number
  pot: number
  hemo: number
  pcv: number
  wc: number
  rc: number
  rbc: string
  pc: string
  pcc: string
  ba: string
  htn: string
  dm: string
  cad: string
  appet: string
  pe: string
  ane: string
}

export type CKDPredictionResponse = {
  disease: "ckd"
  risk_score: number
  risk_level: "low" | "moderate" | "high" | "very_high"
  threshold: number
  prediction: number
  model: string
  model_version: string
  is_lab_enhanced?: boolean
}

export type CKDExplanationResponse = {
  disease: "ckd"
  base_value: number
  top_contributions: Array<{
    feature: string
    contribution: number
    direction: "increases_risk" | "decreases_risk"
    human_readable: string
  }>
  explanation_summary: string
}

// Sleep Wellness Subsystem Types
export type SleepPredictionRequest = {
  gender: string
  age: number
  occupation: string
  sleep_duration: number
  quality_of_sleep: number
  physical_activity_level: number
  stress_level: number
  bmi_category: string
  systolic_bp: number
  diastolic_bp: number
  heart_rate: number
  daily_steps: number
}

export type SleepPredictionResponse = {
  subsystem: "sleep_wellness"
  risk_score: number
  risk_level: "low" | "moderate" | "elevated"
  threshold: number
  prediction: number
  model: string
  model_version: string
}

export type SleepExplanationResponse = {
  subsystem: "sleep_wellness"
  base_value: number
  top_contributions: Array<{
    feature: string
    contribution: number
    direction: "increases_risk" | "decreases_risk"
    human_readable: string
  }>
  explanation_summary: string
}

// Layer E — Adaptive Intelligence Types
export type UserBaselineItem = {
  metric: string
  baseline_value: number
  rolling_7_day_avg: number | null
  rolling_30_day_avg: number | null
  min_value: number | null
  max_value: number | null
  std_deviation: number | null
  current_deviation: number | null
  trend: "IMPROVING" | "STABLE" | "DECLINING" | "INSUFFICIENT_DATA"
  consistency_score: number
  last_updated: string
}

export type UserBaselineSummary = {
  user_id: string
  baselines: UserBaselineItem[]
  evaluated_at: string
}

export type WeeklyHealthReport = {
  report_id: string
  user_id: string
  period_start: string
  period_end: string
  clinical_screening_summary: Record<string, string>
  wellness_summary: {
    sleep_7d_avg_hours: number
    steps_7d_avg: number
  }
  sleep_trend: string
  activity_trend: string
  nutrition_summary: Record<string, string>
  improvements: string[]
  declines: string[]
  personalized_recommendations: string[]
  disclaimer: string
  generated_at: string
}

export type MonthlyHealthReport = {
  report_id: string
  user_id: string
  month_name: string
  clinical_changes: Record<string, string>
  wellness_changes: {
    sleep_30d_avg: number
    steps_30d_avg: number
  }
  consistency_score: number
  recommendation_adherence_rate: number
  key_focus_areas: string[]
  summary_text: string
  disclaimer: string
  generated_at: string
}

export type DemoUserSummary = {
  id: string
  name: string
  label: string
  tagline: string
  age: number
  sex: string
  avatar_color: string
  baseline_summary: string
  purpose: string
  total_days: number
}

export type DemoDayData = {
  day: number
  date: string
  vitals: {
    bp: string
    glucose: number
    hba1c: number
    cholesterol: number
  }
  sleep_hours: number
  steps: number
  active_minutes: number
  sedentary_hours: number
  nutrition_summary: string
  screening_indicators: Record<string, string>
  wellness_signals: Record<string, string>
  recommendations: string[]
  notification: string
  rag_context: string
}

export type DemoUserDetail = DemoUserSummary & {
  days: DemoDayData[]
}

export type DemoWeeklyReport = {
  user_id: string
  user_name: string
  label: string
  tagline: string
  period: string
  initial_state: {
    sleep: string
    steps: string
    sedentary: string
  }
  final_state: {
    sleep: string
    steps: string
    sedentary: string
  }
  overall_trend: string
  weekly_recommendations: string[]
  next_week_focus: string[]
  disclaimer: string
}

// Nutrition Subsystem Contracts
export type NutrientProfile = {
  calories_kcal: number
  protein_g: number
  carbohydrates_g: number
  fat_g: number
  fiber_g: number
  sugars_g: number
  sodium_mg: number
  calcium_mg?: number | null
  iron_mg?: number | null
}

export type FoodItemRecord = {
  food_id: string
  food_name: string
  category: string
  source: "Indian_Food" | "Daily_Food" | "USDA_Foundation"
  serving_basis: string
  nutrients_per_100g: NutrientProfile
  cultural_tag: string
}

export type FoodSearchResponse = {
  query: string
  total_results: number
  results: FoodItemRecord[]
}

export type MealItemInput = {
  food_id: string
  quantity_g: number
}

export type MealCalculationRequest = {
  meal_type: "breakfast" | "lunch" | "dinner" | "snack"
  items: MealItemInput[]
}

export type MealCalculationResponse = {
  meal_type: string
  total_nutrients: NutrientProfile
  items_count: number
  food_summary: Array<Record<string, any>>
}

export type DailyNutritionAggregationRequest = {
  meals: MealCalculationResponse[]
  user_body_weight_kg?: number | null
}

export type NutritionSignal = {
  domain: "nutrition"
  nutrition_score: number
  quality_tier: "optimal" | "balanced" | "suboptimal" | "poor"
  total_calories_kcal: number
  total_protein_g: number
  total_carbohydrates_g: number
  total_fat_g: number
  total_fiber_g: number
  total_sodium_mg: number
  calorie_target_status: string
  protein_adequacy_pct: number
  sodium_risk_level: string
  fiber_adequacy_pct: number
  recommendation_triggers: string[]
  cultural_context: string
  source: string
}

// Activity Subsystem Contracts
export type ActivityPredictionRequest = {
  gender: string
  age: number
  height: number
  weight: number
  duration: number
  heart_rate: number
  body_temp: number
}

export type ActivityCaloriePredictionResponse = {
  subsystem: "activity_wellness"
  estimated_calories: number
  duration_minutes: number
  model: string
  model_version: string
}

export type ActivityEngineInput = {
  daily_steps: number
  very_active_minutes: number
  fairly_active_minutes: number
  lightly_active_minutes: number
  sedentary_minutes: number
  historical_steps?: number[]
}

export type ActivitySignal = {
  domain: "activity"
  activity_score: number
  activity_level: "low" | "moderate" | "optimal"
  sedentary_risk: "low" | "moderate" | "elevated"
  weekly_trend: "IMPROVING" | "STABLE" | "DECLINING"
  exercise_consistency_pct: number
  daily_steps: number
  active_minutes: number
  sedentary_hours: number
  estimated_workout_calories?: number | null
  source: string
  recommendation_triggers: string[]
}

// Stress Subsystem Contracts (Layer B Wellness Intelligence V2)
export type StressCheckinRequest = {
  perceived_stress: number
  overwhelm?: number | null
  difficulty_relaxing?: number | null
  mood?: number | null
  energy?: number | null
  notes?: string | null
}

export type StressCheckin = {
  id: string
  user_id: string
  created_at: string
  perceived_stress: number
  overwhelm?: number | null
  difficulty_relaxing?: number | null
  mood?: number | null
  energy?: number | null
  sleep_hours_snapshot?: number | null
  activity_minutes_snapshot?: number | null
  stress_index: number
  stress_level: "low" | "mild" | "moderate" | "high"
  data_completeness: number
  is_diagnostic: boolean
  recommendations: string[]
  notes?: string | null
}

export type StressCurrentResponse = {
  current_index?: number | null
  current_level?: "low" | "mild" | "moderate" | "high" | null
  data_completeness?: number | null
  latest_checkin?: StressCheckin | null
  rolling_7d_avg?: number | null
  rolling_30d_avg?: number | null
  trend: "IMPROVING" | "STABLE" | "INCREASING" | "INSUFFICIENT_DATA"
  is_diagnostic: boolean
  disclaimer: string
  recommendations: string[]
}

export type StressTrendPoint = {
  date: string
  stress_index: number
  stress_level: string
  sleep_hours?: number | null
  activity_minutes?: number | null
}

export type StressTrendResponse = {
  days_requested: number
  data_points: StressTrendPoint[]
  average_index?: number | null
  trend: "IMPROVING" | "STABLE" | "INCREASING" | "INSUFFICIENT_DATA"
  observed_patterns: string[]
  is_diagnostic: boolean
  disclaimer: string
}

export type StressSummaryResponse = {
  total_checkins_30d: number
  average_index_30d?: number | null
  highest_index_30d?: number | null
  lowest_index_30d?: number | null
  consistency_score: number
  trend: string
  level_distribution: Record<string, number>
  is_diagnostic: boolean
  disclaimer: string
}

export type StressRecommendationItem = {
  title: string
  description: string
  priority: "HIGH" | "MEDIUM" | "LOW"
  category: string
}



