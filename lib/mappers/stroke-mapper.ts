import type { StrokePredictionRequest } from "../types"

export function mapAssessmentToStrokePayload(formData: Record<string, any>): StrokePredictionRequest {
  const age = Number(formData.age ?? 45)
  const gender = String(formData.gender ?? "Male").toLowerCase().includes("female") ? "Female" : "Male"
  const systolic_bp = Number(formData.systolic_bp ?? 120)
  const hypertension = systolic_bp >= 140 ? 1 : 0
  const heart_disease = formData.family_history_heart_disease === "yes" ? 1 : 0
  const smoking = String(formData.smoking_status ?? "never").toLowerCase()
  const smoking_status = smoking.includes("smoker") || smoking.includes("yes") ? "smokes" : "never smoked"

  const height_cm = Number(formData.height_cm ?? 170)
  const weight_kg = Number(formData.weight_kg ?? 70)
  const bmi = formData.bmi ? Number(formData.bmi) : Number((weight_kg / Math.pow(height_cm / 100, 2)).toFixed(1))

  return {
    gender,
    age,
    hypertension,
    heart_disease,
    ever_married: age >= 25 ? "Yes" : "No",
    work_type: "Private",
    Residence_type: "Urban",
    avg_glucose_level: Number(formData.glucose ?? 100),
    bmi,
    smoking_status,
  }
}
