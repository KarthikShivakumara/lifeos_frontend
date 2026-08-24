import type { HeartPredictionRequest } from "../types"

export function mapGenderToSex(gender: string | undefined): number {
  if (!gender) return 1.0 // Default to 1.0 if unspecified
  const lower = String(gender).trim().toLowerCase()
  if (["female", "f", "woman", "girl", "0", "0.0"].includes(lower)) {
    return 0.0
  }
  return 1.0
}

export function mapSmokingToStatus(smoking: string | undefined): number | undefined {
  if (smoking === undefined || smoking === null || smoking === "") return undefined
  const lower = String(smoking).trim().toLowerCase()
  if (["never", "no", "non-smoker", "non", "0", "0.0", "false"].includes(lower)) {
    return 0.0
  }
  if (["smoker", "yes", "regular", "former", "daily", "occasional", "1", "1.0", "true"].includes(lower)) {
    return 1.0
  }
  return 0.0
}

export function mapAlcoholToStatus(alcohol: string | undefined): number | undefined {
  if (alcohol === undefined || alcohol === null || alcohol === "") return undefined
  const lower = String(alcohol).trim().toLowerCase()
  if (["never", "no", "non-drinker", "non", "0", "0.0", "false"].includes(lower)) {
    return 0.0
  }
  if (["drinker", "yes", "social", "regular", "occasional", "1", "1.0", "true"].includes(lower)) {
    return 1.0
  }
  return 0.0
}

export function mapActivityToStatus(activity: string | undefined): number | undefined {
  if (activity === undefined || activity === null || activity === "") return undefined
  const lower = String(activity).trim().toLowerCase()
  if (["none", "inactive", "sedentary", "low", "0", "0.0", "false"].includes(lower)) {
    return 0.0
  }
  if (["active", "moderate", "high", "regular", "daily", "1", "1.0", "true"].includes(lower)) {
    return 1.0
  }
  return 1.0
}

export function mapCholesterolToOrdinal(value: number | undefined): number | undefined {
  if (value === undefined || value === null) return undefined
  // If user passed direct ordinal value 1, 2, or 3
  if (value === 1 || value === 2 || value === 3) {
    return Number(value)
  }
  // Standard clinical mg/dL ranges
  if (value < 200) return 1.0
  if (value < 240) return 2.0
  return 3.0
}

export function mapGlucoseToOrdinal(value: number | undefined): number | undefined {
  if (value === undefined || value === null) return undefined
  // If user passed direct ordinal value 1, 2, or 3
  if (value === 1 || value === 2 || value === 3) {
    return Number(value)
  }
  // Standard clinical mg/dL ranges
  if (value < 100) return 1.0
  if (value < 126) return 2.0
  return 3.0
}

export function mapAssessmentToHeartPayload(formData: Record<string, any>): HeartPredictionRequest {
  const age_years = Number(formData.age ?? formData.age_years ?? 45)
  const sex = mapGenderToSex(formData.gender ?? formData.sex)
  const height_cm = Number(formData.height_cm ?? 170)
  const weight_kg = Number(formData.weight_kg ?? 70)

  let bmi: number | undefined = formData.bmi !== undefined && formData.bmi !== null && formData.bmi !== "" ? Number(formData.bmi) : undefined

  if ((bmi === undefined || isNaN(bmi)) && height_cm > 0 && weight_kg > 0) {
    bmi = Number((weight_kg / Math.pow(height_cm / 100.0, 2)).toFixed(2))
  }

  const systolic_bp_mmHg = Number(formData.systolic_bp ?? formData.systolic_bp_mmHg ?? 120)
  const diastolic_bp_mmHg = Number(formData.diastolic_bp ?? formData.diastolic_bp_mmHg ?? 80)

  const smoking_status = mapSmokingToStatus(formData.smoking_status)
  const alcohol_status = mapAlcoholToStatus(formData.alcohol_use ?? formData.alcohol_status)
  const physical_activity = mapActivityToStatus(formData.exercise_frequency ?? formData.physical_activity)

  const cholesterol_ordinal = mapCholesterolToOrdinal(formData.cholesterol !== undefined ? Number(formData.cholesterol) : undefined)
  const glucose_ordinal = mapGlucoseToOrdinal(formData.glucose !== undefined ? Number(formData.glucose) : undefined)

  const payload: HeartPredictionRequest = {
    age_years,
    sex,
    height_cm,
    weight_kg,
    systolic_bp_mmHg,
    diastolic_bp_mmHg,
  }

  if (bmi !== undefined && !isNaN(bmi)) payload.bmi = bmi
  if (smoking_status !== undefined) payload.smoking_status = smoking_status
  if (alcohol_status !== undefined) payload.alcohol_status = alcohol_status
  if (physical_activity !== undefined) payload.physical_activity = physical_activity
  if (cholesterol_ordinal !== undefined) payload.cholesterol_ordinal = cholesterol_ordinal
  if (glucose_ordinal !== undefined) payload.glucose_ordinal = glucose_ordinal

  return payload
}
