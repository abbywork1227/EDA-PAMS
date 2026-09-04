import { mockAuditRecords } from './mockAuditRecords'

// AuditPlan mock：代表「應查核」的計畫母數；正式環境由查核頻率＋單位 API 產生。
// 為了讓 Demo 可以呈現完成率，額外保留少量尚未完成的計畫。
const extraPlans = mockAuditRecords.filter((_, index) => index % 8 === 0)
  .map(record => ({
    id: `PLAN-${record.id}-OPEN`,
    hospitalId: record.hospitalId,
    hospitalName: record.hospitalName,
    unitId: record.unitId,
    unitName: record.unitName,
    unitType: record.unitType,
    year: record.year,
    month: record.month,
    category: record.category,
    status: 'PENDING',
  }))

export const mockAuditPlans = [
  ...mockAuditRecords.map(record => ({
    id: `PLAN-${record.id}`,
    hospitalId: record.hospitalId,
    hospitalName: record.hospitalName,
    unitId: record.unitId,
    unitName: record.unitName,
    unitType: record.unitType,
    year: record.year,
    month: record.month,
    category: record.category,
    status: 'COMPLETED',
    auditRecordId: record.id,
  })),
  ...extraPlans,
]

export const getAuditPlans = (filters = {}) => mockAuditPlans.filter(plan => {
  if (filters.hospitalId && plan.hospitalId !== filters.hospitalId) return false
  if (filters.unitId && plan.unitId !== filters.unitId) return false
  if (filters.unitType && plan.unitType !== filters.unitType) return false
  if (filters.year && Number(plan.year) !== Number(filters.year)) return false
  if (filters.month && Number(plan.month) !== Number(filters.month)) return false
  if (filters.quarter && Math.ceil(Number(plan.month) / 3) !== Number(filters.quarter)) return false
  return true
})
