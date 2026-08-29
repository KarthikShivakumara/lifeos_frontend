import type { CKDPredictionRequest } from "../types"

export function isLabEnhancedCKD(formData: Record<string, any>): boolean {
  return Boolean(
    formData.has_kidney_labs ||
    (formData.serum_creatinine !== undefined && formData.serum_creatinine !== "") ||
    (formData.sc !== undefined && formData.sc !== "") ||
    (formData.urinary_albumin !== undefined && formData.urinary_albumin !== "") ||
    (formData.blood_urea !== undefined && formData.blood_urea !== "") ||
    (formData.bu !== undefined && formData.bu !== "")
  )
}

export function mapAssessmentToCKDPayload(formData: Record<string, any>): CKDPredictionRequest {
  const age = Number(formData.age ?? 45)
  const bp = Number(formData.systolic_bp ?? 120)
  const bgr = Number(formData.blood_glucose ?? formData.glucose ?? 100)
  const htn = bp >= 140 || formData.hypertension === "yes" || formData.hypertension === 1 ? "yes" : "no"
  const dm = bgr >= 126 || formData.family_history_diabetes === "yes" || formData.diabetes === "yes" ? "yes" : "no"

  // Laboratory Biomarkers: Real user-provided values if entered; clinically sound reference standards if no lab data
  const sg = formData.specific_gravity !== undefined && formData.specific_gravity !== "" ? Number(formData.specific_gravity) : (formData.sg ? Number(formData.sg) : 1.02)
  const al = formData.urinary_albumin !== undefined && formData.urinary_albumin !== "" ? Number(formData.urinary_albumin) : (formData.al ? Number(formData.al) : 0.0)
  const su = formData.urinary_sugar !== undefined && formData.urinary_sugar !== "" ? Number(formData.urinary_sugar) : (formData.su ? Number(formData.su) : 0.0)
  
  const bu = formData.blood_urea !== undefined && formData.blood_urea !== "" ? Number(formData.blood_urea) : (formData.bu ? Number(formData.bu) : 14.0)
  const sc = formData.serum_creatinine !== undefined && formData.serum_creatinine !== "" ? Number(formData.serum_creatinine) : (formData.sc ? Number(formData.sc) : 0.8)
  const sod = formData.serum_sodium !== undefined && formData.serum_sodium !== "" ? Number(formData.serum_sodium) : (formData.sod ? Number(formData.sod) : 140.0)
  const pot = formData.serum_potassium !== undefined && formData.serum_potassium !== "" ? Number(formData.serum_potassium) : (formData.pot ? Number(formData.pot) : 4.2)
  const hemo = formData.hemoglobin !== undefined && formData.hemoglobin !== "" ? Number(formData.hemoglobin) : (formData.hemo ? Number(formData.hemo) : 15.0)
  const pcv = formData.packed_cell_volume !== undefined && formData.packed_cell_volume !== "" ? Number(formData.packed_cell_volume) : (formData.pcv ? Number(formData.pcv) : 45.0)
  const wc = formData.white_blood_cell_count !== undefined && formData.white_blood_cell_count !== "" ? Number(formData.white_blood_cell_count) : (formData.wc ? Number(formData.wc) : 7500.0)
  const rc = formData.red_blood_cell_count !== undefined && formData.red_blood_cell_count !== "" ? Number(formData.red_blood_cell_count) : (formData.rc ? Number(formData.rc) : 5.0)

  const rbc = formData.rbc === "abnormal" ? "abnormal" : "normal"
  const pc = formData.pc === "abnormal" ? "abnormal" : "normal"
  const pcc = formData.pcc === "present" ? "present" : "notpresent"
  const ba = formData.ba === "present" ? "present" : "notpresent"
  const cad = formData.cad === "yes" || formData.family_history_heart_disease === "yes" ? "yes" : "no"
  const appet = formData.appet === "poor" ? "poor" : "good"
  const pe = formData.pedal_edema === "yes" || formData.pe === "yes" ? "yes" : "no"
  const ane = formData.anemia === "yes" || formData.ane === "yes" ? "yes" : "no"

  return {
    age,
    bp,
    sg,
    al,
    su,
    bgr,
    bu,
    sc,
    sod,
    pot,
    hemo,
    pcv,
    wc,
    rc,
    rbc,
    pc,
    pcc,
    ba,
    htn,
    dm,
    cad,
    appet,
    pe,
    ane,
  }
}
