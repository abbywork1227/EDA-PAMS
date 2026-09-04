// 簽核流程設定 Mock：以「院區」為設定單位，角色不因院區主管另外建立新角色。
// 院區主管與藥劑部部長共用 PHARMACY_MANAGER 角色，透過 hospitalId + 流程設定區分權限與關卡。
export const mockWorkflowConfigs = [
  {
    hospitalId: 'EDA',
    enabled: true,
    businessOwnerId: 'U002',
    areaManagerEnabled: true,
    areaManagerId: 'MGR-EDA-AREA',
    pharmacyManagerId: 'MGR-GROUP',
    improvementEnabled: true,
  },
  {
    hospitalId: 'ECM',
    enabled: true,
    businessOwnerId: 'AUD-ECM',
    areaManagerEnabled: false,
    areaManagerId: '',
    pharmacyManagerId: 'MGR-GROUP',
    improvementEnabled: true,
  },
  {
    hospitalId: 'DACHANG',
    enabled: true,
    businessOwnerId: 'AUD-DACHANG',
    areaManagerEnabled: true,
    areaManagerId: 'MGR-DACHANG-AREA',
    pharmacyManagerId: 'MGR-GROUP',
    improvementEnabled: true,
  },
  {
    hospitalId: 'PINGTUNG',
    enabled: true,
    businessOwnerId: 'AUD-PINGTUNG',
    areaManagerEnabled: false,
    areaManagerId: '',
    pharmacyManagerId: 'MGR-GROUP',
    improvementEnabled: true,
  },
]

export const getWorkflowConfig = (hospitalId) =>
  mockWorkflowConfigs.find(item => item.hospitalId === hospitalId) || null

export const updateWorkflowConfig = (hospitalId, changes = {}) => {
  const config = getWorkflowConfig(hospitalId)
  if (!config) return null
  Object.keys(changes).forEach(key => {
    if (key in config) config[key] = changes[key]
  })
  if (!config.areaManagerEnabled) config.areaManagerId = ''
  return config
}
