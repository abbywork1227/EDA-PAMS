<template>
  <div class="overview-page">
    <div class="overview-head">
      <div>
        <div class="eyebrow">BI / 查核進度</div>
        <h2>單位查核總覽</h2>
        <p>以「單位 × 月份」查看整體查核進度；點選已完成月份可唯讀查看完整查核紀錄。</p>
      </div>
      <div class="scope-badge">目前範圍：{{ scopeLabel }}</div>
    </div>

    <section class="query-panel">
      <div class="query-title">
        <div>
          <h3>查核進度查詢條件</h3>
          <p>年度可前後切換一年；不同角色會依權限自動限制院區與單位範圍。</p>
        </div>
      </div>
      <div class="filters">
        <select v-model.number="year">
          <option v-for="y in years" :key="y" :value="y">{{ y }} 年</option>
        </select>
        <select v-model="hospitalId" :disabled="isUnitScoped">
          <option value="">全部院區</option>
          <option v-for="h in hospitals" :key="h.id" :value="h.id">{{ h.name }}</option>
        </select>
        <select v-model="unitType" :disabled="isUnitScoped">
          <option value="">全部單位類型</option>
          <option v-for="x in unitTypes" :key="x" :value="x">{{ x }}</option>
        </select>
        <select v-model="unitId" :disabled="isUnitScoped">
          <option value="">全部受查單位</option>
          <option v-for="x in unitOptions" :key="x.key" :value="x.key">{{ x.unitId }} {{ x.unitName }}</option>
        </select>
        <select v-model="statusFilter">
          <option value="">全部查核狀態</option>
          <option value="completed">已完成</option>
          <option value="processing">改善／簽核中</option>
          <option value="overdue">逾期未查</option>
          <option value="not-started">尚未到期／未開始</option>
          <option value="not-scheduled">該月免查</option>
        </select>
      </div>
    </section>

    <section class="legend-card">
      <span><b class="status-dot done">✓</b> 已完成 OK</span>
      <span><b class="status-dot ng">!</b> 已完成但有 NG</span>
      <span><b class="status-dot processing">↻</b> 改善／簽核中</span>
      <span><b class="status-dot pending">○</b> 尚未完成</span>
      <span><b class="status-dot none">—</b> 該月免查</span>
    </section>

    <section class="panel">
      <div class="panel-head">
        <div>
          <h3>{{ year }} 年查核進度</h3>
          <p>每一格代表該單位當月「整體月查核」，不是將 A～G 拆成不同查核案件。</p>
        </div>
        <div class="year-switch">
          <button @click="year--" :disabled="year <= minYear">← {{ year - 1 }}</button>
          <strong>{{ year }}</strong>
          <button @click="year++" :disabled="year >= maxYear">{{ year + 1 }} →</button>
        </div>
      </div>

      <div class="table-wrap">
        <table class="progress-table">
          <thead>
            <tr>
              <th class="sticky-unit">院區／受查單位</th>
              <th v-for="month in 12" :key="month">{{ String(month).padStart(2, '0') }}月</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="unit in filteredUnits" :key="unit.key">
              <td class="sticky-unit unit-cell" @click="openUnitDetail(unit)">
                <div class="hospital-name">{{ unit.hospitalName }}</div>
                <div><span class="unit-code">{{ unit.unitId }}</span> <b>{{ unit.unitName }}</b></div>
                <small>{{ unit.unitType }}</small>
              </td>
              <td v-for="month in 12" :key="month" class="month-cell">
                <button
                  :class="['month-status', getStatus(unit, month).className]"
                  :title="getStatus(unit, month).title"
                  :disabled="getStatus(unit, month).code === 'not-scheduled' || !getStatus(unit, month).clickable"
                  @click="openAudit(unit, month)"
                >{{ getStatus(unit, month).symbol }}</button>
              </td>
            </tr>
            <tr v-if="!filteredUnits.length">
              <td colspan="13" class="empty">目前篩選條件沒有符合的受查單位。</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <div v-if="unitModal.open" class="modal-backdrop" @click.self="unitModal.open = false">
      <div class="modal unit-modal">
        <div class="modal-head">
          <div>
            <h3>受查單位配置明細</h3>
            <p>{{ unitModal.unit?.hospitalName }}｜{{ unitModal.unit?.unitId }} {{ unitModal.unit?.unitName }}</p>
          </div>
          <button class="close-btn" @click="unitModal.open = false">×</button>
        </div>
        <div class="detail-grid">
          <div><span>單位類型</span><b>{{ unitModal.unit?.unitType || '—' }}</b></div>
          <div><span>管制藥品</span><b>{{ unitModal.controlledCount }} 項</b></div>
          <div><span>常備／一般藥品</span><b>{{ unitModal.regularCount }} 項</b></div>
          <div><span>急救車／箱</span><b>{{ unitModal.ambulanceCount }} 台</b></div>
        </div>
        <div class="detail-section">
          <h4>急救車／箱配置</h4>
          <div v-if="unitModal.ambulances.length" class="detail-list">
            <div v-for="x in unitModal.ambulances" :key="x.id" class="detail-row"><b>{{ x.name }}</b><span>{{ x.quantity }} 台</span></div>
          </div>
          <div v-else class="muted">目前沒有急救車／箱資料。</div>
        </div>
      </div>
    </div>

    <div v-if="auditModal.open" class="modal-backdrop" @click.self="auditModal.open = false">
      <div class="modal audit-modal">
        <div class="modal-head">
          <div>
            <h3>完整查核紀錄｜唯讀</h3>
            <p>{{ auditModal.record?.documentNo }}｜{{ auditModal.record?.hospitalName }}｜{{ auditModal.record?.unitId }} {{ auditModal.record?.unitName }}｜{{ auditModal.record?.year }} 年 {{ auditModal.record?.month }} 月</p>
          </div>
          <button class="close-btn" @click="auditModal.open = false">×</button>
        </div>

        <div v-if="auditModal.record" class="audit-detail">
          <div class="record-summary">
            <span>初評：<b :class="auditModal.record.result === 'OK' ? 'ok' : 'ng'">{{ auditModal.record.result }}</b></span>
            <span>複評：<b :class="(auditModal.record.finalResult || auditModal.record.result) === 'OK' ? 'ok' : 'ng'">{{ auditModal.record.finalResult || auditModal.record.result }}</b></span>
            <span>查核藥師：{{ auditModal.record.createdByName || auditModal.record.createdById }}</span>
          </div>

          <section v-if="auditModal.record.auditData?.controlledDrugList?.length" class="detail-section">
            <h4>管制藥品效期盤點</h4>
            <table class="detail-table"><thead><tr><th>藥品</th><th>級別</th><th>標準量</th><th>空瓶數</th><th>有效期限</th></tr></thead>
              <tbody><tr v-for="drug in auditModal.record.auditData.controlledDrugList" :key="drug.id"><td>{{ drug.name || drug.drugName }}</td><td>{{ drug.level || drug.controlledLevel || '—' }}</td><td>{{ drug.baseQty ?? drug.stockQty }}</td><td>{{ drug.emptyBottleQty || 0 }}</td><td>{{ drug.selectedExpiry || '—' }}</td></tr></tbody>
            </table>
          </section>

          <section v-for="cat in auditModal.record.auditData?.structuredItems || []" :key="cat.categoryId || cat.code" class="detail-section">
            <h4>{{ cat.code }} {{ cat.name || cat.categoryName }}</h4>
            <table class="detail-table"><thead><tr><th>項次</th><th>查核內容</th><th>結果</th><th>原因</th></tr></thead>
              <tbody><tr v-for="item in cat.items" :key="item.id"><td>{{ item.code }}</td><td>{{ item.text }}</td><td><b :class="item.result === 'fail' || item.result === 'NG' ? 'ng' : item.result === 'pass' ? 'ok' : 'na'">{{ item.result === 'fail' ? '不符合' : item.result === 'pass' ? '符合' : '不適用' }}</b></td><td>{{ item.reason || '—' }}</td></tr></tbody>
            </table>
          </section>

          <section v-if="auditModal.record.auditData?.ambulances?.length" class="detail-section">
            <h4>急救車／箱查核</h4>
            <div class="cart-grid"><div v-for="cart in auditModal.record.auditData.ambulances" :key="cart.id" class="cart-card"><b>{{ cart.customName || cart.name }}</b><span>車號：{{ cart.carNo || '—' }}</span><span>封條：{{ cart.sealNo || '—' }}</span><span>{{ cart.items?.length || 0 }} 項藥品配置</span></div></div>
          </section>

          <section v-if="auditModal.record.auditData?.improvementCases?.length" class="detail-section">
            <h4>改善案件</h4>
            <div v-for="item in auditModal.record.auditData.improvementCases" :key="item.itemId" class="improvement-row">
              <div><b>{{ item.categoryCode }} {{ item.itemCode }} {{ item.itemText }}</b><p>原缺失：{{ item.originalReason || '—' }}</p><p>改善回覆：{{ item.response || '—' }}</p></div>
              <div class="photo-list"><img v-for="(photo, i) in [...(item.originalPhotos || []), ...(item.improvementPhotos || [])]" :key="i" :src="photo" alt="查核照片" /></div>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { mockService } from '../mock/mockService'
import { mockHospitals, getMockUserByAccount } from '../mock/users'
import { mockUnitAssignments } from '../mock/unitAssignments'
import { mockAuditRecords } from '../mock/mockAuditRecords'
import { getHospitalAmbulancesByUnit } from '../mock/hospitalAmbulanceData'
import { getControlledDrugsByUnit, getRegularDrugsByUnit } from '../mock/hospitalMedicationData'
import { getAmbulanceConfig } from '../mock/ambulance'

const hospitals = mockHospitals
const unitTypes = ['門診', '急診', '住院', '醫技']
const minYear = 2025
const maxYear = 2027
const year = ref(2026)
const hospitalId = ref('')
const unitType = ref('')
const unitId = ref('')
const statusFilter = ref('')

const role = sessionStorage.getItem('userRole') || '藥師'
const account = sessionStorage.getItem('username') || ''
const currentUser = getMockUserByAccount(account)
const hospitalNameToId = Object.fromEntries(hospitals.map(x => [x.name, x.id]))
const currentHospitalId = computed(() => hospitalNameToId[sessionStorage.getItem('userHospital')] || currentUser?.hospitalId || '')
const currentUnitKey = computed(() => {
  if (currentUser?.roleId !== 'UNIT_CONTACT') return ''
  const assignment = mockUnitAssignments.find(x => x.contactUserId === currentUser.id && x.enabled)
  return assignment ? `${currentHospitalId.value}|${assignment.unitId}` : ''
})
const isUnitScoped = computed(() => role.includes('受查單位') || currentUser?.roleId === 'UNIT_CONTACT')
const scopeLabel = computed(() => isUnitScoped.value ? `${sessionStorage.getItem('userHospital') || '目前院區'}｜自己的單位` : '依目前登入角色授權範圍')

if (isUnitScoped.value) {
  hospitalId.value = currentHospitalId.value
  unitId.value = currentUnitKey.value
}

const unitOptions = computed(() => {
  const map = new Map()
  mockAuditRecords.forEach(record => {
    if (hospitalId.value && record.hospitalId !== hospitalId.value) return
    if (unitType.value && record.unitType !== unitType.value) return
    if (isUnitScoped.value && currentUnitKey.value && `${record.hospitalId}|${record.unitId}` !== currentUnitKey.value) return
    const key = `${record.hospitalId}|${record.unitId}`
    if (!map.has(key)) map.set(key, { key, hospitalId: record.hospitalId, hospitalName: record.hospitalName, unitId: record.unitId, unitName: record.unitName, unitType: record.unitType })
  })
  return [...map.values()].sort((a, b) => `${a.hospitalName}${a.unitId}`.localeCompare(`${b.hospitalName}${b.unitId}`, 'zh-Hant'))
})

const filteredUnits = computed(() => unitOptions.value.filter(x => !unitId.value || x.key === unitId.value))

const approvalRecords = computed(() => mockService.approval.getAll())

function isScheduled(unit, month) {
  // 與目前客戶確認的頻率規則一致：有管制藥品的單位 A 每月；其他類別於 6、12 月。
  const controlled = getControlledDrugsByUnit(unit.unitId).length > 0
  return controlled ? true : [6, 12].includes(month)
}

function getStatus(unit, month) {
  if (!isScheduled(unit, month)) return { code: 'not-scheduled', symbol: '—', className: 'none', title: `${month} 月：該單位本月免查`, clickable: false }

  const key = `${unit.hospitalId}|${unit.unitId}`
  const approval = approvalRecords.value.find(r => r.hospitalId === unit.hospitalId && r.unitId === unit.unitId && Number(r.year) === year.value && Number(r.month) === month)
  if (approval && approval.status !== 'COMPLETED') {
    return { code: 'processing', symbol: '↻', className: 'processing', title: `${month} 月：改善／簽核中`, clickable: false }
  }
  if (approval && approval.status === 'COMPLETED') {
    return approval.result === 'NG'
      ? { code: 'completed', symbol: '!', className: 'ng', title: `${month} 月：已完成，曾有 NG`, clickable: true, record: approval }
      : { code: 'completed', symbol: '✓', className: 'done', title: `${month} 月：已完成 OK`, clickable: true, record: approval }
  }

  const record = mockAuditRecords.find(r => r.hospitalId === unit.hospitalId && r.unitId === unit.unitId && Number(r.year) === year.value && Number(r.month) === month && r.status === 'COMPLETED')
  if (record) {
    return record.result === 'NG'
      ? { code: 'completed', symbol: '!', className: 'ng', title: `${month} 月：已完成，曾有 NG`, clickable: true, record }
      : { code: 'completed', symbol: '✓', className: 'done', title: `${month} 月：已完成 OK`, clickable: true, record }
  }

  const now = new Date()
  const overdue = year.value < now.getFullYear() || (year.value === now.getFullYear() && month < now.getMonth() + 1)
  return overdue
    ? { code: 'overdue', symbol: '○', className: 'overdue', title: `${month} 月：逾期未查`, clickable: false }
    : { code: 'not-started', symbol: '○', className: 'pending', title: `${month} 月：尚未到期／未開始`, clickable: false }
}

const visibleUnits = computed(() => filteredUnits.value.filter(unit => {
  if (!statusFilter.value) return true
  return Array.from({ length: 12 }, (_, i) => getStatus(unit, i + 1).code).some(code => code === statusFilter.value)
}))

const unitModal = reactive({ open: false, unit: null, controlledCount: 0, regularCount: 0, ambulanceCount: 0, ambulances: [] })
const auditModal = reactive({ open: false, record: null })

function openUnitDetail(unit) {
  const sources = getHospitalAmbulancesByUnit(unit.unitId)
  const ambulances = sources.map(source => ({ id: source.id, name: getAmbulanceConfig(source.ambulanceTypeId)?.name || source.ambulanceTypeId, quantity: source.quantity }))
  Object.assign(unitModal, {
    open: true,
    unit,
    controlledCount: getControlledDrugsByUnit(unit.unitId).length,
    regularCount: getRegularDrugsByUnit(unit.unitId).length,
    ambulanceCount: sources.reduce((sum, x) => sum + x.quantity, 0),
    ambulances,
  })
}

function openAudit(unit, month) {
  const status = getStatus(unit, month)
  if (!status.clickable || !status.record) return
  auditModal.record = status.record
  auditModal.open = true
}

watch([hospitalId, unitType], () => {
  if (isUnitScoped.value) return
  if (unitId.value && !unitOptions.value.some(x => x.key === unitId.value)) unitId.value = ''
})
</script>

<style scoped>
.overview-page{background:#f4f7fa;color:#1f2937}.overview-head{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin-bottom:14px}.eyebrow{font-size:12px;color:#64748b;letter-spacing:.08em;margin-bottom:4px}.overview-head h2{margin:0 0 5px;font-size:23px}.overview-head p{margin:0;color:#64748b;font-size:13px}.scope-badge{background:#fff;border:1px solid #dbe4ee;border-radius:999px;padding:8px 12px;color:#475569;font-size:12px}.query-panel,.panel,.legend-card{background:#fff;border:1px solid #e2e8f0;border-radius:12px;box-shadow:0 1px 2px #00000008}.query-panel{padding:16px 18px;margin-bottom:12px}.query-title h3{margin:0 0 4px;font-size:15px}.query-title p{margin:0;color:#64748b;font-size:12px}.filters{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}.filters select{min-width:145px;border:1px solid #d8e0e7;border-radius:8px;background:#fff;padding:9px 11px;color:#334155}.filters select:disabled{background:#f1f5f9;color:#64748b;cursor:not-allowed}.legend-card{display:flex;flex-wrap:wrap;gap:18px;padding:11px 14px;margin-bottom:12px;color:#64748b;font-size:12px}.legend-card span{display:flex;align-items:center;gap:6px}.status-dot{width:22px;height:22px;border-radius:7px;display:inline-flex;align-items:center;justify-content:center;font-size:12px;font-style:normal}.status-dot.done{background:#ecfdf5;color:#15803d}.status-dot.ng{background:#fff7ed;color:#c2410c}.status-dot.processing{background:#eff6ff;color:#2563eb}.status-dot.pending{background:#eff6ff;color:#2563eb}.status-dot.none{background:#f1f5f9;color:#94a3b8}.panel{padding:18px}.panel-head{display:flex;justify-content:space-between;gap:14px;align-items:flex-start;margin-bottom:14px}.panel-head h3{margin:0 0 4px;font-size:17px}.panel-head p{margin:0;color:#64748b;font-size:12px}.year-switch{display:flex;align-items:center;gap:8px}.year-switch button{border:1px solid #d8e0e7;background:#fff;border-radius:7px;padding:7px 10px;color:#475569;cursor:pointer}.year-switch button:disabled{opacity:.45;cursor:not-allowed}.year-switch strong{min-width:60px;text-align:center}.table-wrap{overflow:auto}.progress-table{width:100%;border-collapse:separate;border-spacing:0;min-width:1050px}.progress-table th,.progress-table td{border-right:1px solid #e5eaf0;border-bottom:1px solid #e5eaf0}.progress-table th{background:#f8fafc;padding:10px 7px;color:#475569;font-size:12px;text-align:center}.progress-table td{background:#fff;padding:8px 5px}.sticky-unit{position:sticky;left:0;z-index:2;min-width:220px;text-align:left!important;background:#fff!important}.progress-table thead .sticky-unit{z-index:3;background:#f8fafc!important}.unit-cell{cursor:pointer}.unit-cell:hover{background:#f8fafc!important}.hospital-name{font-size:11px;color:#64748b;margin-bottom:2px}.unit-code{color:#256f67;margin-right:4px}.unit-cell small{display:block;color:#94a3b8;margin-top:3px}.month-cell{text-align:center}.month-status{width:34px;height:30px;border-radius:8px;border:1px solid #e2e8f0;background:#f8fafc;font-size:15px;font-weight:800;cursor:pointer}.month-status.done{color:#15803d;background:#ecfdf5;border-color:#bbf7d0}.month-status.ng{color:#c2410c;background:#fff7ed;border-color:#fed7aa}.month-status.processing{color:#2563eb;background:#eff6ff;border-color:#bfdbfe}.month-status.pending{color:#2563eb;background:#eff6ff;border-color:#dbeafe}.month-status.overdue{color:#dc2626;background:#fef2f2;border-color:#fecaca}.month-status.none{color:#94a3b8;background:#f8fafc;cursor:default}.month-status:disabled{opacity:1}.empty{text-align:center;padding:38px!important;color:#94a3b8}.modal-backdrop{position:fixed;inset:0;background:#00000045;display:flex;align-items:center;justify-content:center;padding:20px;z-index:60}.modal{width:min(900px,100%);max-height:88vh;overflow:auto;background:#fff;border-radius:14px;padding:20px;box-shadow:0 16px 50px #00000025}.unit-modal{width:min(720px,100%)}.modal-head{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;margin-bottom:16px}.modal-head h3{margin:0 0 4px;font-size:18px}.modal-head p{margin:0;color:#64748b;font-size:12px}.close-btn{border:0;background:#f1f5f9;border-radius:8px;width:32px;height:32px;font-size:22px;cursor:pointer;color:#475569}.detail-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.detail-grid>div{border:1px solid #e5eaf0;border-radius:10px;padding:13px}.detail-grid span{display:block;color:#64748b;font-size:12px;margin-bottom:6px}.detail-grid b{font-size:17px}.detail-section{margin-top:18px}.detail-section h4{margin:0 0 9px;font-size:14px}.detail-list{border:1px solid #e5eaf0;border-radius:9px}.detail-row{display:flex;justify-content:space-between;padding:10px 12px;border-bottom:1px solid #eef2f5}.detail-row:last-child{border-bottom:0}.muted{color:#94a3b8;font-size:12px}.record-summary{display:flex;flex-wrap:wrap;gap:18px;padding:12px;background:#f8fafc;border-radius:9px;margin-bottom:12px;color:#475569;font-size:13px}.ok{color:#15803d}.ng{color:#dc2626}.na{color:#64748b}.detail-table{width:100%;border-collapse:collapse;font-size:12px}.detail-table th,.detail-table td{border:1px solid #e2e8f0;padding:8px;text-align:left}.detail-table th{background:#f8fafc;color:#475569}.cart-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:9px}.cart-card{border:1px solid #e5eaf0;border-radius:9px;padding:11px;display:flex;flex-direction:column;gap:4px}.cart-card span{font-size:11px;color:#64748b}.improvement-row{border:1px solid #e5eaf0;border-radius:9px;padding:11px;margin-bottom:9px}.improvement-row p{margin:6px 0;color:#64748b;font-size:12px}.photo-list{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}.photo-list img{width:105px;height:75px;object-fit:cover;border-radius:7px;border:1px solid #e2e8f0}@media(max-width:800px){.detail-grid{grid-template-columns:repeat(2,1fr)}.cart-grid{grid-template-columns:1fr}.overview-head{flex-direction:column}.scope-badge{align-self:flex-start}}
</style>
