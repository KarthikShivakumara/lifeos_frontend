"use client"

import Link from "next/link"
import { CheckCircle2, ChevronLeft, Database, FileSpreadsheet, Lock, Shield, XCircle } from "lucide-react"

export default function DatasetIntelligenceReportPage() {
  const datasets = [
    {
      name: "Cardiovascular Disease Dataset",
      category: "Production (Layer A)",
      purpose: "Train Heart Disease XGBoost Classifier",
      rows: "70,000 records",
      features: "12 clinical features",
      target: "cardio (0/1)",
      model: "Heart Disease Model",
      status: "PRODUCTION / VERIFIED",
      provenance: "Kaggle Clinical Dataset",
    },
    {
      name: "Diabetes Prediction Dataset",
      category: "Production (Layer A)",
      purpose: "Train Diabetes LightGBM Classifier",
      rows: "100,000 records",
      features: "9 clinical features",
      target: "diabetes (0/1)",
      model: "Diabetes Mellitus Model",
      status: "PRODUCTION / VERIFIED",
      provenance: "Healthcare System Registry",
    },
    {
      name: "Hypertension Risk Dataset",
      category: "Production (Layer A)",
      purpose: "Train Hypertension XGBoost Classifier",
      rows: "30,000 records",
      features: "11 clinical features",
      target: "hypertension (0/1)",
      model: "Hypertension Model",
      status: "PRODUCTION / VERIFIED",
      provenance: "Cardiovascular Registry",
    },
    {
      name: "Obesity Levels Estimation Dataset",
      category: "Production (Layer A)",
      purpose: "Train Obesity LightGBM Classifier",
      rows: "2,111 records",
      features: "17 lifestyle & demographic features",
      target: "NObeyesdad (Multi-class ordinal)",
      model: "Obesity Model",
      status: "PRODUCTION / VERIFIED",
      provenance: "UCI Machine Learning Repository",
    },
    {
      name: "Healthcare Stroke Prediction Dataset",
      category: "Production (Layer A)",
      purpose: "Train Stroke Risk XGBoost Classifier",
      rows: "5,110 records",
      features: "11 clinical features",
      target: "stroke (0/1)",
      model: "Stroke Risk Model",
      status: "PRODUCTION / VERIFIED",
      provenance: "Kaggle Clinical Dataset",
    },
    {
      name: "UCI Chronic Kidney Disease Dataset",
      category: "Production (Layer A)",
      purpose: "Train CKD XGBoost Classifier",
      rows: "400 patient records",
      features: "24 lab & clinical features",
      target: "classification (ckd/notckd)",
      model: "CKD Model",
      status: "PRODUCTION / VERIFIED",
      provenance: "UCI Machine Learning Repository",
    },
    {
      name: "USDA FoodData Central Foundation Database",
      category: "Production (Layer B)",
      purpose: "Nutrient Lookup & Micronutrient Scaling",
      rows: "8,789 indexed foods",
      features: "34 nutrient fields per food item",
      target: "Nutritional Provenance",
      model: "Nutrition Rules Engine",
      status: "PRODUCTION / VERIFIED",
      provenance: "USDA Official Food Registry",
    },
    {
      name: "Wearable Stress Detection Dataset (WESAD)",
      category: "Rejected / Experimental",
      purpose: "Experimental Wearable Stress Classifier",
      rows: "15 subject wearable streams",
      features: "BVP, EDA, ECG, Temperature",
      target: "stress_level (0/1)",
      model: "Stress Prediction Model",
      status: "REJECTED (ROC-AUC 0.4615)",
      provenance: "WESAD Multi-Modal Dataset",
    },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/reports"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Dataset Intelligence & Provenance Registry</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Complete audit trail of production clinical datasets, supporting wellness databases, and rejected experimental sources.
          </p>
        </div>
      </div>

      {/* Datasets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {datasets.map((d) => {
          const isRejected = d.status.includes("REJECTED")
          return (
            <div
              key={d.name}
              className={`rounded-2xl border p-5 space-y-3 transition-all ${
                isRejected
                  ? "border-rose-300 dark:border-rose-800 bg-rose-50/40 dark:bg-rose-950/30"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs"
              }`}
            >
              <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isRejected ? "text-rose-600" : "text-emerald-600"}`}>
                    {d.category}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">{d.name}</h3>
                  <p className="text-xs text-slate-500">{d.provenance}</p>
                </div>
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                    isRejected
                      ? "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900 dark:text-rose-200"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300"
                  }`}
                >
                  {isRejected ? <XCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                  {d.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">Dataset Size</span>
                  <div className="font-bold text-slate-900 dark:text-slate-100">{d.rows}</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">Feature Count</span>
                  <div className="font-bold text-slate-900 dark:text-slate-100">{d.features}</div>
                </div>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-400 pt-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Target / Purpose:</span> {d.purpose}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
