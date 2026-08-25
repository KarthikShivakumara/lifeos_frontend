import type { CKDPredictionRequest } from "../types"

export function mapAssessmentToCKDPayload(formData: Record<string, any>): CKDPredictionRequest {
  const age = Number(formData.age ?? 45)
  const bp = Number(formData.systolic_bp ?? 120)
  const bgr = Number(formData.blood_glucose ?? formData.glucose ?? 100)
  const htn = bp >= 140 ? "yes" : "no"
  const dm = bgr >= 126 || formData.family_history_diabetes === "yes" ? "yes" : "no"

  return {
    age,
    bp,
    sg: 1.02,
    al: 0,
    su: 0,
    bgr,
    bu: 14,
    sc: 0.8,
    sod: 140.0,
    pot: 4.2,
    hemo: 15.0,
    pcv: 45,
    wc: 7500,
    rc: 5.0,
    rbc: "normal",
    pc: "normal",
    pcc: "notpresent",
    ba: "notpresent",
    htn,
    dm,
    cad: "no",
    appet: "good",
    pe: "no",
    ane: "no",
  }
}
