// 受查單位主檔：只描述「有哪些單位」，藥品內容由醫院 API Mock 提供。
export const mockUnits = [
  { id: '3A', name: '3A 護理站', type: '病房', hospitalId: 'EDA', email: '3a@example.com', enabled: true },
  { id: '3B', name: '3B 護理站', type: '病房', hospitalId: 'EDA', email: '3b@example.com', enabled: true },
  { id: '3C', name: '3C 護理站', type: '病房', hospitalId: 'EDA', email: '3c@example.com', enabled: true },
  { id: '3D', name: '3D 護理站', type: '病房', hospitalId: 'EDA', email: '3d@example.com', enabled: true },
  { id: '3E', name: '3E 護理站', type: '病房', hospitalId: 'EDA', email: '3e@example.com', enabled: true },
  { id: '4A', name: '4A 護理站', type: '病房', hospitalId: 'EDA', email: '4a@example.com', enabled: true },
  { id: '4B', name: '4B 護理站', type: '病房', hospitalId: 'EDA', email: '4b@example.com', enabled: true },
  { id: '4C', name: '4C 護理站', type: '病房', hospitalId: 'EDA', email: '4c@example.com', enabled: true },
  { id: 'ER', name: '急診急救室', type: '門/急診', hospitalId: 'EDA', email: 'er@example.com', enabled: true },
  { id: 'OPD', name: '門診注射室', type: '門/急診', hospitalId: 'EDA', email: 'opd@example.com', enabled: true },
  { id: 'OR', name: '開刀房手術區', type: '醫技', hospitalId: 'EDA', email: 'or@example.com', enabled: true },
  { id: 'CATH', name: '心導管室', type: '醫技', hospitalId: 'EDA', email: 'cath@example.com', enabled: true },
]

export const getUnitById = (unitId) => mockUnits.find(unit => unit.id === unitId) || null
