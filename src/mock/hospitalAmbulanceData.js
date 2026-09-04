// 模擬醫院 API：提供「單位有哪些急救車類型、各有幾台」。
// 不預先建立現場實體車號；實際車號於藥師到現場查核時輸入。
export const mockHospitalAmbulanceData = [
  { id: 'HA001', hospitalId: 'EDA', unitId: '3A', ambulanceTypeId: 'AMB-PED-CART', quantity: 2 },
  { id: 'HA002', hospitalId: 'EDA', unitId: '3A', ambulanceTypeId: 'AMB-PED-BOX', quantity: 1 },
  { id: 'HA003', hospitalId: 'EDA', unitId: '3C', ambulanceTypeId: 'AMB-ADULT-CART', quantity: 2 },
  { id: 'HA004', hospitalId: 'EDA', unitId: '4A', ambulanceTypeId: 'AMB-PED-CART', quantity: 1 },
  { id: 'HA005', hospitalId: 'EDA', unitId: '4B', ambulanceTypeId: 'AMB-PED-BOX', quantity: 1 },
  { id: 'HA006', hospitalId: 'EDA', unitId: 'ER', ambulanceTypeId: 'AMB-ADULT-CART', quantity: 2 },
  { id: 'HA007', hospitalId: 'EDA', unitId: 'ER', ambulanceTypeId: 'AMB-PED-BOX', quantity: 1 },
  { id: 'HA008', hospitalId: 'EDA', unitId: 'OR', ambulanceTypeId: 'AMB-ADULT-CART', quantity: 1 },
  { id: 'HA009', hospitalId: 'EDA', unitId: 'OR', ambulanceTypeId: 'AMB-PED-CART', quantity: 1 },
  { id: 'HA010', hospitalId: 'EDA', unitId: 'CATH', ambulanceTypeId: 'AMB-ADULT-CART', quantity: 1 },
]

export const getHospitalAmbulancesByUnit = (unitId) =>
  mockHospitalAmbulanceData.filter(item => item.unitId === unitId && item.quantity > 0)
