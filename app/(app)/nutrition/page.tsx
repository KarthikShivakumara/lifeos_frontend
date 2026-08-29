"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Utensils,
  Search,
  Plus,
  Trash2,
  Apple,
  Flame,
  Wheat,
  Beef,
  Droplet,
  Info,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight
} from "lucide-react"
import { nutritionApi } from "@/lib/api"
import type { FoodItemRecord, MealCalculationResponse, NutrientProfile } from "@/lib/types"

interface LoggedItem {
  id: string
  name: string
  source: string
  quantity_g: number
  nutrients: NutrientProfile
}

interface MealState {
  breakfast: LoggedItem[]
  lunch: LoggedItem[]
  dinner: LoggedItem[]
  snack: LoggedItem[]
}

const DEFAULT_TARGETS = {
  calories: 2000,
  protein: 65,
  carbs: 250,
  fat: 65,
  fiber: 30,
  sodium: 2300,
}

export default function NutritionPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<FoodItemRecord[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedPortion, setSelectedPortion] = useState<number>(100)
  const [activeMealCategory, setActiveMealCategory] = useState<"breakfast" | "lunch" | "dinner" | "snack">("lunch")
  
  const [meals, setMeals] = useState<MealState>({
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: [],
  })

  // Load from local storage if present
  useEffect(() => {
    const saved = localStorage.getItem("lifeos_logged_meals")
    if (saved) {
      try {
        setMeals(JSON.parse(saved))
      } catch (e) {
        console.error("Failed to parse saved meals", e)
      }
    }
  }, [])

  // Save to local storage on change
  const saveMeals = (newMeals: MealState) => {
    setMeals(newMeals)
    localStorage.setItem("lifeos_logged_meals", JSON.stringify(newMeals))
  }

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!searchQuery.trim()) return
    setSearching(true)
    try {
      const res = await nutritionApi.search(searchQuery.trim(), 20)
      setSearchResults(res.results || [])
    } catch (err) {
      console.error("Food search error", err)
    } finally {
      setSearching(false)
    }
  }

  // Pre-seed some items on mount if query empty
  useEffect(() => {
    nutritionApi.search("dal", 10).then((res) => {
      if (res.results && res.results.length > 0) {
        setSearchResults(res.results)
      }
    }).catch(() => {})
  }, [])

  const addItemToMeal = (food: FoodItemRecord, mealCat: "breakfast" | "lunch" | "dinner" | "snack") => {
    const scale = selectedPortion / 100.0
    const scaledNutrients: NutrientProfile = {
      calories_kcal: Math.round(food.nutrients_per_100g.calories_kcal * scale * 10) / 10,
      protein_g: Math.round(food.nutrients_per_100g.protein_g * scale * 10) / 10,
      carbohydrates_g: Math.round(food.nutrients_per_100g.carbohydrates_g * scale * 10) / 10,
      fat_g: Math.round(food.nutrients_per_100g.fat_g * scale * 10) / 10,
      fiber_g: Math.round(food.nutrients_per_100g.fiber_g * scale * 10) / 10,
      sugars_g: Math.round(food.nutrients_per_100g.sugars_g * scale * 10) / 10,
      sodium_mg: Math.round(food.nutrients_per_100g.sodium_mg * scale * 10) / 10,
    }

    const newItem: LoggedItem = {
      id: `${food.food_id}-${Date.now()}`,
      name: food.food_name,
      source: food.source,
      quantity_g: selectedPortion,
      nutrients: scaledNutrients,
    }

    const updated = {
      ...meals,
      [mealCat]: [...meals[mealCat], newItem],
    }
    saveMeals(updated)
  }

  const removeItem = (mealCat: "breakfast" | "lunch" | "dinner" | "snack", id: string) => {
    const updated = {
      ...meals,
      [mealCat]: meals[mealCat].filter((item) => item.id !== id),
    }
    saveMeals(updated)
  }

  // Calculate daily totals across all meals
  const allItems = [...meals.breakfast, ...meals.lunch, ...meals.dinner, ...meals.snack]
  const totalCalories = Math.round(allItems.reduce((acc, item) => acc + item.nutrients.calories_kcal, 0))
  const totalProtein = Math.round(allItems.reduce((acc, item) => acc + item.nutrients.protein_g, 0))
  const totalCarbs = Math.round(allItems.reduce((acc, item) => acc + item.nutrients.carbohydrates_g, 0))
  const totalFat = Math.round(allItems.reduce((acc, item) => acc + item.nutrients.fat_g, 0))
  const totalFiber = Math.round(allItems.reduce((acc, item) => acc + item.nutrients.fiber_g, 0))
  const totalSodium = Math.round(allItems.reduce((acc, item) => acc + item.nutrients.sodium_mg, 0))

  const calPct = Math.min(100, Math.round((totalCalories / DEFAULT_TARGETS.calories) * 100))
  const proteinPct = Math.min(100, Math.round((totalProtein / DEFAULT_TARGETS.protein) * 100))
  const carbsPct = Math.min(100, Math.round((totalCarbs / DEFAULT_TARGETS.carbs) * 100))
  const fatPct = Math.min(100, Math.round((totalFat / DEFAULT_TARGETS.fat) * 100))
  const fiberPct = Math.min(100, Math.round((totalFiber / DEFAULT_TARGETS.fiber) * 100))
  const sodiumPct = Math.min(100, Math.round((totalSodium / DEFAULT_TARGETS.sodium) * 100))

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20">
            <Utensils className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Nutrition & Dietary Intelligence</h1>
              <span className="text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded-full">
                Layer B Wellness
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Deterministic nutritional profiling indexing 89,649 items across USDA FoodData, Indian culinary databases, and daily food registries.
            </p>
          </div>
        </div>

        <Link
          href="/dashboard"
          className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 transition-all self-start md:self-auto"
        >
          <span>Back to Dashboard</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Daily Progress Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Energy</span>
            <Flame className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900 dark:text-slate-100">{totalCalories} <span className="text-xs font-normal text-slate-500">/ {DEFAULT_TARGETS.calories} kcal</span></div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${calPct}%` }} />
          </div>
          <div className="mt-1 text-[10px] text-slate-500 text-right">{calPct}% target</div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Protein</span>
            <Beef className="h-4 w-4 text-rose-500" />
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900 dark:text-slate-100">{totalProtein}g <span className="text-xs font-normal text-slate-500">/ {DEFAULT_TARGETS.protein}g</span></div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div className="h-full bg-rose-500 rounded-full transition-all" style={{ width: `${proteinPct}%` }} />
          </div>
          <div className="mt-1 text-[10px] text-slate-500 text-right">{proteinPct}% target</div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Carbohydrates</span>
            <Wheat className="h-4 w-4 text-amber-600" />
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900 dark:text-slate-100">{totalCarbs}g <span className="text-xs font-normal text-slate-500">/ {DEFAULT_TARGETS.carbs}g</span></div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div className="h-full bg-amber-600 rounded-full transition-all" style={{ width: `${carbsPct}%` }} />
          </div>
          <div className="mt-1 text-[10px] text-slate-500 text-right">{carbsPct}% target</div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Fats</span>
            <Droplet className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900 dark:text-slate-100">{totalFat}g <span className="text-xs font-normal text-slate-500">/ {DEFAULT_TARGETS.fat}g</span></div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${fatPct}%` }} />
          </div>
          <div className="mt-1 text-[10px] text-slate-500 text-right">{fatPct}% target</div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Dietary Fiber</span>
            <Apple className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900 dark:text-slate-100">{totalFiber}g <span className="text-xs font-normal text-slate-500">/ {DEFAULT_TARGETS.fiber}g</span></div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${fiberPct}%` }} />
          </div>
          <div className="mt-1 text-[10px] text-slate-500 text-right">{fiberPct}% target</div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Sodium</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${totalSodium > 2300 ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>
              {totalSodium > 2300 ? "HIGH" : "SAFE"}
            </span>
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900 dark:text-slate-100">{totalSodium}mg <span className="text-xs font-normal text-slate-500">/ {DEFAULT_TARGETS.sodium}mg</span></div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div className={`h-full rounded-full transition-all ${totalSodium > 2300 ? "bg-rose-500" : "bg-emerald-500"}`} style={{ width: `${sodiumPct}%` }} />
          </div>
          <div className="mt-1 text-[10px] text-slate-500 text-right">{sodiumPct}% limit</div>
        </div>
      </div>

      {/* Main Grid: Food Search vs. Daily Logged Meals */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Food Database Search (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Search className="h-4 w-4 text-emerald-600" />
                <span>Search Food Database (89,649 Items)</span>
              </h2>
              <span className="text-[11px] text-slate-500">Serving Basis: 100g</span>
            </div>

            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search food item (e.g. 'Dosa', 'Brown Rice', 'Lentils', 'Apple', 'Chicken')..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={searching}
                className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors flex items-center gap-1.5 shrink-0"
              >
                {searching ? "Searching..." : "Search"}
              </button>
            </form>

            {/* Quick Portions & Meal Selection */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-medium">Add to Meal:</span>
                {(["breakfast", "lunch", "dinner", "snack"] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveMealCategory(cat)}
                    className={`capitalize px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      activeMealCategory === cat
                        ? "bg-emerald-600 text-white font-semibold shadow-xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-medium">Portion:</span>
                {[50, 100, 150, 200].map((g) => (
                  <button
                    key={g}
                    onClick={() => setSelectedPortion(g)}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-all ${
                      selectedPortion === g
                        ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                    }`}
                  >
                    {g}g
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Search Results List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Search Results ({searchResults.length} matches)
            </h3>
            {searchResults.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center text-xs text-slate-400">
                No food items match your query. Try searching common ingredients like &quot;Rice&quot;, &quot;Paneer&quot;, &quot;Oats&quot;, or &quot;Spinach&quot;.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
                {searchResults.map((food) => (
                  <div
                    key={food.food_id}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs hover:border-emerald-500/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">{food.food_name}</span>
                        <span className="text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full">
                          {food.source.replace("_", " ")}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap gap-x-3 gap-y-1">
                        <span><strong className="text-slate-700 dark:text-slate-300">{Math.round(food.nutrients_per_100g.calories_kcal * (selectedPortion / 100))}</strong> kcal</span>
                        <span>Protein: <strong className="text-slate-700 dark:text-slate-300">{(food.nutrients_per_100g.protein_g * (selectedPortion / 100)).toFixed(1)}g</strong></span>
                        <span>Carbs: <strong className="text-slate-700 dark:text-slate-300">{(food.nutrients_per_100g.carbohydrates_g * (selectedPortion / 100)).toFixed(1)}g</strong></span>
                        <span>Fat: <strong className="text-slate-700 dark:text-slate-300">{(food.nutrients_per_100g.fat_g * (selectedPortion / 100)).toFixed(1)}g</strong></span>
                        <span>Sodium: <strong className="text-slate-700 dark:text-slate-300">{Math.round(food.nutrients_per_100g.sodium_mg * (selectedPortion / 100))}mg</strong></span>
                      </div>
                    </div>

                    <button
                      onClick={() => addItemToMeal(food, activeMealCategory)}
                      className="rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-600 hover:text-white px-3 py-1.5 text-xs font-semibold transition-colors flex items-center gap-1 shrink-0 self-end sm:self-center"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add ({selectedPortion}g)</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Daily Meal Diary (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Today&apos;s Meal Journal</h2>
              <button
                onClick={() => saveMeals({ breakfast: [], lunch: [], dinner: [], snack: [] })}
                className="text-[11px] text-rose-500 hover:underline font-medium"
              >
                Clear All
              </button>
            </div>

            {(["breakfast", "lunch", "dinner", "snack"] as const).map((mealType) => {
              const items = meals[mealType]
              const mealCals = Math.round(items.reduce((sum, it) => sum + it.nutrients.calories_kcal, 0))
              return (
                <div key={mealType} className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold capitalize text-slate-800 dark:text-slate-200">{mealType}</span>
                    <span className="text-slate-500">{mealCals} kcal</span>
                  </div>

                  {items.length === 0 ? (
                    <div className="rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-850/40 p-3 text-[11px] text-slate-400 italic">
                      No items logged for {mealType}.
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 px-3 py-2 text-xs"
                        >
                          <div className="space-y-0.5">
                            <div className="font-medium text-slate-900 dark:text-slate-100 text-[11px]">
                              {item.name} <span className="text-slate-400 font-normal">({item.quantity_g}g)</span>
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {item.nutrients.calories_kcal} kcal | P: {item.nutrients.protein_g}g | C: {item.nutrients.carbohydrates_g}g | Na: {item.nutrients.sodium_mg}mg
                            </div>
                          </div>
                          <button
                            onClick={() => removeItem(mealType, item.id)}
                            className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}

            {/* Non-diagnostic Disclaimer */}
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/30 p-3 text-[11px] text-amber-900 dark:text-amber-200">
              <ShieldCheck className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
              <span>
                <strong>[Non-diagnostic wellness indicator]</strong> Nutrition recommendations are based on standard AHA and WHO dietary reference intakes. Dietary inputs are isolated to Layer B and cannot alter Layer A clinical disease probabilities.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
