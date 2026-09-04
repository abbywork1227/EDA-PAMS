<template>
  <section class="closed-page">
    <div class="page-head">
      <div>
        <h2>結案報表查詢</h2>
        <p>查詢已完成全部簽核的常備藥品查核案件，並查看完整查核表、改善案件及簽核歷程。</p>
      </div>
      <div class="page-summary">
        <span>已結案件數</span>
        <strong>{{ filteredRecords.length }}</strong>
      </div>
    </div>

    <section class="card filter-card">
      <h3>查詢條件</h3>
      <div class="filters">
        <label>院區
          <select v-model="filters.hospitalId">
            <option value="">全部</option>
            <option v-for="hospital in hospitals" :key="hospital.id" :value="hospital.id">{{ hospital.name }}</option>
          </select>
        </label>
        <label>受查單位
          <input v-model.trim="filters.unit" placeholder="請輸入單位名稱或代碼" />
        </label>
        <label>查核年度
          <select v-model="filters.year">
            <option value="">全部</option>
            <option v-for="year in yearOptions" :key="year" :value="String(year)">{{ year }}</option>
          </select>
        </label>
        <label>查核月份
          <select v-model="filters.month">
            <option value="">全部</option>
            <option v-for="month in 12" :key="month" :value="String(month)">{{ month }} 月</option>
          </select>
        </label>
        <label>查核結果
          <select v-model="filters.result">
            <option value="">全部</option>
            <option value="OK">OK</option>
            <option value="NG">NG</option>
          </select>
        </label>
        <label>查核藥師
          <select v-model="filters.pharmacistId">
            <option value="">全部</option>
            <option v-for="pharmacist in pharmacists" :key="pharmacist.id" :value="pharmacist.id">{{ pharmacist.name }}</option>
          </select>
        </label>
        <label>結案日期（起）
          <input v-model="filters.closedFrom" type="date" />
        </label>
        <label>結案日期（迄）
          <input v-model="filters.closedTo" type="date" />
        </label>
        <label class="wide-field">查核單號
          <input v-model.trim="filters.documentNo" placeholder="請輸入查核單號／文件編號" />
        </label>
      </div>
      <div class="filter-actions">
        <button class="btn light" @click="clearFilters">清除</button>
        <button class="btn primary" @click="applyFilters">查詢</button>
      </div>
    </section>

    <section class="stats-row">
      <div class="stat-card"><span>結案件數</span><strong>{{ filteredRecords.length }}</strong></div>
      <div class="stat-card"><span>OK</span><strong>{{ okCount }}</strong></div>
      <div class="stat-card"><span>NG</span><strong>{{ ngCount }}</strong></div>
      <div class="stat-card"><span>改善案件</span><strong>{{ improvementCount }}</strong></div>
    </section>

    <section class="card table-card">
      <div class="table-head">
        <div><h3>結案案件</h3><span>共 {{ filteredRecords.length }} 筆</span></div>
        <span class="readonly-badge">僅供查詢</span>
      </div>
      <div v-if="filteredRecords.length === 0" class="empty">目前沒有符合條件的結案案件。</div>
      <table v-else>
        <thead>
          <tr>
            <th>查核單號</th><th>院區</th><th>受查單位</th><th>查核年月</th><th>結果</th><th>查核藥師</th><th>結案日期</th><th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in filteredRecords" :key="record.id">
            <td class="document-no">{{ record.documentNo }}</td>
            <td>{{ record.hospitalName }}</td>
            <td>{{ record.unitName }}</td>
            <td>{{ record.year }}/{{ String(record.month).padStart(2, '0') }}</td>
            <td><span :class="['result-tag', record.result.toLowerCase()]">{{ record.result }}</span></td>
            <td>{{ record.createdByName }}</td>
            <td>{{ getClosedDate(record) }}</td>
            <td><button class="link-btn" @click="openRecord(record)">查看完整查核單</button></td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- 完整結案查核單 -->
    <div v-if="detailRecord" class="modal-mask" @click.self="closeRecord">
      <div class="modal">
        <div class="modal-head">
          <div>
            <h3>{{ detailRecord.documentNo }}</h3>
            <p>{{ detailRecord.hospitalName }}｜{{ detailRecord.unitName }}｜{{ detailRecord.year }}/{{ String(detailRecord.month).padStart(2, '0') }}</p>
          </div>
          <button class="close" @click="closeRecord">×</button>
        </div>

        <div class="audit-sheet">
          <div class="sheet-title">
            <h2>常備藥查核表 <span v-if="detailRecord.result === 'NG'">（含改善案件）</span></h2>
            <p>結案歷史紀錄｜本頁為唯讀查詢</p>
          </div>
          <div class="sheet-line"></div>

          <h3>基本資料</h3>
          <table class="basic-table">
            <tbody>
              <tr><th>受查單位</th><td>{{ detailRecord.auditData?.pageInfo?.unitName || detailRecord.unitName }}</td><th>院區</th><td>{{ detailRecord.hospitalName }}</td></tr>
              <tr><th>年度</th><td>{{ detailRecord.year }}</td><th>月份</th><td>{{ detailRecord.month }}</td></tr>
              <tr><th>查核藥師</th><td>{{ detailRecord.createdByName }}</td><th>結案日期</th><td>{{ getClosedDate(detailRecord) }}</td></tr>
              <tr><th>查核結果</th><td><span :class="['result-tag', detailRecord.result.toLowerCase()]">{{ detailRecord.result }}</span></td><th>案件摘要</th><td>{{ detailRecord.summary }}</td></tr>
            </tbody>
          </table>

          <h3>查核結果</h3>
          <div v-if="detailRecord.auditData?.controlledDrugList?.length" class="sheet-block">
            <h4>A｜管制藥品效期盤點</h4>
            <table class="confirm-table">
              <thead><tr><th>管制藥品名稱（規格）</th><th>管制級別</th><th>標準量</th><th>空瓶數</th><th>有效期限核對</th></tr></thead>
              <tbody><tr v-for="drug in detailRecord.auditData.controlledDrugList" :key="drug.id"><td>{{ drug.drugName }}</td><td>{{ drug.controlledLevel || '-' }}</td><td>{{ drug.baseQty }}</td><td>{{ drug.emptyBottleQty }} 瓶</td><td>{{ drug.selectedExpiry || '-' }}</td></tr></tbody>
            </table>
          </div>

          <div v-for="category in detailRecord.auditData?.structuredItems || []" :key="category.categoryId" class="sheet-block">
            <h4>{{ category.code }}｜{{ category.name }}</h4>
            <table class="confirm-table">
              <thead><tr><th class="code-col">項次</th><th>查核內容</th><th class="result-col">結果</th></tr></thead>
              <tbody>
                <template v-for="item in category.items" :key="item.id">
                  <tr><td>{{ item.code }}</td><td>{{ item.text }}</td><td><span :class="item.result">{{ resultText(item.result) }}</span></td></tr>
                  <tr v-if="item.result === 'fail'" class="fail-row">
                    <td></td><td colspan="2"><b>不符合原因：</b>{{ item.reason || '-' }}
                      <div v-if="item.images?.length" class="origin-inline"><span>原始查核照片</span><img v-for="(img,i) in item.images" :key="i" :src="img" alt="原始查核照片" /></div>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>

          <div v-if="detailRecord.auditData?.ambulances?.length" class="sheet-block">
            <h4>D｜急救車盤點</h4>
            <div v-for="car in detailRecord.auditData.ambulances" :key="car.id" class="car-preview">
              <div class="car-head"><strong>🚑 {{ car.customName }}</strong><span>車號：{{ car.carNo }}｜封條：{{ car.sealNo }}</span></div>
              <div class="car-grid"><div v-for="item in car.items" :key="item.id" class="car-item"><img :src="item.img" /><b>{{ item.name }}</b><span>數量：{{ item.qty }}</span><small>效期：{{ item.expire }}</small></div></div>
            </div>
          </div>

          <div v-if="detailRecord.result === 'NG'" class="improvement-section">
            <h3 class="improvement-title">改善案件</h3>
            <div v-for="item in detailRecord.auditData?.improvementCases || []" :key="item.itemId" class="improvement-card">
              <div class="improvement-card-head"><strong>{{ item.itemCode }}｜{{ item.itemText }}</strong><span class="improvement-status pass">{{ improvementStatusText(item.status) }}</span></div>
              <div class="reason"><b>不符合原因：</b>{{ item.originalReason || '-' }}</div>
              <div class="compare-grid">
                <div class="compare-col"><h5>改善前｜原始查核照片</h5><div class="photo-list"><img v-for="(img,i) in item.originalPhotos || []" :key="i" :src="img" alt="改善前" /><span v-if="!item.originalPhotos?.length" class="no-photo">無照片</span></div></div>
                <div class="compare-col after"><h5>改善後｜改善照片</h5><div class="photo-list"><img v-for="(img,i) in item.improvementPhotos || []" :key="i" :src="img" alt="改善後" /><span v-if="!item.improvementPhotos?.length" class="no-photo">無照片</span></div></div>
              </div>
              <div class="response-box"><b>受查單位改善回覆：</b>{{ item.response || '未填寫' }}</div>
              <div v-if="item.recheck" class="recheck-box"><b>藥師複查：</b>{{ item.recheck.result === 'PASS' ? '複查通過' : '複查不通過' }}<span v-if="item.recheck.comment">｜{{ item.recheck.comment }}</span></div>
            </div>
          </div>
        </div>

        <section class="detail-section">
          <h4>簽核流程</h4>
          <div class="flow">
            <template v-for="(step,index) in detailRecord.workflowSteps" :key="step.step">
              <div :class="['flow-node',{done:isStepDone(step.step)}]"><span>{{ isStepDone(step.step) ? '✓' : index + 1 }}</span><b>{{ step.label }}</b></div>
              <div v-if="index < detailRecord.workflowSteps.length - 1" class="flow-arrow">→</div>
            </template>
            <div class="flow-node done"><span>✓</span><b>結案</b></div>
          </div>
        </section>

        <section class="detail-section">
          <h4>簽核歷程</h4>
          <div class="history">
            <div v-for="(item,index) in detailRecord.history" :key="index" class="history-row"><span>{{ item.at }}</span><b>{{ item.label }}</b><span>{{ userName(item.userId) }}</span><em>{{ item.action }}</em></div>
            <div class="history-row closed-row"><span>{{ getClosedDateTime(detailRecord) }}</span><b>案件結案</b><span>系統</span><em>結案</em></div>
          </div>
        </section>

        <div class="readonly-note">本頁為結案報表歷史查詢，案件已完成全部流程，無法再修改或簽核。</div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { mockHospitals } from '../../mock/users'
import { mockService } from '../../mock/mockService'

const hospitals = mockHospitals
const records = computed(() => mockService.auditRecords.getCompleted())
const filters = reactive({ hospitalId:'', unit:'', year:'', month:'', result:'', pharmacistId:'', closedFrom:'', closedTo:'', documentNo:'' })
const appliedFilters = reactive({ ...filters })
const detailRecord = ref(null)

const yearOptions = computed(() => [...new Set(records.value.map(r => r.year))].sort((a,b)=>b-a))
const pharmacists = computed(() => {
  const ids = [...new Set(records.value.map(r => r.createdById))]
  return ids.map(id => ({ id, name: mockService.users.get(id)?.name || id }))
})
const filteredRecords = computed(() => records.value.filter(record => {
  const closedDate = getClosedDate(record)
  if (appliedFilters.hospitalId && record.hospitalId !== appliedFilters.hospitalId) return false
  if (appliedFilters.unit) {
    const keyword = appliedFilters.unit.toLowerCase()
    if (!String(record.unitName || '').toLowerCase().includes(keyword) && !String(record.unitId || '').toLowerCase().includes(keyword)) return false
  }
  if (appliedFilters.year && String(record.year) !== String(appliedFilters.year)) return false
  if (appliedFilters.month && String(record.month) !== String(appliedFilters.month)) return false
  if (appliedFilters.result && record.result !== appliedFilters.result) return false
  if (appliedFilters.pharmacistId && record.createdById !== appliedFilters.pharmacistId) return false
  if (appliedFilters.closedFrom && closedDate < appliedFilters.closedFrom) return false
  if (appliedFilters.closedTo && closedDate > appliedFilters.closedTo) return false
  if (appliedFilters.documentNo && !record.documentNo.toLowerCase().includes(appliedFilters.documentNo.toLowerCase())) return false
  return true
}))
const okCount = computed(() => filteredRecords.value.filter(r => r.result === 'OK').length)
const ngCount = computed(() => filteredRecords.value.filter(r => r.result === 'NG').length)
const improvementCount = computed(() => filteredRecords.value.reduce((sum,r) => sum + (r.auditData?.improvementCases?.length || 0), 0))

const resultText = r => r === 'pass' ? '符合' : r === 'fail' ? '不符合' : '不適用'
const improvementStatusText = status => ({ PASS:'改善完成／複查通過', SUBMITTED:'已回覆待複查', PENDING:'待改善', FAIL:'複查不通過' }[status] || status || '-')
const userName = id => mockService.users.get(id)?.name || '-'
const getClosedDateTime = record => record.history?.[record.history.length - 1]?.at || record.createdAt
const getClosedDate = record => String(getClosedDateTime(record) || '').slice(0,10)
const isStepDone = step => detailRecord.value?.history?.some(item => item.step === step.step && ['核准','複查通過','改善完成','送出','查看'].includes(item.action))
const openRecord = record => { detailRecord.value = record }
const closeRecord = () => { detailRecord.value = null }
const applyFilters = () => Object.assign(appliedFilters, filters)
const clearFilters = () => { Object.keys(filters).forEach(k => { filters[k] = '' }); applyFilters() }
</script>

<style scoped>
.closed-page{padding:20px;background:#f5f8fb;min-height:100%;color:#29435c}.page-head{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:18px}.page-head h2{margin:0 0 8px;color:#102a43}.page-head p{margin:0;color:#627d98}.page-summary{background:#fff;border:1px solid #dfe7ef;border-radius:12px;padding:10px 18px;text-align:right}.page-summary span{display:block;font-size:12px;color:#829ab1}.page-summary strong{font-size:24px;color:#174a7c}.card{background:#fff;border:1px solid #dfe7ef;border-radius:18px;box-shadow:0 2px 5px rgba(16,42,67,.04);margin-bottom:16px}.filter-card{padding:22px}.filter-card h3{margin:0 0 16px;color:#102a43}.filters{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}.filters label{font-size:13px;color:#486581}.filters input,.filters select{display:block;width:100%;box-sizing:border-box;margin-top:6px;border:1px solid #d9e2ec;border-radius:9px;padding:10px 12px;background:#fff;color:#334e68}.wide-field{grid-column:span 2}.filter-actions{display:flex;justify-content:flex-end;gap:10px;margin-top:16px}.btn{border:1px solid #d9e2ec;border-radius:9px;padding:10px 18px;background:#fff;color:#486581;cursor:pointer}.btn.primary{background:#2b948c;border-color:#2b948c;color:#fff}.stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px}.stat-card{background:#fff;border:1px solid #dfe7ef;border-radius:14px;padding:15px 18px}.stat-card span{display:block;color:#829ab1;font-size:12px}.stat-card strong{display:block;color:#174a7c;font-size:24px;margin-top:4px}.table-card{overflow:hidden}.table-head{display:flex;justify-content:space-between;align-items:center;padding:18px 20px;border-bottom:1px solid #edf2f7}.table-head h3{margin:0;color:#102a43}.table-head span{font-size:12px;color:#829ab1}.readonly-badge{padding:5px 9px;border-radius:999px;background:#f2f5f8;color:#627d98!important}.table-card table{width:100%;border-collapse:collapse;font-size:13px}.table-card th{background:#f8fafc;color:#486581;font-weight:600;text-align:left}.table-card th,.table-card td{padding:14px 12px;border-bottom:1px solid #edf2f7}.document-no{color:#174a7c;font-weight:600}.result-tag{display:inline-block;padding:4px 9px;border-radius:999px;font-size:12px;font-weight:600}.result-tag.ok{background:#e7f7ef;color:#16834d}.result-tag.ng{background:#fff0ee;color:#c0392b}.link-btn{border:0;background:transparent;color:#167a9b;cursor:pointer}.empty{padding:45px;text-align:center;color:#829ab1}.modal-mask{position:fixed;inset:0;background:rgba(16,42,67,.45);display:flex;align-items:center;justify-content:center;padding:18px;z-index:50}.modal{width:min(1220px,96vw);max-height:94vh;overflow:auto;background:#fff;border-radius:18px;box-shadow:0 20px 60px rgba(16,42,67,.25)}.modal-head{position:sticky;top:0;z-index:3;background:#fff;display:flex;justify-content:space-between;align-items:flex-start;padding:20px 24px;border-bottom:1px solid #e8eef3}.modal-head h3{margin:0;color:#102a43}.modal-head p{margin:5px 0 0;color:#627d98;font-size:13px}.close{border:0;background:transparent;font-size:28px;color:#829ab1;cursor:pointer}.audit-sheet{margin:22px;border:1px solid #d9e2ec;border-radius:8px;padding:30px 32px;background:#fff}.sheet-title{text-align:center}.sheet-title h2{margin:0;color:#102a43;font-size:27px}.sheet-title h2 span{color:#c0392b}.sheet-title p{margin:8px 0;color:#627d98}.sheet-line{border-top:2px solid #334e68;margin:22px 0}.audit-sheet>h3{font-size:20px;color:#102a43;margin:22px 0 12px}.basic-table,.confirm-table{width:100%;border-collapse:collapse}.basic-table th,.basic-table td,.confirm-table th,.confirm-table td{border:1px solid #d9e2ec;padding:11px 12px;text-align:left;vertical-align:top}.basic-table th,.confirm-table th{background:#f7f9fb;color:#102a43;font-weight:700}.basic-table th{width:12%;text-align:center}.sheet-block{margin:22px 0}.sheet-block h4{margin:0;background:#edf5fc;color:#174a7c;padding:11px 14px;border:1px solid #d9e2ec;border-bottom:0;border-radius:8px 8px 0 0}.confirm-table{font-size:13px}.code-col{width:70px}.result-col{width:80px}.pass{color:#16834d;font-weight:700}.fail{color:#c0392b;font-weight:700}.fail-row td{background:#fff8f7}.origin-inline{display:flex;align-items:flex-start;gap:10px;flex-wrap:wrap;margin-top:10px}.origin-inline span{width:100%;color:#627d98;font-size:12px}.origin-inline img{width:180px;height:125px;object-fit:cover;border-radius:8px;border:1px solid #d9e2ec}.car-preview{border:1px solid #d9e2ec;border-radius:8px;padding:12px;margin-top:10px}.car-head{display:flex;justify-content:space-between;margin-bottom:10px}.car-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.car-item{border:1px solid #e5e7eb;border-radius:8px;padding:7px;font-size:11px}.car-item img{width:100%;height:72px;object-fit:cover;border-radius:5px}.car-item b,.car-item span,.car-item small{display:block;margin-top:4px}.car-item span,.car-item small{color:#829ab1}.improvement-section{margin-top:30px;border-top:2px solid #e85b5b;padding-top:10px}.improvement-title{color:#c0392b!important}.improvement-card{border:1px solid #f0b7b2;border-radius:10px;padding:16px;margin:12px 0;background:#fffafa}.improvement-card-head{display:flex;justify-content:space-between;gap:10px;align-items:center;color:#174a7c}.improvement-status{display:inline-block;padding:4px 9px;border-radius:999px;font-size:12px;font-weight:600}.improvement-status.pass{background:#e7f7ef;color:#16834d}.reason{margin:12px 0;color:#486581}.compare-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:14px}.compare-col{border:1px solid #d9e2ec;border-radius:9px;padding:12px;background:#fff}.compare-col.after{border-color:#b7ddd3}.compare-col h5{margin:0 0 10px;color:#486581}.photo-list{display:flex;gap:10px;flex-wrap:wrap}.photo-list img{width:270px;height:190px;object-fit:cover;border-radius:8px;border:1px solid #d9e2ec}.no-photo{color:#829ab1;padding:55px 10px}.response-box,.recheck-box{margin-top:12px;padding:12px 14px;background:#f5f8fb;border-radius:8px;color:#486581}.detail-section{padding:0 24px 20px}.detail-section h4{color:#102a43}.flow{display:flex;align-items:center;gap:8px}.flow-node{flex:1 1 0;min-width:0;text-align:center;color:#829ab1}.flow-node span{display:inline-flex;width:30px;height:30px;border-radius:50%;align-items:center;justify-content:center;background:#eef2f7;margin-bottom:6px}.flow-node b{display:block;font-size:12px}.flow-node.done span{background:#dff6ea;color:#16834d}.flow-node.done b{color:#167a70}.flow-arrow{color:#9fb3c8}.history{border:1px solid #d9e2ec;border-radius:9px;overflow:hidden}.history-row{display:grid;grid-template-columns:160px 180px 1fr 100px;gap:10px;padding:11px 12px;border-bottom:1px solid #edf2f7;font-size:12px}.history-row:last-child{border-bottom:0}.history-row em{color:#16834d;font-style:normal}.closed-row{background:#f7fbf9}.readonly-note{margin:0 24px 24px;padding:13px;background:#f5f8fb;color:#627d98;border-radius:8px}@media(max-width:1000px){.filters{grid-template-columns:1fr 1fr}.wide-field{grid-column:auto}.stats-row{grid-template-columns:1fr 1fr}.compare-grid{grid-template-columns:1fr}.photo-list img{width:220px;height:155px}.car-grid{grid-template-columns:repeat(2,1fr)}.flow{overflow:auto}.flow-node{min-width:95px}.history-row{grid-template-columns:1fr}.audit-sheet{padding:18px;margin:12px}}
</style>
