// Mock data for AuditForm.vue
export const mockDrawerSections = [
  { id: 'top', name: '車頂外部', icon: '🎛️' },
  { id: 'A', name: '第一層 (A) - 核心急救藥', icon: '🗄️' },
  { id: 'B', name: '第二層 (B) - 高警訊藥品', icon: '🗄️' },
  { id: 'C', name: '第三層 (C) - 點滴/耗材', icon: '🗄️' },
]
export const mockStockDates = [
  '2026-11-30',
  '2027-01-31',
  '2027-03-31',
  '2026-06-30',
  '2026-09-30',
]
export const mockControlledDrugList = [
  {
    id: 'd1',
    name: 'Morphine HCl Inj 10mg/mL',
    level: '一管',
    baseQty: '10 支',
    emptyBottleQty: 0,
    selectedDateType: '2026-11-30',
    customDate: '',
  },
  {
    id: 'd2',
    name: 'Pethidine HCl Inj 50mg/mL',
    level: '二管',
    baseQty: '5 支',
    emptyBottleQty: 0,
    selectedDateType: '2026-06-30',
    customDate: '',
  },
  {
    id: 'd3',
    name: 'Fentanyl Citrate Inj 0.1mg/2mL',
    level: '三管',
    baseQty: '8 支',
    emptyBottleQty: 0,
    selectedDateType: '2027-03-31',
    customDate: '',
  },
]
export const mockStructuredItems = [
  {
    categoryName: '1. 管制藥品管理 (每月核對)',
    tagClass: 'block-ctrl',
    items: [
      {
        id: 'c_1',
        code: '1.1',
        text: '1-3級管制藥品應設專櫃加鎖存放。',
        result: 'pass',
        reasonType: '', // 下拉選單
        reason: '',
        imgUrl: '',
      },
      {
        id: 'c_2',
        code: '1.2',
        text: '儲位藥盒標籤具學名、規格明確標示，區隔存放。',
        result: 'pass',
        reasonType: '', // 下拉選單
        reason: '',
        imgUrl: '',
      },
      {
        id: 'c_3',
        code: '1.3',
        text: '設置收支簿冊有完整紀錄，設置點班本依排班別進行點班。',
        result: 'pass',
        reasonType: '', // 下拉選單
        reason: '',
        imgUrl: '',
      },
    ],
  },
  {
    categoryName: '2. 一般常備藥品 (每季核對)',
    tagClass: 'block-regular',
    items: [
      {
        id: 'reg_1',
        code: '2.1',
        text: '對常備藥品應有防止遺失失竊機制，如門禁管控或常備藥櫃上鎖。',
        result: 'pass',
        reason: '',
        reasonType: '', // 下拉選單
        imgUrl: '',
      },
      {
        id: 'reg_2',
        code: '2.2',
        text: '藥盒標籤學名規格清晰。存放溫溼度標準：溫度 15-25℃、濕度 60% 以下。',
        result: 'pass',
        reason: '',
        reasonType: '', // 下拉選單
        imgUrl: '',
      },
      {
        id: 'reg_3',
        code: '2.3',
        text: '設置常備品項點班本交接。單位常備品項數登載無誤。',
        result: 'pass',
        reason: '',
        reasonType: '', // 下拉選單
        imgUrl: '',
      },
    ],
  },
  {
    categoryName: '3. 高警訊與 LASA 藥品 (每季核對)',
    tagClass: 'block-alert',
    items: [
      {
        id: 'hi_1',
        code: '3.1',
        text: '單位內備有高警訊藥物管理政策明細更新，並以螢光標示。',
        result: 'pass',
        reasonType: '', // 下拉選單
        reason: '',
        imgUrl: '',
      },
      {
        id: 'hi_2',
        code: '3.2',
        text: '高警訊與 LASA 儲位藥盒應張貼特殊雙人覆核警示標誌。',
        result: 'pass',
        reasonType: '', // 下拉選單
        reason: '',
        imgUrl: '',
      },
    ],
  },
  {
    categoryName: '4. 藥品專用冷藏庫與冷凍品項 (每季核對)',
    tagClass: 'block-ctrl',
    items: [
      {
        id: 'ref_1',
        code: '4.1',
        text: '藥品專用冷藏櫃溫度落於標準 2-8℃ 範圍，且每日落實雙時段對數紀錄。',
        result: 'pass',
        reasonType: '', // 下拉選單
        reason: '',
        imgUrl: '',
      },
      {
        id: 'ref_2',
        code: '4.2',
        text: '冷凍庫內禁止存放私人食物。品項整齊排放未觸碰冰箱內壁。',
        result: 'pass',
        reasonType: '', // 下拉選單
        reason: '',
        imgUrl: '',
      },
    ],
  },
  {
    categoryName: '5. 病患自備藥品管理 (每季核對)',
    tagClass: 'block-regular',
    items: [
      {
        id: 'self_1',
        code: '5.1',
        text: '醫師於住院醫囑系統確實開立自備藥醫囑。',
        result: 'pass',
        reasonType: '', // 下拉選單
        reason: '',
        imgUrl: '',
      },
      {
        id: 'self_2',
        code: '5.2',
        text: '自備藥儲存區僅限存放醫囑中開立之藥。',
        result: 'pass',
        reasonType: '', // 下拉選單
        reason: '',
        imgUrl: '',
      },
      {
        id: 'self_3',
        code: '5.3',
        text: '不同患者之自備藥須區隔存放。',
        result: 'pass',
        reasonType: '', // 下拉選單
        reason: '',
        imgUrl: '',
      },
    ],
  },
  {
    categoryName: '6. 急救車與應急品項配置 (每季核對)',
    tagClass: 'block-ambulance',
    items: [
      {
        id: 'em_1',
        code: '6.1',
        text: '急救車/包確實加鎖封條，封條編號與交班點班本登載完全一致。',
        result: 'pass',
        reasonType: '', // 下拉選單
        reason: '',
        imgUrl: '',
      },
      {
        id: 'em_2',
        code: '6.2',
        text: '急救車內高警訊品項標籤底色為紅色，位置擺放與配置表吻合。',
        result: 'pass',
        reasonType: '', // 下拉選單
        reason: '',
        imgUrl: '',
      },
    ],
  },
  {
    categoryName: '7. 其他資產、總務及過期品項處理 (每季核對)',
    tagClass: 'block-alert',
    items: [
      {
        id: 'oth_1',
        code: '7.1',
        text: '每週確實登錄【NO鋼瓶】壓力。(PICU)',
        result: 'pass',
        reasonType: '', // 下拉選單
        reason: '',
        imgUrl: '',
      },
    ],
  },
]
export const mockReasonOptions = [
  '藥品未依規定位置擺放',
  '藥品效期不足六個月',
  '藥品標示不完整（未貼先用標籤）',
  '庫存數量與點班紀錄不一致',
  '其他（自行輸入）',
]
export const mockAmbulanceItems = [
  {
    id: 101,
    name: 'Amiodarone 150mg/3ml/Amp',
    qty: '3 支',
    expire: '2026-06-30',
    img: 'https://picsum.photos/200/140?11',
    result: '',
  },
  {
    id: 102,
    name: 'Adenosine 6mg/2ml/Vial',
    qty: '3 支',
    expire: '2026-06-30',
    img: 'https://picsum.photos/200/140?12',
    result: '',
  },
  {
    id: 103,
    name: 'Midazolam 5mg/ml/Amp',
    qty: '2 支',
    expire: '2026-06-30',
    img: 'https://picsum.photos/200/140?13',
    result: '',
  },
  {
    id: 104,
    name: 'Succinylcholine 500mg/Vial',
    qty: '1 支',
    expire: '2026-06-30',
    img: 'https://picsum.photos/200/140?14',
    result: '',
  },
  {
    id: 105,
    name: 'Atropine 1mg/ml',
    qty: '5 支',
    expire: '2026-09-30',
    img: 'https://picsum.photos/200/140?15',
    result: '',
  },
  {
    id: 106,
    name: 'Epinephrine 1mg/ml',
    qty: '10 支',
    expire: '2026-09-30',
    img: 'https://picsum.photos/200/140?16',
    result: '',
  },
  {
    id: 107,
    name: 'Lidocaine 2%',
    qty: '6 支',
    expire: '2026-09-30',
    img: 'https://picsum.photos/200/140?17',
    result: '',
  },
  {
    id: 108,
    name: 'Normal Saline 500ml',
    qty: '4 袋',
    expire: '2027-01-31',
    img: 'https://picsum.photos/200/140?18',
    result: '',
  },
  {
    id: 109,
    name: 'D5W 500ml',
    qty: '6 袋',
    expire: '2027-01-31',
    img: 'https://picsum.photos/200/140?19',
    result: '',
  },
  {
    id: 110,
    name: 'Magnesium Sulfate',
    qty: '2 支',
    expire: '2027-03-31',
    img: 'https://picsum.photos/200/140?20',
    result: '',
  },
  {
    id: 111,
    name: 'Norepinephrine 4mg',
    qty: '4 支',
    expire: '2027-03-31',
    img: 'https://picsum.photos/200/140?21',
    result: '',
  },
  {
    id: 112,
    name: 'Lactated Ringer',
    qty: '10 袋',
    expire: '2026-06-30',
    img: 'https://picsum.photos/200/140?22',
    result: '',
  },
]
export const mockAmbulances = [
  {
    id: 1,
    customName: '4A 護理站 成人急救車',
    sealNo: 'E-1001',
    layout: 'cart',
    items: structuredClone(mockAmbulanceItems),
  },
  {
    id: 2,
    customName: '4A 護理站 小兒急救車',
    sealNo: 'E-1002',
    layout: 'cart',
    items: structuredClone(mockAmbulanceItems),
  },
  /*{
    id: 3,
    customName: '4A 護理站 小兒外接箱',
    sealNo: 'I-2001',
    layout: 'pediatric',
    items: structuredClone(mockAmbulanceItems),
  },
  {
    id: 4,
    customName: '4A 護理站 急救包藥盒',
    sealNo: 'P-3001',
    layout: 'bag',
    items: structuredClone(mockAmbulanceItems),
  },*/
]
