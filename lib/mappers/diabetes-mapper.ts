import type { DiabetesPredictionRequest } from "../types"
import { mapGenderToSex, mapSmokingToStatus } from "./heart-mapper"

export function mapGlucoseToBloodGlucose(glucose: number | undefined): number | undefined {
  if (glucose === undefined || glucose === null || isNaN(glucose)) return undefined
  // If user entered raw mg/dL value (e.g. 70 - 350)
  if (glucose > 10) return Number(glucose)
  // If user entered ordinal (1 = 90 mg/dL, 2 = 115 mg/dL, 3 = 160 mg/dL)
  if (glucose === 1) return 90.0
  if (glucose === 2) return 115.0
  if (glucose === 3) return 160.0
  return Number(glucose)
}

export function mapHypertensionToStatus(
  systolic_bp?: number,
  diastolic_bp?: number,
  hypertension_field?: string | number
): number | undefined {
  if (hypertension_field !== undefined && hypertension_field !== null && hypertension_field !== "") {
    const str = String(hypertension_field).trim().toLowerCase()
    if (["1", "1.0", "yes", "true", "hypertensive"].includes(str)) return 1.0
    if (["0", "0.0", "no", "false", "normal"].includes(str)) return 0.0
  }
  if (systolic_bp !== undefined && diastolic_bp !== undefined) {
    if (systolic_bp >= 140 || diastolic_bp >= 90) return 1.0
    return 0.0
  }
  return undefined
}

export function mapHeartDiseaseToStatus(field?: string | number): number | undefined {
  if (field === undefined || field === null || field === "") return undefined
  const str = String(field).trim().toLowerCase()
  if (["1", "1.0", "yes", "true", "present"].includes(str)) return 1.0
  if (["0", "0.0", "no", "false", "none"].includes(str)) return 0.0
  return 0.0
}

export function mapAssessmentToDiabetesPayload(formData: Record<string, any>): DiabetesPredictionRequest {
  const age_years = Number(formData.age ?? formData.age_years ?? 45)
  const sex = mapGenderToSex(formData.gender ?? formData.sex)

  const height_cm = Number(formData.height_cm ?? 170)
  const weight_kg = Number(formData.weight_kg ?? 70)
  let bmi: number | undefined = formData.bmi !== undefined && formData.bmi !== null && formData.bmi !== "" ? Number(formData.bmi) : undefined

  if ((bmi === undefined || isNaN(bmi)) && height_cm > 0 && weight_kg > 0) {
    bmi = Number((weight_kg / Math.pow(height_cm / 100.0, 2)).toFixed(2))
  }

  const blood_glucose_level = mapGlucoseToBloodGlucose(formData.glucose !== undefined ? Number(formData.glucose) : undefined)
  const hba1c_level = formData.hba1c !== undefined && formData.hba1c !== null && formData.hba1c !== "" ? Number(formData.hba1c) : undefined

  const systolic_bp = formData.systolic_bp !== undefined ? Number(formData.systolic_bp) : undefined
  const diastolic_bp = formData.diastolic_bp !== undefined ? Number(formData.diastolic_bp) : undefined
  const hypertension = mapHypertensionToStatus(systolic_bp, diastolic_bp, formData.hypertension)

  const heart_disease = mapHeartDiseaseToStatus(formData.family_history_heart_disease ?? formData.heart_disease)
  const smoking_status = mapSmokingToStatus(formData.smoking_status)

  const payload: DiabetesPredictionRequest = {
    age_years,
    sex,
  }

  if (bmi !== undefined && !isNaN(bmi)) payload.bmi = bmi
  if (blood_glucose_level !== undefined && !isNaN(blood_glucose_level)) payload.blood_glucose_level = blood_glucose_level
  if (hba1c_level !== undefined && !isNaN(hba1c_level)) payload.hba1c_level = hba1c_level
  if (hypertension !== undefined) payload.hypertension = hypertension
  if (heart_disease !== undefined) payload.heart_disease = heart_disease
  if (smoking_status !== undefined) payload.smoking_status = smoking_status

  return payload
}
