// 查核項目主檔。
// inputFields 是本系統動態表單的關鍵：管理者可設定一題是否需要輸入資料，以及輸入型態、單位與必填規則。
// AuditForm 未來只需要依 inputFields render，不需要為每一題寫死 UI。

export const mockAuditItemCategories = [
  { id: 'CONTROLLED', code: 'A', name: '管制藥品', tagClass: 'block-ctrl' },
  { id: 'REGULAR', code: 'B', name: '一般常備藥品', tagClass: 'block-regular' },
  { id: 'HIGH_ALERT', code: 'C', name: '高警訊藥品', tagClass: 'block-alert' },
  { id: 'EMERGENCY', code: 'D', name: '急救車藥品', tagClass: 'block-ambulance' },
  { id: 'REFRIGERATED', code: 'E', name: '冷藏藥品(含疫苗)', tagClass: 'block-ctrl' },
  { id: 'SELF_MEDICATION', code: 'F', name: '自備藥', tagClass: 'block-regular' },
  { id: 'OTHER', code: 'G', name: '其他', tagClass: 'block-alert' },
]

const numberField = (key, label, unit, extra = {}) => ({
  key,
  label,
  type: 'NUMBER',
  unit,
  required: true,
  ...extra,
})

const textField = (key, label, extra = {}) => ({
  key,
  label,
  type: 'TEXT',
  required: true,
  ...extra,
})

const dateField = (key, label, extra = {}) => ({
  key,
  label,
  type: 'DATE',
  required: true,
  ...extra,
})

export const mockAuditItems = [
  // A 管制藥品
  { id: 'A-1', categoryId: 'CONTROLLED', code: 'A-1', text: '1-3級管制藥品應設專櫃加鎖存放。', resultType: 'PASS_FAIL_NA', inputFields: [] },
  { id: 'A-2', categoryId: 'CONTROLLED', code: 'A-2', text: '管制藥品之儲位藥盒標籤具學名、規格及劑型明確標示。不同成份規格藥品區隔存放。', resultType: 'PASS_FAIL_NA', inputFields: [] },
  { id: 'A-3', categoryId: 'CONTROLLED', code: 'A-3', text: '1-3級管制藥品應設置收支簿冊有完整使用紀錄，設置點班本依排班別進行點班。', resultType: 'PASS_FAIL_NA', inputFields: [] },
  { id: 'A-4', categoryId: 'CONTROLLED', code: 'A-4', text: '藥品皆為有效期限內，且有效期限小於6個月者，應貼有「先用」貼紙提醒優先使用。', resultType: 'PASS_FAIL_NA', inputFields: [] },

  // B 一般常備藥品：依目前提供的正式表單內容建立輸入欄位
  { id: 'B-1', categoryId: 'REGULAR', code: 'B-1', text: '單位對常備藥品應有防止遺失或失竊機制，如具備門禁管控或常備藥櫃上鎖。', resultType: 'PASS_FAIL_NA', inputFields: [] },
  { id: 'B-2', categoryId: 'REGULAR', code: 'B-2', text: '藥品之儲位藥盒標籤具學名、規格及劑型明確標示。不同成份規格藥品區隔存放。', resultType: 'PASS_FAIL_NA', inputFields: [] },
  {
    id: 'B-3', categoryId: 'REGULAR', code: 'B-3',
    text: '設置常備品項點班本點班。單位常備品項數登載無誤。',
    resultType: 'PASS_FAIL_NA',
    inputFields: [numberField('actualStockItemCount', '實際常備品項數', '項')],
  },
  {
    id: 'B-4', categoryId: 'REGULAR', code: 'B-4',
    text: '存放溫溼度符合標準：溫度15-25℃；相對濕度50%~80%。',
    resultType: 'PASS_FAIL_NA',
    inputFields: [
      numberField('temperature', '查核當日溫度', '℃'),
      numberField('humidity', '濕度', '%'),
    ],
  },
  { id: 'B-5', categoryId: 'REGULAR', code: 'B-5', text: '開封續用藥品需標示開封日期及有效期限，開封後效期小於24小時者需再加註時間。', resultType: 'PASS_FAIL_NA', inputFields: [] },
  { id: 'B-6', categoryId: 'REGULAR', code: 'B-6', text: '藥品由原包裝取出，調配成不同形式或分裝到不同容器中且未立即給藥時，最小包裝上須有標籤加註藥名、劑量/濃度、調配日期/有效期限及2項病人辨識資訊。術中使用，病人姓名和有效日期非必要標示項目，但藥品未使用部分在術後必須立即丟棄。', resultType: 'PASS_FAIL_NA', inputFields: [] },
  { id: 'B-7', categoryId: 'REGULAR', code: 'B-7', text: '藥品皆為有效期限內，且有效期限小於6個月者，應貼有「先用」貼紙提醒優先使用。', resultType: 'PASS_FAIL_NA', inputFields: [] },
  {
    id: 'B-8', categoryId: 'REGULAR', code: 'B-8',
    text: '單位每年至少有一次常備藥品耗用評估或盤點記錄。',
    resultType: 'PASS_FAIL_NA',
    inputFields: [dateField('evaluationDate', '評估或會議日期')],
  },

  // C 高警訊藥品
  { id: 'C-1', categoryId: 'HIGH_ALERT', code: 'C-1', text: '單位內備有高警訊藥物管理政策及明細，並即時更新（依全院公告為主）。螢光標示單位品項。', resultType: 'PASS_FAIL_NA', inputFields: [] },
  { id: 'C-2', categoryId: 'HIGH_ALERT', code: 'C-2', text: '高警訊及LASA藥品之儲位藥盒標籤具學名、規格及劑型明確標示。不同成份規格藥品區隔存放。', resultType: 'PASS_FAIL_NA', inputFields: [] },
  { id: 'C-3', categoryId: 'HIGH_ALERT', code: 'C-3', text: '高警訊及LASA藥品之儲位藥盒上應有其特殊警示標誌。', resultType: 'PASS_FAIL_NA', inputFields: [] },

  // D 急救車藥品
  {
    id: 'D-1', categoryId: 'EMERGENCY', code: 'D-1',
    text: '急救車加鎖，號碼鎖編號與點班本需一致。',
    resultType: 'PASS_FAIL_NA',
    inputFields: [textField('lockNumber', '號碼鎖編號')],
  },
  { id: 'D-2', categoryId: 'EMERGENCY', code: 'D-2', text: '急救車(包/箱)藥品之儲位藥盒標籤具學名、規格及劑型明確標示。', resultType: 'PASS_FAIL_NA', inputFields: [] },
  { id: 'D-3', categoryId: 'EMERGENCY', code: 'D-3', text: '以急救車點班本依排班別進行點班。', resultType: 'PASS_FAIL_NA', inputFields: [] },
  { id: 'D-4', categoryId: 'EMERGENCY', code: 'D-4', text: '高警訊及LASA藥品之儲位上應貼有特殊警示標誌，急救車內高警訊品項標籤底色為紅色。', resultType: 'PASS_FAIL_NA', inputFields: [] },
  { id: 'D-5', categoryId: 'EMERGENCY', code: 'D-5', text: '成人及小兒急救車(箱)上應備妥小兒劑量換算表，並即時更新（依全院公告為主）。', resultType: 'PASS_FAIL_NA', inputFields: [] },
  { id: 'D-6', categoryId: 'EMERGENCY', code: 'D-6', text: '品項、數量及擺放相對位置與急救車藥品配置表一致。', resultType: 'PASS_FAIL_NA', inputFields: [] },
  { id: 'D-7', categoryId: 'EMERGENCY', code: 'D-7', text: '藥品皆為有效期限內，且有效期限小於6個月者，應貼有「先用」貼紙提醒優先使用。', resultType: 'PASS_FAIL_NA', inputFields: [] },
  { id: 'D-8', categoryId: 'EMERGENCY', code: 'D-8', text: '鎖片依規定列冊管理。', resultType: 'PASS_FAIL_NA', inputFields: [] },

  // E 冷藏藥品（含疫苗）
  { id: 'E-1', categoryId: 'REFRIGERATED', code: 'E-1', text: '冰箱內儲存的藥品，需有防止遺失或失竊機制，如存放空間具備門禁管控。', resultType: 'PASS_FAIL_NA', inputFields: [] },
  { id: 'E-2', categoryId: 'REFRIGERATED', code: 'E-2', text: '冷藏藥之儲位藥盒標籤具學名、規格及劑型明確標示。不同成份規格藥品區隔存放，門邊不擺藥。', resultType: 'PASS_FAIL_NA', inputFields: [] },
  { id: 'E-3', categoryId: 'REFRIGERATED', code: 'E-3', text: '病人用藥需標示病人基本資料（如藥袋）。', resultType: 'PASS_FAIL_NA', inputFields: [] },
  { id: 'E-4', categoryId: 'REFRIGERATED', code: 'E-4', text: '溫度維持2~8℃，需備有高低溫度計。無中央溫度監控系統則需依排班別有手工高低溫度記錄。', resultType: 'PASS_FAIL_NA', inputFields: [numberField('refrigeratorTemperature', '查核當日溫度', '℃')] },
  { id: 'E-5', categoryId: 'REFRIGERATED', code: 'E-5', text: '開封續用藥品需標示開封日期及有效期限，開封後效期小於24小時者需再加註時間。', resultType: 'PASS_FAIL_NA', inputFields: [] },
  { id: 'E-6', categoryId: 'REFRIGERATED', code: 'E-6', text: '藥品皆為有效期限內，且有效期限小於6個月者，應貼有「先用」貼紙提醒優先使用。', resultType: 'PASS_FAIL_NA', inputFields: [] },
  { id: 'E-7', categoryId: 'REFRIGERATED', code: 'E-7', text: '單位之冰箱溫度異常緊急應變處理流程。', resultType: 'PASS_FAIL_NA', inputFields: [] },
  { id: 'E-8', categoryId: 'REFRIGERATED', code: 'E-8', text: '供電插座為緊急供電之電源插座。', resultType: 'PASS_FAIL_NA', inputFields: [] },
  { id: 'E-9', categoryId: 'REFRIGERATED', code: 'E-9', text: '設有單位之冰箱溫度異常緊急應變處理流程。', resultType: 'PASS_FAIL_NA', inputFields: [] },
  { id: 'E-10', categoryId: 'REFRIGERATED', code: 'E-10', text: '疫苗有專用冰箱，不可放置疫苗以外物品。', resultType: 'PASS_FAIL_NA', inputFields: [] },
  { id: 'E-11', categoryId: 'REFRIGERATED', code: 'E-11', text: '疫苗冰箱每層備有高低溫度計，每項疫苗儲位藥盒需有溫度監測卡及凍球。', resultType: 'PASS_FAIL_NA', inputFields: [] },
  { id: 'E-12', categoryId: 'REFRIGERATED', code: 'E-12', text: '活性疫苗應存放於中上層；不活性疫苗應存放於中下層。', resultType: 'PASS_FAIL_NA', inputFields: [] },

  // F 自備藥
  { id: 'F-1', categoryId: 'SELF_MEDICATION', code: 'F-1', text: '醫師於住院醫囑系統確實開立自備藥醫囑。', resultType: 'PASS_FAIL_NA', inputFields: [] },
  { id: 'F-2', categoryId: 'SELF_MEDICATION', code: 'F-2', text: '自備藥儲存區僅限存放醫囑中開立之藥品。', resultType: 'PASS_FAIL_NA', inputFields: [] },
  { id: 'F-3', categoryId: 'SELF_MEDICATION', code: 'F-3', text: '不同患者之自備藥須區隔存放。', resultType: 'PASS_FAIL_NA', inputFields: [] },

  // G 其他
  { id: 'G-1', categoryId: 'OTHER', code: 'G-1', text: '每週確實登錄【NO鋼瓶】壓力。(PICU)', resultType: 'PASS_FAIL_NA', inputFields: [numberField('noCylinderPressure', 'NO鋼瓶壓力', 'kg/cm²')], },
]

export const getAuditItemsByCategory = (categoryId) =>
  mockAuditItems.filter(item => item.categoryId === categoryId)

export const getAuditItemById = (id) =>
  mockAuditItems.find(item => item.id === id) || null
