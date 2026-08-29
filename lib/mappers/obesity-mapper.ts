import type { ObesityPredictionRequest } from "../types"
import { mapGenderToSex, mapSmokingToStatus } from "./heart-mapper"
import { mapActivityToStatus } from "./hypertension-mapper"

export function mapAssessmentToObesityPayload(formData: Record<string, any>): ObesityPredictionRequest {
  const age_years = Number(formData.age ?? formData.age_years ?? 45)
  const sex = mapGenderToSex(formData.gender ?? formData.sex)

  const fam_hist = formData.family_history_obesity ?? formData.family_history_diabetes ?? formData.family_history_heart_disease
  const family_history_obesity = fam_hist && ["yes", "true", "1"].includes(String(fam_hist).toLowerCase()) ? 1.0 : 0.0

  const diet_q = String(formData.diet_quality ?? "").toLowerCase()
  // High calorie food: check explicit user field or infer from diet quality
  let frequent_high_calorie_food = 0.0
  if (formData.frequent_high_calorie_food !== undefined && formData.frequent_high_calorie_food !== "") {
    frequent_high_calorie_food = Number(formData.frequent_high_calorie_food) > 0 || ["yes", "true", "1"].includes(String(formData.frequent_high_calorie_food).toLowerCase()) ? 1.0 : 0.0
  } else {
    frequent_high_calorie_food = ["poor", "fast_food", "high_calorie", "unhealthy"].includes(diet_q) ? 1.0 : 0.0
  }

  // Vegetable consumption: 1.0 (Rarely), 2.0 (Sometimes), 3.0 (Daily/Always)
  const vegetable_consumption = formData.vegetable_consumption !== undefined && formData.vegetable_consumption !== "" 
    ? Number(formData.vegetable_consumption) 
    : (["poor", "unhealthy"].includes(diet_q) ? 1.0 : 2.0)

  // Main meals per day: typically 1 to 4
  const meals_per_day = formData.meals_per_day !== undefined && formData.meals_per_day !== "" 
    ? Number(formData.meals_per_day) 
    : 3.0

  // Food consumption between meals: 0 (No), 1 (Sometimes), 2 (Frequently), 3 (Always)
  const between_meal_eating = formData.between_meal_eating !== undefined && formData.between_meal_eating !== "" 
    ? Number(formData.between_meal_eating) 
    : (["poor", "unhealthy"].includes(diet_q) ? 2.0 : 1.0)

  const smoking_status = mapSmokingToStatus(formData.smoking_status) ?? 0.0
  
  // Hydration in liters: defaults to realistic 2.0L if omitted
  const water_intake_l = formData.water_intake_l !== undefined && formData.water_intake_l !== "" 
    ? Number(formData.water_intake_l) 
    : 2.0

  // Calorie monitoring: 1.0 (Yes), 0.0 (No) — realistic adult default is 0.0
  const calorie_monitoring = formData.calorie_monitoring !== undefined && formData.calorie_monitoring !== "" 
    ? (Number(formData.calorie_monitoring) > 0 || ["yes", "true", "1"].includes(String(formData.calorie_monitoring).toLowerCase()) ? 1.0 : 0.0)
    : 0.0

  // Physical activity frequency: 0.0 (none) to 3.0 (high)
  let physical_activity_frequency = 1.0
  if (formData.physical_activity_frequency !== undefined && formData.physical_activity_frequency !== "") {
    physical_activity_frequency = Number(formData.physical_activity_frequency)
  } else {
    const act_str = String(formData.physical_activity ?? formData.exercise_frequency ?? "").toLowerCase()
    if (["high", "daily", "athlete"].includes(act_str)) physical_activity_frequency = 3.0
    else if (["moderate", "regular"].includes(act_str)) physical_activity_frequency = 2.0
    else if (["low", "light", "occasional"].includes(act_str)) physical_activity_frequency = 1.0
    else if (["none", "sedentary", "inactive"].includes(act_str)) physical_activity_frequency = 0.0
  }

  // Device / Screen Time: 0.0 (0-2h), 1.0 (3-5h), 2.0 (>5h) — realistic adult default is 1.0 (3-5h)
  const technology_usage_hours = formData.technology_usage_hours !== undefined && formData.technology_usage_hours !== "" 
    ? Number(formData.technology_usage_hours) 
    : 1.0

  const alc_str = String(formData.alcohol_use ?? "").toLowerCase()
  const alcohol_use = ["yes", "drinker", "1", "frequently", "sometimes"].includes(alc_str) ? 1.0 : 0.0

  // Transportation mode: 0.0 (Walking/Bike), 1.0 (Automobile/Motorized) — realistic default is 1.0
  const transportation_mode = formData.transportation_mode !== undefined && formData.transportation_mode !== "" 
    ? Number(formData.transportation_mode) 
    : 1.0

  // Strictly return non-leaking features ONLY (height/weight/BMI strictly excluded)
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
