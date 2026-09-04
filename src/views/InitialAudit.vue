<template>
<div class="initial-audit-container">
  <div class="content-page-title">
    <h2>請點選欲查核年/單位/月份</h2>
  </div>

  <div class="filter-zone">
    <div class="year-tabs">
      <button v-for="year in years" :key="year" :class="['year-tab', { active: selectedYear === year }]" @click="selectedYear = year">
        {{ year }} 年
      </button>
    </div>

    <div class="type-tabs">
      <button v-for="type in unitTypes" :key="type" :class="['type-tab', { active: selectedType === type }]" @click="selectedType = type">
        {{ type === '全部' ? '全部' : type }} 單位 ({{ getUnitCountByType(type) }})
      </button>
    </div>
  </div>

  <table class="audit-table">
    <thead>
      <tr>
        <th width="18%">待查核單位名稱</th>
        <th width="12%">管制藥品</th>
        <th width="12%">常備藥品</th>
        <th width="10%">急救車數量</th>
        <th width="16%">配置明細</th>
        <th class="text-center">年度查核進度時軸 ({{ selectedYear }}年)</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="unit in filteredUnitList" :key="unit.id">
        <td class="font-bold">
          <span class="unit-code">{{ unit.id }}</span>
          {{ unit.name }}
        </td>
        <td>
          <span v-if="unit.hasControlledDrugs" class="badge badge-green">✓ {{ unit.controlledDrugsCount }}品項</span>
          <span v-else class="badge badge-gray">無管制藥</span>
        </td>
        <td><span v-if="unit.hasRegularDrugs" class="badge badge-green">✓ {{ unit.regularDrugsCount }}品項</span><span v-else class="badge badge-gray">無常備藥</span></td>
        <td>
          <span v-if="unit.ambulanceCount > 0" class="ambulance-count-tag">{{ unit.ambulanceCount }} 台</span>
          <span v-else class="text-muted">0</span>
        </td>
        <td>
          <span v-if="unit.ambulances.length > 0" class="ambulance-detail-text">{{ formatAmbulanceDesc(unit.ambulances) }}</span>
          <span v-else class="text-muted">—</span>
        </td>
        <td class="text-center month-timeline">
          <button v-for="month in getAvailableMonths(unit.id)" :key="month" type="button" :class="['month-badge', getStatusClass(unit.id, month)]" @click="handleMonthClick(unit, month)">
            {{ String(month).padStart(2, '0') }}
          </button>
          <span v-if="getAvailableMonths(unit.id).length === 0" class="text-muted">本年度無查核月份</span>
        </td>
      </tr>
      <tr v-if="filteredUnitList.length === 0"><td colspan="6" class="no-data">目前沒有配置給此藥師的受查單位</td></tr>
    </tbody>
  </table>

  <div class="status-legend">
    <span class="legend-title">年度查核進度狀態說明：</span>
    <span class="legend-item"><i class="dot dot-not-started"></i>藍色：尚未開始</span>
    <span class="legend-item"><i class="dot dot-processing"></i>綠色：處理中 (暫存)</span>
    <span class="legend-item"><i class="dot dot-completed"></i>黑色：結案 (已送出)</span>
    <span class="legend-item"><i class="dot dot-overdue"></i>紅色：逾期未查 (警示)</span>
  </div>
</div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { mockService } from '../mock/mockService'
import { mockHospitals } from '../mock/users'
import { auditStore } from '../store'

const router = useRouter()
const selectedYear = ref(2026)
const selectedType = ref('全部')
const years = [2025, 2026, 2027]
const unitTypes = ['全部', '病房', '門/急診', '醫技']
const account = sessionStorage.getItem('username') || '4D231'
const profile = mockService.auth.getUser(account) || mockService.auth.getUser('4D231')
const pharmacistId = profile?.id || 'U001'

const currentAssignments = computed(() => mockService.audits.getForPharmacist(pharmacistId, selectedYear.value))
const filteredUnitList = computed(() => {
  const seen = new Set()
  return currentAssignments.value
    .filter(a => {
      if (seen.has(a.unitId)) return false
      seen.add(a.unitId)
      return selectedType.value === '全部' || a.unitType === selectedType.value
    })
    .map(a => {
      const medication = mockService.units.getMedication(a.unitId)
      const controlled = mockService.units.getControlledDrugs(a.unitId)
      const regular = mockService.units.getRegularDrugs(a.unitId)
      const ambulances = mockService.units.getHospitalAmbulances(a.unitId)
      const unit = mockService.units.get(a.unitId)
      return {
        id: a.unitId,
        name: unit?.name || a.unitName,
        type: a.unitType,
        hospitalId: a.hospitalId,
        hasControlledDrugs: controlled.length > 0,
        controlledDrugsCount: controlled.length,
        hasRegularDrugs: regular.length > 0,
        regularDrugsCount: regular.length,
        medicationCount: medication.length,
        ambulances,
        ambulanceCount: ambulances.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
      }
    })
})

const getUnitCountByType = type => type === '全部' ? filteredAllUnits().length : filteredAllUnits().filter(unit => unit.type === type).length
const filteredAllUnits = () => {
  const seen = new Set()
  return currentAssignments.value.filter(a => {
    if (seen.has(a.unitId)) return false
    seen.add(a.unitId)
    return true
  })
}

const formatAmbulanceDesc = ambulances => ambulances.map(item => {
  const type = mockService.ambulance.get(item.ambulanceTypeId)
  return `${type?.name || item.ambulanceTypeId}x${item.quantity}`
}).join(', ')

const getAvailableMonths = unitId => mockService.audits.getForPharmacist(pharmacistId, selectedYear.value).filter(a => a.unitId === unitId).map(a => a.month).sort((a,b) => a-b)
const getStatusClass = (unitId, month) => {
  const key = `${unitId}-${selectedYear.value}-${month}`
  const stored = auditStore.auditStatuses[key]

  // 優先使用本次實際查核流程留下的狀態：暫存／已送出。
  if (stored === 'processing') return 'status-processing'
  if (stored === 'completed') return 'status-completed'

  // 沒有實際查核紀錄時，依「查核月份是否已經過期」動態判斷。
  // 當月仍可查，不算逾期；跨年時，過去年度的未查月份視為逾期。
  const now = new Date()
  const year = Number(selectedYear.value)
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1
  const isPastMonth = year < currentYear || (year === currentYear && month < currentMonth)

  return isPastMonth ? 'status-overdue' : 'status-not-started'
}

const handleMonthClick = async (unit, month) => {
  await router.push({ path: '/audit-form', query: { unitId: unit.id, unitName: unit.name, month: String(month), year: String(selectedYear.value) } })
}
</script>

<style scoped>
.initial-audit-container { padding: 24px; background-color: #fff; font-family: "PingFang TC", "Microsoft JhengHei", sans-serif; }
.filter-zone { background-color: #f8fafc; padding: 16px; border-radius: 8px; margin-bottom: 24px; border: 1px solid #e2e8f0; }
.year-tabs { display: flex; gap: 12px; margin-bottom: 14px; }
.year-tab { background: #fff; border: 1px solid #cbd5e1; padding: 6px 16px; border-radius: 6px; font-weight: bold; color: #627d98; cursor: pointer; }
.year-tab.active { background: #005088; color: #fff; border-color: #005088; }
.type-tabs { display: flex; gap: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 2px; }
.type-tab { background: none; border: none; padding: 8px 16px; font-size: 0.95rem; font-weight: 600; color: #627d98; cursor: pointer; position: relative; }
.type-tab.active { color: #005088; }
.type-tab.active::after { content: ''; position: absolute; bottom: -2px; left: 0; right: 0; height: 3px; background-color: #005088; }
.audit-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
.audit-table th { background-color: #f1f5f9; border-bottom: 2px solid #cbd5e1; padding: 12px; text-align: left; font-weight: 700; color: #334155; }
.audit-table td { border-bottom: 1px solid #e2e8f0; padding: 14px 12px; color: #334155; font-size: 0.95rem; }
.font-bold { font-weight: bold; color: #102a43; }.unit-code { color:#64748b; margin-right:6px; font-weight:700; }
.text-center { text-align: center !important; }.text-muted { color: #94a3b8; }
.badge { padding: 4px 8px; border-radius: 4px; font-size: 0.85rem; font-weight: 600; }.badge-green { background-color: #e6fffa; color: #008170; }.badge-gray { background-color: #f1f5f9; color: #94a3b8; }
.ambulance-count-tag { background-color: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 12px; font-weight: bold; font-size: 0.85rem; }.ambulance-detail-text { color: #475569; font-size: 0.9rem; font-weight: 500; }
.month-timeline { white-space: nowrap; }.month-badge { display:inline-flex; align-items:center; justify-content:center; width:32px; height:28px; margin:2px; border-radius:8px; font-size:13px; font-weight:600; cursor:pointer; border:1px solid #dbe4ee; background:#f8fafc; }
.status-not-started { color:#2563eb !important; }.status-processing { color:#22c55e !important; }.status-completed { color:#000 !important; }.status-overdue { color:#ef4444 !important; }
.no-data { text-align:center; padding:40px !important; color:#94a3b8; font-weight:500; }.status-legend { display:flex; align-items:center; gap:20px; justify-content:center; font-size:.9rem; font-weight:bold; margin-top:40px; background:#f8fafc; padding:12px; border-radius:6px; border:1px solid #edf2f7; }.legend-item { display:flex; align-items:center; gap:6px; }.dot { width:10px; height:10px; border-radius:50%; display:inline-block; }.dot-not-started { background:#2563eb; }.dot-processing { background:#22c55e; }.dot-completed { background:#000; }.dot-overdue { background:#ef4444; }
</style>
