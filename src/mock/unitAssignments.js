// 受查單位配置：對應「哪個單位由哪個藥師負責」，以及該單位啟用哪些查核屬性。
export const mockUnitAssignments = [
  { id: 'UA001', unitId: '3A', pharmacistId: 'U001', contactUserId: 'C003A', enabled: true, auditAttributes: ['REGULAR', 'CONTROLLED'], ambulanceTypeIds: ['AMB-PED-CART'] },
  { id: 'UA002', unitId: '3B', pharmacistId: 'U001', contactUserId: 'C003B', enabled: true, auditAttributes: ['CONTROLLED'], ambulanceTypeIds: [] },
  { id: 'UA003', unitId: '3C', pharmacistId: 'U001', contactUserId: 'C003C', enabled: true, auditAttributes: ['REGULAR', 'CONTROLLED'], ambulanceTypeIds: ['AMB-ADULT-CART'] },
  { id: 'UA004', unitId: '3D', pharmacistId: 'U001', contactUserId: 'C003D', enabled: true, auditAttributes: ['REGULAR', 'CONTROLLED'], ambulanceTypeIds: [] },
  { id: 'UA005', unitId: '3E', pharmacistId: 'U001', contactUserId: 'C003E', enabled: true, auditAttributes: ['REGULAR'], ambulanceTypeIds: [] },
  { id: 'UA006', unitId: '4A', pharmacistId: 'U005', contactUserId: 'C004A', enabled: true, auditAttributes: ['REGULAR'], ambulanceTypeIds: ['AMB-PED-CART'] },
  { id: 'UA007', unitId: '4B', pharmacistId: 'U005', contactUserId: 'C004B', enabled: true, auditAttributes: ['REGULAR'], ambulanceTypeIds: ['AMB-PED-BOX'] },
  { id: 'UA008', unitId: '4C', pharmacistId: 'U005', contactUserId: 'C004C', enabled: true, auditAttributes: ['CONTROLLED'], ambulanceTypeIds: [] },
  { id: 'UA009', unitId: 'ER', pharmacistId: 'U001', contactUserId: 'CER', enabled: true, auditAttributes: ['REGULAR', 'CONTROLLED'], ambulanceTypeIds: ['AMB-ADULT-CART', 'AMB-ADULT-CART', 'AMB-PED-BOX'] },
  { id: 'UA010', unitId: 'OPD', pharmacistId: 'U001', contactUserId: 'COPD', enabled: true, auditAttributes: ['REGULAR'], ambulanceTypeIds: ['AMB-PED-BOX'] },
  { id: 'UA011', unitId: 'OR', pharmacistId: 'U005', contactUserId: 'COR', enabled: true, auditAttributes: ['REGULAR', 'CONTROLLED'], ambulanceTypeIds: ['AMB-ADULT-CART', 'AMB-PED-CART'] },
  { id: 'UA012', unitId: 'CATH', pharmacistId: 'U005', contactUserId: 'CCATH', enabled: true, auditAttributes: ['REGULAR', 'CONTROLLED'], ambulanceTypeIds: ['AMB-ADULT-CART'] },
]

export const getUnitAssignment = (unitId) => mockUnitAssignments.find(item => item.unitId === unitId && item.enabled) || null
export const getAssignmentsForPharmacist = (pharmacistId) => mockUnitAssignments.filter(item => item.pharmacistId === pharmacistId && item.enabled)

export const updateUnitAssignment = (unitId, changes = {}) => {
  const assignment = mockUnitAssignments.find(item => item.unitId === unitId)
  if (!assignment) return null
  if ('pharmacistId' in changes) assignment.pharmacistId = changes.pharmacistId || ''
  if ('contactUserId' in changes) assignment.contactUserId = changes.contactUserId || ''
  if ('enabled' in changes) assignment.enabled = Boolean(changes.enabled)
  return assignment
}

export const setPharmacistUnits = (pharmacistId, unitIds = []) => {
  const ids = new Set(unitIds)
  mockUnitAssignments.forEach(item => {
    if (item.enabled && ids.has(item.unitId)) item.pharmacistId = pharmacistId
    else if (item.enabled && item.pharmacistId === pharmacistId && !ids.has(item.unitId)) item.pharmacistId = ''
  })
  return getAssignmentsForPharmacist(pharmacistId)
}
