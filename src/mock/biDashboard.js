import { mockAuditRecords } from './mockAuditRecords'
import { getAuditPlans } from './mockAuditPlans'

const UNIT_TYPES = ['門診', '急診', '住院', '醫技']
const CATEGORIES = ['A', 'B', 'C', 'D', 'E', 'F', 'G']

const inPeriod = (row, filters = {}) => {
  if (filters.year && Number(row.year) !== Number(filters.year)) return false
  if (filters.month && Number(row.month) !== Number(filters.month)) return false
  if (filters.quarter && Math.ceil(Number(row.month) / 3) !== Number(filters.quarter)) return false
  if (filters.hospitalId && row.hospitalId !== filters.hospitalId) return false
  if (filters.unitType && row.unitType !== filters.unitType) return false
  if (filters.unitId && row.unitId !== filters.unitId) return false
  if (filters.unitHospitalId && row.hospitalId !== filters.unitHospitalId) return false
  if (filters.category && !(row.applicableCategories || []).includes(filters.category)) return false
  return true
}

// Filter 是資料切片：選擇 A 類後，各分析區塊都只統計 A 類資料；不是只隱藏表格。
const getRecords = (filters = {}) =>
  mockAuditRecords.filter(r => r.status === 'COMPLETED' && inPeriod(r, filters))

const getPlans = (filters = {}) => getAuditPlans(filters)

const getItems = records =>
  records.flatMap(record =>
    (record.auditData?.categories || record.categories || []).flatMap(category =>
      (category.items || []).map(item => ({ record, category, item }))
    )
  )

const rate = (n, d) => d ? Number((n / d * 100).toFixed(1)) : 0

function buildUnitTypeStats(records, plans) {
  return UNIT_TYPES.map(unitType => {
    const rs = records.filter(r => r.unitType === unitType)
    const ps = plans.filter(p => p.unitType === unitType)
    const initialOK = rs.filter(r => r.result === 'OK').length
    const reviewOK = rs.filter(r => (r.finalResult || r.result) === 'OK').length
    const completed = ps.filter(p => p.status === 'COMPLETED').length
    return {
      unitType,
      auditCount: rs.length,
      plannedCount: ps.length,
      initialPassRate: rate(initialOK, rs.length),
      reviewPassRate: rate(reviewOK, rs.length),
      completionRate: rate(completed, ps.length),
      defectUnits: new Set(rs.filter(r => r.result === 'NG').map(r => r.unitId)).size,
    }
  })
}

function buildCategoryStats(records) {
  return CATEGORIES.map(code => {
    const rs = records.filter(r => (r.applicableCategories || []).includes(code))
    const rows = getItems(rs).filter(x => x.category.code === code)
    const initialOK = rs.filter(r => r.result === 'OK').length
    const reviewOK = rs.filter(r => (r.finalResult || r.result) === 'OK').length
    const affectedUnits = new Set(rows.filter(x => x.item.result === 'fail' || x.item.result === 'NG').map(x => `${x.record.hospitalId}|${x.record.unitId}`)).size
    const units = new Set(rs.map(r => r.unitId)).size
    return {
      category: code,
      categoryName: rs[0]?.categories?.find(c => c.code === code)?.name || `${code} 類`,
      auditCount: rs.length,
      initialPassRate: rate(initialOK, rs.length),
      reviewPassRate: rate(reviewOK, rs.length),
      affectedUnitRate: rate(affectedUnits, units),
      defectCount: rows.filter(x => x.item.result === 'fail' || x.item.result === 'NG').length,
    }
  }).filter(x => x.auditCount > 0)
}

function buildUnitDistribution(records) {
  const total = new Set(records.map(r => `${r.hospitalId}|${r.unitId}`)).size
  return UNIT_TYPES.map(unitType => {
    const count = new Set(records.filter(r => r.unitType === unitType).map(r => `${r.hospitalId}|${r.unitId}`)).size
    return { unitType, count, percentage: rate(count, total) }
  }).filter(x => x.count > 0)
}

function buildDefectAnalysis(records, filters = {}) {
  const rows = getItems(records).filter(x => (x.item.result === 'fail' || x.item.result === 'NG') && (!filters.category || x.category.code === filters.category))

  const category = CATEGORIES.map(code => {
    const rs = rows.filter(x => x.category.code === code)
    const affectedUnits = new Set(rs.map(x => `${x.record.hospitalId}|${x.record.unitId}`)).size
    const totalUnits = new Set(records.filter(r => (r.applicableCategories || []).includes(code))
      .map(r => `${r.hospitalId}|${r.unitId}`)).size
    return {
      category: code,
      categoryName: records.flatMap(r => r.categories || []).find(c => c.code === code)?.name || `${code} 類`,
      defectCount: rs.length,
      affectedUnitCount: affectedUnits,
      affectedUnits: [...new Set(rs.map(x => `${x.record.hospitalId}|${x.record.unitId}`))].map(key => {
        const [hospitalId, unitId] = key.split('|')
        const record = records.find(r => r.hospitalId === hospitalId && r.unitId === unitId)
        const defectCount = rs.filter(x => `${x.record.hospitalId}|${x.record.unitId}` === key).length
        return { hospitalId, unitId, unitName: record?.unitName || unitId, hospitalName: record?.hospitalName || hospitalId, unitType: record?.unitType || '', defectCount }
      }),
      affectedUnitRate: rate(affectedUnits, totalUnits),
    }
  }).filter(x => x.defectCount > 0).sort((a, b) => b.defectCount - a.defectCount)

  const itemMap = new Map()
  rows.forEach(({ record, category, item }) => {
    const key = `${category.code}|${item.code}`
    if (!itemMap.has(key)) itemMap.set(key, {
      category: category.code,
      categoryName: category.name,
      itemCode: item.code,
      itemText: item.text,
      defectCount: 0,
      units: new Set(),
    })
    const x = itemMap.get(key)
    x.defectCount += 1
    x.units.add(`${record.hospitalId}|${record.unitId}`)
  })

  const item = [...itemMap.values()].map(x => ({
    category: x.category,
    categoryName: x.categoryName,
    itemCode: x.itemCode,
    itemText: x.itemText,
    defectCount: x.defectCount,
    affectedUnitCount: x.units.size,
    affectedUnits: [...x.units].map(key => {
      const [hospitalId, unitId] = key.split('|')
      const record = records.find(r => r.hospitalId === hospitalId && r.unitId === unitId)
      const defectCount = rows.filter(v => `${v.record.hospitalId}|${v.record.unitId}` === key && `${v.category.code}|${v.item.code}` === `${x.category}|${x.itemCode}`).length
      return { hospitalId, unitId, unitName: record?.unitName || unitId, hospitalName: record?.hospitalName || hospitalId, unitType: record?.unitType || '', defectCount }
    }),
  })).sort((a, b) => b.defectCount - a.defectCount)

  const unitMap = new Map()
  records.forEach(record => {
    const key = `${record.hospitalId}|${record.unitId}`
    if (!unitMap.has(key)) unitMap.set(key, {
      hospitalId: record.hospitalId,
      hospitalName: record.hospitalName,
      unitId: record.unitId,
      unitName: record.unitName,
      unitType: record.unitType,
      auditCount: 0,
      initialNG: 0,
      reviewNG: 0,
      defectCount: 0,
      categories: {},
      defectItems: [],
    })
    const x = unitMap.get(key)
    x.auditCount += 1
    if (record.result === 'NG') x.initialNG += 1
    if ((record.finalResult || record.result) === 'NG') x.reviewNG += 1
    getItems([record]).filter(v => v.item.result === 'fail' || v.item.result === 'NG').forEach(v => {
      x.defectCount += 1
      x.categories[v.category.code] = (x.categories[v.category.code] || 0) + 1
      x.defectItems.push({ category: v.category.code, itemCode: v.item.code, itemText: v.item.text })
    })
  })

  const units = [...unitMap.values()].map(x => ({
    ...x,
    initialPassRate: rate(x.auditCount - x.initialNG, x.auditCount),
    reviewPassRate: rate(x.auditCount - x.reviewNG, x.auditCount),
    affectedUnits: [],
    defectItems: x.defectItems,
  })).sort((a, b) => b.defectCount - a.defectCount)

  return { category, item, units }
}

// 趨勢維度由上方查詢列的 period 決定：month=1~12、quarter=Q1~Q4、year=近5年。
function buildTrend(filters = {}) {
  const year = filters.year || 2026
  const base = { ...filters, year, month: null, quarter: null }
  const buckets = filters.period === 'month'
    ? Array.from({ length: 12 }, (_, i) => ({ label: `${i + 1}月`, months: [i + 1] }))
    : filters.period === 'quarter'
      ? Array.from({ length: 4 }, (_, i) => ({ label: `Q${i + 1}`, months: [i * 3 + 1, i * 3 + 2, i * 3 + 3] }))
      : Array.from({ length: 5 }, (_, i) => ({ label: `${year - 4 + i}年`, year: year - 4 + i, months: null }))

  return buckets.map(bucket => {
    const rs = mockAuditRecords.filter(r => {
      if (r.status !== 'COMPLETED') return false
      if (bucket.year != null && Number(r.year) !== bucket.year) return false
      if (bucket.year == null && Number(r.year) !== Number(year)) return false
      if (bucket.months && !bucket.months.includes(Number(r.month))) return false
      if (filters.hospitalId && r.hospitalId !== filters.hospitalId) return false
      if (filters.unitType && r.unitType !== filters.unitType) return false
      if (filters.unitId && r.unitId !== filters.unitId) return false
      if (filters.unitHospitalId && r.hospitalId !== filters.unitHospitalId) return false
      if (filters.category && !(r.applicableCategories || []).includes(filters.category)) return false
      return true
    })
    const planFilters = bucket.year != null ? { ...base, year: bucket.year } : { ...base, year }
    const ps = getAuditPlans(planFilters).filter(p => {
      if (bucket.months && !bucket.months.includes(Number(p.month))) return false
      return true
    })
    return {
      month: bucket.label,
      initialPassRate: rate(rs.filter(r => r.result === 'OK').length, rs.length),
      reviewPassRate: rate(rs.filter(r => (r.finalResult || r.result) === 'OK').length, rs.length),
      completionRate: rate(ps.filter(p => p.status === 'COMPLETED').length, ps.length),
    }
  })
}

export const getBIDashboardData = (filters = {}) => {
  const records = getRecords(filters)
  const plans = getPlans(filters)
  const initialOK = records.filter(r => r.result === 'OK').length
  const reviewOK = records.filter(r => (r.finalResult || r.result) === 'OK').length
  const defectRows = getItems(records).filter(x => x.item.result === 'fail' || x.item.result === 'NG')
  const improvementRecords = records.filter(r => r.improvementRequired)

  return {
    filters,
    summary: {
      initialPassRate: rate(initialOK, records.length),
      reviewPassRate: rate(reviewOK, records.length),
      completionRate: rate(plans.filter(p => p.status === 'COMPLETED').length, plans.length),
      auditCount: records.length,
      plannedCount: plans.length,
      defectCount: defectRows.length,
      defectUnitCount: new Set(defectRows.map(x => `${x.record.hospitalId}|${x.record.unitId}`)).size,
      improvementCount: improvementRecords.length,
      improvementCompletedCount: improvementRecords.filter(r => r.improvementCompleted).length,
    },
    unitTypeStats: buildUnitTypeStats(records, plans),
    categoryStats: buildCategoryStats(records),
    unitDistribution: buildUnitDistribution(records),
    defectAnalysis: buildDefectAnalysis(records, filters),
    trend: buildTrend(filters),
  }
}

export const biMock = { getDashboard: getBIDashboardData }
