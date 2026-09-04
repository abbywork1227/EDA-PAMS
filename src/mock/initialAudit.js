// Mock data for InitialAudit.vue
export const mockUnitList = [
{ id: '3A', name: '3A 護理站', type: '病房', hasControlledDrugs: true, controlledDrugsCount: 12, regularDrugsCount: 25, 
  ambulances: [{ type: '小兒車' }] },
{ id: '3B', name: '3B 護理站', type: '病房', hasControlledDrugs: false, controlledDrugsCount: 0, regularDrugsCount: 12, 
  ambulances: [] },
{ id: '4A', name: '4A 護理站', type: '病房', hasControlledDrugs: true, controlledDrugsCount: 8, regularDrugsCount: 18, 
  ambulances: [{ type: '成人車' }, { type: '小兒車' }] },
{ id: '5A', name: '5A 綜合病房', type: '病房', hasControlledDrugs: false, controlledDrugsCount: 0, regularDrugsCount: 15, 
  ambulances: [{ type: '成人車' }] },
{ id: 'ER', name: '急診急救室', type: '門/急診', hasControlledDrugs: true, controlledDrugsCount: 20, regularDrugsCount: 40, 
  ambulances: [{ type: '成人車' }, { type: '成人車' }, { type: '小兒包' }] },
{ id: 'OPD', name: '門診注射室', type: '門/急診', hasControlledDrugs: false, controlledDrugsCount: 0, regularDrugsCount: 8, 
  ambulances: [{ type: '小兒包' }] },
{ id: 'OR', name: '開刀房手術區', type: '醫技', hasControlledDrugs: true, controlledDrugsCount: 35, regularDrugsCount: 50, 
  ambulances: [{ type: '成人車' }, { type: '成人車' }, { type: '小兒車' }] },
{ id: 'CATH', name: '心導管室', type: '醫技', hasControlledDrugs: true, controlledDrugsCount: 5, regularDrugsCount: 30, 
  ambulances: [{ type: '成人車' }] }
]
export const mockGlobalAuditData = {
// 2025 歷史年度：大部分結案，但保留12月開放讓2026年補登測試
2025: {
  '3A-12': 2, '4A-12': 4, 'ER-12': 3, 'OR-12': 3
},
// 2026 當前年度
2026: {
  '3A-1': 3, '3A-2': 3, '3A-3': 3, '3A-4': 3, '3A-5': 2, '3A-6': 1,
  '4A-1': 3, '4A-2': 3, '4A-3': 3, '4A-4': 4, '4A-5': 2, '4A-6': 1,
  'ER-1': 3, 'ER-2': 3, 'ER-3': 4, 'ER-4': 3, 'ER-5': 3, 'ER-6': 2,
  'OPD-6': 2, 'CATH-5': 2, 'OR-5': 3
},
// 2027 未來年度：全面開放，但一月可做「跨年超前部屬暫存」
2027: {
  '3A-1': 2, 'ER-1': 2
}
}
