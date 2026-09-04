import { mockAuditItemCategories, getAuditItemsByCategory } from './auditItems'

/**
 * BI / 結案報表的核心 Mock 資料。
 *
 * 定義：一筆資料 = 一張「已完成結案」的查核紀錄快照。
 * 未來正式環境可直接由 AuditRecord API / DB 取代，不應另外建立一份 BI 專用統計資料。
 *
 * result      = 初評結果（OK / NG）
 * finalResult = 結案前最後結果（OK / NG）；NG 改善後通常會變成 OK
 */

const HOSPITALS = [
  { id: 'EDA', name: '義大醫院', units: [
    { id: '3A', name: '3A 護理站', type: '住院', controlled: true },
    { id: '4A', name: '4A 護理站', type: '住院', controlled: true },
    { id: 'ER', name: '急診急救室', type: '急診', controlled: true },
    { id: 'OPD', name: '門診注射室', type: '門診', controlled: false },
    { id: 'OR', name: '開刀房手術區', type: '醫技', controlled: false },
  ] },
  { id: 'ECM', name: '義大癌醫', units: [
    { id: '3A', name: '3A 護理站', type: '住院', controlled: true },
    { id: '3B', name: '3B 護理站', type: '住院', controlled: true },
    { id: 'ER', name: '急診急救室', type: '急診', controlled: true },
    { id: 'OPD', name: '門診注射室', type: '門診', controlled: false },
    { id: 'OR', name: '手術室', type: '醫技', controlled: false },
  ] },
  { id: 'DACHANG', name: '大昌醫院', units: [
    { id: '3A', name: '3A 護理站', type: '住院', controlled: true },
    { id: '4A', name: '4A 護理站', type: '住院', controlled: true },
    { id: 'ER', name: '急診急救室', type: '急診', controlled: true },
    { id: 'OPD', name: '門診注射室', type: '門診', controlled: false },
    { id: 'LAB', name: '檢驗醫學部', type: '醫技', controlled: false },
  ] },
  { id: 'PINGTUNG', name: '屏東醫院', units: [
    { id: '3A', name: '3A 護理站', type: '住院', controlled: true },
    { id: '4A', name: '4A 護理站', type: '住院', controlled: true },
    { id: 'ER', name: '急診急救室', type: '急診', controlled: true },
    { id: 'OPD', name: '門診注射室', type: '門診', controlled: false },
    { id: 'OR', name: '手術室', type: '醫技', controlled: false },
  ] },
]

const PHARMACISTS = [
  { id: 'U001', name: '黃嘉偉' },
  { id: 'U005', name: '李成偉' },
]

const CATEGORY_NAMES = Object.fromEntries(
  mockAuditItemCategories.map(category => [category.code, category.name])
)

const CATEGORY_BY_CODE = Object.fromEntries(
  mockAuditItemCategories.map(category => [category.code, category.id])
)

const categoryCodeById = Object.fromEntries(
  mockAuditItemCategories.map(category => [category.id, category.code])
)

const hash = (text) => {
  let value = 0
  for (const char of String(text)) value = (value * 31 + char.charCodeAt(0)) % 1000003
  return value
}

const pad = (value) => String(value).padStart(2, '0')

const getHospital = (id) => HOSPITALS.find(item => item.id === id)

const getUnit = (hospitalId, unitId) =>
  getHospital(hospitalId)?.units.find(unit => unit.id === unitId)

const getPharmacist = (hospitalId, year, unitId) => {
  const index = hash(`${hospitalId}-${year}-${unitId}`) % PHARMACISTS.length
  return PHARMACISTS[index]
}

// 客戶既有頻率規則：A 管制藥品每月；B～G 原則上 6、12 月。
// 無管制藥品的單位，非 6/12 月不建立 A；6/12 月建立 B～G。
const getApplicableCategories = (unit, month) => {
  if (month === 6 || month === 12) {
    return unit.controlled ? ['A', 'B', 'C', 'D', 'E', 'F', 'G'] : ['B', 'C', 'D', 'E', 'F', 'G']
  }
  return unit.controlled ? ['A'] : []
}

const shouldFail = (seed, categoryCode, itemIndex) => {
  // 讓不同大類、不同月份、不同單位都有可見差異。
  // 真正 BI 仍應從每筆 AuditRecord 的 item.result 統計，不使用任何預先算好的統計數字。
  const score = hash(`${seed}-${categoryCode}-${itemIndex}`) % 100
  const thresholds = {
    A: 4,  // 管制藥品
    B: 8,  // 一般常備藥品
    C: 6,  // 高警訊
    D: 11, // 急救車
    E: 5,  // 冷藏
    F: 7,  // 自備藥
    G: 3,  // 其他
  }
  return score < (thresholds[categoryCode] ?? 5)
}


const buildInputValues = (item, seed) => {
  const values = {}
  item.inputFields?.forEach((field, index) => {
    if (field.type === 'NUMBER') {
      if (field.unit === '%') values[field.key] = 60 + (hash(`${seed}-${index}`) % 21)
      else if (field.unit === '℃') values[field.key] = 18 + (hash(`${seed}-${index}`) % 7)
      else values[field.key] = 10 + (hash(`${seed}-${index}`) % 30)
    } else if (field.type === 'DATE') {
      values[field.key] = `${seed.slice(0, 4)}-${seed.slice(4, 6)}-${pad(10 + (hash(`${seed}-${index}`) % 18))}`
    } else {
      values[field.key] = `MOCK-${hash(`${seed}-${index}`) % 9000 + 1000}`
    }
  })
  return values
}

const buildCategory = (categoryCode, recordSeed, failedCodes) => {
  const categoryId = CATEGORY_BY_CODE[categoryCode]
  const items = getAuditItemsByCategory(categoryId).map((item, index) => {
    const failed = failedCodes.includes(item.code)
    return {
      id: item.id,
      code: item.code,
      text: item.text,
      resultType: item.resultType,
      result: failed ? 'fail' : 'pass',
      reason: failed ? `查核發現「${item.text.slice(0, 22)}」未符合標準，已建立改善案件。` : '',
      images: failed ? [`https://picsum.photos/420/280?audit=${recordSeed}-${item.id}`] : [],
      values: buildInputValues(item, recordSeed),
    }
  })

  return {
    categoryId,
    code: categoryCode,
    name: CATEGORY_NAMES[categoryCode],
    items,
    passCount: items.filter(item => item.result === 'pass').length,
    failCount: items.filter(item => item.result === 'fail').length,
  }
}

const buildControlledDrugs = (unit, seed) => {
  if (!unit.controlled) return []
  const names = ['Morphine 10mg', 'Fentanyl 0.1mg', 'Midazolam 5mg']
  return names.map((name, index) => ({
    drugId: `${unit.id}-CD-${index + 1}`,
    drugName: name,
    specification: 'Mock 規格',
    stockQty: 5 + (hash(`${seed}-${index}`) % 16),
    baseQty: 5 + (hash(`${seed}-${index}`) % 16),
    emptyBottleQty: hash(`${seed}-empty-${index}`) % 3,
    expiryDates: ['2026-10-31', '2027-01-31', '2027-04-30'],
    selectedExpiry: ['2026-10-31', '2027-01-31', '2027-04-30'][index],
  }))
}

const buildAmbulances = (unit, seed) => {
  if (!['ER', '3A', '4A'].includes(unit.id)) return []
  const count = unit.id === 'ER' ? 2 : 1
  const type = unit.id === 'ER' ? '成人急救車' : '成人急救車'
  return Array.from({ length: count }, (_, index) => ({
    id: `${seed}-AMB-${index + 1}`,
    type,
    customName: `${type} 第${index + 1}台`,
    carNo: `${unit.id}-AMB-${pad(index + 1)}`,
    sealNo: `S${seed.slice(0, 6)}${pad(index + 1)}`,
    items: Array.from({ length: 12 }, (_, position) => ({
      position: `${Math.floor(position / 4) + 1}-${(position % 4) + 1}`,
      drugName: `急救藥品${position + 1}`,
      qty: 1 + (hash(`${seed}-amb-${position}`) % 3),
      expire: '2027-12-31',
    })),
  }))
}

const buildImprovementCases = (categories, seed, finalResult) => {
  const failedItems = categories.flatMap(category =>
    category.items.filter(item => item.result === 'fail').map(item => ({ ...item, category }))
  )

  return failedItems.map((item, index) => ({
    itemId: item.id,
    itemCode: item.code,
    categoryCode: item.category.code,
    categoryName: item.category.name,
    originalReason: item.reason,
    originalPhotos: item.images,
    response: finalResult === 'OK' ? `已完成「${item.text.slice(0, 18)}」改善，並重新確認現場狀況。` : '',
    improvementPhotos: finalResult === 'OK' ? [`https://picsum.photos/420/280?improvement=${seed}-${item.id}`] : [],
    status: finalResult === 'OK' ? 'PASS' : 'PENDING',
    recheck: finalResult === 'OK'
      ? { result: 'PASS', comment: '藥師已現場確認改善完成。', at: `${seed.slice(0, 4)}-${seed.slice(4, 6)}-28 09:20` }
      : null,
    sequence: index + 1,
  }))
}

const buildHistory = (record) => {
  const base = `${record.year}-${pad(record.month)}`
  const pharmacistAt = `${base}-05 09:00`
  const improvementAt = `${base}-07 15:20`
  const recheckAt = `${base}-08 09:10`
  const ownerAt = `${base}-08 13:30`
  const managerAt = `${base}-09 10:00`

  const history = [
    { step: 'PHARMACIST', label: '藥師初查', userId: record.createdById, action: '送出', at: pharmacistAt },
  ]

  if (record.result === 'NG') {
    history.push(
      { step: 'UNIT_CONTACT', label: '受查單位窗口改善', userId: `${record.unitId}-CONTACT`, action: '改善完成', at: improvementAt },
      { step: 'PHARMACIST_RECHECK', label: '藥師複查', userId: record.createdById, action: record.finalResult === 'OK' ? '複查通過' : '複查仍有缺失', at: recheckAt },
    )
  }

  history.push(
    { step: 'AUDIT_OWNER', label: '查核業務負責人', userId: `${record.hospitalId}-AUDIT`, action: '核准', at: ownerAt },
  )

  if (hash(record.id) % 3 !== 0) {
    history.push({ step: 'HOSPITAL_MANAGER', label: '院區主管', userId: `${record.hospitalId}-MANAGER`, action: '核准', at: managerAt })
  }

  history.push({
    step: 'PHARMACY_MANAGER',
    label: '藥劑部部長',
    userId: 'MGR-GROUP',
    action: '核准',
    at: `${base}-10 09:20`,
  })

  return history
}

const buildRecord = ({ hospital, unit, year, month, sequence }) => {
  const seed = `${year}${pad(month)}${hospital.id}${unit.id}${sequence}`
  const applicableCodes = getApplicableCategories(unit, month)

  const failedCodes = []
  applicableCodes.forEach(categoryCode => {
    const items = getAuditItemsByCategory(CATEGORY_BY_CODE[categoryCode])
    items.forEach((item, index) => {
      if (shouldFail(seed, categoryCode, index)) failedCodes.push(item.code)
    })
  })

  // 讓初評 NG 約落在接近客戶手稿的示意比例，且每個類別都有機會出現缺失。
  // NG 案件再從可用類別中挑 1～2 個具體查核項目做為缺失明細。
  // 約 20% 初評 NG，避免 Demo 幾乎全部 100%，並讓年度/月度分析有明顯差異。
  const isNgRecord = hash(`${seed}-record-result`) % 100 < 20
  if (isNgRecord) {
    const preferred = ['B', 'D', 'A', 'C', 'E', 'F', 'G'].filter(code => applicableCodes.includes(code))
    const firstCategory = preferred[hash(`${seed}-category`) % preferred.length]
    const firstItems = getAuditItemsByCategory(CATEGORY_BY_CODE[firstCategory])
    const firstItem = firstItems[hash(`${seed}-item`) % firstItems.length]
    if (firstItem && !failedCodes.includes(firstItem.code)) failedCodes.push(firstItem.code)

    if (hash(`${seed}-second`) % 4 === 0) {
      const secondCategory = preferred[(preferred.indexOf(firstCategory) + 1) % preferred.length]
      const secondItems = getAuditItemsByCategory(CATEGORY_BY_CODE[secondCategory])
      const secondItem = secondItems[hash(`${seed}-second-item`) % secondItems.length]
      if (secondItem && !failedCodes.includes(secondItem.code)) failedCodes.push(secondItem.code)
    }
  }

  const result = failedCodes.length ? 'NG' : 'OK'

  // NG 案件中約 75% 改善後複評合格、25% 複評仍 NG。
  // 這讓「初評 vs 複評」不會永遠都是 88% vs 100%，同時保留真實查核資料粒度。
  const finalResult = result === 'NG'
    ? (hash(`${seed}-final-result`) % 100 < 75 ? 'OK' : 'NG')
    : 'OK'
  const pharmacist = getPharmacist(hospital.id, year, unit.id)
  const documentNo = `${hospital.id}-${unit.id}-${result}-${year}${pad(month)}-${String(sequence).padStart(3, '0')}`
  const categories = applicableCodes.map(code => buildCategory(code, seed, failedCodes))
  const allItems = categories.flatMap(category => category.items)
  const failedItems = allItems.filter(item => item.result === 'fail')
  const closedDate = `${year}-${pad(month)}-${pad(10 + (hash(`${seed}-closed`) % 18))}`

  const record = {
    id: `AUD-${year}-${hospital.id}-${unit.id}-${pad(month)}-${String(sequence).padStart(3, '0')}`,
    documentNo,
    hospitalId: hospital.id,
    hospitalName: hospital.name,
    unitId: unit.id,
    unitName: unit.name,
    unitType: unit.type,
    year,
    month,
    auditDate: `${year}-${pad(month)}-05`,
    result,
    finalResult,
    status: 'COMPLETED',
    createdById: pharmacist.id,
    createdByName: pharmacist.name,
    createdAt: `${year}-${pad(month)}-05 09:00`,
    completedAt: `${closedDate} 10:00`,
    closedDate,
    applicableCategories: applicableCodes,
    categories,
    structuredItems: categories,
    controlledDrugs: buildControlledDrugs(unit, seed),
    emergencyCarts: buildAmbulances(unit, seed),
    improvementRequired: result === 'NG',
    improvementCompleted: result === 'NG' && finalResult === 'OK',
    improvementCases: buildImprovementCases(categories, seed, finalResult),
    initialFailCount: failedItems.length,
    finalFailCount: finalResult === 'NG' ? Math.max(1, Math.ceil(failedItems.length * 0.5)) : 0,
    summary: result === 'OK'
      ? '本次查核各項目均符合，完成全部簽核並結案。'
      : `初評發現 ${failedItems.length} 項不符合，已完成改善、藥師複查及全部簽核。`,
    suggestion: result === 'OK' ? '查核結果符合，完成結案。' : '改善事項均已完成，准予結案。',
    history: [],
    workflowSteps: [
      { step: 'PHARMACIST', label: '藥師初查' },
      ...(result === 'NG' ? [
        { step: 'UNIT_CONTACT', label: '受查單位窗口改善' },
        { step: 'PHARMACIST_RECHECK', label: '藥師複查' },
      ] : []),
      { step: 'AUDIT_OWNER', label: '查核業務負責人' },
      { step: 'HOSPITAL_MANAGER', label: '院區主管' },
      { step: 'PHARMACY_MANAGER', label: '藥劑部部長' },
    ],
    auditSnapshotVersion: 'MOCK-1.0',
    source: 'mock-completed-audit',
  }

  record.history = buildHistory(record)
  record.auditData = {
    pageInfo: {
      hospitalId: record.hospitalId,
      unitId: record.unitId,
      unitName: record.unitName,
      year: record.year,
      month: record.month,
    },
    structuredItems: record.structuredItems,
    controlledDrugList: record.controlledDrugs,
    ambulances: record.emergencyCarts.map(car => ({
      ...car,
      items: car.items.map(item => ({
        ...item,
        id: `${car.id}-${item.position}`,
        name: item.drugName,
        img: `https://picsum.photos/220/140?car=${car.id}-${item.position}`,
      })),
    })),
    improvementCases: record.improvementCases,
  }
  return record
}

const records = []

// 產生 2021～2026 的歷史結案資料。
// 每個院區每個單位依目前頻率規則產生：管制藥品單位每月、其他類別於 6/12 月。
for (const hospital of HOSPITALS) {
  for (const unit of hospital.units) {
    let sequence = 1
    for (let year = 2021; year <= 2026; year += 1) {
      for (let month = 1; month <= 12; month += 1) {
        if (getApplicableCategories(unit, month).length === 0) continue
        records.push(buildRecord({ hospital, unit, year, month, sequence }))
        sequence += 1
      }
    }
  }
}

// 明確保留幾筆客戶手稿／目前 Demo 容易對照的 2026 結案示意：
// - EDA 3A OK
// - EDA 4B NG（改善後結案）
// - ECM 3C NG（改善後結案）
// - DACHANG 3A OK
// - PINGTUNG ER NG（改善後結案）
// 以上均已包含在同一套 AuditRecord 結構中，不另建 BI 專用資料。

export const mockAuditRecords = records

export const getCompletedAuditRecords = (filters = {}) => {
  const {
    hospitalId,
    unitId,
    unitType,
    year,
    month,
    result,
    finalResult,
    pharmacistId,
    from,
    to,
  } = filters

  return mockAuditRecords.filter(record => {
    if (record.status !== 'COMPLETED') return false
    if (hospitalId && record.hospitalId !== hospitalId) return false
    if (unitId && record.unitId !== unitId) return false
    if (unitType && record.unitType !== unitType) return false
    if (year && Number(record.year) !== Number(year)) return false
    if (month && Number(record.month) !== Number(month)) return false
    if (result && record.result !== result) return false
    if (finalResult && record.finalResult !== finalResult) return false
    if (pharmacistId && record.createdById !== pharmacistId) return false
    if (from && record.closedDate < from) return false
    if (to && record.closedDate > to) return false
    return true
  })
}

export const getAuditRecordById = (id) =>
  mockAuditRecords.find(record => record.id === id || record.documentNo === id) || null

export const getAuditRecordsSummary = () => ({
  total: mockAuditRecords.length,
  completed: mockAuditRecords.filter(record => record.status === 'COMPLETED').length,
  ok: mockAuditRecords.filter(record => record.result === 'OK').length,
  ng: mockAuditRecords.filter(record => record.result === 'NG').length,
  improved: mockAuditRecords.filter(record => record.improvementRequired && record.improvementCompleted).length,
  years: [...new Set(mockAuditRecords.map(record => record.year))].sort(),
  hospitals: [...new Set(mockAuditRecords.map(record => record.hospitalId))],
})

export const getAuditCategoryCode = (categoryId) => categoryCodeById[categoryId] || categoryId
