import type { HypertensionPredictionRequest } from "../types"
import { mapGenderToSex, mapSmokingToStatus } from "./heart-mapper"
import { mapGlucoseToBloodGlucose } from "./diabetes-mapper"

export function mapActivityToStatus(activity?: string): number | undefined {
  if (!activity) return undefined
  const str = String(activity).trim().toLowerCase()
  if (["active", "high", "moderate", "1", "yes"].includes(str)) return 1.0
  if (["inactive", "low", "none", "0", "no"].includes(str)) return 0.0
  return undefined
}

export function mapStressToStatus(stress?: string): number | undefined {
  if (!stress) return undefined
  const str = String(stress).trim().toLowerCase()
  if (["high", "moderate", "1", "yes"].includes(str)) return 1.0
  if (["low", "none", "0", "no"].includes(str)) return 0.0
  return undefined
}

export function mapAssessmentToHypertensionPayload(formData: Record<string, any>): HypertensionPredictionRequest {
  const age_years = Number(formData.age ?? formData.age_years ?? 45)
  const sex = mapGenderToSex(formData.gender ?? formData.sex)

  const systolic_bp_mmHg = Number(formData.systolic_bp ?? formData.systolic_bp_mmHg ?? 120)
  const diastolic_bp_mmHg = Number(formData.diastolic_bp ?? formData.diastolic_bp_mmHg ?? 80)

  const height_cm = Number(formData.height_cm ?? 170)
  const weight_kg = Number(formData.weight_kg ?? 70)
  let bmi: number | undefined = formData.bmi !== undefined && formData.bmi !== null && formData.bmi !== "" ? Number(formData.bmi) : undefined

  if ((bmi === undefined || isNaN(bmi)) && height_cm > 0 && weight_kg > 0) {
    bmi = Number((weight_kg / Math.pow(height_cm / 100.0, 2)).toFixed(2))
  }

  const heart_rate = formData.heart_rate !== undefined && formData.heart_rate !== null && formData.heart_rate !== "" ? Number(formData.heart_rate) : undefined
  const cholesterol = formData.cholesterol !== undefined && formData.cholesterol !== null && formData.cholesterol !== "" ? Number(formData.cholesterol) : undefined
  const raw_glucose = formData.blood_glucose ?? formData.glucose
  const glucose = mapGlucoseToBloodGlucose(raw_glucose !== undefined && raw_glucose !== "" ? Number(raw_glucose) : undefined)

  const smoking_status = mapSmokingToStatus(formData.smoking_status)
  const physical_activity = mapActivityToStatus(formData.physical_activity ?? formData.exercise_frequency)
  const stress_level = mapStressToStatus(formData.stress_level)

  const payload: HypertensionPredictionRequest = {
    age_years,
    sex,
    systolic_bp_mmHg,
    diastolic_bp_mmHg,
  }

  if (bmi !== undefined && !isNaN(bmi)) payload.bmi = bmi
  if (heart_rate !== undefined && !isNaN(heart_rate)) payload.heart_rate = heart_rate
  if (cholesterol !== undefined && !isNaN(cholesterol)) payload.cholesterol = cholesterol
  if (glucose !== undefined && !isNaN(glucose)) payload.glucose = glucose
  if (smoking_status !== undefined) payload.smoking_status = smoking_status
  if (physical_activity !== undefined) payload.physical_activity = physical_activity
  if (stress_level !== undefined) payload.stress_level = stress_level

  return payload
}
