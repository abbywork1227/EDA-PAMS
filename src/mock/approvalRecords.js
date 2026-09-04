import { mockHospitals } from './users';
import { getUnitById } from './units';
import { getMockUserById } from './users';
import { getWorkflowConfig } from './workflow';
import { getAuditItemsByCategory, mockAuditItemCategories } from './auditItems';
import { getControlledDrugsByUnit } from './hospitalMedicationData';
import { getHospitalAmbulancesByUnit } from './hospitalAmbulanceData';
import { getAmbulanceConfig } from './ambulance';

// Mock 簽核單：模擬「已完成初查並送入簽核流程」的案件。
// 正式介接後可由 AuditRecord + Workflow API 取代。
export const mockApprovalRecords = [
  {
    id: 'AR001',
    documentNo: 'EDA-3A-OK-202609-001',
    hospitalId: 'EDA',
    unitId: '3A',
    year: 2026,
    month: 9,
    result: 'OK',
    createdById: 'U001',
    createdAt: '2026-09-01',
    currentStep: 'AUDIT_OWNER',
    currentApproverId: 'U002',
    status: 'PENDING',
    summary: '本次查核各項目均符合，無改善案件。',
    suggestion: '',
    history: [
      {
        step: 'PHARMACIST',
        label: '藥師初查',
        userId: 'U001',
        action: '送出',
        at: '2026-09-01 10:12',
      },
    ],
  },

  {
    id: 'AR002',
    documentNo: 'EDA-5B-NG-202609-002',
    hospitalId: 'EDA',
    unitId: '3B',
    year: 2026,
    month: 9,
    result: 'NG',
    createdById: 'U001',
    createdAt: '2026-09-01',
    currentStep: 'UNIT_CONTACT',
    currentApproverId: 'C003B',
    status: 'IN_PROGRESS',
    summary: '發現 2 項不符合，已通知受查單位改善。',
    suggestion: '請依查核結果完成改善後回覆。',
    history: [
      {
        step: 'PHARMACIST',
        label: '藥師初查',
        userId: 'U001',
        action: '送出',
        at: '2026-09-01 09:20',
      },
      {
        step: 'UNIT_CONTACT',
        label: '受查單位窗口改善',
        userId: 'C003B',
        action: '待改善',
        at: '2026-09-01 09:21',
      },
    ],
  },

  {
    id: 'AR003',
    documentNo: 'EDA-4A-NG-202608-001',
    hospitalId: 'EDA',
    unitId: '4A',
    year: 2026,
    month: 8,
    result: 'NG',
    createdById: 'U005',
    createdAt: '2026-08-25',
    currentStep: 'AUDIT_OWNER',
    currentApproverId: 'U002',
    status: 'PENDING',
    summary: '改善已完成並經藥師複查，現送查核業務負責人覆核。',
    suggestion: '改善項目已完成，建議核准。',
    history: [
      {
        step: 'PHARMACIST',
        label: '藥師初查',
        userId: 'U005',
        action: '送出',
        at: '2026-08-25 14:10',
      },
      {
        step: 'UNIT_CONTACT',
        label: '受查單位窗口改善',
        userId: 'C004A',
        action: '改善完成',
        at: '2026-08-27 11:30',
      },
      {
        step: 'PHARMACIST_RECHECK',
        label: '藥師複查',
        userId: 'U005',
        action: '複查通過',
        at: '2026-08-28 09:15',
      },
    ],
  },

  {
    id: 'AR004',
    documentNo: 'ECM-3A-OK-202609-001',
    hospitalId: 'ECM',
    unitId: '3A',
    year: 2026,
    month: 9,
    result: 'OK',
    createdById: 'U001',
    createdAt: '2026-09-01',
    currentStep: 'PHARMACY_MANAGER',
    currentApproverId: 'MGR-GROUP',
    status: 'IN_PROGRESS',
    summary: '查核業務負責人已覆核，目前送藥劑部部長簽核。',
    suggestion: '前一關已確認查核內容。',
    history: [
      {
        step: 'PHARMACIST',
        label: '藥師初查',
        userId: 'U001',
        action: '送出',
        at: '2026-09-01 08:30',
      },
      {
        step: 'AUDIT_OWNER',
        label: '查核業務負責人',
        userId: 'AUD-ECM',
        action: '核准',
        at: '2026-09-01 13:20',
      },
    ],
  },

  {
    id: 'AR005',
    documentNo: 'DACHANG-3A-OK-202608-001',
    hospitalId: 'DACHANG',
    unitId: '3A',
    year: 2026,
    month: 8,
    result: 'OK',
    createdById: 'U001',
    createdAt: '2026-08-22',
    currentStep: 'HOSPITAL_MANAGER',
    currentApproverId: 'MGR-DACHANG-AREA',
    status: 'IN_PROGRESS',
    summary: '查核業務負責人已核准，等待院區主管。',
    suggestion: '',
    history: [
      {
        step: 'PHARMACIST',
        label: '藥師初查',
        userId: 'U001',
        action: '送出',
        at: '2026-08-22 10:00',
      },
      {
        step: 'AUDIT_OWNER',
        label: '查核業務負責人',
        userId: 'AUD-DACHANG',
        action: '核准',
        at: '2026-08-22 15:10',
      },
    ],
  },

  {
    id: 'AR006',
    documentNo: 'PINGTUNG-ER-NG-202608-001',
    hospitalId: 'PINGTUNG',
    unitId: 'ER',
    year: 2026,
    month: 8,
    result: 'NG',
    createdById: 'U001',
    createdAt: '2026-08-20',
    currentStep: 'PHARMACIST_RECHECK',
    currentApproverId: 'U001',
    status: 'IN_PROGRESS',
    summary: '受查單位已完成改善，等待藥師複查。',
    suggestion: '請藥師確認改善內容與現場狀況。',
    history: [
      {
        step: 'PHARMACIST',
        label: '藥師初查',
        userId: 'U001',
        action: '送出',
        at: '2026-08-20 09:00',
      },
      {
        step: 'UNIT_CONTACT',
        label: '受查單位窗口改善',
        userId: 'CER',
        action: '改善完成',
        at: '2026-08-21 16:20',
      },
    ],
  },

  {
    id: 'AR007',
    documentNo: 'EDA-3C-OK-202607-003',
    hospitalId: 'EDA',
    unitId: '3C',
    year: 2026,
    month: 7,
    result: 'OK',
    createdById: 'U001',
    createdAt: '2026-07-15',
    currentStep: 'COMPLETED',
    currentApproverId: '',
    status: 'COMPLETED',
    summary: '所有簽核完成。',
    suggestion: '查核結果符合，完成結案。',
    history: [
      {
        step: 'PHARMACIST',
        label: '藥師初查',
        userId: 'U001',
        action: '送出',
        at: '2026-07-15 09:00',
      },
      {
        step: 'AUDIT_OWNER',
        label: '查核業務負責人',
        userId: 'U002',
        action: '核准',
        at: '2026-07-15 11:10',
      },
      {
        step: 'HOSPITAL_MANAGER',
        label: '院區主管',
        userId: 'MGR-EDA-AREA',
        action: '核准',
        at: '2026-07-15 14:30',
      },
      {
        step: 'PHARMACY_MANAGER',
        label: '藥劑部部長',
        userId: 'MGR-GROUP',
        action: '核准',
        at: '2026-07-16 09:20',
      },
    ],
  },

  {
    id: 'AR008',
    documentNo: 'EDA-4B-NG-202607-004',
    hospitalId: 'EDA',
    unitId: '4B',
    year: 2026,
    month: 7,
    result: 'NG',
    createdById: 'U005',
    createdAt: '2026-07-18',
    currentStep: 'COMPLETED',
    currentApproverId: '',
    status: 'COMPLETED',
    summary: '改善完成並完成全部簽核。',
    suggestion: '改善事項已完成，結案。',
    history: [
      {
        step: 'PHARMACIST',
        label: '藥師初查',
        userId: 'U005',
        action: '送出',
        at: '2026-07-18 10:00',
      },
      {
        step: 'UNIT_CONTACT',
        label: '受查單位窗口改善',
        userId: 'C004B',
        action: '改善完成',
        at: '2026-07-19 15:20',
      },
      {
        step: 'PHARMACIST_RECHECK',
        label: '藥師複查',
        userId: 'U005',
        action: '複查通過',
        at: '2026-07-20 09:10',
      },
      {
        step: 'AUDIT_OWNER',
        label: '查核業務負責人',
        userId: 'U002',
        action: '核准',
        at: '2026-07-20 13:30',
      },
      {
        step: 'HOSPITAL_MANAGER',
        label: '院區主管',
        userId: 'MGR-EDA-AREA',
        action: '核准',
        at: '2026-07-20 16:00',
      },
      {
        step: 'PHARMACY_MANAGER',
        label: '藥劑部部長',
        userId: 'MGR-GROUP',
        action: '核准',
        at: '2026-07-21 09:00',
      },
    ],
  },

  {
    id: 'AR009',
    documentNo: 'EDA-3D-OK-202609-002',
    hospitalId: 'EDA',
    unitId: '3D',
    year: 2026,
    month: 9,
    result: 'OK',
    createdById: 'U005',
    createdAt: '2026-09-02',
    currentStep: 'HOSPITAL_MANAGER',
    currentApproverId: 'MGR-EDA-AREA',
    status: 'IN_PROGRESS',
    summary: '查核業務負責人已查看，目前等待義大院區主管簽核。',
    suggestion: '查核內容確認無誤，建議核准。',
    history: [
      { step: 'PHARMACIST', label: '藥師初查', userId: 'U005', action: '送出', at: '2026-09-02 09:00' },
      { step: 'AUDIT_OWNER', label: '查核業務負責人', userId: 'U002', action: '查看', at: '2026-09-02 11:30' },
    ],
  },

  // 讓藥師登入時有多筆「待我複查」示意案件。
  {
    id: 'AR010',
    documentNo: 'EDA-3E-NG-202609-003',
    hospitalId: 'EDA',
    unitId: '3E',
    year: 2026,
    month: 9,
    result: 'NG',
    createdById: 'U005',
    createdAt: '2026-09-03',
    currentStep: 'PHARMACIST_RECHECK',
    currentApproverId: 'U005',
    status: 'IN_PROGRESS',
    summary: '受查單位已完成改善，等待藥師複查。',
    suggestion: '請確認改善前後照片及現場改善情形。',
    history: [
      { step: 'PHARMACIST', label: '藥師初查', userId: 'U005', action: '送出', at: '2026-09-03 08:30' },
      { step: 'UNIT_CONTACT', label: '受查單位窗口改善', userId: 'C003E', action: '改善完成', at: '2026-09-03 13:10' },
    ],
  },

  // 讓藥劑部部長登入時有多筆「待我簽核」示意案件。
  {
    id: 'AR011',
    documentNo: 'EDA-4C-NG-202609-004',
    hospitalId: 'EDA',
    unitId: '4C',
    year: 2026,
    month: 9,
    result: 'NG',
    createdById: 'U001',
    createdAt: '2026-09-01',
    currentStep: 'PHARMACY_MANAGER',
    currentApproverId: 'MGR-GROUP',
    status: 'IN_PROGRESS',
    summary: '改善完成、藥師複查通過及前置流程完成，目前送藥劑部部長簽核。',
    suggestion: '改善內容已確認，請進行最終簽核。',
    history: [
      { step: 'PHARMACIST', label: '藥師初查', userId: 'U001', action: '送出', at: '2026-09-01 09:10' },
      { step: 'UNIT_CONTACT', label: '受查單位窗口改善', userId: 'C004C', action: '改善完成', at: '2026-09-02 10:30' },
      { step: 'PHARMACIST_RECHECK', label: '藥師複查', userId: 'U001', action: '複查通過', at: '2026-09-02 15:20' },
      { step: 'AUDIT_OWNER', label: '查核業務負責人', userId: 'U002', action: '核准', at: '2026-09-03 09:20' },
      { step: 'HOSPITAL_MANAGER', label: '院區主管', userId: 'MGR-EDA-AREA', action: '核准', at: '2026-09-03 11:00' },
    ],
  },

  {
    id: 'AR012',
    documentNo: 'ECM-3B-OK-202609-002',
    hospitalId: 'ECM',
    unitId: '3B',
    year: 2026,
    month: 9,
    result: 'OK',
    createdById: 'U005',
    createdAt: '2026-09-02',
    currentStep: 'PHARMACY_MANAGER',
    currentApproverId: 'MGR-GROUP',
    status: 'IN_PROGRESS',
    summary: '查核業務負責人已完成查看，目前等待共同部長最終簽核。',
    suggestion: '查核結果無缺失，請進行最終簽核。',
    history: [
      { step: 'PHARMACIST', label: '藥師初查', userId: 'U005', action: '送出', at: '2026-09-02 08:50' },
      { step: 'AUDIT_OWNER', label: '查核業務負責人', userId: 'AUD-ECM', action: '查看', at: '2026-09-02 14:20' },
    ],
  },

  // 歷史結案案件：提供結案報表跨院區、OK/NG 與不同月份的查詢示意。
  {
    id: 'AR013',
    documentNo: 'ECM-3C-NG-202605-001',
    hospitalId: 'ECM',
    unitId: '3C',
    year: 2026,
    month: 5,
    result: 'NG',
    createdById: 'U005',
    createdAt: '2026-05-12',
    currentStep: 'COMPLETED',
    currentApproverId: '',
    status: 'COMPLETED',
    summary: '改善完成並通過藥師複查，全部簽核完成。',
    suggestion: '改善事項均已完成，准予結案。',
    history: [
      { step: 'PHARMACIST', label: '藥師初查', userId: 'U005', action: '送出', at: '2026-05-12 09:00' },
      { step: 'UNIT_CONTACT', label: '受查單位窗口改善', userId: 'C003C', action: '改善完成', at: '2026-05-14 16:10' },
      { step: 'PHARMACIST_RECHECK', label: '藥師複查', userId: 'U005', action: '複查通過', at: '2026-05-15 09:20' },
      { step: 'AUDIT_OWNER', label: '查核業務負責人', userId: 'AUD-ECM', action: '核准', at: '2026-05-15 13:30' },
      { step: 'PHARMACY_MANAGER', label: '藥劑部部長', userId: 'MGR-GROUP', action: '核准', at: '2026-05-16 10:00' },
    ],
  },

  {
    id: 'AR014',
    documentNo: 'DACHANG-3A-OK-202604-001',
    hospitalId: 'DACHANG',
    unitId: '3A',
    year: 2026,
    month: 4,
    result: 'OK',
    createdById: 'U005',
    createdAt: '2026-04-08',
    currentStep: 'COMPLETED',
    currentApproverId: '',
    status: 'COMPLETED',
    summary: '所有簽核完成，查核結果符合。',
    suggestion: '查核結果符合，完成結案。',
    history: [
      { step: 'PHARMACIST', label: '藥師初查', userId: 'U005', action: '送出', at: '2026-04-08 09:00' },
      { step: 'AUDIT_OWNER', label: '查核業務負責人', userId: 'AUD-DACHANG', action: '核准', at: '2026-04-08 14:10' },
      { step: 'HOSPITAL_MANAGER', label: '院區主管', userId: 'MGR-DACHANG-AREA', action: '核准', at: '2026-04-09 10:00' },
      { step: 'PHARMACY_MANAGER', label: '藥劑部部長', userId: 'MGR-GROUP', action: '核准', at: '2026-04-09 15:30' },
    ],
  },

  {
    id: 'AR015',
    documentNo: 'PINGTUNG-ER-NG-202603-001',
    hospitalId: 'PINGTUNG',
    unitId: 'ER',
    year: 2026,
    month: 3,
    result: 'NG',
    createdById: 'U001',
    createdAt: '2026-03-05',
    currentStep: 'COMPLETED',
    currentApproverId: '',
    status: 'COMPLETED',
    summary: '改善完成、複查通過並完成簽核。',
    suggestion: '改善佐證完整，准予結案。',
    history: [
      { step: 'PHARMACIST', label: '藥師初查', userId: 'U001', action: '送出', at: '2026-03-05 08:40' },
      { step: 'UNIT_CONTACT', label: '受查單位窗口改善', userId: 'CER', action: '改善完成', at: '2026-03-07 15:20' },
      { step: 'PHARMACIST_RECHECK', label: '藥師複查', userId: 'U001', action: '複查通過', at: '2026-03-08 09:10' },
      { step: 'AUDIT_OWNER', label: '查核業務負責人', userId: 'AUD-PINGTUNG', action: '核准', at: '2026-03-08 13:20' },
      { step: 'PHARMACY_MANAGER', label: '藥劑部部長', userId: 'MGR-GROUP', action: '核准', at: '2026-03-09 09:00' },
    ],
  },

];

const roleStepMap = {
  // 簽核作業中的藥師角色，主要負責 NG 案件的改善複查。
  PHARMACIST: 'PHARMACIST_RECHECK',
  AUDIT_OWNER: 'AUDIT_OWNER',
  PHARMACY_MANAGER: 'PHARMACY_MANAGER',
  UNIT_CONTACT: 'UNIT_CONTACT',
};

const hospitalName = (id) => mockHospitals.find((h) => h.id === id)?.name || id;

const userName = (id) => getMockUserById(id)?.name || '-';

// 建立「當時查核完成後」的完整查核資料快照。
// 目前為 Mock 示意資料，正式串接 API / DB 後改由實際 AuditRecord 取得。
const buildAuditSnapshot = (record) => {
  const isNg = record.result === 'NG';

  const failCodes = isNg ? ['A-3', 'B-4', 'D-1'] : [];

  const categories = mockAuditItemCategories.map((category) => ({
    categoryId: category.id,
    code: category.code,
    name: category.name,

    items: getAuditItemsByCategory(category.id).map((item) => {
      const failed = failCodes.includes(item.code);

      const values = {};

      item.inputFields?.forEach((field) => {
        values[field.key] =
          field.type === 'NUMBER'
            ? field.unit === '%'
              ? 65
              : 22
            : '2026-09-01';
      });

      return {
        ...item,

        result: failed ? 'fail' : 'pass',

        reason: failed
          ? `查核現場發現${item.text.slice(0, 18)}未符合標準，已通知改善。`
          : '',

        images: failed
          ? [`https://picsum.photos/220/140?audit=${item.id}`]
          : [],

        values,
      };
    }),
  }));

  const controlledDrugs = getControlledDrugsByUnit(record.unitId).map(
    (drug, index) => ({
      ...drug,

      baseQty: drug.stockQty,

      emptyBottleQty: index + 1,

      selectedExpiry: drug.expiryDates?.[0] || '-',
    })
  );

  const ambulances = getHospitalAmbulancesByUnit(record.unitId).flatMap(
    (source) => {
      const config = getAmbulanceConfig(source.ambulanceTypeId);

      return Array.from({ length: source.quantity }, (_, index) => ({
        id: `${source.id}-${index + 1}`,

        customName: `${config?.name || source.ambulanceTypeId} 第${
          index + 1
        }台`,

        carNo: `${source.unitId}-${source.ambulanceTypeId.slice(-4)}-${String(
          index + 1
        ).padStart(2, '0')}`,

        sealNo: `S${record.year}${String(record.month).padStart(
          2,
          '0'
        )}${String(index + 1).padStart(2, '0')}`,

        items: (config?.items || []).map((item) => ({
          ...item,

          qty: item.requiredQty,

          expire: '2027-03-31',

          img: item.image,
        })),
      }));
    }
  );

  return {
    pageInfo: {
      hospitalId: record.hospitalId,

      unitId: record.unitId,

      unitName: getUnitById(record.unitId)?.name || record.unitId,

      year: record.year,

      month: record.month,
    },

    structuredItems: categories,

    controlledDrugList: controlledDrugs,

    ambulances,

    improvementCases: categories.flatMap((category) =>
      category.items.filter((item) => item.result === 'fail').map((item) => {
        const completed = record.status === 'COMPLETED';
        const submitted = record.currentStep === 'PHARMACIST_RECHECK' || record.id === 'AR006';
        return {
          itemId: item.id,
          itemCode: item.code,
          itemText: item.text,
          originalReason: item.reason,
          originalPhotos: item.images || [],
          response: completed || submitted ? `已完成「${item.text.slice(0, 16)}」改善，並重新確認現場狀況。` : '',
          improvementPhotos: completed || submitted ? [`https://picsum.photos/420/280?improvement=${item.id}-${record.id}`] : [],
          status: completed ? 'PASS' : submitted ? 'SUBMITTED' : 'PENDING',
          recheck: completed ? { result: 'PASS', comment: '藥師已現場確認改善完成。' } : submitted ? null : null,
        };
      })
    ),
  };
};

// 取得所有簽核案件。
// 每一筆案件都會帶有完整的「當時查核資料快照」。
export const getApprovalRecords = () =>
  mockApprovalRecords.map((record) => ({
    ...record,

    auditData: record.auditData || buildAuditSnapshot(record),
  }));

// 判斷目前登入者能不能查看／操作此案件。
export const getApprovalContext = (record, userId, roleId) => {
  if (!record) {
    return {
      canView: false,
      canAct: false,
    };
  }

  // 已結案案件可以查看，但不能再操作。
  if (record.status === 'COMPLETED') {
    return {
      canView: true,
      canAct: false,
    };
  }

  const step = roleStepMap[roleId];

  return {
    canView: true,

    canAct: record.currentApproverId === userId && record.currentStep === step,
  };
};

// 依照院區簽核設定建立流程。
const getWorkflowSteps = (record) => {
  const config = getWorkflowConfig(record.hospitalId);

  const base = [
    {
      step: 'PHARMACIST',
      label: '藥師初查',
    },
  ];

  // NG 才會增加改善與複查流程。
  if (record.result === 'NG') {
    base.push(
      {
        step: 'UNIT_CONTACT',
        label: '受查單位窗口改善',
      },
      {
        step: 'PHARMACIST_RECHECK',
        label: '藥師複查',
      }
    );
  }

  base.push({
    step: 'AUDIT_OWNER',
    label: '查核業務負責人',
  });

  // 院區主管依院區設定決定是否存在。
  if (config?.areaManagerEnabled) {
    base.push({
      step: 'HOSPITAL_MANAGER',
      label: '院區主管',
    });
  }

  // 最後統一由藥劑部部長簽核。
  base.push({
    step: 'PHARMACY_MANAGER',
    label: '藥劑部部長',
  });

  return base;
};

// 取得下一個流程節點。
const nextStep = (record) => {
  const steps = getWorkflowSteps(record);

  const index = steps.findIndex((item) => item.step === record.currentStep);

  return (
    steps[index + 1] || {
      step: 'COMPLETED',
      label: '結案',
    }
  );
};

// 核准目前簽核案件。
export const approveApprovalRecord = (id, userId, suggestion = '') => {
  const record = mockApprovalRecords.find((item) => item.id === id);

  if (
    !record ||
    record.status === 'COMPLETED' ||
    record.currentApproverId !== userId
  ) {
    return null;
  }

  const currentLabel =
    getWorkflowSteps(record).find((s) => s.step === record.currentStep)
      ?.label || record.currentStep;

  const next = nextStep(record);

  record.suggestion = suggestion;

  record.history.push({
    step: record.currentStep,

    label: currentLabel,

    userId,

    action: '核准',

    at: new Date().toLocaleString('zh-TW', {
      hour12: false,
    }),
  });

  record.currentStep = next.step;

  record.currentApproverId =
    next.step === 'COMPLETED' ? '' : resolveApprover(record, next.step);

  record.status = next.step === 'COMPLETED' ? 'COMPLETED' : 'IN_PROGRESS';

  return record;
};

// 退回目前簽核案件。
export const rejectApprovalRecord = (id, userId, suggestion = '') => {
  const record = mockApprovalRecords.find((item) => item.id === id);

  if (
    !record ||
    record.status === 'COMPLETED' ||
    record.currentApproverId !== userId
  ) {
    return null;
  }

  const currentLabel =
    getWorkflowSteps(record).find((s) => s.step === record.currentStep)
      ?.label || record.currentStep;

  record.suggestion = suggestion;

  record.history.push({
    step: record.currentStep,

    label: currentLabel,

    userId,

    action: '退回',

    at: new Date().toLocaleString('zh-TW', {
      hour12: false,
    }),
  });

  record.currentStep = 'RETURNED';

  record.currentApproverId = record.createdById;

  record.status = 'RETURNED';

  return record;
};


// 儲存受查單位窗口的單筆改善回覆；正式版改由改善案件 API / DB 儲存。
export const saveApprovalImprovement = (id, userId, itemId, response, photos = [], submit = false) => {
  const record = mockApprovalRecords.find((item) => item.id === id);
  if (!record || record.status === 'COMPLETED' || record.currentStep !== 'UNIT_CONTACT' || record.currentApproverId !== userId) return null;
  const snapshot = record.auditData || buildAuditSnapshot(record);
  const target = snapshot.improvementCases.find((item) => item.itemId === itemId);
  if (!target) return null;
  target.response = response;
  target.improvementPhotos = photos;
  target.status = submit ? 'SUBMITTED' : 'PENDING';
  record.auditData = snapshot;
  record.improvementCases = snapshot.improvementCases;
  if (submit) {
    const allDone = snapshot.improvementCases.every((item) => item.status === 'SUBMITTED' || item.status === 'PASS');
    if (allDone) {
      record.history.push({ step: 'UNIT_CONTACT', label: '受查單位窗口改善', userId, action: '改善完成', at: new Date().toLocaleString('zh-TW', { hour12: false }) });
      record.currentStep = 'PHARMACIST_RECHECK';
      record.currentApproverId = record.createdById;
      record.status = 'IN_PROGRESS';
    }
  }
  return record;
};

// 藥師複查改善結果。
export const recheckApprovalRecord = (id, userId, pass, comment = '') => {
  const record = mockApprovalRecords.find((item) => item.id === id);
  if (!record || record.status === 'COMPLETED' || record.currentStep !== 'PHARMACIST_RECHECK' || record.currentApproverId !== userId) return null;
  record.auditData = record.auditData || buildAuditSnapshot(record);
  record.auditData.improvementCases = (record.auditData.improvementCases || []).map((item) => ({
    ...item,
    status: pass ? 'PASS' : 'FAIL',
    recheck: { result: pass ? 'PASS' : 'FAIL', comment },
  }));
  record.history.push({ step: 'PHARMACIST_RECHECK', label: '藥師複查', userId, action: pass ? '複查通過' : '複查不通過', at: new Date().toLocaleString('zh-TW', { hour12: false }) });
  if (pass) {
    const next = nextStep(record);
    record.currentStep = next.step;
    record.currentApproverId = next.step === 'COMPLETED' ? '' : resolveApprover(record, next.step);
    record.status = next.step === 'COMPLETED' ? 'COMPLETED' : 'IN_PROGRESS';
  } else {
    record.auditData.improvementCases = record.auditData.improvementCases.map((item) => ({ ...item, status: 'PENDING', recheck: { result: 'FAIL', comment } }));
    record.currentStep = 'UNIT_CONTACT';
    record.currentApproverId = resolveApprover(record, 'UNIT_CONTACT');
    record.status = 'IN_PROGRESS';
  }
  return record;
};

// 根據下一個流程節點找出負責人。
export const resolveApprover = (record, step) => {
  const config = getWorkflowConfig(record.hospitalId);

  if (step === 'AUDIT_OWNER') {
    return config?.businessOwnerId || '';
  }

  if (step === 'HOSPITAL_MANAGER') {
    return config?.areaManagerId || '';
  }

  if (step === 'PHARMACY_MANAGER') {
    return config?.pharmacyManagerId || 'MGR-GROUP';
  }

  if (step === 'PHARMACIST_RECHECK') {
    return record.createdById;
  }

  if (step === 'UNIT_CONTACT') {
    return getUnitById(record.unitId)
      ? {
          '3A': 'C003A',
          '3B': 'C003B',
          '3C': 'C003C',
          '3D': 'C003D',
          '3E': 'C003E',
          '4A': 'C004A',
          '4B': 'C004B',
          '4C': 'C004C',
          ER: 'CER',
          OPD: 'COPD',
          OR: 'COR',
          CATH: 'CCATH',
        }[record.unitId] || ''
      : '';
  }

  return '';
};

// 提供 Approval.vue 顯示用資料。
export const getApprovalDisplay = (record) => ({
  ...record,

  hospitalName: hospitalName(record.hospitalId),

  unitName: getUnitById(record.unitId)?.name || record.unitId,

  createdByName: userName(record.createdById),

  currentApproverName: userName(record.currentApproverId),

  currentStepName:
    getWorkflowSteps(record).find((s) => s.step === record.currentStep)
      ?.label ||
    (record.currentStep === 'RETURNED' ? '退回／待重新處理' : '結案'),

  workflowSteps: getWorkflowSteps(record),
});
