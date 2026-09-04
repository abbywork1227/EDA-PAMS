// 系統角色主檔：角色目前固定由系統定義，不開放新增／刪除／修改。
// 權限僅供管理者查看，實際可見功能仍由系統角色控制。
export const mockRoles = [
  {
    id: 'PHARMACIST',
    name: '藥師',
    permissions: ['NEWS', 'INITIAL_AUDIT', 'APPROVAL', 'UNIT_OVERVIEW', 'REPORT_PERIODIC', 'REPORT_CLOSED'],
  },
  {
    id: 'AUDIT_OWNER',
    name: '查核(區院)業務負責人',
    permissions: ['NEWS', 'INITIAL_AUDIT', 'APPROVAL', 'UNIT_OVERVIEW', 'REPORT_PERIODIC', 'REPORT_CLOSED', 'WORKFLOW', 'UNIT_CONFIG'],
  },
  {
    id: 'PHARMACY_MANAGER',
    name: '藥劑部區院主管/部長',
    permissions: ['NEWS', 'INITIAL_AUDIT', 'APPROVAL', 'UNIT_OVERVIEW', 'REPORT_PERIODIC', 'REPORT_CLOSED', 'WORKFLOW', 'UNIT_CONFIG', 'AUDIT_ITEMS', 'UNIT_MANAGEMENT', 'AMBULANCE'],
  },
  {
    id: 'UNIT_CONTACT',
    name: '受查單位窗口',
    permissions: ['NEWS', 'UNIT_OVERVIEW'],
  },
]

export const mockPermissionGroups = [
  { id: 'NEWS_GROUP', name: '藥劑最新資訊', children: [{ id: 'NEWS', name: '藥劑最新資訊' }] },
  { id: 'AUDIT_GROUP', name: '藥師查核', children: [{ id: 'INITIAL_AUDIT', name: '初核作業' }, { id: 'APPROVAL', name: '覆核／簽核作業' }] },
  { id: 'UNIT_GROUP', name: '受查單位', children: [{ id: 'UNIT_OVERVIEW', name: '受查單位總覽' }] },
  { id: 'REPORT_GROUP', name: '查核報表', children: [{ id: 'REPORT_PERIODIC', name: '季報表、年報表查詢' }, { id: 'REPORT_CLOSED', name: '結案報表查詢' }] },
  { id: 'ADMIN_GROUP', name: '管理維護作業', children: [{ id: 'ROLES', name: '角色管理（僅查看）' }, { id: 'USERS', name: '使用者管理' }, { id: 'WORKFLOW', name: '簽核流程管理' }, { id: 'UNIT_CONFIG', name: '受查單位配置' }] },
  { id: 'SETTINGS_GROUP', name: '系統設定', children: [{ id: 'AUDIT_ITEMS', name: '查核項目、頻率管理' }, { id: 'UNIT_MANAGEMENT', name: '受查單位管理' }, { id: 'AMBULANCE', name: '急救車查核管理' }] },
]
