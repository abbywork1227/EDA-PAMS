import { mockRoles } from './roles'

export const mockHospitals = [
  { id: 'EDA', name: '義大醫院' },
  { id: 'ECM', name: '義大癌醫' },
  { id: 'DACHANG', name: '大昌醫院' },
  { id: 'PINGTUNG', name: '屏東醫院' },
]

// 人員資料：窗口負責人也由這裡提供。
// 正式介接後可替換為人員／帳號 API；受查單位管理不再直接寫死窗口姓名。
export const mockUsers = [
  { id: 'MGR-GROUP', account: 'MGR-GROUP', name: '藥劑部部長', roleId: 'PHARMACY_MANAGER', hospitalId: 'ALL', unit: '藥劑部', password: '000000', enabled: true },
  { id: 'U001', account: '4D231', name: '黃嘉偉', roleId: 'PHARMACIST', hospitalId: 'EDA', unit: '藥劑部', password: '000000', enabled: true },
  { id: 'U002', account: 'AUDIT001', name: '查核業務負責人', roleId: 'AUDIT_OWNER', hospitalId: 'EDA', unit: '藥劑部', password: '000000', enabled: true },
  { id: 'U003', account: 'BOSS001', name: '4A藥劑部主管', roleId: 'PHARMACY_MANAGER', hospitalId: 'EDA', unit: '藥劑部', password: '000000', enabled: true },
  { id: 'U004', account: 'WARD001', name: '4A護理部窗口', roleId: 'UNIT_CONTACT', hospitalId: 'EDA', unit: '4A護理站', password: '000000', enabled: true },
  { id: 'U005', account: '4D232', name: '李成偉', roleId: 'PHARMACIST', hospitalId: 'EDA', unit: '藥劑部', password: '000000', enabled: true },

  // Mock：該院區可被受查單位管理選擇的窗口人員
  { id: 'C003A', account: 'WARD3A', name: '護理長3A', roleId: 'UNIT_CONTACT', hospitalId: 'EDA', unit: '護理部', password: '000000', enabled: true },
  { id: 'C003B', account: 'WARD3B', name: '護理長3B', roleId: 'UNIT_CONTACT', hospitalId: 'EDA', unit: '護理部', password: '000000', enabled: true },
  { id: 'C003C', account: 'WARD3C', name: '護理長3C', roleId: 'UNIT_CONTACT', hospitalId: 'EDA', unit: '護理部', password: '000000', enabled: true },
  { id: 'C003D', account: 'WARD3D', name: '護理長3D', roleId: 'UNIT_CONTACT', hospitalId: 'EDA', unit: '護理部', password: '000000', enabled: true },
  { id: 'C003E', account: 'WARD3E', name: '護理長3E', roleId: 'UNIT_CONTACT', hospitalId: 'EDA', unit: '護理部', password: '000000', enabled: true },
  { id: 'C004A', account: 'WARD4A', name: '護理長4A', roleId: 'UNIT_CONTACT', hospitalId: 'EDA', unit: '護理部', password: '000000', enabled: true },
  { id: 'C004B', account: 'WARD4B', name: '護理長4B', roleId: 'UNIT_CONTACT', hospitalId: 'EDA', unit: '護理部', password: '000000', enabled: true },
  { id: 'C004C', account: 'WARD4C', name: '護理長4C', roleId: 'UNIT_CONTACT', hospitalId: 'EDA', unit: '護理部', password: '000000', enabled: true },
  { id: 'CER', account: 'WARDER', name: '急診窗口', roleId: 'UNIT_CONTACT', hospitalId: 'EDA', unit: '急診部', password: '000000', enabled: true },
  { id: 'COPD', account: 'WARDOPD', name: '門診窗口', roleId: 'UNIT_CONTACT', hospitalId: 'EDA', unit: '門診部', password: '000000', enabled: true },
  { id: 'COR', account: 'WARDOR', name: '手術房窗口', roleId: 'UNIT_CONTACT', hospitalId: 'EDA', unit: '手術部', password: '000000', enabled: true },
  { id: 'CCATH', account: 'WARDCATH', name: '心導管窗口', roleId: 'UNIT_CONTACT', hospitalId: 'EDA', unit: '心導管室', password: '000000', enabled: true },
  // 其他院區簽核人員：院區主管與部長共用 PHARMACY_MANAGER 角色，以院區區分。
  { id: 'AUD-ECM', account: 'AUD-ECM', name: '癌醫查核業務負責人', roleId: 'AUDIT_OWNER', hospitalId: 'ECM', unit: '藥劑部', password: '000000', enabled: true },
  { id: 'MGR-ECM', account: 'MGR-ECM', name: '癌醫藥劑部部長', roleId: 'PHARMACY_MANAGER', hospitalId: 'ECM', unit: '藥劑部', password: '000000', enabled: true },
  { id: 'AUD-DACHANG', account: 'AUD-DACHANG', name: '大昌查核業務負責人', roleId: 'AUDIT_OWNER', hospitalId: 'DACHANG', unit: '藥劑部', password: '000000', enabled: true },
  { id: 'MGR-DACHANG-AREA', account: 'MGR-DACHANG-A', name: '大昌院區主管', roleId: 'PHARMACY_MANAGER', hospitalId: 'DACHANG', unit: '藥劑部', password: '000000', enabled: true },
  { id: 'MGR-DACHANG', account: 'MGR-DACHANG', name: '大昌藥劑部部長', roleId: 'PHARMACY_MANAGER', hospitalId: 'DACHANG', unit: '藥劑部', password: '000000', enabled: true },
  { id: 'AUD-PINGTUNG', account: 'AUD-PINGTUNG', name: '屏東查核業務負責人', roleId: 'AUDIT_OWNER', hospitalId: 'PINGTUNG', unit: '藥劑部', password: '000000', enabled: true },
  { id: 'MGR-PINGTUNG', account: 'MGR-PINGTUNG', name: '屏東藥劑部部長', roleId: 'PHARMACY_MANAGER', hospitalId: 'PINGTUNG', unit: '藥劑部', password: '000000', enabled: true },
  { id: 'AUD-ECM-02', account: 'AUD-ECM-02', name: '癌醫查核業務負責人（二）', roleId: 'AUDIT_OWNER', hospitalId: 'ECM', unit: '藥劑部', password: '000000', enabled: true },
  { id: 'MGR-ECM-AREA', account: 'MGR-ECM-A', name: '癌醫院區主管', roleId: 'PHARMACY_MANAGER', hospitalId: 'ECM', unit: '藥劑部', password: '000000', enabled: true },
  { id: 'AUD-DACHANG-02', account: 'AUD-DACHANG-02', name: '大昌查核業務負責人（二）', roleId: 'AUDIT_OWNER', hospitalId: 'DACHANG', unit: '藥劑部', password: '000000', enabled: true },
  { id: 'MGR-PINGTUNG-AREA', account: 'MGR-PINGTUNG-A', name: '屏東院區主管', roleId: 'PHARMACY_MANAGER', hospitalId: 'PINGTUNG', unit: '藥劑部', password: '000000', enabled: true },
  { id: 'MGR-EDA-AREA', account: 'MGR-EDA-A', name: '義大院區主管', roleId: 'PHARMACY_MANAGER', hospitalId: 'EDA', unit: '藥劑部', password: '000000', enabled: true },
]

// Demo 使用者補充分機、Email 與職稱；正式資料由使用者管理維護。
const titleByRole = {
  PHARMACIST: '藥師', AUDIT_OWNER: '查核業務負責人',
  PHARMACY_MANAGER: '藥劑部主管', UNIT_CONTACT: '護理師／單位窗口',
}
mockUsers.forEach((user, index) => {
  user.title ||= (user.name.includes('護理長') ? '護理長' : (titleByRole[user.roleId] || '人員'))
  user.extension ||= user.roleId === 'PHARMACIST' ? `5${String(index + 1).padStart(3, '0')}` : ''
  user.email ||= `${user.account.toLowerCase().replace(/[^a-z0-9]/g, '') || 'user'}@hospital.example.com`
})

// 各院區增加藥師 Mock，供受查單位配置跨院區示範。
const additionalPharmacists = [
  ['U101','5D101','林雅婷','ECM'], ['U102','5D102','陳怡君','ECM'], ['U103','5D103','張家豪','ECM'],
  ['U201','6D201','許雅雯','DACHANG'], ['U202','6D202','郭俊廷','DACHANG'], ['U203','6D203','蔡佩珊','DACHANG'],
  ['U301','7D301','吳承翰','PINGTUNG'], ['U302','7D302','李佳蓉','PINGTUNG'], ['U303','7D303','周柏廷','PINGTUNG'],
  ['U006','4D233','林怡萱','EDA'], ['U007','4D234','陳柏宇','EDA'],
]
additionalPharmacists.forEach(([id, account, name, hospitalId], index) => mockUsers.push({
  id, account, name, roleId: 'PHARMACIST', hospitalId, unit: '藥劑部', title: '藥師',
  extension: `6${String(index + 1).padStart(3, '0')}`, email: `${account.toLowerCase()}@hospital.example.com`, password: '000000', enabled: true,
}))

export const getMockUserByAccount = (account) =>
  mockUsers.find(user => user.account.toLowerCase() === String(account || '').trim().toLowerCase()) || null

export const getMockRoleName = (roleId) =>
  mockRoles.find(role => role.id === roleId)?.name || ''

export const getUsersByHospitalAndRole = (hospitalId, roleId) =>
  mockUsers.filter(user => user.roleId === roleId && user.enabled && (user.hospitalId === hospitalId || (roleId === 'PHARMACY_MANAGER' && user.hospitalId === 'ALL')))

export const getMockUserById = (userId) => mockUsers.find(user => user.id === userId) || null

export const getMockUserProfile = (account) => {
  const user = getMockUserByAccount(account)
  if (!user) return null
  return {
    ...user,
    roleName: getMockRoleName(user.roleId),
    hospitalName: mockHospitals.find(h => h.id === user.hospitalId)?.name || '',
  }
}


export const getMockUsers = () => mockUsers

export const createMockUser = (data = {}) => {
  const account = String(data.account || '').trim()
  if (!account || mockUsers.some(user => user.account.toLowerCase() === account.toLowerCase())) return null
  const user = {
    id: `U${String(mockUsers.length + 1).padStart(3, '0')}`,
    account,
    name: String(data.name || '').trim(),
    roleId: data.roleId || 'PHARMACIST',
    hospitalId: data.hospitalId || mockHospitals[0]?.id || '',
    unit: String(data.unit || '').trim(),
    title: String(data.title || '').trim(),
    extension: String(data.extension || '').trim(),
    email: String(data.email || '').trim(),
    password: '000000',
    enabled: data.enabled !== false,
  }
  mockUsers.push(user)
  return user
}

export const updateMockUser = (userId, changes = {}) => {
  const user = getMockUserById(userId)
  if (!user) return null
  const allowed = ['name', 'roleId', 'hospitalId', 'unit', 'title', 'extension', 'email', 'enabled']
  allowed.forEach(key => { if (key in changes) user[key] = changes[key] })
  return user
}

export const resetMockUserPassword = (userId) => {
  const user = getMockUserById(userId)
  if (!user) return null
  user.password = '000000'
  return user
}
