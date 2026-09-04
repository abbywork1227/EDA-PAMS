// 急救車查核管理：定義「標準車型」與 4x3 藥品位置。單位配置只引用 typeId，不重複保存標準內容。
export const mockAmbulanceTypes = [
  { id: 'AMB-ADULT-CART', code: 'ADULT_CART', name: '成人急救車', layout: '4x3' },
  { id: 'AMB-PED-CART', code: 'PED_CART', name: '小兒急救車', layout: '4x3' },
  { id: 'AMB-PED-BOX', code: 'PED_BOX', name: '小兒外接箱', layout: '4x3' },
]

const makeItem = (id, typeId, row, column, name, qty, image) => ({
  id, typeId, row, column, position: `${row}-${column}`, name, requiredQty: qty, image,
})

const commonItems = [
  ['AM-001', 1, 1, 'Amiodarone 150mg/3ml/Amp', 3, 'https://picsum.photos/200/140?11'],
  ['AM-002', 1, 2, 'Adenosine 6mg/2ml/Vial', 3, 'https://picsum.photos/200/140?12'],
  ['AM-003', 1, 3, 'Midazolam 5mg/ml/Amp', 2, 'https://picsum.photos/200/140?13'],
  ['AM-004', 1, 4, 'Succinylcholine 500mg/Vial', 1, 'https://picsum.photos/200/140?14'],
  ['AM-005', 2, 1, 'Atropine 1mg/ml', 5, 'https://picsum.photos/200/140?15'],
  ['AM-006', 2, 2, 'Epinephrine 1mg/ml', 10, 'https://picsum.photos/200/140?16'],
  ['AM-007', 2, 3, 'Lidocaine 2%', 6, 'https://picsum.photos/200/140?17'],
  ['AM-008', 2, 4, 'Normal Saline 500ml', 4, 'https://picsum.photos/200/140?18'],
  ['AM-009', 3, 1, 'D5W 500ml', 6, 'https://picsum.photos/200/140?19'],
  ['AM-010', 3, 2, 'Magnesium Sulfate', 2, 'https://picsum.photos/200/140?20'],
  ['AM-011', 3, 3, 'Norepinephrine 4mg', 4, 'https://picsum.photos/200/140?21'],
  ['AM-012', 3, 4, 'Lactated Ringer', 10, 'https://picsum.photos/200/140?22'],
]

export const mockAmbulanceConfigurations = mockAmbulanceTypes.map(type => ({
  ...type,
  items: commonItems.map(([id, row, column, name, requiredQty, image]) =>
    makeItem(`${id}-${type.code}`, type.id, row, column, name, requiredQty, image)
  ),
}))

export const getAmbulanceConfig = (typeId) =>
  mockAmbulanceConfigurations.find(item => item.id === typeId) || null


export const updateAmbulancePosition = (typeId, position, changes = {}) => {
  const config = getAmbulanceConfig(typeId)
  if (!config) return null
  const item = config.items.find(entry => entry.position === position)
  if (!item) return null
  Object.assign(item, changes)
  return item
}
