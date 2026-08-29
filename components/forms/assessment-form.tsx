"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, Controller } from "react-hook-form"
import * as z from "zod"
import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { SmartInput } from "@/components/ui/smart-input"
import { SegmentedControl } from "@/components/ui/segmented-control"
import { InfoTooltip } from "@/components/ui/info-tooltip"
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Heart,
  HeartPulse,
  Info,
  Loader2,
  Lock,
  Moon,
  Scale,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  User,
  Zap,
  FlaskConical,
  Layers,
} from "lucide-react"
import {
  diabetesApi,
  heartApi,
  historyApi,
  hypertensionApi,
  notificationsApi,
  obesityApi,
  recommendationEngineApi,
  riskFusionApi,
  predictStroke,
  predictCKD,
} from "@/lib/api"
import { mapAssessmentToDiabetesPayload } from "@/lib/mappers/diabetes-mapper"
import { mapAssessmentToHeartPayload } from "@/lib/mappers/heart-mapper"
import { mapAssessmentToHypertensionPayload } from "@/lib/mappers/hypertension-mapper"
import { mapAssessmentToObesityPayload } from "@/lib/mappers/obesity-mapper"
import { mapAssessmentToStrokePayload } from "@/lib/mappers/stroke-mapper"
import { mapAssessmentToCKDPayload, isLabEnhancedCKD } from "@/lib/mappers/ckd-mapper"
import { sendDevicePushNotification } from "@/lib/services/push-notifications"
import type {
  CombinedDiabetesResult,
  CombinedHeartResult,
  CombinedHypertensionResult,
  CombinedObesityResult,
  DiabetesExplanationResponse,
  DiabetesPredictionResponse,
  HealthSnapshot,
  HeartExplanationResponse,
  HeartPredictionResponse,
  HypertensionExplanationResponse,
  HypertensionPredictionResponse,
  ObesityExplanationResponse,
  ObesityPredictionResponse,
  RecommendationEngineResponse,
  RecommendationRequest,
  RiskFusionRequest,
  RiskFusionResult,
} from "@/lib/types"

const optionalNumber = (min: number, max: number, labelName: string) =>
  z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? undefined : value),
    z.coerce
      .number({ invalid_type_error: `${labelName} must be a number` })
      .min(min, `${labelName} must be at least ${min}`)
      .max(max, `${labelName} must be at most ${max}`)
      .optional()
  )

const schema = z.object({
  // Step 1: Basic Info
  age: z.coerce.number().min(14, "Age must be at least 14 years").max(100, "Age must be at most 100 years"),
  gender: z.string().min(1, "Biological sex is required"),

  // Step 2: Body & Vitals
  height_cm: z.coerce.number().min(100, "Height must be at least 100 cm").max(220, "Height must be at most 220 cm"),
  weight_kg: z.coerce.number().min(30, "Weight must be at least 30 kg").max(250, "Weight must be at most 250 kg"),
  bmi: optionalNumber(10, 80, "BMI"),
  systolic_bp: z.coerce.number().min(70, "Systolic BP must be at least 70 mmHg").max(250, "Systolic BP must be at most 250 mmHg"),
  diastolic_bp: z.coerce.number().min(40, "Diastolic BP must be at least 40 mmHg").max(150, "Diastolic BP must be at most 150 mmHg"),
  heart_rate: z.coerce.number().min(40, "Heart rate must be at least 40 bpm").max(220, "Heart rate must be at most 220 bpm"),
  spo2: z.coerce.number().min(50, "SpO2 must be at least 50%").max(100, "SpO2 must be at most 100%"),

  // Step 3: Medical & Metabolic Profile
  glucose: optionalNumber(20, 600, "Blood glucose"),
  blood_glucose: optionalNumber(20, 600, "Blood glucose"),
  hba1c: optionalNumber(3.5, 15, "HbA1c"),
  cholesterol: optionalNumber(50, 500, "Cholesterol"),
  family_history_diabetes: z.string().optional(),
  family_history_heart_disease: z.string().optional(),
  family_history_stroke: z.string().optional(),
  family_history_obesity: z.string().optional(),

  // Step 4: Lifestyle & Nutrition Habits (Feeding Obesity, CVD, and Wellness)
  smoking_status: z.string().optional(),
  alcohol_use: z.string().optional(),
  exercise_frequency: z.string().optional(),
  physical_activity: z.string().optional(),
  diet_quality: z.string().optional(),
  vegetable_consumption: optionalNumber(1, 3, "Vegetable consumption"),
  meals_per_day: optionalNumber(1, 6, "Meals per day"),
  between_meal_eating: optionalNumber(0, 3, "Snacking frequency"),
  calorie_monitoring: z.string().optional(),
  technology_usage_hours: optionalNumber(0, 24, "Daily screen hours"),
  transportation_mode: z.string().optional(),

  // Step 5: Sleep & Wellness
  water_intake_l: optionalNumber(0.5, 10, "Daily water intake"),
  sleep_hours: z.coerce.number().min(3, "Sleep duration must be at least 3 hours").max(14, "Sleep duration must be at most 14 hours"),
  stress_level: z.string().optional(),
  depression_score: optionalNumber(0, 100, "Depression score"),

  // Step 6: Kidney Laboratory Biomarkers (Optional Progressive Disclosure)
  has_kidney_labs: z.boolean().optional(),
  serum_creatinine: optionalNumber(0.1, 15.0, "Serum creatinine"),
  blood_urea: optionalNumber(1, 250, "Blood urea / BUN"),
  urinary_albumin: optionalNumber(0, 5, "Urinary albumin"),
  hemoglobin: optionalNumber(3.0, 20.0, "Hemoglobin"),
  specific_gravity: optionalNumber(1.000, 1.040, "Specific gravity"),
  pedal_edema: z.string().optional(),

  notes: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

const STEP_TITLES = [
  { id: 1, name: "About You", icon: User, subtitle: "Basic demographic baseline" },
  { id: 2, name: "Body & Vitals", icon: HeartPulse, subtitle: "Physical & cardiac measurements" },
  { id: 3, name: "Medical History", icon: Stethoscope, subtitle: "Metabolic & genetic profile" },
  { id: 4, name: "Lifestyle & Diet", icon: Activity, subtitle: "Nutrition, activity & screen time" },
  { id: 5, name: "Wellness & Sleep", icon: Moon, subtitle: "Sleep duration & hydration" },
  { id: 6, name: "Kidney Labs", icon: FlaskConical, subtitle: "Optional clinical bloodwork" },
  { id: 7, name: "Review", icon: ClipboardCheck, subtitle: "Verify & submit assessment" },
]

export function AssessmentForm({ token, onCreated }: { token: string; onCreated: () => void }) {
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [status, setStatus] = useState<string>("")
  const [analysisPhase, setAnalysisPhase] = useState<number>(0)
  const [errorMsg, setErrorMsg] = useState<string>("")

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    trigger,
    formState: { isSubmitting, errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      age: 30,
      gender: "male",
      height_cm: 175,
      weight_kg: 68,
      bmi: 22.2,
      systolic_bp: 118,
      diastolic_bp: 78,
      heart_rate: 72,
      spo2: 98,
      glucose: 90,
      blood_glucose: 90,
      hba1c: 5.2,
      cholesterol: 175,
      family_history_diabetes: "no",
      family_history_heart_disease: "no",
      family_history_stroke: "no",
      family_history_obesity: "no",
      smoking_status: "no",
      alcohol_use: "no",
      physical_activity: "active",
      exercise_frequency: "active",
      diet_quality: "good",
      vegetable_consumption: 2,
      meals_per_day: 3,
      between_meal_eating: 1,
      calorie_monitoring: "no",
      technology_usage_hours: 1,
      transportation_mode: "motorized",
      water_intake_l: 2.0,
      sleep_hours: 8,
      stress_level: "low",
      depression_score: 0,
      has_kidney_labs: false,
      serum_creatinine: undefined,
      blood_urea: undefined,
      urinary_albumin: 0,
      hemoglobin: undefined,
      specific_gravity: undefined,
      pedal_edema: "no",
      notes: "",
    },
  })

  const watchHeight = watch("height_cm")
  const watchWeight = watch("weight_kg")
  const watchHasKidneyLabs = watch("has_kidney_labs")

  // Auto-calculate BMI whenever Height or Weight changes
  const calculatedBmi = useMemo(() => {
    if (watchHeight && watchWeight && watchHeight > 0) {
      const heightM = watchHeight / 100
      const val = watchWeight / (heightM * heightM)
      return parseFloat(val.toFixed(1))
    }
    return 0
  }, [watchHeight, watchWeight])

  useEffect(() => {
    if (calculatedBmi > 0) {
      setValue("bmi", calculatedBmi, { shouldValidate: true })
    }
  }, [calculatedBmi, setValue])

  // Validate fields relevant to each step before proceeding
  const handleNextStep = async () => {
    let fieldsToValidate: (keyof FormValues)[] = []
    if (currentStep === 1) fieldsToValidate = ["age", "gender"]
    else if (currentStep === 2) fieldsToValidate = ["height_cm", "weight_kg", "systolic_bp", "diastolic_bp", "heart_rate", "spo2"]
    else if (currentStep === 3) fieldsToValidate = ["glucose", "hba1c", "cholesterol"]
    else if (currentStep === 4) fieldsToValidate = ["smoking_status", "alcohol_use", "exercise_frequency", "vegetable_consumption", "meals_per_day", "between_meal_eating", "technology_usage_hours"]
    else if (currentStep === 5) fieldsToValidate = ["sleep_hours", "water_intake_l"]
    else if (currentStep === 6 && watchHasKidneyLabs) fieldsToValidate = ["serum_creatinine", "blood_urea", "urinary_albumin", "hemoglobin", "specific_gravity"]

    const isStepValid = await trigger(fieldsToValidate)
    if (isStepValid) {
      setCurrentStep((prev) => Math.min(prev + 1, 7))
    }
  }

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const submit = async (values: FormValues) => {
    setCurrentStep(8) // Real-Time Intelligence Analysis Phase
    setErrorMsg("")
    setAnalysisPhase(1)
    setStatus("Step 1/5: Validating health data & feature contracts...")

    try {
      await new Promise((r) => setTimeout(r, 400))
      setAnalysisPhase(2)
      setStatus("Step 2/5: Evaluating Heart, Diabetes, Hypertension, Obesity, Stroke, & CKD models in parallel...")

      const authToken = token || (typeof window !== "undefined" ? localStorage.getItem("lifeos_token") || "" : "")

      const heartPayload = mapAssessmentToHeartPayload(values)
      const diabetesPayload = mapAssessmentToDiabetesPayload(values)
      const htnPayload = mapAssessmentToHypertensionPayload(values)
      const obesityPayload = mapAssessmentToObesityPayload(values)
      const strokePayload = mapAssessmentToStrokePayload(values)
      const ckdPayload = mapAssessmentToCKDPayload(values)

      const [heartPredRes, diabetesPredRes, htnPredRes, obesityPredRes, strokePredRes, ckdPredRes] = await Promise.allSettled([
        heartApi.predict(heartPayload, authToken),
        diabetesApi.predict(diabetesPayload, authToken),
        hypertensionApi.predict(htnPayload, authToken),
        obesityApi.predict(obesityPayload, authToken),
        predictStroke(strokePayload),
        predictCKD(ckdPayload),
      ])

      let heartPred: HeartPredictionResponse | null = null
      let diabetesPred: DiabetesPredictionResponse | null = null
      let htnPred: HypertensionPredictionResponse | null = null
      let obesityPred: ObesityPredictionResponse | null = null
      let strokePred: any = null
      let ckdPred: any = null

      if (heartPredRes.status === "fulfilled") heartPred = heartPredRes.value
      else console.error("Heart prediction failed:", heartPredRes.reason)

      if (diabetesPredRes.status === "fulfilled") diabetesPred = diabetesPredRes.value
      else console.error("Diabetes prediction failed:", diabetesPredRes.reason)

      if (htnPredRes.status === "fulfilled") htnPred = htnPredRes.value
      else console.error("Hypertension prediction failed:", htnPredRes.reason)

      if (obesityPredRes.status === "fulfilled") obesityPred = obesityPredRes.value
      else console.error("Obesity prediction failed:", obesityPredRes.reason)

      if (strokePredRes.status === "fulfilled") strokePred = strokePredRes.value
      else console.error("Stroke prediction failed:", strokePredRes.reason)

      if (ckdPredRes.status === "fulfilled") ckdPred = ckdPredRes.value
      else console.error("CKD prediction failed:", ckdPredRes.reason)

      if (!heartPred && !diabetesPred && !htnPred && !obesityPred && !strokePred && !ckdPred) {
        throw new Error("Failed to communicate with prediction services. Backend service might be waking up (Render spin-down) or unreachable.")
      }

      setAnalysisPhase(3)
      setStatus("Step 3/5: Computing SHAP feature attributions across disease models...")

      const [heartExplainRes, diabetesExplainRes, htnExplainRes, obesityExplainRes] = await Promise.allSettled([
        heartPred ? heartApi.explain(heartPayload, token) : Promise.reject("Skipped"),
        diabetesPred ? diabetesApi.explain(diabetesPayload, token) : Promise.reject("Skipped"),
        htnPred ? hypertensionApi.explain(htnPayload, token) : Promise.reject("Skipped"),
        obesityPred ? obesityApi.explain(obesityPayload, token) : Promise.reject("Skipped"),
      ])

      let heartExplain: HeartExplanationResponse | null = null
      let heartExplainErr: string | null = null
      if (heartExplainRes.status === "fulfilled") heartExplain = heartExplainRes.value
      else heartExplainErr = "Heart explanation temporarily unavailable."

      let diabetesExplain: DiabetesExplanationResponse | null = null
      let diabetesExplainErr: string | null = null
      if (diabetesExplainRes.status === "fulfilled") diabetesExplain = diabetesExplainRes.value
      else diabetesExplainErr = "Diabetes explanation temporarily unavailable."

      let htnExplain: HypertensionExplanationResponse | null = null
      let htnExplainErr: string | null = null
      if (htnExplainRes.status === "fulfilled") htnExplain = htnExplainRes.value
      else htnExplainErr = "Hypertension explanation temporarily unavailable."

      let obesityExplain: ObesityExplanationResponse | null = null
      let obesityExplainErr: string | null = null
      if (obesityExplainRes.status === "fulfilled") obesityExplain = obesityExplainRes.value
      else obesityExplainErr = "Obesity explanation temporarily unavailable."

      // Cache detailed results for all 6 clinical disease models
      if (heartPred) {
        localStorage.setItem(
          "lifeos_heart_result",
          JSON.stringify({ prediction: heartPred, explanation: heartExplain, explanationError: heartExplainErr, rawInput: values, payload: heartPayload, evaluatedAt: new Date().toISOString() })
        )
      }
      if (diabetesPred) {
        localStorage.setItem(
          "lifeos_diabetes_result",
          JSON.stringify({ prediction: diabetesPred, explanation: diabetesExplain, explanationError: diabetesExplainErr, rawInput: values, payload: diabetesPayload, evaluatedAt: new Date().toISOString() })
        )
      }
      if (htnPred) {
        localStorage.setItem(
          "lifeos_hypertension_result",
          JSON.stringify({ prediction: htnPred, explanation: htnExplain, explanationError: htnExplainErr, rawInput: values, payload: htnPayload, evaluatedAt: new Date().toISOString() })
        )
      }
      if (obesityPred) {
        localStorage.setItem(
          "lifeos_obesity_result",
          JSON.stringify({ prediction: obesityPred, explanation: obesityExplain, explanationError: obesityExplainErr, rawInput: values, payload: obesityPayload, evaluatedAt: new Date().toISOString() })
        )
      }
      const isLabEnhanced = isLabEnhancedCKD(values)
      const ckdWithMeta = ckdPred ? { ...ckdPred, is_lab_enhanced: isLabEnhanced, evaluatedAt: new Date().toISOString() } : null

      if (strokePred) {
        localStorage.setItem("lifeos_stroke_result", JSON.stringify({ ...strokePred, evaluatedAt: new Date().toISOString() }))
      }
      if (ckdWithMeta) {
        localStorage.setItem("lifeos_ckd_result", JSON.stringify(ckdWithMeta))
      }

      setAnalysisPhase(4)
      setStatus("Step 4/5: Fusing disease predictions & generating clinical recommendations...")

      const fusionPayload: RiskFusionRequest = {
        heart: heartPred ? { disease: "heart", risk_score: heartPred.risk_score, prediction: heartPred.prediction, threshold: heartPred.threshold, model: heartPred.model, top_contributors: (heartExplain?.top_contributors as any) ?? [] } : null,
        diabetes: diabetesPred ? { disease: "diabetes", risk_score: diabetesPred.risk_score, prediction: diabetesPred.prediction, threshold: diabetesPred.threshold, model: diabetesPred.model, top_contributors: (diabetesExplain?.top_contributors as any) ?? [] } : null,
        hypertension: htnPred ? { disease: "hypertension", risk_score: htnPred.risk_score, prediction: htnPred.prediction, threshold: htnPred.threshold, model: htnPred.model, top_contributors: (htnExplain?.top_contributors as any) ?? [] } : null,
        obesity: obesityPred ? { disease: "obesity", risk_score: obesityPred.risk_score, prediction: obesityPred.prediction, threshold: obesityPred.threshold, model: obesityPred.model, top_contributors: (obesityExplain?.top_contributors as any) ?? [] } : null,
      }

      let fusionResult: RiskFusionResult | null = null
      try {
        fusionResult = await riskFusionApi.fuse(fusionPayload, token)
        localStorage.setItem("lifeos_risk_fusion_result", JSON.stringify(fusionResult))
      } catch (err) {
        console.warn("Risk Fusion API warning:", err)
      }

      const recPayload: RecommendationRequest = {
        assessment_input: values,
        heart: heartPred ? { ...heartPred, explanation: heartExplain } : null,
        diabetes: diabetesPred ? { ...diabetesPred, explanation: diabetesExplain } : null,
        hypertension: htnPred ? { ...htnPred, explanation: htnExplain } : null,
        obesity: obesityPred ? { ...obesityPred, explanation: obesityExplain } : null,
        risk_fusion: fusionResult as any,
      }

      let recResult: RecommendationEngineResponse | null = null
      try {
        recResult = await recommendationEngineApi.generate(recPayload, token)
        localStorage.setItem("lifeos_recommendations_result", JSON.stringify(recResult))
      } catch (err) {
        console.warn("Recommendation API warning:", err)
      }

      setAnalysisPhase(5)
      setStatus("Step 5/5: Storing health snapshot & finalizing intelligence profile...")

      const maxRisk = Math.max(
        heartPred?.risk_score || 0,
        diabetesPred?.risk_score || 0,
        htnPred?.risk_score || 0,
        obesityPred?.risk_score || 0,
        strokePred?.risk_score || 0,
        ckdWithMeta?.risk_score || 0
      )
      
      localStorage.setItem(
        "lifeos_latest_result",
        JSON.stringify({
          overall_health_score: fusionResult ? fusionResult.overall_health_score : Math.round((1 - maxRisk) * 100),
          overall_risk: fusionResult ? fusionResult.overall_risk_level.toUpperCase() : maxRisk >= 0.6 ? "HIGH" : "MODERATE",
          predictions: {
            heart: heartPred ? Math.round(heartPred.risk_score * 100) : null,
            diabetes: diabetesPred ? Math.round(diabetesPred.risk_score * 100) : null,
            hypertension: htnPred ? Math.round(htnPred.risk_score * 100) : null,
            obesity: obesityPred ? Math.round(obesityPred.risk_score * 100) : null,
            stroke: strokePred ? Math.round(strokePred.risk_score * 100) : null,
            ckd: ckdWithMeta ? Math.round(ckdWithMeta.risk_score * 100) : null,
          },
          heart_detail: heartPred ? JSON.parse(localStorage.getItem("lifeos_heart_result") || "null") : null,
          diabetes_detail: diabetesPred ? JSON.parse(localStorage.getItem("lifeos_diabetes_result") || "null") : null,
          hypertension_detail: htnPred ? JSON.parse(localStorage.getItem("lifeos_hypertension_result") || "null") : null,
          obesity_detail: obesityPred ? JSON.parse(localStorage.getItem("lifeos_obesity_result") || "null") : null,
          stroke_detail: strokePred ? { ...strokePred, evaluatedAt: new Date().toISOString() } : null,
          ckd_detail: ckdWithMeta,
          risk_fusion_detail: fusionResult,
          recommendations_detail: recResult,
        })
      )

      const newSnapshot: Partial<HealthSnapshot> = {
        id: `snap-${Date.now()}`,
        timestamp: new Date().toISOString(),
        assessment_input: values,
        disease_results: {
          heart: heartPred,
          diabetes: diabetesPred,
          hypertension: htnPred,
          obesity: obesityPred,
          stroke: strokePred,
          ckd: ckdWithMeta,
        },
        risk_fusion: fusionResult,
        recommendations: recResult?.recommendations || [],
        model_versions: {
          heart: heartPred?.model_version || "1.0.0",
          diabetes: diabetesPred?.model_version || "1.0.0",
          hypertension: htnPred?.model_version || "1.0.0",
          obesity: obesityPred?.model_version || "1.0.0",
          stroke: strokePred?.model_version || "1.0.0",
          ckd: ckdWithMeta?.model_version || "1.0.0",
        },
      }

      try {
        await historyApi.create(newSnapshot, token)
        await notificationsApi.generate(token).catch((err) => console.warn("Notification warning:", err))
        
        sendDevicePushNotification({
          title: "LifeOS Health Assessment Complete 🏥",
          body: `Multi-model analysis completed. Composite Risk: ${fusionResult?.overall_risk_level?.toUpperCase() || "EVALUATED"}. Tap to review recommendations.`,
        })
      } catch (err) {
        console.warn("History API warning:", err)
      }

      const existingHistory: HealthSnapshot[] = JSON.parse(localStorage.getItem("lifeos_health_history") || "[]")
      localStorage.setItem("lifeos_health_history", JSON.stringify([newSnapshot as HealthSnapshot, ...existingHistory].slice(0, 100)))

      await new Promise((r) => setTimeout(r, 300))
      onCreated()
    } catch (err: any) {
      console.error("Assessment submission failed:", err)
      setErrorMsg(err.message || "Failed to communicate with LifeOS prediction APIs.")
      setCurrentStep(6) // Return to review on error
    }
  }

  return (
    <Card className="max-w-4xl mx-auto border border-slate-200/80 dark:border-slate-800 shadow-xl rounded-2xl overflow-hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl">
      {/* Top Header & Stepper */}
      <div className="p-6 md:p-8 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Clinical Safety Verified
              </span>
              <span className="text-xs text-slate-400">Step {Math.min(currentStep, 6)} of 6</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Health Risk Assessment</h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Complete guided measurement entries evaluated across 6 production ML disease risk models & wellness engines.
            </p>
          </div>

          <div className="hidden md:flex items-center gap-2 bg-slate-800/80 backdrop-blur px-3 py-2 rounded-xl border border-slate-700/60">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-slate-300">TreeSHAP Explainable Intelligence</span>
          </div>
        </div>

        {/* Stepper Progress Bar */}
        {currentStep <= 6 && (
          <div className="grid grid-cols-6 gap-2 pt-2 border-t border-slate-800">
            {STEP_TITLES.map((step) => {
              const StepIcon = step.icon
              const isCompleted = currentStep > step.id
              const isCurrent = currentStep === step.id
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => isCompleted && setCurrentStep(step.id)}
                  disabled={!isCompleted && !isCurrent}
                  className={`flex flex-col items-center gap-1 text-center group focus:outline-none transition-all ${
                    isCurrent ? "text-emerald-400" : isCompleted ? "text-slate-300 hover:text-white" : "text-slate-600 opacity-60"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                      isCurrent
                        ? "bg-emerald-500 text-slate-950 ring-4 ring-emerald-500/20 shadow-lg shadow-emerald-500/30"
                        : isCompleted
                        ? "bg-slate-700 text-emerald-400 border border-emerald-500/40"
                        : "bg-slate-800/80 text-slate-500 border border-slate-700/50"
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <StepIcon className="w-4 h-4" />}
                  </div>
                  <span className="text-[11px] font-medium hidden sm:block truncate max-w-[80px]">{step.name}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Main Form Content Body */}
      <form onSubmit={handleSubmit(submit)} className="p-6 md:p-8 space-y-6">
        {errorMsg && (
          <div className="rounded-xl bg-rose-50 dark:bg-rose-950/40 p-4 text-sm text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
            <div>
              <strong className="font-semibold">Assessment Error:</strong> {errorMsg}
            </div>
          </div>
        )}

        {/* STEP 1: Basic Information */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-600" /> Step 1: Basic Demographic Information
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Tell us a few essential baseline details required for clinical risk scaling and demographic calibration.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <SmartInput
                label="Age"
                explanation="Your current chronological age in years."
                unit="years"
                rangeHint="14 – 100 years"
                tooltipContent="Age is a primary baseline risk factor used in Heart (XGBoost), Diabetes, Hypertension, and Stroke prediction models."
                type="number"
                requiredBadge
                error={errors.age?.message}
                {...register("age")}
              />

              <div className="space-y-1.5 w-full">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <span>Biological Sex</span>
                    <span className="text-rose-500 font-bold text-sm">*</span>
                  </label>
                  <InfoTooltip content="Biological sex assigned at birth affects baseline metabolic and cardiovascular model weights." title="Biological Sex" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Biological sex assigned at birth.</p>
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <SegmentedControl
                      options={[
                        { label: "Male", value: "male", description: "Biological Male" },
                        { label: "Female", value: "female", description: "Biological Female" },
                      ]}
                      value={field.value}
                      onChange={field.onChange}
                      name="gender"
                    />
                  )}
                />
                {errors.gender && <p className="text-xs text-rose-500">{errors.gender.message}</p>}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Body & Vitals */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-emerald-600" /> Step 2: Body Measurements & Vital Signs
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Enter your current body measurements and vital sign readings. Every vital input requires clear medical context.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <SmartInput
                label="Height"
                explanation="Standing height measured without shoes."
                unit="cm"
                rangeHint="100 – 220 cm"
                tooltipContent="Height is used to compute your Body Mass Index (BMI) and calibrate physical activity models."
                type="number"
                requiredBadge
                error={errors.height_cm?.message}
                {...register("height_cm")}
              />

              <SmartInput
                label="Weight"
                explanation="Total body mass in light clothing."
                unit="kg"
                rangeHint="30 – 250 kg"
                tooltipContent="Weight is used for BMI auto-calculation and metabolic energy expenditure modeling."
                type="number"
                requiredBadge
                error={errors.weight_kg?.message}
                {...register("weight_kg")}
              />

              {/* Read-Only Auto-Calculated BMI Field */}
              <div className="md:col-span-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Scale className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">Calculated Body Mass Index (BMI)</span>
                      <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold px-2 py-0.5 rounded-full">Auto-Computed</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Calculated automatically from your height ({watchHeight || 0} cm) and weight ({watchWeight || 0} kg).
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto">
                  <span className="text-2xl font-black text-slate-900 dark:text-slate-100">{calculatedBmi > 0 ? calculatedBmi : "--"}</span>
                  <span className="text-xs font-semibold text-slate-500">kg/m²</span>
                </div>
              </div>

              <SmartInput
                label="Systolic Blood Pressure"
                explanation="The upper number: pressure in arteries when your heart beats."
                unit="mmHg"
                rangeHint="70 – 250 mmHg"
                tooltipContent="Systolic BP measures peak pressure during heart contraction. Normal resting is under 120 mmHg."
                type="number"
                requiredBadge
                error={errors.systolic_bp?.message}
                {...register("systolic_bp")}
              />

              <SmartInput
                label="Diastolic Blood Pressure"
                explanation="The lower number: pressure in arteries when your heart rests."
                unit="mmHg"
                rangeHint="40 – 150 mmHg"
                tooltipContent="Diastolic BP measures pressure between heartbeats. Normal resting is under 80 mmHg."
                type="number"
                requiredBadge
                error={errors.diastolic_bp?.message}
                {...register("diastolic_bp")}
              />

              <SmartInput
                label="Resting Heart Rate"
                explanation="Number of heart beats per minute while at rest."
                unit="bpm"
                rangeHint="40 – 220 bpm"
                tooltipContent="Normal resting heart rate for adults ranges from 60 to 100 bpm."
                type="number"
                requiredBadge
                error={errors.heart_rate?.message}
                {...register("heart_rate")}
              />

              <SmartInput
                label="Blood Oxygen Saturation (SpO2)"
                explanation="Percentage of oxygen-saturated hemoglobin."
                unit="%"
                rangeHint="50 – 100 %"
                tooltipContent="Normal resting blood oxygen level is typically 95% to 100%."
                type="number"
                requiredBadge
                error={errors.spo2?.message}
                {...register("spo2")}
              />
            </div>
          </div>
        )}

        {/* STEP 3: Medical History & Metabolic Profile */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-emerald-600" /> Step 3: Medical & Metabolic Profile
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Provide lab readings and clinical history. If optional lab values are unknown, leave them blank for baseline median imputation.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <SmartInput
                label="Fasting Blood Glucose"
                explanation="Blood sugar level after an overnight fast (8+ hours)."
                unit="mg/dL"
                rangeHint="20 – 600 mg/dL"
                tooltipContent="Fasting blood glucose under 100 mg/dL is normal. 100–125 mg/dL indicates prediabetes; 126+ mg/dL indicates diabetes."
                type="number"
                error={errors.glucose?.message}
                {...register("glucose")}
              />

              <SmartInput
                label="Hemoglobin A1c (HbA1c)"
                explanation="3-month average blood sugar percentage marker."
                unit="%"
                rangeHint="3.5 – 15.0 %"
                tooltipContent="HbA1c below 5.7% is normal; 5.7%–6.4% indicates prediabetes; 6.5%+ indicates diabetes."
                type="number"
                error={errors.hba1c?.message}
                {...register("hba1c")}
              />

              <SmartInput
                label="Total Cholesterol"
                explanation="Total concentration of cholesterol in your blood."
                unit="mg/dL"
                rangeHint="50 – 500 mg/dL"
                tooltipContent="Desirable total cholesterol level for adults is generally under 200 mg/dL."
                type="number"
                error={errors.cholesterol?.message}
                {...register("cholesterol")}
              />

              <div className="space-y-4 md:col-span-2 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Family Medical History</h3>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">Family Diabetes History</div>
                    <Controller
                      name="family_history_diabetes"
                      control={control}
                      render={({ field }) => (
                        <SegmentedControl
                          options={[
                            { label: "No", value: "no" },
                            { label: "Yes", value: "yes" },
                          ]}
                          value={field.value || "no"}
                          onChange={field.onChange}
                        />
                      )}
                    />
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">Family Heart Disease History</div>
                    <Controller
                      name="family_history_heart_disease"
                      control={control}
                      render={({ field }) => (
                        <SegmentedControl
                          options={[
                            { label: "No", value: "no" },
                            { label: "Yes", value: "yes" },
                          ]}
                          value={field.value || "no"}
                          onChange={field.onChange}
                        />
                      )}
                    />
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">Family Stroke History</div>
                    <Controller
                      name="family_history_stroke"
                      control={control}
                      render={({ field }) => (
                        <SegmentedControl
                          options={[
                            { label: "No", value: "no" },
                            { label: "Yes", value: "yes" },
                          ]}
                          value={field.value || "no"}
                          onChange={field.onChange}
                        />
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Lifestyle & Nutrition Habits */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-600" /> Step 4: Everyday Lifestyle & Dietary Habits
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Your daily habits provide key behavioral context used across obesity, cardiovascular, and physical activity engines.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Smoking Habit</label>
                <p className="text-xs text-slate-500">Do you smoke tobacco products?</p>
                <Controller
                  name="smoking_status"
                  control={control}
                  render={({ field }) => (
                    <SegmentedControl
                      options={[
                        { label: "Non-smoker", value: "no", description: "Never or former" },
                        { label: "Active Smoker", value: "yes", description: "Current user" },
                      ]}
                      value={field.value || "no"}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Alcohol Consumption</label>
                <p className="text-xs text-slate-500">Do you consume alcoholic beverages regularly?</p>
                <Controller
                  name="alcohol_use"
                  control={control}
                  render={({ field }) => (
                    <SegmentedControl
                      options={[
                        { label: "Non-drinker", value: "no", description: "None or rare" },
                        { label: "Drinker", value: "yes", description: "Regular intake" },
                      ]}
                      value={field.value || "no"}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Vegetable Intake Frequency</label>
                <p className="text-xs text-slate-500">How often do you eat vegetables in meals?</p>
                <Controller
                  name="vegetable_consumption"
                  control={control}
                  render={({ field }) => (
                    <SegmentedControl
                      options={[
                        { label: "Rarely", value: "1", description: "< 1 serving/day" },
                        { label: "Sometimes", value: "2", description: "1–2 servings/day" },
                        { label: "Daily", value: "3", description: "≥ 3 servings/day" },
                      ]}
                      value={String(field.value ?? 2)}
                      onChange={(v) => field.onChange(Number(v))}
                    />
                  )}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Main Meals Per Day</label>
                <p className="text-xs text-slate-500">Number of primary meals eaten daily.</p>
                <Controller
                  name="meals_per_day"
                  control={control}
                  render={({ field }) => (
                    <SegmentedControl
                      options={[
                        { label: "1–2 Meals", value: "2", description: "Infrequent" },
                        { label: "3 Meals", value: "3", description: "Standard" },
                        { label: "4+ Meals", value: "4", description: "Frequent" },
                      ]}
                      value={String(field.value ?? 3)}
                      onChange={(v) => field.onChange(Number(v))}
                    />
                  )}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Snacking Between Meals</label>
                <p className="text-xs text-slate-500">How frequently do you eat food between main meals?</p>
                <Controller
                  name="between_meal_eating"
                  control={control}
                  render={({ field }) => (
                    <SegmentedControl
                      options={[
                        { label: "Never", value: "0", description: "No snacks" },
                        { label: "Sometimes", value: "1", description: "Occasional" },
                        { label: "Frequently", value: "2", description: "Regularly" },
                        { label: "Always", value: "3", description: "Constant" },
                      ]}
                      value={String(field.value ?? 1)}
                      onChange={(v) => field.onChange(Number(v))}
                    />
                  )}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Calorie Intake Tracking</label>
                <p className="text-xs text-slate-500">Do you actively track or monitor your daily calories?</p>
                <Controller
                  name="calorie_monitoring"
                  control={control}
                  render={({ field }) => (
                    <SegmentedControl
                      options={[
                        { label: "No Tracking", value: "no", description: "Standard diet" },
                        { label: "Yes, Tracking", value: "yes", description: "Monitors calories" },
                      ]}
                      value={field.value || "no"}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Daily Screen / Device Hours</label>
                <p className="text-xs text-slate-500">Daily sedentary screen time (phones, laptops, TV).</p>
                <Controller
                  name="technology_usage_hours"
                  control={control}
                  render={({ field }) => (
                    <SegmentedControl
                      options={[
                        { label: "0–2 Hours", value: "0", description: "Low screen time" },
                        { label: "3–5 Hours", value: "1", description: "Average screen time" },
                        { label: "> 5 Hours", value: "2", description: "High screen time" },
                      ]}
                      value={String(field.value ?? 1)}
                      onChange={(v) => field.onChange(Number(v))}
                    />
                  )}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Primary Commute Mode</label>
                <p className="text-xs text-slate-500">Typical transportation method used daily.</p>
                <Controller
                  name="transportation_mode"
                  control={control}
                  render={({ field }) => (
                    <SegmentedControl
                      options={[
                        { label: "Active Commute", value: "walking", description: "Walking / Cycling" },
                        { label: "Motorized Commute", value: "motorized", description: "Car / Bus / Train" },
                      ]}
                      value={field.value || "motorized"}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Physical Activity Level</label>
                <p className="text-xs text-slate-500">Select your general physical exercise activity level.</p>
                <Controller
                  name="exercise_frequency"
                  control={control}
                  render={({ field }) => (
                    <SegmentedControl
                      options={[
                        { label: "Sedentary / Inactive", value: "inactive", description: "< 150 mins exercise / week" },
                        { label: "Physically Active", value: "active", description: "≥ 150 mins exercise / week" },
                      ]}
                      value={field.value || "active"}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Sleep & Wellness */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Moon className="w-5 h-5 text-indigo-500" /> Step 5: Sleep & Wellness Signals
                </h2>
                <span className="text-xs bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-full font-medium border border-indigo-200 dark:border-indigo-800">
                  Layer B Wellness Signals
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                These lifestyle measurements feed non-diagnostic sleep, physical activity, and nutrition intelligence models.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <SmartInput
                label="Daily Sleep Duration"
                explanation="Average total sleep duration per 24-hour night."
                unit="hours/night"
                rangeHint="3.0 – 14.0 hours"
                tooltipContent="Recommended sleep for adults is 7 to 9 hours per night."
                type="number"
                requiredBadge
                error={errors.sleep_hours?.message}
                {...register("sleep_hours")}
              />

              <SmartInput
                label="Daily Water Intake"
                explanation="Estimated volume of plain liquid water consumed per day."
                unit="L/day"
                rangeHint="0.5 – 10.0 liters"
                tooltipContent="Adequate daily water intake is roughly 2.0–3.5 liters per day depending on climate and activity."
                type="number"
                error={errors.water_intake_l?.message}
                {...register("water_intake_l")}
              />

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Assessment Notes (Optional)</label>
                <Textarea
                  placeholder="Enter any additional personal context, symptoms, or medication notes..."
                  className="rounded-xl text-sm"
                  rows={3}
                  {...register("notes")}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: Kidney / Laboratory Data (Optional Progressive Disclosure) */}
        {currentStep === 6 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <FlaskConical className="w-5 h-5 text-cyan-600" /> Step 6: Kidney Health & Laboratory Biomarkers (Optional)
                </h2>
                <span className="text-xs bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 px-2.5 py-1 rounded-full font-medium border border-cyan-200 dark:border-cyan-800">
                  Optional Clinical Labs
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Enter recent blood or urine laboratory results if available. If no laboratory tests have been performed, LifeOS will evaluate kidney health in self-assessment mode without fabricating clinical measurements.
              </p>
            </div>

            {/* Mode Selector Toggle */}
            <div className="p-4 rounded-xl border border-cyan-200 dark:border-cyan-900 bg-cyan-50/40 dark:bg-cyan-950/20 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                    Do you have recent clinical laboratory test results?
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Includes Serum Creatinine, Blood Urea / BUN, Urine Albumin, or Complete Blood Count.
                  </p>
                </div>
                <Controller
                  name="has_kidney_labs"
                  control={control}
                  render={({ field }) => (
                    <SegmentedControl
                      options={[
                        { label: "No Labs Available", value: "no", description: "Vitals-only Mode A" },
                        { label: "Enter Lab Results", value: "yes", description: "Enhanced Mode B" },
                      ]}
                      value={field.value ? "yes" : "no"}
                      onChange={(v) => field.onChange(v === "yes")}
                    />
                  )}
                />
              </div>

              {!watchHasKidneyLabs ? (
                <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                  <Info className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Self-Assessment Mode A Active:</strong> Chronic Kidney Disease risk will be estimated using your entered vitals (blood pressure, age, blood glucose). To prevent clinical inaccuracy, no fake normal creatinine or albumin values will be claimed as your personal measurements.
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Lab-Enhanced Mode B Active:</strong> The 24-feature XGBoost kidney model will utilize your actual clinical laboratory biomarkers for individualized risk screening.
                  </div>
                </div>
              )}
            </div>

            {/* Conditional Lab Inputs */}
            {watchHasKidneyLabs && (
              <div className="grid gap-6 md:grid-cols-2 animate-in fade-in duration-200">
                <SmartInput
                  label="Serum Creatinine"
                  explanation="Key marker of glomerular filtration rate (GFR)."
                  unit="mg/dL"
                  rangeHint="0.1 – 15.0 mg/dL (Normal ~0.6–1.2)"
                  tooltipContent="Creatinine is a waste product filtered by the kidneys. Elevated levels indicate impaired clearance."
                  type="number"
                  error={errors.serum_creatinine?.message}
                  {...register("serum_creatinine")}
                />

                <SmartInput
                  label="Blood Urea / BUN"
                  explanation="Nitrogen waste product from protein metabolism."
                  unit="mg/dL"
                  rangeHint="1 – 250 mg/dL (Normal ~7–20)"
                  tooltipContent="Blood Urea Nitrogen rises when kidney function decreases or with severe dehydration."
                  type="number"
                  error={errors.blood_urea?.message}
                  {...register("blood_urea")}
                />

                <SmartInput
                  label="Urinary Albumin"
                  explanation="Protein presence in urine sample (ordinal grade)."
                  unit="grade 0–5"
                  rangeHint="0 (Negative) to 5 (Heavy Proteinuria)"
                  tooltipContent="Albuminuria indicates damage to kidney glomeruli filtering barriers."
                  type="number"
                  error={errors.urinary_albumin?.message}
                  {...register("urinary_albumin")}
                />

                <SmartInput
                  label="Hemoglobin Level"
                  explanation="Oxygen-carrying protein in red blood cells."
                  unit="g/dL"
                  rangeHint="3.0 – 20.0 g/dL (Normal ~12–17)"
                  tooltipContent="Kidneys produce erythropoietin (EPO); chronic impairment often results in low hemoglobin (renal anemia)."
                  type="number"
                  error={errors.hemoglobin?.message}
                  {...register("hemoglobin")}
                />

                <SmartInput
                  label="Urine Specific Gravity"
                  explanation="Concentration of solutes in urine."
                  unit="ratio"
                  rangeHint="1.000 – 1.040 (Normal ~1.010–1.025)"
                  tooltipContent="Reflects the kidney tubules ability to concentrate or dilute urine."
                  type="number"
                  error={errors.specific_gravity?.message}
                  {...register("specific_gravity")}
                />

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Pedal Edema (Ankle Swelling)</label>
                  <p className="text-xs text-slate-500">Noticeable swelling in feet, ankles, or lower legs?</p>
                  <Controller
                    name="pedal_edema"
                    control={control}
                    render={({ field }) => (
                      <SegmentedControl
                        options={[
                          { label: "No Swelling", value: "no", description: "Normal" },
                          { label: "Yes, Swelling", value: "yes", description: "Fluid retention" },
                        ]}
                        value={field.value || "no"}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 7: Review Information */}
        {currentStep === 7 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-emerald-600" /> Step 7: Review Your Complete Assessment Summary
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Please verify all entered measurements before initiating multi-model intelligence analysis.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Basic Info Summary */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">1. Demographic Baseline</span>
                  <button type="button" onClick={() => setCurrentStep(1)} className="text-xs text-emerald-600 font-semibold hover:underline">Edit</button>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                  <div>Age: <strong className="text-slate-900 dark:text-slate-100">{watch("age")} years</strong></div>
                  <div>Biological Sex: <strong className="text-slate-900 dark:text-slate-100 capitalize">{watch("gender")}</strong></div>
                </div>
              </div>

              {/* Body & Vitals Summary */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">2. Body & Vital Signs</span>
                  <button type="button" onClick={() => setCurrentStep(2)} className="text-xs text-emerald-600 font-semibold hover:underline">Edit</button>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                  <div>Height & Weight: <strong className="text-slate-900 dark:text-slate-100">{watch("height_cm")} cm / {watch("weight_kg")} kg</strong></div>
                  <div>BMI: <strong className="text-emerald-600 dark:text-emerald-400">{calculatedBmi} kg/m²</strong></div>
                  <div>Blood Pressure: <strong className="text-slate-900 dark:text-slate-100">{watch("systolic_bp")} / {watch("diastolic_bp")} mmHg</strong></div>
                  <div>Heart Rate & SpO2: <strong className="text-slate-900 dark:text-slate-100">{watch("heart_rate")} bpm / {watch("spo2")}%</strong></div>
                </div>
              </div>

              {/* Medical History Summary */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">3. Metabolic Profile</span>
                  <button type="button" onClick={() => setCurrentStep(3)} className="text-xs text-emerald-600 font-semibold hover:underline">Edit</button>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                  <div>Blood Glucose: <strong className="text-slate-900 dark:text-slate-100">{watch("glucose") || "Default"} mg/dL</strong></div>
                  <div>HbA1c: <strong className="text-slate-900 dark:text-slate-100">{watch("hba1c") || "Unspecified"} %</strong></div>
                  <div>Cholesterol: <strong className="text-slate-900 dark:text-slate-100">{watch("cholesterol") || "Unspecified"} mg/dL</strong></div>
                </div>
              </div>

              {/* Lifestyle & Wellness Summary */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">4 & 5. Lifestyle & Habits</span>
                  <button type="button" onClick={() => setCurrentStep(4)} className="text-xs text-emerald-600 font-semibold hover:underline">Edit</button>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                  <div>Exercise / Activity: <strong className="text-slate-900 dark:text-slate-100 capitalize">{watch("exercise_frequency")}</strong></div>
                  <div>Vegetables & Meals: <strong className="text-slate-900 dark:text-slate-100">{watch("vegetable_consumption") === 3 ? "Daily" : watch("vegetable_consumption") === 1 ? "Rarely" : "Sometimes"}, {watch("meals_per_day")} meals/day</strong></div>
                  <div>Screen Time / Commute: <strong className="text-slate-900 dark:text-slate-100">{watch("technology_usage_hours") === 0 ? "0-2h" : watch("technology_usage_hours") === 2 ? ">5h" : "3-5h"}, {watch("transportation_mode")}</strong></div>
                  <div>Sleep: <strong className="text-indigo-600 dark:text-indigo-400">{watch("sleep_hours")} hours/night</strong></div>
                </div>
              </div>

              {/* Kidney Labs Mode Summary */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2 md:col-span-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">6. Kidney Screening Mode</span>
                  <button type="button" onClick={() => setCurrentStep(6)} className="text-xs text-emerald-600 font-semibold hover:underline">Edit</button>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  {watchHasKidneyLabs ? (
                    <div className="text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5 font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Lab-Enhanced Screening Active (Creatinine: {watch("serum_creatinine") || "Standard"}, BUN: {watch("blood_urea") || "Standard"}, Albumin: {watch("urinary_albumin") ?? "Standard"})
                    </div>
                  ) : (
                    <div className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                      <Info className="w-4 h-4 text-cyan-600" />
                      Self-Assessment Vitals Mode (Evaluated from blood pressure, glucose, and age. No clinical laboratory values claimed).
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              <div>
                <strong>Submission Notice:</strong> Clicking <em>"Analyze Health Risk"</em> will execute 6 parallel machine learning disease models (Heart, Diabetes, Hypertension, Obesity, Stroke, CKD), compute TreeSHAP feature attributions, invoke the 4-way Risk Fusion Engine, generate recommendations, and save a canonical snapshot in your Health History.
              </div>
            </div>
          </div>
        )}

        {/* STEP 8: Real-Time Intelligence Loader */}
        {currentStep === 8 && (
          <div className="py-12 px-4 text-center space-y-6 animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center ring-8 ring-emerald-500/10 animate-pulse">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">LifeOS Intelligence Analysis in Progress</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">{status}</p>
            </div>

            {/* Analysis Progress Steps */}
            <div className="max-w-md mx-auto space-y-2 text-left bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <div className={`flex items-center gap-2.5 ${analysisPhase >= 1 ? "text-emerald-600 font-semibold" : "text-slate-400"}`}>
                {analysisPhase > 1 ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Loader2 className="w-4 h-4 animate-spin" />}
                <span>1. Feature Contract Validation</span>
              </div>
              <div className={`flex items-center gap-2.5 ${analysisPhase >= 2 ? "text-emerald-600 font-semibold" : "text-slate-400"}`}>
                {analysisPhase > 2 ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : analysisPhase === 2 ? <Loader2 className="w-4 h-4 animate-spin" /> : <div className="w-4 h-4 rounded-full border border-slate-300" />}
                <span>2. Disease Model Inference (6 Disease Verticals)</span>
              </div>
              <div className={`flex items-center gap-2.5 ${analysisPhase >= 3 ? "text-emerald-600 font-semibold" : "text-slate-400"}`}>
                {analysisPhase > 3 ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : analysisPhase === 3 ? <Loader2 className="w-4 h-4 animate-spin" /> : <div className="w-4 h-4 rounded-full border border-slate-300" />}
                <span>3. TreeSHAP Feature Attribution Computation</span>
              </div>
              <div className={`flex items-center gap-2.5 ${analysisPhase >= 4 ? "text-emerald-600 font-semibold" : "text-slate-400"}`}>
                {analysisPhase > 4 ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : analysisPhase === 4 ? <Loader2 className="w-4 h-4 animate-spin" /> : <div className="w-4 h-4 rounded-full border border-slate-300" />}
                <span>4. Risk Fusion Engine & Recommendation Synthesis</span>
              </div>
              <div className={`flex items-center gap-2.5 ${analysisPhase >= 5 ? "text-emerald-600 font-semibold" : "text-slate-400"}`}>
                {analysisPhase >= 5 ? <Loader2 className="w-4 h-4 animate-spin" /> : <div className="w-4 h-4 rounded-full border border-slate-300" />}
                <span>5. Storing Snapshot into Health Assessment History</span>
              </div>
            </div>
          </div>
        )}

        {/* Stepper Navigation Actions */}
        {currentStep <= 7 && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            {currentStep > 1 ? (
              <Button type="button" variant="outline" onClick={handlePrevStep} className="rounded-xl gap-2">
                <ArrowLeft className="w-4 h-4" /> Previous
              </Button>
            ) : (
              <div />
            )}

            {currentStep < 7 ? (
              <Button type="button" onClick={handleNextStep} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                Next Step <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white gap-2 px-6">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-amber-300" />}
                Analyze Health Risk
              </Button>
            )}
          </div>
        )}
      </form>
    </Card>
  )
}
