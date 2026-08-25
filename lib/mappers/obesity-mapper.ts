import type { ObesityPredictionRequest } from "../types"
import { mapGenderToSex, mapSmokingToStatus } from "./heart-mapper"
import { mapActivityToStatus } from "./hypertension-mapper"

export function mapAssessmentToObesityPayload(formData: Record<string, any>): ObesityPredictionRequest {
  const age_years = Number(formData.age ?? formData.age_years ?? 45)
  const sex = mapGenderToSex(formData.gender ?? formData.sex)

  const fam_hist = formData.family_history_obesity ?? formData.family_history_diabetes ?? formData.family_history_heart_disease
  const family_history_obesity = fam_hist && ["yes", "true", "1"].includes(String(fam_hist).toLowerCase()) ? 1.0 : 0.0

  const diet_q = String(formData.diet_quality ?? "").toLowerCase()
  const frequent_high_calorie_food = ["poor", "fast_food", "high_calorie", "unhealthy"].includes(diet_q) ? 1.0 : 0.0

  const vegetable_consumption = formData.vegetable_consumption !== undefined ? Number(formData.vegetable_consumption) : 2.0
  const meals_per_day = formData.meals_per_day !== undefined ? Number(formData.meals_per_day) : 3.0
  const between_meal_eating = formData.between_meal_eating !== undefined ? Number(formData.between_meal_eating) : 1.0

  const smoking_status = mapSmokingToStatus(formData.smoking_status) ?? 0.0
  const water_intake_l = formData.water_intake_l !== undefined && formData.water_intake_l !== "" ? Number(formData.water_intake_l) : 2.0
  const calorie_monitoring = formData.calorie_monitoring !== undefined ? Number(formData.calorie_monitoring) : 0.0

  const act_val = mapActivityToStatus(formData.physical_activity ?? formData.exercise_frequency)
  const physical_activity_frequency = act_val !== undefined ? act_val * 2.0 : 1.0

  const technology_usage_hours = formData.technology_usage_hours !== undefined ? Number(formData.technology_usage_hours) : 1.0

  const alc_str = String(formData.alcohol_use ?? "").toLowerCase()
  const alcohol_use = ["yes", "drinker", "1", "frequently", "sometimes"].includes(alc_str) ? 1.0 : 0.0

  const transportation_mode = formData.transportation_mode !== undefined ? Number(formData.transportation_mode) : 1.0

  // Strictly return non-leaking features ONLY
  return {
    age_years,
    sex,
    family_history_obesity,
    frequent_high_calorie_food,
    vegetable_consumption,
    meals_per_day,
    between_meal_eating,
    smoking_status,
    water_intake_l,
    calorie_monitoring,
    physical_activity_frequency,
    technology_usage_hours,
    alcohol_use,
    transportation_mode,
  }
}
