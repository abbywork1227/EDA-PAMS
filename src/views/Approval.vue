<template>
  <div class="approval-page">
    <div class="page-head">
      <h2>簽核作業</h2>
      <p>目前登入身分：<strong>{{ currentUser.name }}</strong>（{{ currentUser.roleName }}｜{{ currentUser.hospitalName }}）</p>
    </div>

    <div class="tabs card">
      <button v-for="tab in tabs" :key="tab.key" :class="['tab', { active: activeTab === tab.key }]" @click="activeTab = tab.key">
        {{ tab.label }}（{{ tab.count }}）
      </button>
    </div>

    <section class="card filter-card">
      <h3>查詢條件</h3>
      <div class="filters">
        <label>院區<select v-model="filters.hospitalId"><option value="">全部</option><option v-for="hospital in hospitals" :key="hospital.id" :value="hospital.id">{{ hospital.name }}</option></select></label>
        <label>受查單位<input v-model.trim="filters.unit" placeholder="請輸入單位" /></label>
        <label>查核結果<select v-model="filters.result"><option value="">全部</option><option value="OK">OK</option><option value="NG">NG</option></select></label>
        <label>查核年月<input v-model="filters.yearMonth" type="month" /></label>
        <label>文件編號<input v-model.trim="filters.documentNo" placeholder="請輸入文件編號" /></label>
      </div>
      <div class="filter-actions"><button class="btn light" @click="clearFilters">清除</button><button class="btn primary" @click="applyFilters">查詢</button></div>
    </section>

    <section class="card selection-bar">
      <span>已選取 <strong>{{ selectedIds.length }}</strong> 筆</span>
      <div class="selection-actions">
        <button class="btn light" :disabled="selectedIds.length === 0" @click="openBatchPreview">批次預覽</button>
        <button class="btn primary" :disabled="!canBatchApprove" @click="batchApprove">批次核准（預留）</button>
      </div>
    </section>

    <section class="card table-card">
      <div v-if="filteredRecords.length === 0" class="empty">目前沒有符合條件的案件。</div>
      <table v-else>
        <thead><tr><th class="check-col"><input type="checkbox" :checked="allSelected" @change="toggleAll" /></th><th>文件編號</th><th>院區</th><th>受查單位</th><th>查核年月</th><th>結果</th><th>建立人</th><th>目前流程</th><th>操作</th></tr></thead>
        <tbody>
          <tr v-for="record in filteredRecords" :key="record.id">
            <td class="check-col"><input type="checkbox" :value="record.id" v-model="selectedIds" /></td>
            <td class="document-no">{{ record.documentNo }}</td><td>{{ record.hospitalName }}</td><td>{{ record.unitName }}</td>
            <td>{{ record.year }}/{{ String(record.month).padStart(2, '0') }}</td>
            <td><span :class="['result-tag', record.result.toLowerCase()]">{{ record.result }}</span></td>
            <td>{{ record.createdByName }}</td><td><span :class="['step-tag', { mine: canAct(record) }]">{{ record.currentStepName }}</span></td>
            <td><button class="link-btn" @click="openRecord(record)">{{ actionLabel(record) }}</button></td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- 單筆：完整 AuditRecordConfirm 風格查核單 -->
    <div v-if="detailRecord" class="modal-mask" @click.self="closeDetail">
      <div class="modal xlarge">
        <div class="modal-head">
          <div><h3>{{ detailRecord.documentNo }}</h3><p>{{ detailRecord.hospitalName }}｜{{ detailRecord.unitName }}｜{{ detailRecord.year }}/{{ String(detailRecord.month).padStart(2, '0') }}</p></div>
          <button class="close" @click="closeDetail">×</button>
        </div>

        <div class="audit-sheet">
          <div class="sheet-title"><h2>常備藥查核表</h2><p>本次查核送出時的完整表單內容（示意資料）</p></div>
          <div class="sheet-line"></div>
          <h3>基本資料</h3>
          <table class="basic-table"><tbody><tr><th>受查單位</th><td>{{ detailRecord.auditData?.pageInfo?.unitName || detailRecord.unitName }}</td><th>年度</th><td>{{ detailRecord.year }}</td></tr><tr><th>月份</th><td>{{ detailRecord.month }}</td><th>查核藥師</th><td>{{ detailRecord.createdByName }}</td></tr></tbody></table>

          <h3>查核結果</h3>
          <div v-if="detailRecord.auditData?.controlledDrugList?.length" class="sheet-block">
            <h4>A｜管制藥品效期盤點</h4>
            <table class="confirm-table"><thead><tr><th>管制藥品名稱（規格）</th><th>管制級別</th><th>標準量</th><th>空瓶數</th><th>有效期限核對</th></tr></thead><tbody><tr v-for="drug in detailRecord.auditData.controlledDrugList" :key="drug.id"><td>{{ drug.drugName }}</td><td>{{ drug.controlledLevel || '-' }}</td><td>{{ drug.baseQty }}</td><td>{{ drug.emptyBottleQty }} 瓶</td><td>{{ drug.selectedExpiry || '-' }}</td></tr></tbody></table>
          </div>
          <div v-for="category in detailRecord.auditData?.structuredItems || []" :key="category.categoryId" class="sheet-block">
            <h4>{{ category.code }}｜{{ category.name }}</h4>
            <table class="confirm-table"><thead><tr><th class="code-col">項次</th><th>查核內容</th><th class="result-col">結果</th></tr></thead><tbody>
              <template v-for="item in category.items" :key="item.id"><tr><td>{{ item.code }}</td><td>{{ item.text }}</td><td><span :class="item.result">{{ resultText(item.result) }}</span></td></tr><tr v-if="item.result === 'fail'" class="fail-row"><td></td><td colspan="2"><b>不符合原因：</b>{{ item.reason || '-' }}<div v-if="item.images?.length" class="origin-inline"><span>查核照片</span><img v-for="(img,i) in item.images" :key="i" :src="img" alt="原始查核照片" /></div></td></tr></template>
            </tbody></table>
          </div>

          <div v-if="detailRecord.auditData?.ambulances?.length" class="sheet-block">
            <h4>D｜急救車盤點</h4>
            <div v-for="car in detailRecord.auditData.ambulances" :key="car.id" class="car-preview"><div class="car-head"><strong>🚑 {{ car.customName }}</strong><span>車號：{{ car.carNo }}｜封條：{{ car.sealNo }}</span></div><div class="car-grid"><div v-for="item in car.items" :key="item.id" class="car-item"><img :src="item.img" /><b>{{ item.name }}</b><span>數量：{{ item.qty }}</span><small>效期：{{ item.expire }}</small></div></div></div>
          </div>

          <!-- NG：改善案件直接接在完整查核表下方 -->
          <div v-if="detailRecord.result === 'NG'" class="improvement-section">
            <h3 class="improvement-title">改善案件</h3>
            <div v-for="item in improvementItems" :key="item.itemId" class="improvement-card">
              <div class="improvement-card-head"><strong>{{ item.itemCode }}｜{{ item.itemText }}</strong><span :class="['improvement-status', item.status.toLowerCase()]">{{ improvementStatusText(item.status) }}</span></div>
              <div class="reason"><b>不符合原因：</b>{{ item.originalReason || '-' }}</div>
              <div class="compare-grid">
                <div class="compare-col"><h5>改善前｜查核照片</h5><div class="photo-list"><img v-for="(img,i) in item.originalPhotos" :key="i" :src="img" alt="改善前" /><span v-if="!item.originalPhotos?.length" class="no-photo">無照片</span></div></div>
                <div class="compare-col after"><h5>改善後｜改善照片</h5><div class="photo-list"><img v-for="(img,i) in item.improvementPhotos" :key="i" :src="img" alt="改善後" /><span v-if="!item.improvementPhotos?.length" class="no-photo">尚未上傳</span></div></div>
              </div>
              <div class="response-box"><b>受查單位改善回覆：</b><span>{{ item.response || '尚未填寫' }}</span></div>
              <div v-if="item.recheck" class="recheck-box"><b>藥師複查：</b>{{ item.recheck.result === 'PASS' ? '複查通過' : '複查不通過' }}<span v-if="item.recheck.comment">｜{{ item.recheck.comment }}</span></div>

              <!-- 受查單位窗口操作：單筆改善 -->
              <div v-if="currentUser.roleId === 'UNIT_CONTACT' && detailRecord.currentStep === 'UNIT_CONTACT' && canAct(detailRecord)" class="contact-editor">
                <h5>填寫本項改善</h5>
                <textarea v-model="contactDraft[item.itemId].response" placeholder="請填寫改善說明"></textarea>
                <div class="upload-row"><label class="upload-btn">＋ 上傳改善照片<input type="file" accept="image/*" multiple @change="handleUpload($event, item.itemId)" /></label><span>可選擇多張照片</span></div>
                <div class="draft-photos"><img v-for="(img,i) in contactDraft[item.itemId].photos" :key="i" :src="img" alt="待送出的改善照片" /></div>
                <div class="contact-actions"><button class="btn light" @click="saveImprovement(item.itemId)">暫存本項</button><button class="btn primary" @click="submitImprovement(item.itemId)">送出本項改善</button></div>
              </div>
            </div>
            <div class="improvement-notice">📌 本查核送出後，系統將自動建立改善案件，並通知受查單位填寫改善回覆。</div>
          </div>
        </div>

        <div class="detail-section"><h4>簽核流程</h4><div class="flow"><template v-for="(step,index) in detailRecord.workflowSteps" :key="step.step"><div :class="['flow-node',{done:isStepDone(detailRecord,step.step),current:detailRecord.currentStep===step.step}]"><span>{{ isStepDone(detailRecord,step.step) ? '✓' : index+1 }}</span><b>{{ step.label }}</b></div><div v-if="index<detailRecord.workflowSteps.length-1" class="flow-arrow">→</div></template></div></div>
        <div class="detail-section"><h4>簽核歷程</h4><div class="history"><div v-for="(item,index) in detailRecord.history" :key="index" class="history-row"><span>{{ item.at }}</span><b>{{ item.label }}</b><span>{{ userName(item.userId) }}</span><em>{{ item.action }}</em></div></div></div>

        <div v-if="canAct(detailRecord) && currentUser.roleId !== 'UNIT_CONTACT'" class="action-area">
          <label>{{ currentUser.roleId === 'PHARMACIST' ? '複查建議（可留空）' : '簽核建議（可留空）' }}<textarea v-model="actionSuggestion" :placeholder="currentUser.roleId === 'PHARMACIST' ? '請輸入複查結果與現場確認說明' : '請輸入本次簽核建議'"></textarea></label>
          <div v-if="currentUser.roleId === 'PHARMACIST' && detailRecord.currentStep === 'PHARMACIST_RECHECK'" class="recheck-actions"><button class="btn light danger" @click="recheckFail">複查不通過</button><button class="btn primary" @click="recheckPass">複查通過</button></div>
          <div v-else class="modal-actions"><button class="btn light danger" @click="rejectCurrent">退回</button><button class="btn primary" @click="approveCurrent">核准</button></div>
        </div>
        <div v-else-if="currentUser.roleId === 'UNIT_CONTACT' && canAct(detailRecord)" class="readonly-note">請先針對每一筆改善案件填寫改善說明並上傳照片，再送出改善回覆。</div>
        <div v-else class="readonly-note">目前為查看模式，可以查看完整查核表、改善內容、流程與簽核歷程。</div>
      </div>
    </div>

    <div v-if="batchPreviewOpen" class="modal-mask" @click.self="batchPreviewOpen=false"><div class="modal xlarge"><div class="modal-head"><div><h3>批次預覽</h3><p>每一筆案件各自留下建議；批次核准目前僅預留 UI。</p></div><button class="close" @click="batchPreviewOpen=false">×</button></div><div class="batch-list"><article v-for="record in selectedRecords" :key="record.id" class="batch-item"><div class="batch-title"><b>{{ record.documentNo }}</b><span :class="['result-tag',record.result.toLowerCase()]">{{ record.result }}</span></div><div>{{ record.hospitalName }}｜{{ record.unitName }}</div><button class="link-btn" @click="openRecord(record);batchPreviewOpen=false">查看完整查核單</button><label>本筆簽核建議<textarea v-model="batchSuggestions[record.id]"></textarea></label></article></div><div class="modal-actions"><button class="btn light" @click="batchPreviewOpen=false">關閉</button><button class="btn primary" disabled>批次核准（待後端確認）</button></div></div></div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { mockHospitals } from '../mock/users'
import { mockService } from '../mock/mockService'

const hospitals = mockHospitals
const activeTab = ref('pending')
const filters = reactive({ hospitalId:'', unit:'', result:'', yearMonth:'', documentNo:'' })
const appliedFilters = reactive({ ...filters })
const selectedIds = ref([])
const detailRecord = ref(null)
const actionSuggestion = ref('')
const batchPreviewOpen = ref(false)
const batchSuggestions = reactive({})
const contactDraft = reactive({})
const recordsVersion = ref(0)

const roleNameMap = { PHARMACIST:'藥師', AUDIT_OWNER:'查核業務負責人', PHARMACY_MANAGER:'藥劑部區院主管/部長', UNIT_CONTACT:'受查單位窗口' }
const resolveCurrentUser = () => {
  const account = sessionStorage.getItem('username') || 'AUDIT001'
  const hospitalName = sessionStorage.getItem('userHospital') || '義大醫院'
  const hospital = hospitals.find(h=>h.name===hospitalName) || hospitals[0]
  const profile = mockService.auth.getUser(account)
  if (profile) return profile
  const roleLabel = sessionStorage.getItem('userRole') || '查核業務負責人(區院)'
  let roleId = roleLabel.includes('藥師') && !roleLabel.includes('主管') ? 'PHARMACIST' : roleLabel.includes('窗口') || roleLabel.includes('受核') ? 'UNIT_CONTACT' : roleLabel.includes('查核') ? 'AUDIT_OWNER' : 'PHARMACY_MANAGER'
  let userId = roleId==='AUDIT_OWNER' ? (mockService.workflow.getConfig(hospital.id)?.businessOwnerId || 'U002') : roleId==='PHARMACY_MANAGER' ? (mockService.workflow.getConfig(hospital.id)?.areaManagerId || 'MGR-GROUP') : roleId==='UNIT_CONTACT' ? 'C003B' : 'U001'
  return { id:userId,name:sessionStorage.getItem('userName')||roleLabel,roleId,roleName:roleNameMap[roleId],hospitalId:hospital.id,hospitalName:hospital.name }
}
const currentUser = computed(resolveCurrentUser)
const allRecords = computed(()=>{ recordsVersion.value; return mockService.approval.getAll() })
const visibleForUser = computed(()=>allRecords.value.filter(r=>r.hospitalId===currentUser.value.hospitalId || currentUser.value.roleId==='PHARMACY_MANAGER'))
const canWorkRecord = r => mockService.approval.getContext(r,currentUser.value.id,currentUser.value.roleId).canAct
const pendingRecords = computed(()=>visibleForUser.value.filter(r=>canWorkRecord(r)))
const inProgressRecords = computed(()=>visibleForUser.value.filter(r=>r.status==='IN_PROGRESS' && r.status!=='COMPLETED'))
const completedRecords = computed(()=>visibleForUser.value.filter(r=>r.status==='COMPLETED'))
const signedRecords = computed(()=>visibleForUser.value.filter(r=>r.history.some(h=>h.userId===currentUser.value.id && ['核准','退回','複查通過','改善完成'].includes(h.action))))
const tabs = computed(()=>[
  {key:'pending',label: currentUser.value.roleId==='PHARMACIST' ? '待我複查' : currentUser.value.roleId==='UNIT_CONTACT' ? '待我改善' : currentUser.value.roleId==='AUDIT_OWNER' ? '待查看' : '待我簽核',count: pendingRecords.value.length},
  {key:'progress',label:'流程中',count: inProgressRecords.value.length},
  {key:'completed',label:'已結案',count: completedRecords.value.length},
])
const sourceRecords = computed(()=>activeTab.value==='pending'?pendingRecords.value:activeTab.value==='progress'?inProgressRecords.value:completedRecords.value)
const filteredRecords = computed(()=>sourceRecords.value.filter(r=>!appliedFilters.hospitalId||r.hospitalId===appliedFilters.hospitalId).filter(r=>!appliedFilters.unit||r.unitName.includes(appliedFilters.unit)).filter(r=>!appliedFilters.result||r.result===appliedFilters.result).filter(r=>!appliedFilters.yearMonth||`${r.year}-${String(r.month).padStart(2,'0')}`===appliedFilters.yearMonth).filter(r=>!appliedFilters.documentNo||r.documentNo.toLowerCase().includes(appliedFilters.documentNo.toLowerCase())))
const allSelected = computed(()=>filteredRecords.value.length>0 && filteredRecords.value.every(r=>selectedIds.value.includes(r.id)))
const selectedRecords = computed(()=>filteredRecords.value.filter(r=>selectedIds.value.includes(r.id)))
const canBatchApprove = computed(()=>currentUser.value.roleId==='PHARMACY_MANAGER' && activeTab.value==='pending' && selectedRecords.value.length>0)
const canAct = r => canWorkRecord(r)
const userName = id => mockService.users.get(id)?.name || '-'
const actionLabel = r => canAct(r) ? (currentUser.value.roleId==='UNIT_CONTACT'?'處理改善':currentUser.value.roleId==='PHARMACIST'?'進行複查':'簽核') : '查看'
const resultText = result => result==='fail'?'不符合':result==='pass'?'符合':'-'
const isStepDone = (record,step) => record.history.some(h=>h.step===step && ['核准','複查通過','改善完成'].includes(h.action)) || (record.currentStep==='COMPLETED'&&step==='PHARMACY_MANAGER')
const improvementItems = computed(()=>{
  const source = detailRecord.value?.auditData?.improvementCases
  if (source?.length) return source
  const list=[]
  for(const cat of detailRecord.value?.auditData?.structuredItems||[]) for(const item of cat.items||[]) if(item.result==='fail') list.push({itemId:item.id,itemCode:item.code,itemText:item.text,originalReason:item.reason,originalPhotos:item.images||[],response:'',improvementPhotos:[],status:'PENDING'})
  return list
})
const improvementStatusText = s => ({PENDING:'待改善',SUBMITTED:'待藥師複查',PASS:'複查通過',FAIL:'複查不通過'})[s]||s

const applyFilters=()=>{Object.assign(appliedFilters,filters);selectedIds.value=[]}
const clearFilters=()=>{Object.keys(filters).forEach(k=>filters[k]='');applyFilters()}
const toggleAll=e=>{selectedIds.value=e.target.checked?filteredRecords.value.map(r=>r.id):[]}
const prepareContactDraft=record=>{ if(record.currentStep!=='UNIT_CONTACT') return; for(const item of improvementItems.value){ if(!contactDraft[item.itemId]) contactDraft[item.itemId]={response:item.response||'',photos:[...(item.improvementPhotos||[])]} } }
const openRecord=record=>{detailRecord.value=record;actionSuggestion.value=record.suggestion||'';prepareContactDraft(record)}
watch(detailRecord,record=>{if(record) prepareContactDraft(record)})
const closeDetail=()=>{detailRecord.value=null;actionSuggestion.value=''}
const refresh=()=>recordsVersion.value++
const approveCurrent=()=>{if(!detailRecord.value)return;if(!mockService.approval.approve(detailRecord.value.id,currentUser.value.id,actionSuggestion.value))return alert('目前不是您的簽核關卡，無法核准。');alert('已核准，案件已進入下一個流程。');closeDetail();refresh()}
const rejectCurrent=()=>{if(!detailRecord.value)return;if(!actionSuggestion.value.trim())return alert('退回前請填寫簽核建議。');if(!mockService.approval.reject(detailRecord.value.id,currentUser.value.id,actionSuggestion.value))return alert('目前不是您的簽核關卡，無法退回。');alert('已退回案件。');closeDetail();refresh()}
const recheckPass=()=>{if(!detailRecord.value)return;if(!mockService.approval.recheck(detailRecord.value.id,currentUser.value.id,true,actionSuggestion.value))return alert('目前不是您的複查關卡。');alert('複查通過，案件已進入後續流程。');closeDetail();refresh()}
const recheckFail=()=>{if(!detailRecord.value)return;if(!actionSuggestion.value.trim())return alert('複查不通過時請填寫說明。');if(!mockService.approval.recheck(detailRecord.value.id,currentUser.value.id,false,actionSuggestion.value))return alert('目前不是您的複查關卡。');alert('已記錄複查不通過，案件退回受查單位改善。');closeDetail();refresh()}
const handleUpload=(e,itemId)=>{const files=[...e.target.files];if(!contactDraft[itemId])contactDraft[itemId]={response:'',photos:[]};files.forEach(file=>{const reader=new FileReader();reader.onload=()=>contactDraft[itemId].photos.push(reader.result);reader.readAsDataURL(file)});e.target.value=''}
const saveImprovement=itemId=>{const d=contactDraft[itemId];if(!d)return;mockService.approval.saveImprovement(detailRecord.value.id,currentUser.value.id,itemId,d.response,d.photos,false);refresh();alert('本項改善已暫存。')}
const submitImprovement=itemId=>{const d=contactDraft[itemId];if(!d?.response?.trim())return alert('請先填寫本項改善說明。');if(!d.photos.length)return alert('請至少上傳一張改善照片。');if(!mockService.approval.saveImprovement(detailRecord.value.id,currentUser.value.id,itemId,d.response,d.photos,true))return alert('目前不是您的改善關卡。');alert('本項改善已送出，待藥師複查。');refresh();const fresh=mockService.approval.getAll().find(r=>r.id===detailRecord.value.id);if(fresh){detailRecord.value=fresh;prepareContactDraft(fresh)}}
const openBatchPreview=()=>{if(!selectedRecords.value.length)return alert('請先選擇案件。');selectedRecords.value.forEach(r=>{if(!(r.id in batchSuggestions))batchSuggestions[r.id]=r.suggestion||''});batchPreviewOpen.value=true}
const batchApprove=()=>{alert('批次核准目前僅預留 UI，待後端確認批次簽核規則後再啟用。')}
</script>

<style scoped>
.approval-page{padding:20px;background:#f5f8fb;min-height:100%;color:#29435c}.page-head h2{margin:0 0 8px;color:#102a43}.page-head p{margin:0 0 18px;color:#627d98}.card{background:#fff;border:1px solid #dfe7ef;border-radius:18px;box-shadow:0 2px 5px rgba(16,42,67,.04);margin-bottom:16px}.tabs{display:flex;padding:8px;gap:8px}.tab{border:0;background:transparent;padding:12px 22px;border-radius:12px;color:#486581;cursor:pointer}.tab.active{background:#2b948c;color:#fff}.filter-card{padding:22px}.filter-card h3{margin:0 0 16px;color:#102a43}.filters{display:grid;grid-template-columns:repeat(5,1fr);gap:14px}.filters label,.action-area label{font-size:13px;color:#486581}.filters input,.filters select,.action-area textarea,.contact-editor textarea,.batch-item textarea{display:block;width:100%;box-sizing:border-box;margin-top:6px;border:1px solid #d9e2ec;border-radius:9px;padding:10px 12px;background:#fff;color:#334e68}.filter-actions{display:flex;justify-content:flex-end;gap:10px;margin-top:16px}.btn{border:1px solid #d9e2ec;border-radius:9px;padding:10px 18px;background:#fff;color:#486581;cursor:pointer}.btn.primary{background:#2b948c;border-color:#2b948c;color:#fff}.btn.danger{color:#b42318;border-color:#f0c4c0}.btn:disabled{opacity:.45;cursor:not-allowed}.selection-bar{padding:14px 22px;display:flex;align-items:center;justify-content:space-between;color:#486581}.selection-actions{display:flex;gap:8px}.table-card{overflow:hidden}.table-card table{width:100%;border-collapse:collapse;font-size:13px}.table-card th{background:#f8fafc;color:#486581;font-weight:600;text-align:left}.table-card th,.table-card td{padding:14px 12px;border-bottom:1px solid #edf2f7}.check-col{width:40px;text-align:center!important}.document-no{color:#174a7c;font-weight:600}.result-tag,.step-tag,.improvement-status{display:inline-block;padding:4px 9px;border-radius:999px;font-size:12px;font-weight:600}.result-tag.ok{background:#e7f7ef;color:#16834d}.result-tag.ng{background:#fff0ee;color:#c0392b}.step-tag{background:#fff6db;color:#b7791f}.step-tag.mine{background:#e5f7f3;color:#167a70}.link-btn{border:0;background:transparent;color:#167a9b;cursor:pointer}.empty{padding:40px;text-align:center;color:#829ab1}.modal-mask{position:fixed;inset:0;background:rgba(16,42,67,.45);display:flex;align-items:center;justify-content:center;padding:18px;z-index:50}.modal{width:min(1180px,96vw);max-height:94vh;overflow:auto;background:#fff;border-radius:18px;box-shadow:0 20px 60px rgba(16,42,67,.25)}.modal-head{position:sticky;top:0;z-index:2;background:#fff;display:flex;justify-content:space-between;align-items:flex-start;padding:20px 24px;border-bottom:1px solid #e8eef3}.modal-head h3{margin:0;color:#102a43}.modal-head p{margin:5px 0 0;color:#627d98;font-size:13px}.close{border:0;background:transparent;font-size:28px;color:#829ab1;cursor:pointer}.audit-sheet{margin:22px;border:1px solid #d9e2ec;border-radius:8px;padding:30px 32px;background:#fff}.sheet-title{text-align:center}.sheet-title h2{margin:0;color:#102a43;font-size:28px}.sheet-title p{margin:8px 0;color:#627d98}.sheet-line{border-top:2px solid #334e68;margin:22px 0}.audit-sheet>h3{font-size:20px;color:#102a43;margin:22px 0 12px}.basic-table,.confirm-table{width:100%;border-collapse:collapse}.basic-table th,.basic-table td,.confirm-table th,.confirm-table td{border:1px solid #d9e2ec;padding:11px 12px;text-align:left;vertical-align:top}.basic-table th,.confirm-table th{background:#f7f9fb;color:#102a43;font-weight:700}.basic-table th{width:13%;text-align:center}.sheet-block{margin:22px 0}.sheet-block h4{margin:0;background:#edf5fc;color:#174a7c;padding:11px 14px;border:1px solid #d9e2ec;border-bottom:0;border-radius:8px 8px 0 0}.confirm-table{font-size:13px}.code-col{width:70px}.result-col{width:80px}.pass{color:#16834d;font-weight:700}.fail{color:#c0392b;font-weight:700}.fail-row td{background:#fff8f7}.origin-inline{display:flex;align-items:flex-start;gap:10px;flex-wrap:wrap;margin-top:10px}.origin-inline span{width:100%;color:#627d98;font-size:12px}.origin-inline img{width:150px;height:105px;object-fit:cover;border-radius:8px;border:1px solid #d9e2ec}.car-preview{border:1px solid #d9e2ec;border-radius:8px;padding:12px;margin-top:10px}.car-head{display:flex;justify-content:space-between;margin-bottom:10px}.car-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.car-item{border:1px solid #e5e7eb;border-radius:8px;padding:7px;font-size:11px}.car-item img{width:100%;height:72px;object-fit:cover;border-radius:5px}.car-item b,.car-item span,.car-item small{display:block;margin-top:4px}.car-item span,.car-item small{color:#829ab1}.improvement-section{margin-top:30px;border-top:2px solid #e85b5b;padding-top:10px}.improvement-title{color:#c0392b!important}.improvement-card{border:1px solid #f0b7b2;border-radius:10px;padding:16px;margin:12px 0;background:#fffafa}.improvement-card-head{display:flex;justify-content:space-between;gap:10px;align-items:center;color:#174a7c}.improvement-status.pending{background:#fff4dc;color:#b7791f}.improvement-status.submitted{background:#e9f2ff;color:#1769aa}.improvement-status.pass{background:#e7f7ef;color:#16834d}.improvement-status.fail{background:#fff0ee;color:#c0392b}.reason{margin:12px 0;color:#486581}.compare-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:14px}.compare-col{border:1px solid #d9e2ec;border-radius:9px;padding:12px;background:#fff}.compare-col.after{border-color:#b7ddd3}.compare-col h5{margin:0 0 10px;color:#486581}.photo-list{display:flex;gap:10px;flex-wrap:wrap}.photo-list img{width:225px;height:160px;object-fit:cover;border-radius:8px;border:1px solid #d9e2ec}.no-photo{color:#829ab1;padding:45px 10px}.response-box,.recheck-box{margin-top:12px;padding:12px 14px;background:#f5f8fb;border-radius:8px;color:#486581}.contact-editor{margin-top:14px;padding:16px;border:1px dashed #2b948c;border-radius:9px;background:#f7fffd}.contact-editor h5{margin:0 0 10px;color:#167a70}.upload-row{display:flex;align-items:center;gap:10px;margin-top:10px;color:#829ab1;font-size:12px}.upload-btn{display:inline-block;background:#fff;border:1px solid #b7d8d3;color:#167a70;padding:8px 12px;border-radius:8px;cursor:pointer}.upload-btn input{display:none}.draft-photos{display:flex;gap:8px;margin-top:10px;flex-wrap:wrap}.draft-photos img{width:120px;height:86px;object-fit:cover;border-radius:7px}.contact-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:12px}.improvement-notice{padding:14px;background:#edf5ff;border-left:4px solid #2f6fed;border-radius:7px;color:#174a7c;margin-top:14px}.detail-section{padding:0 24px 20px}.detail-section h4{color:#102a43}.flow{display:flex;align-items:center;gap:10px}.flow-node{flex:1 1 0;min-width:0;text-align:center;color:#829ab1}.flow-node span{display:inline-flex;width:30px;height:30px;border-radius:50%;align-items:center;justify-content:center;background:#eef2f7;margin-bottom:6px}.flow-node b{display:block;font-size:12px}.flow-node.done span{background:#dff6ea;color:#16834d}.flow-node.current span{background:#2b948c;color:#fff}.flow-node.current b{color:#167a70}.flow-arrow{color:#9fb3c8}.history{border:1px solid #d9e2ec;border-radius:9px;overflow:hidden}.history-row{display:grid;grid-template-columns:150px 180px 1fr 100px;gap:10px;padding:11px 12px;border-bottom:1px solid #edf2f7;font-size:12px}.history-row:last-child{border-bottom:0}.history-row em{color:#16834d;font-style:normal}.action-area{padding:0 24px 24px}.recheck-actions,.modal-actions{display:flex;justify-content:flex-end;gap:10px;margin-top:12px}.readonly-note{margin:0 24px 24px;padding:13px;background:#f5f8fb;color:#627d98;border-radius:8px}.batch-list{padding:20px}.batch-item{border:1px solid #d9e2ec;border-radius:10px;padding:14px;margin-bottom:12px}.batch-title{display:flex;justify-content:space-between;margin-bottom:7px}.batch-item label{display:block;margin-top:12px;color:#486581;font-size:13px}@media(max-width:900px){.filters{grid-template-columns:1fr 1fr}.car-grid{grid-template-columns:repeat(2,1fr)}.compare-grid{grid-template-columns:1fr}.photo-list img{width:180px;height:125px}.history-row{grid-template-columns:1fr}.flow{overflow:auto}.flow-node{min-width:95px}.audit-sheet{padding:18px;margin:12px}.basic-table,.confirm-table{font-size:12px}}
</style>
