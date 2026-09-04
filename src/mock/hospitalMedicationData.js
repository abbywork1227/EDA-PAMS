// 模擬「醫院藥品 API」回傳資料。
// 真正上線時這一層會由 API response 取代；查核系統不自行維護醫院實際藥品主檔。
const drug = (id, unitId, code, name, controlledLevel = null, ambulanceTypeId = null, ambulanceFlag = false, qty = 1) => ({
  id, unitId, drugCode: code, drugName: name, controlledLevel, isControlled: Boolean(controlledLevel),
  isAmbulanceItem: ambulanceFlag, ambulanceTypeId, stockQty: qty,
  // 模擬藥庫可提供的效期清單；正式環境由藥庫 API 回傳。
  expiryDates: [],
})

export const mockHospitalMedicationData = [
  { ...drug('D-3A-01', '3A', 'C001', 'Morphine HCl Inj 10mg/mL', '1', null, false, 12), expiryDates: ['2026-06-30','2026-08-31','2026-09-30','2026-11-30','2027-01-31'] },,
  { ...drug('D-3A-02', '3A', 'C002', 'Pethidine HCl Inj 50mg/mL', '2', null, false, 8), expiryDates: ['2026-06-30','2026-07-31','2026-10-31','2027-01-31','2027-03-31'] },,
  drug('D-3A-03', '3A', 'R001', 'Normal Saline 500ml', null, null, false, 25),
  drug('D-3A-04', '3A', 'R002', 'Acetaminophen 500mg', null, null, false, 18),
  drug('D-3A-05', '3A', 'A001', 'Amiodarone 150mg/3ml/Amp', null, 'AMB-PED-CART', true, 3),
  drug('D-3B-01', '3B', 'R101', 'Normal Saline 500ml', null, null, false, 12),
  drug('D-3B-02', '3B', 'R102', 'Acetaminophen 500mg', null, null, false, 10),
  { ...drug('D-3C-01', '3C', 'C101', 'Fentanyl Citrate Inj 0.1mg/2mL', '3', null, false, 8), expiryDates: ['2026-07-31','2026-09-30','2026-12-31','2027-02-28','2027-04-30'] },,
  drug('D-3C-02', '3C', 'R201', 'D5W 500ml', null, null, false, 18),
  drug('D-3C-03', '3C', 'A201', 'Amiodarone 150mg/3ml/Amp', null, 'AMB-ADULT-CART', true, 3),
  { ...drug('D-3D-01', '3D', 'C301', 'Morphine HCl Inj 10mg/mL', '1', null, false, 8), expiryDates: ['2026-06-30','2026-08-31','2026-10-31','2027-01-31','2027-02-28'] },,
  drug('D-3D-02', '3D', 'R301', 'Normal Saline 500ml', null, null, false, 16),
  drug('D-3E-01', '3E', 'R401', 'Normal Saline 500ml', null, null, false, 15),
  drug('D-3E-02', '3E', 'R402', 'Acetaminophen 500mg', null, null, false, 10),
  drug('D-4A-01', '4A', 'R501', 'Normal Saline 500ml', null, null, false, 18),
  drug('D-4A-02', '4A', 'A501', 'Atropine 1mg/ml', null, 'AMB-PED-CART', true, 5),
  drug('D-4B-01', '4B', 'R601', 'Normal Saline 500ml', null, null, false, 6),
  drug('D-4B-02', '4B', 'A601', 'Epinephrine 1mg/ml', null, 'AMB-PED-BOX', true, 4),
  { ...drug('D-4C-01', '4C', 'C701', 'Pethidine HCl Inj 50mg/mL', '2', null, false, 5), expiryDates: ['2026-09-30','2026-12-31','2027-02-28','2027-04-30','2027-06-30'] },,
  { ...drug('D-ER-01', 'ER', 'C801', 'Morphine HCl Inj 10mg/mL', '1', null, false, 20), expiryDates: ['2026-06-30','2026-07-31','2026-09-30','2026-12-31','2027-03-31'] },,
  drug('D-ER-02', 'ER', 'R801', 'Normal Saline 500ml', null, null, false, 40),
  { ...drug('D-OR-01', 'OR', 'C901', 'Fentanyl Citrate Inj 0.1mg/2mL', '3', null, false, 15), expiryDates: ['2026-06-30','2026-09-30','2026-11-30','2027-01-31','2027-05-31'] },,
  drug('D-OR-02', 'OR', 'R901', 'Normal Saline 500ml', null, null, false, 50),
  { ...drug('D-CATH-01', 'CATH', 'C1001', 'Midazolam 5mg/ml/Amp', '4', null, false, 5), expiryDates: ['2026-08-31','2026-10-31','2027-01-31','2027-03-31','2027-06-30'] },,
  drug('D-CATH-02', 'CATH', 'R1001', 'Normal Saline 500ml', null, null, false, 30),
]

export const getHospitalMedicationByUnit = (unitId) =>
  mockHospitalMedicationData.filter(item => item.unitId === unitId)

export const getControlledDrugsByUnit = (unitId) =>
  getHospitalMedicationByUnit(unitId).filter(item => item.isControlled)

export const getRegularDrugsByUnit = (unitId) =>
  getHospitalMedicationByUnit(unitId).filter(item => !item.isControlled)

export const getControlledDrugExpiryDates = (drugId) => {
  const item = mockHospitalMedicationData.find(entry => entry.id === drugId)
  return item?.expiryDates || []
}

export const getAmbulanceDrugsByUnit = (unitId, ambulanceTypeId = null) =>
  getHospitalMedicationByUnit(unitId).filter(item =>
    item.isAmbulanceItem && (!ambulanceTypeId || item.ambulanceTypeId === ambulanceTypeId)
  )
