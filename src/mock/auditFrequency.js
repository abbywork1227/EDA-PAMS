// 查核頻率主檔：以「查核大類」為單位設定查核月份。
// 月份由管理者設定；受查單位實際應查月份，會依該單位具備的查核大類自動合併產生。
// 目前 Mock：由各查核大類獨立設定查核月份。預設 A 管制藥品每月，其餘大類半年（6、12 月）。
export const mockAuditFrequency = [
  { categoryId: 'CONTROLLED', frequencyId: 'MONTHLY', name: '每月', months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], enabled: true },
  { categoryId: 'REGULAR', frequencyId: 'SEMI_ANNUAL', name: '半年', months: [6, 12], enabled: true },
  { categoryId: 'HIGH_ALERT', frequencyId: 'SEMI_ANNUAL', name: '半年', months: [6, 12], enabled: true },
  { categoryId: 'EMERGENCY', frequencyId: 'SEMI_ANNUAL', name: '半年', months: [6, 12], enabled: true },
  { categoryId: 'REFRIGERATED', frequencyId: 'SEMI_ANNUAL', name: '半年', months: [6, 12], enabled: true },
  { categoryId: 'SELF_MEDICATION', frequencyId: 'SEMI_ANNUAL', name: '半年', months: [6, 12], enabled: true },
  { categoryId: 'OTHER', frequencyId: 'SEMI_ANNUAL', name: '半年', months: [6, 12], enabled: true },
]

export const getFrequency = (categoryId) =>
  mockAuditFrequency.find(item => item.categoryId === categoryId) || null

export const getFrequencyMonths = (categoryId) =>
  getFrequency(categoryId)?.months ? [...getFrequency(categoryId).months] : []
