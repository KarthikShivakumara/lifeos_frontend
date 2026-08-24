import type { CKDPredictionRequest } from "../types"

export function mapAssessmentToCKDPayload(formData: Record<string, any>): CKDPredictionRequest {
  const age = Number(formData.age ?? 45)
  const bp = Number(formData.systolic_bp ?? 120)
  const bgr = Number(formData.glucose ?? 100)
  const htn = bp >= 140 ? "yes" : "no"
  const dm = bgr >= 126 || formData.family_history_diabetes === "yes" ? "yes" : "no"

  return {
    age,
    bp,
    sg: 1.02,
    al: 0,
    su: 0,
    bgr,
    bu: 36,
    sc: 1.2,
    sod: 137.5,
    pot: 4.6,
    hemo: 12.5,
    pcv: 40,
    wc: 8000,
    rc: 5.2,
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
