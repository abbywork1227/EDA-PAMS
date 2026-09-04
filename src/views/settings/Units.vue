<template>
  <section class="page">
    <div class="page-head">
      <div>
        <div class="breadcrumb">系統設定 / 受查單位管理</div>
        <h1>受查單位管理</h1>
        <p>單位基本資料由醫院 API 提供；查核相關屬性依 API 資料自動判定。</p>
      </div>
      <button class="sync-btn" type="button" @click="syncUnits">↻ 同步單位</button>
    </div>

    <div class="info-banner">
      <div class="info-icon">i</div>
      <div>
        <strong>資料來源說明</strong>
        <span>目前以 Mock API 模擬醫院單位與藥品資料。正式介接後，單位新增／停用由醫院主檔決定，本系統不自行新增或刪除單位。</span>
      </div>
    </div>

    <div class="toolbar">
      <div class="search-box">
        <span class="search-icon">⌕</span>
        <input v-model="keyword" type="text" placeholder="搜尋院區、單位代碼、單位名稱" />
        <button v-if="keyword" class="clear-btn" type="button" @click="keyword = ''">×</button>
      </div>
      <div class="toolbar-meta">共 {{ filteredUnits.length }} 個單位 <span class="dot">•</span> 最後同步：{{ lastSyncText }}</div>
    </div>

    <div class="table-card">
      <table>
        <thead>
          <tr>
            <th class="check-col"><input type="checkbox" :checked="allSelected" @change="toggleAll" /></th>
            <th>院區</th>
            <th>單位代碼</th>
            <th>查核單位</th>
            <th>查核藥師</th>
            <th>窗口負責人</th>
            <th>是否啟用</th>
            <th>查核屬性</th>
            <th>急救車類型</th>
            <th class="action-col">功能</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="unit in filteredUnits" :key="unit.id">
            <td class="check-col"><input v-model="selectedIds" type="checkbox" :value="unit.id" /></td>
            <td><span class="hospital-name">{{ unit.hospitalName }}</span></td>
            <td><span class="unit-id">{{ unit.id }}</span></td>
            <td>
              <div class="unit-name">{{ unit.name }}</div>
              <div class="unit-type">{{ unit.type }}</div>
            </td>
            <td><span v-if="unit.pharmacistName" class="person">{{ unit.pharmacistName }}</span><span v-else class="muted">尚未配置</span></td>
            <td><span>{{ unit.contactName || '尚未設定' }}</span></td>
            <td>
              <span class="status-pill" :class="unit.enabled ? 'enabled' : 'disabled'"><span class="status-dot"></span>{{ unit.enabled ? '啟用' : '停用' }}</span>
            </td>
            <td>
              <div class="badges">
                <span v-if="unit.hasRegular" class="badge regular">常備</span>
                <span v-if="unit.hasControlled" class="badge controlled">管制</span>
                <span v-if="unit.hasAmbulance" class="badge ambulance">急救車</span>
                <span v-if="!unit.hasRegular && !unit.hasControlled && !unit.hasAmbulance" class="muted">—</span>
              </div>
            </td>
            <td>
              <div v-if="unit.ambulanceTypes.length" class="ambulance-list">
                <span v-for="type in unit.ambulanceTypes" :key="type.id" class="ambulance-tag">{{ type.config.name }} × {{ type.quantity }}</span>
              </div>
              <span v-else class="muted">—</span>
            </td>
            <td class="action-col">
              <div class="action-buttons">
                <button class="view-btn" type="button" @click="openDetail(unit)">查看</button>
                <button class="edit-btn" type="button" @click="openEdit(unit)">修改</button>
              </div>
            </td>
          </tr>
          <tr v-if="!filteredUnits.length"><td colspan="10" class="empty">查無符合條件的受查單位</td></tr>
        </tbody>
      </table>
    </div>

    <div v-if="syncMessage" class="toast">{{ syncMessage }}</div>

    <div v-if="detailUnit" class="modal-mask" @click.self="closeDetail">
      <div class="modal">
        <div class="modal-head">
          <div><div class="modal-label">受查單位</div><h2>{{ detailUnit.name }}</h2><p>{{ detailUnit.hospitalName }} · {{ detailUnit.id }} · {{ detailUnit.type }}</p></div>
          <button class="close-btn" type="button" @click="closeDetail">×</button>
        </div>
        <div class="modal-section">
          <h3>醫院 API 提供資料</h3>
          <div class="detail-grid">
            <div class="detail-item"><span>院區</span><strong>{{ detailUnit.hospitalName }}</strong></div>
            <div class="detail-item"><span>單位代碼</span><strong>{{ detailUnit.id }}</strong></div>
            <div class="detail-item"><span>單位名稱</span><strong>{{ detailUnit.name }}</strong></div>
            <div class="detail-item"><span>單位類型</span><strong>{{ detailUnit.type }}</strong></div>
            <div class="detail-item"><span>藥品筆數</span><strong>{{ detailUnit.medicationCount }} 筆</strong></div>
          </div>
        </div>
        <div class="modal-section">
          <h3>自動判定查核屬性</h3>
          <div class="attribute-grid">
            <div class="attribute" :class="{ active: detailUnit.hasRegular }"><span>{{ detailUnit.hasRegular ? '✓' : '—' }}</span>常備藥品</div>
            <div class="attribute" :class="{ active: detailUnit.hasControlled }"><span>{{ detailUnit.hasControlled ? '✓' : '—' }}</span>管制藥品</div>
            <div class="attribute pending"><span>API</span>高警訊藥品</div>
            <div class="attribute pending"><span>API</span>冷藏藥品</div>
            <div class="attribute" :class="{ active: detailUnit.hasAmbulance }"><span>{{ detailUnit.hasAmbulance ? '✓' : '—' }}</span>急救車藥品</div>
          </div>
          <p class="hint">查核屬性由醫院 API 資料自動判定；高警訊與冷藏欄位待客戶確認 API 是否提供。</p>
        </div>
        <div class="modal-section">
          <h3>急救車類型／數量</h3>
          <div v-if="detailUnit.ambulanceTypes.length" class="type-chips"><span v-for="type in detailUnit.ambulanceTypes" :key="type.id">✓ {{ type.config.name }} × {{ type.quantity }}</span></div>
          <span v-else class="muted">API 未回傳急救車資料</span>
        </div>
        <div class="modal-foot"><button class="secondary-btn" type="button" @click="closeDetail">關閉</button></div>
      </div>
    </div>

    <div v-if="editUnit" class="modal-mask" @click.self="closeEdit">
      <form class="modal edit-modal" @submit.prevent="saveEdit">
        <div class="modal-head">
          <div><div class="modal-label">受查單位設定</div><h2>{{ editUnit.name }}</h2><p>{{ editUnit.hospitalName }} · {{ editUnit.id }} · 單位基本資料由醫院 API 提供</p></div>
          <button class="close-btn" type="button" @click="closeEdit">×</button>
        </div>
        <div class="modal-section">
          <div class="readonly-note">以下三項為本系統可設定內容；院區、單位、查核屬性與急救車資訊由醫院 API 提供。</div>
          <div class="form-grid">
            <label class="form-field"><span>查核藥師</span><select v-model="editForm.pharmacistId"><option value="">尚未配置</option><option v-for="user in availablePharmacists" :key="user.id" :value="user.id">{{ user.name }}（{{ user.account }}）</option></select></label>
            <label class="form-field combobox-field">
              <span>窗口負責人</span>
              <div class="autocomplete-wrap">
                <input v-model="contactKeyword" type="text" placeholder="輸入姓名或關鍵字搜尋" @focus="contactOpen = true" @input="handleContactInput" @keydown.esc="contactOpen = false" />
                <button class="combo-arrow" type="button" @click="contactOpen = !contactOpen">▾</button>
                <div v-if="contactOpen" class="autocomplete-menu">
                  <button v-for="user in filteredContacts" :key="user.id" type="button" class="contact-option" @mousedown.prevent="selectContact(user)">
                    <strong>{{ user.name }}</strong><small>{{ user.unit }} · {{ user.account }}</small>
                  </button>
                  <div v-if="!filteredContacts.length" class="no-option">查無該院區可選窗口</div>
                </div>
              </div>
              <small>來源：該院區「受查單位窗口」人員設定，共 {{ availableContacts.length }} 位可選。</small>
            </label>
          </div>
          <label class="enable-field"><input v-model="editForm.enabled" type="checkbox" /><span><strong>啟用此受查單位</strong><small>停用後，後續查核產生時不納入此單位。</small></span></label>
        </div>
        <div class="modal-section api-summary">
          <h3>目前 API 自動判定結果</h3>
          <div class="summary-row"><span>查核屬性</span><div class="badges"><span v-if="editUnit.hasRegular" class="badge regular">常備</span><span v-if="editUnit.hasControlled" class="badge controlled">管制</span><span v-if="editUnit.hasAmbulance" class="badge ambulance">急救車</span></div></div>
          <div class="summary-row"><span>急救車類型／數量</span><span>{{ editUnit.ambulanceTypes.map(item => `${item.config.name} × ${item.quantity}`).join('、') || '無' }}</span></div>
        </div>
        <div class="modal-foot"><button class="secondary-btn" type="button" @click="closeEdit">取消</button><button class="save-btn" type="submit">儲存設定</button></div>
      </form>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import { mockService } from '../../mock/mockService'
import { mockHospitals } from '../../mock/users'
import { mockUnits } from '../../mock/units'

const keyword = ref('')
const selectedIds = ref([])
const detailUnit = ref(null)
const editUnit = ref(null)
const editForm = ref({ pharmacistId: '', contactUserId: '', enabled: true })
const contactKeyword = ref('')
const contactOpen = ref(false)
const syncMessage = ref('')
const lastSync = ref(new Date())

const hospitalMap = Object.fromEntries(mockHospitals.map(hospital => [hospital.id, hospital.name]))
const pharmacistsByHospital = Object.fromEntries(mockHospitals.map(hospital => [hospital.id, mockService.users.getByHospitalAndRole(hospital.id, 'PHARMACIST')]))
const contactsByHospital = Object.fromEntries(mockHospitals.map(hospital => [hospital.id, mockService.users.getByHospitalAndRole(hospital.id, 'UNIT_CONTACT')]))
const pharmacists = mockService.users.getByHospitalAndRole('EDA', 'PHARMACIST')
const contacts = mockService.users.getByHospitalAndRole('EDA', 'UNIT_CONTACT')
const availablePharmacists = computed(() => editUnit.value ? (pharmacistsByHospital[editUnit.value.hospitalId] || []) : pharmacists)
const availableContacts = computed(() => editUnit.value ? (contactsByHospital[editUnit.value.hospitalId] || []) : contacts)
const pharmacistMap = Object.fromEntries(mockHospitals.flatMap(hospital => (pharmacistsByHospital[hospital.id] || []).map(user => [user.id, user.name])))
const ambulanceNameMap = new Map()
;['AMB-ADULT-CART', 'AMB-PED-CART', 'AMB-PED-BOX'].forEach(typeId => {
  const config = mockService.ambulance.get(typeId)
  if (config) ambulanceNameMap.set(typeId, config)
})

const buildUnitRow = (unit) => {
  const medications = mockService.units.getMedication(unit.id)
  const config = mockService.units.getConfig(unit.id)
  const contact = (contactsByHospital[unit.hospitalId] || []).find(user => user.id === config?.contactUserId)
  const hospitalAmbulances = mockService.units.getHospitalAmbulances(unit.id)
  const ambulanceTypes = hospitalAmbulances
    .filter(item => item.quantity > 0)
    .map(item => ({ ...item, config: ambulanceNameMap.get(item.ambulanceTypeId) }))
    .filter(item => item.config)
  return {
    ...unit,
    hospitalName: hospitalMap[unit.hospitalId] || unit.hospitalId,
    pharmacistName: config?.pharmacistId ? pharmacistMap[config.pharmacistId] || '' : '',
    contactName: contact?.name || '',
    contactUserId: config?.contactUserId || '',
    enabled: config?.enabled ?? unit.enabled,
    medicationCount: medications.length,
    hasRegular: medications.some(item => !item.isControlled),
    hasControlled: medications.some(item => item.isControlled),
    hasAmbulance: hospitalAmbulances.some(item => item.quantity > 0),
    ambulanceTypes,
  }
}

const rows = ref(mockUnits.map(buildUnitRow))
const filteredUnits = computed(() => {
  const q = keyword.value.trim().toLowerCase()
  if (!q) return rows.value
  return rows.value.filter(unit => [unit.hospitalName, unit.hospitalId, unit.id, unit.name, unit.type, unit.pharmacistName, unit.contactName].some(value => String(value || '').toLowerCase().includes(q)))
})
const allSelected = computed(() => filteredUnits.value.length > 0 && filteredUnits.value.every(unit => selectedIds.value.includes(unit.id)))
const lastSyncText = computed(() => lastSync.value.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }))
const filteredContacts = computed(() => {
  const source = availableContacts.value
  const q = contactKeyword.value.trim().toLowerCase()
  if (!q) return source
  return source.filter(user => [user.name, user.account, user.unit].some(value => String(value || '').toLowerCase().includes(q)))
})

const toggleAll = (event) => {
  if (event.target.checked) selectedIds.value = [...new Set([...selectedIds.value, ...filteredUnits.value.map(unit => unit.id)])]
  else {
    const ids = new Set(filteredUnits.value.map(unit => unit.id))
    selectedIds.value = selectedIds.value.filter(id => !ids.has(id))
  }
}
const syncUnits = () => {
  rows.value = mockUnits.map(buildUnitRow)
  lastSync.value = new Date()
  syncMessage.value = `已同步 ${rows.value.length} 個單位（Mock API）`
  window.setTimeout(() => { syncMessage.value = '' }, 2200)
}
const openDetail = (unit) => { detailUnit.value = unit }
const closeDetail = () => { detailUnit.value = null }
const openEdit = (unit) => {
  const config = mockService.units.getConfig(unit.id)
  const selectedContact = (contactsByHospital[unit.hospitalId] || []).find(user => user.id === config?.contactUserId)
  editUnit.value = unit
  editForm.value = { pharmacistId: config?.pharmacistId || '', contactUserId: config?.contactUserId || '', enabled: config?.enabled ?? unit.enabled }
  contactKeyword.value = selectedContact?.name || ''
  contactOpen.value = false
}
const closeEdit = () => { editUnit.value = null; contactOpen.value = false }
const handleContactInput = () => {
  contactOpen.value = true
  editForm.value.contactUserId = ''
}
const selectContact = (user) => {
  editForm.value.contactUserId = user.id
  contactKeyword.value = user.name
  contactOpen.value = false
}
const saveEdit = () => {
  mockService.units.updateConfig(editUnit.value.id, editForm.value)
  rows.value = mockUnits.map(buildUnitRow)
  syncMessage.value = `${editUnit.value.name} 的設定已儲存`
  editUnit.value = null
  contactOpen.value = false
  window.setTimeout(() => { syncMessage.value = '' }, 2200)
}
</script>

<style scoped>
.page { min-height: 100%; padding: 30px 32px 48px; box-sizing: border-box; background: #f7f9fc; color: #1f2937; font-size: 15px; }
.page-head { display:flex; justify-content:space-between; align-items:flex-end; gap:24px; margin-bottom:20px; }
.breadcrumb { font-size:14px; color:#718096; margin-bottom:8px; }
h1 { margin:0; font-size:32px; letter-spacing:.2px; color:#102a43; }
.page-head p { margin:9px 0 0; color:#718096; font-size:15px; }
.sync-btn { border:0; border-radius:8px; padding:12px 19px; background:#1769aa; color:#fff; font-size:15px; font-weight:700; cursor:pointer; }
.info-banner { display:flex; gap:12px; align-items:flex-start; padding:14px 17px; margin-bottom:18px; border:1px solid #dbeafe; background:#eff6ff; border-radius:9px; color:#35516d; font-size:14px; }
.info-banner strong { display:block; margin-bottom:4px; color:#174a73; font-size:15px; }
.info-banner span { line-height:1.65; }
.info-icon { width:22px; height:22px; flex:0 0 22px; border-radius:50%; background:#2b78b8; color:#fff; text-align:center; line-height:22px; font-weight:700; }
.toolbar { display:flex; justify-content:space-between; align-items:center; gap:20px; margin-bottom:12px; }
.search-box { width:min(430px,100%); height:46px; display:flex; align-items:center; background:#fff; border:1px solid #cbd5e1; border-radius:8px; box-sizing:border-box; }
.search-icon { margin:0 10px 0 13px; font-size:24px; color:#64748b; transform:rotate(-15deg); }
.search-box input { min-width:0; flex:1; height:100%; border:0; outline:0; font-size:15px; color:#1f2937; }
.clear-btn { border:0; background:transparent; color:#94a3b8; font-size:22px; cursor:pointer; padding:0 12px; }
.toolbar-meta { font-size:14px; color:#64748b; white-space:nowrap; }
.dot { margin:0 7px; color:#cbd5e1; }
.table-card { overflow:auto; background:#fff; border:1px solid #dbe2ea; border-radius:10px; overflow:hidden; box-shadow:0 2px 7px rgba(15,23,42,.04); }
table { width:100%; min-width:1380px; border-collapse:collapse; table-layout:fixed; }
th { padding:15px 12px; background:#f8fafc; color:#475569; font-size:15px; font-weight:700; text-align:left; border-bottom:1px solid #dbe2ea; }
td { padding:15px 12px; border-bottom:1px solid #e8edf3; vertical-align:middle; font-size:15px; color:#334155; }
tbody tr:last-child td { border-bottom:0; }
tbody tr:hover { background:#fbfdff; }
.check-col { width:44px; text-align:center; }
th:nth-child(2) { width:92px; }
th:nth-child(3) { width:90px; }
th:nth-child(4) { width:155px; }
th:nth-child(5) { width:130px; }
th:nth-child(6) { width:135px; }
th:nth-child(7) { width:105px; }
th:nth-child(8) { width:180px; }
th:nth-child(9) { width:170px; }
.action-col { width:145px; text-align:center; }
input[type='checkbox'] { width:17px; height:17px; accent-color:#1769aa; }
.unit-name { color:#1669aa; font-weight:700; font-size:16px; }
.unit-code { margin-top:4px; color:#94a3b8; font-size:13px; }
.hospital-name { font-weight:700; color:#334155; white-space:nowrap; }
.unit-id { font-weight:700; color:#475569; font-family:ui-monospace,SFMono-Regular,Menlo,monospace; }
.unit-type { margin-top:4px; color:#94a3b8; font-size:13px; }
.person { font-weight:600; color:#334155; }
.muted { color:#94a3b8; }
.status-pill { display:inline-flex; align-items:center; gap:6px; padding:5px 10px; border-radius:999px; font-size:13px; font-weight:700; }
.status-pill.enabled { color:#166534; background:#f0fdf4; }
.status-pill.disabled { color:#64748b; background:#f1f5f9; }
.status-dot { width:7px; height:7px; border-radius:50%; background:currentColor; }
.badges { display:flex; flex-wrap:wrap; gap:6px; }
.badge { display:inline-flex; align-items:center; padding:5px 8px; border-radius:5px; font-size:12px; font-weight:700; }
.badge.regular { color:#166534; background:#f0fdf4; }
.badge.controlled { color:#9a3412; background:#fff7ed; }
.badge.ambulance { color:#075985; background:#eff6ff; }
.ambulance-list { display:flex; flex-direction:column; gap:5px; }
.ambulance-tag { color:#475569; font-size:13px; white-space:nowrap; }
.action-buttons { display:flex; justify-content:center; gap:6px; }
.view-btn,.edit-btn { border:0; border-radius:6px; padding:8px 12px; font-size:14px; font-weight:700; cursor:pointer; }
.view-btn { background:#eaf2fb; color:#125a91; }
.view-btn:hover { background:#dbeafe; }
.edit-btn { background:#1769aa; color:#fff; }
.edit-btn:hover { background:#125b91; }
.empty { padding:44px; text-align:center; color:#94a3b8; font-size:15px; }
.toast { position:fixed; right:28px; bottom:28px; padding:12px 17px; background:#17324d; color:#fff; border-radius:8px; box-shadow:0 6px 20px rgba(0,0,0,.15); font-size:14px; z-index:30; }
.modal-mask { position:fixed; inset:0; display:flex; align-items:center; justify-content:center; padding:24px; background:rgba(15,23,42,.38); z-index:20; box-sizing:border-box; }
.modal { width:min(760px,100%); max-height:90vh; overflow:auto; background:#fff; border-radius:12px; box-shadow:0 20px 55px rgba(15,23,42,.25); }
.modal-head { display:flex; justify-content:space-between; padding:23px 25px 18px; border-bottom:1px solid #e5e7eb; }
.modal-label { font-size:13px; color:#64748b; margin-bottom:5px; }
.modal h2 { margin:0; font-size:23px; color:#102a43; }
.modal-head p { margin:6px 0 0; color:#94a3b8; font-size:14px; }
.close-btn { width:34px; height:34px; border:0; border-radius:6px; background:#f1f5f9; color:#64748b; font-size:23px; cursor:pointer; }
.modal-section { padding:19px 25px; border-bottom:1px solid #eef2f7; }
.modal-section h3 { margin:0 0 13px; font-size:17px; color:#334155; }
.detail-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; }
.detail-item { padding:12px 13px; background:#f8fafc; border-radius:7px; }
.detail-item span { display:block; margin-bottom:5px; font-size:13px; color:#94a3b8; }
.detail-item strong { color:#334155; font-size:15px; }
.attribute-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:9px; }
.attribute { padding:11px 12px; border:1px solid #e2e8f0; border-radius:7px; color:#94a3b8; font-size:14px; }
.attribute span { margin-right:7px; font-weight:800; }
.attribute.active { border-color:#bbf7d0; background:#f0fdf4; color:#166534; }
.attribute.pending { background:#f8fafc; color:#64748b; }
.attribute.pending span { color:#1769aa; font-size:11px; }
.hint { margin:10px 0 0; color:#94a3b8; font-size:13px; line-height:1.65; }
.type-chips { display:flex; flex-wrap:wrap; gap:8px; }
.type-chips span { padding:8px 11px; border-radius:7px; background:#eff6ff; color:#075985; font-size:14px; font-weight:700; }
.modal-foot { display:flex; justify-content:flex-end; gap:9px; padding:16px 25px; }
.secondary-btn,.save-btn { border-radius:7px; padding:9px 19px; font-size:14px; font-weight:700; cursor:pointer; }
.secondary-btn { border:1px solid #cbd5e1; background:#fff; color:#475569; }
.save-btn { border:0; background:#1769aa; color:#fff; }
.readonly-note { padding:11px 13px; margin-bottom:16px; border-radius:7px; background:#f8fafc; color:#64748b; font-size:13px; line-height:1.6; }
.form-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
.form-field { display:flex; flex-direction:column; gap:7px; }
.form-field > span { color:#475569; font-size:14px; font-weight:700; }
.form-field input,.form-field select { height:42px; padding:0 11px; border:1px solid #cbd5e1; border-radius:7px; outline:0; background:#fff; color:#334155; font-size:15px; box-sizing:border-box; }
.form-field input:focus,.form-field select:focus { border-color:#1769aa; box-shadow:0 0 0 3px rgba(23,105,170,.1); }
.autocomplete-wrap { position:relative; }
.autocomplete-wrap input { width:100%; padding-right:38px; }
.combo-arrow { position:absolute; right:1px; top:1px; height:40px; width:38px; border:0; background:transparent; color:#64748b; font-size:17px; cursor:pointer; }
.autocomplete-menu { position:absolute; left:0; right:0; top:calc(100% + 5px); z-index:50; background:#fff; border:1px solid #cbd5e1; border-radius:8px; box-shadow:0 12px 28px rgba(15,23,42,.16); overflow:hidden; max-height:230px; overflow-y:auto; }
.contact-option { width:100%; display:flex; flex-direction:column; align-items:flex-start; gap:3px; padding:10px 12px; border:0; border-bottom:1px solid #eef2f7; background:#fff; text-align:left; cursor:pointer; }
.contact-option:hover { background:#f8fafc; }
.contact-option strong { color:#334155; font-size:14px; }
.contact-option small { color:#94a3b8; font-size:12px; }
.no-option { padding:13px; color:#94a3b8; font-size:13px; }

.enable-field { display:flex; align-items:flex-start; gap:10px; margin-top:18px; padding:13px; border:1px solid #e2e8f0; border-radius:8px; cursor:pointer; }
.enable-field input { margin-top:3px; }
.enable-field strong { display:block; color:#334155; font-size:15px; }
.enable-field small { display:block; margin-top:3px; color:#94a3b8; font-size:13px; }
.api-summary { background:#fbfdff; }
.summary-row { display:flex; justify-content:space-between; align-items:center; gap:20px; padding:8px 0; color:#64748b; font-size:14px; }
.summary-row > span:last-child { color:#334155; }
@media (max-width:1050px) { .page{padding:22px 18px 36px;} .table-card{overflow-x:auto;} table{min-width:1150px;} }
@media (max-width:720px) { .page-head,.toolbar{align-items:stretch;flex-direction:column;} .search-box{width:100%;} .attribute-grid,.detail-grid,.form-grid{grid-template-columns:1fr;} }
</style>
