import { mockUnits } from './units'
import { mockUsers, getMockUserById } from './users'
import { mockUnitAssignments } from './unitAssignments'
import { mockAuditItemCategories } from './auditItems'
import { mockAuditFrequency } from './auditFrequency'
import { mockAmbulanceConfigurations } from './ambulance'
import { getHospitalAmbulancesByUnit } from './hospitalAmbulanceData'
import { getHospitalMedicationByUnit, getControlledDrugsByUnit, getRegularDrugsByUnit } from './hospitalMedicationData'

const YEARS = [2025, 2026, 2027]

const getConfiguredCategoryIds = (unitAssignment, unitId) => {
  // 類別是否「有查核」由「查核項目／頻率設定」決定；
  // A 管制藥品則另外依醫院 API 判斷該單位是否真的有管制藥品。
  // 因此不再使用 unitAssignment.auditAttributes 作為新流程的來源。
  const controlledExists = getControlledDrugsByUnit(unitId).length > 0
  const configuredIds = mockAuditItemCategories
    .map(category => category.id)
    .filter(categoryId => categoryId !== 'CONTROLLED' || controlledExists)

  return configuredIds
}

export const getAuditCategoryIdsForUnit = (unitId) => {
  const unitAssignment = mockUnitAssignments.find(item => item.unitId === unitId && item.enabled)
  if (!unitAssignment) return []
  return getConfiguredCategoryIds(unitAssignment, unitId)
}

export const getAuditMonthsForUnit = (unitId) => {
  const categoryIds = getAuditCategoryIdsForUnit(unitId)
  const months = new Set()

  categoryIds.forEach(categoryId => {
    const frequency = mockAuditFrequency.find(item => item.categoryId === categoryId && item.enabled !== false)
    frequency?.months?.forEach(month => months.add(month))
  })

  return [...months].sort((a, b) => a - b)
}

const makeAuditCategories = (unitAssignment, unitId, month) => {
  const categoryIds = getConfiguredCategoryIds(unitAssignment, unitId)

  return categoryIds
    .filter(categoryId => {
      const frequency = mockAuditFrequency.find(item => item.categoryId === categoryId && item.enabled !== false)
      return frequency?.months?.includes(month)
    })
    .map(categoryId => {
      const category = mockAuditItemCategories.find(item => item.id === categoryId)
      return category ? { categoryId, code: category.code, name: category.name } : null
    })
    .filter(Boolean)
}

const buildAssignment = (unitAssignment, unit, pharmacist, year, month) => {
  const controlledDrugs = getControlledDrugsByUnit(unit.id)
  const regularDrugs = getRegularDrugsByUnit(unit.id)
  const medicationData = getHospitalMedicationByUnit(unit.id)
  const categories = makeAuditCategories(unitAssignment, unit.id, month)
  const hospitalAmbulances = getHospitalAmbulancesByUnit(unit.id)
  const ambulanceTypes = hospitalAmbulances
    .map(item => mockAmbulanceConfigurations.find(config => config.id === item.ambulanceTypeId) ? {
      ...mockAmbulanceConfigurations.find(config => config.id === item.ambulanceTypeId),
      quantity: item.quantity,
    } : null)
    .filter(Boolean)

  return {
    id: `AUD-${year}-${String(month).padStart(2, '0')}-${unit.id}`,
    year,
    month,
    unitId: unit.id,
    unitName: unit.name,
    unitType: unit.type,
    hospitalId: unit.hospitalId,
    pharmacistId: pharmacist.id,
    pharmacistName: pharmacist.name,
    unitContactName: getMockUserById(unitAssignment.contactUserId)?.name || '',
    auditCategoryIds: categories.map(item => item.categoryId),
    auditCategories: categories,
    availableCategoryIds: getConfiguredCategoryIds(unitAssignment, unit.id),
    hasControlledDrugs: controlledDrugs.length > 0,
    controlledDrugsCount: controlledDrugs.length,
    regularDrugsCount: regularDrugs.length,
    medicationSnapshot: medicationData.map(item => ({ ...item })),
    ambulanceTypeIds: ambulanceTypes.map(item => item.id),
    ambulanceTypes: ambulanceTypes.map(item => ({ id: item.id, code: item.code, name: item.name, layout: item.layout, quantity: item.quantity })),
    auditWindow: {
      previousYear: year - 1,
      currentYear: year,
      nextYear: year + 1,
    },
  }
}

export const buildMockAuditAssignments = () => YEARS.flatMap(year =>
  mockUnitAssignments.flatMap(unitAssignment => {
    const unit = mockUnits.find(item => item.id === unitAssignment.unitId)
    const pharmacist = mockUsers.find(item => item.id === unitAssignment.pharmacistId)
    if (!unit || !pharmacist || !unitAssignment.enabled) return []

    return getAuditMonthsForUnit(unit.id)
      .map(month => buildAssignment(unitAssignment, unit, pharmacist, year, month))
  })
)

// 保留這個 export 給既有頁面使用；真正查詢時改由函式即時依目前頻率設定重建。
export const mockAuditAssignments = buildMockAuditAssignments()

export const getAuditAssignment = (id) => buildMockAuditAssignments().find(item => item.id === id) || null

export const getAuditAssignmentByUnitMonth = (unitId, year, month) =>
  buildMockAuditAssignments().find(item => item.unitId === unitId && item.year === Number(year) && item.month === Number(month)) || null

export const getAuditAssignmentsForPharmacist = (pharmacistId, year = null) =>
  buildMockAuditAssignments().filter(item => item.pharmacistId === pharmacistId && (year == null || item.year === Number(year)))

export const getAvailableMonthsForUnit = (unitId, year) =>
  buildMockAuditAssignments()
    .filter(item => item.unitId === unitId && item.year === Number(year))
    .map(item => item.month)
    .sort((a, b) => a - b)

export const getAuditYearWindow = (year) => {
  const y = Number(year)
  return { previousYear: y - 1, currentYear: y, nextYear: y + 1 }
}
