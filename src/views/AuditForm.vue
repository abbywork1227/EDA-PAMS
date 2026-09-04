<template>
  <div class="audit-form-container">
    <div class="form-header card">
      <div class="header-main">
        <button class="back-btn" @click="router.push('/initial-audit')">
          ⬅ 返回大廳
        </button>
        <h2>
          {{ pageInfo.year }}年 {{ pageInfo.month }}月份 — 常備藥品查核作業
        </h2>
        <!-- <span
          class="mode-badge"
          :class="isPreviewMode ? 'mode-preview' : 'mode-edit'"
        >
          {{ isPreviewMode ? '📄 單據預覽模式 (唯讀)' : '✍️ 現場填報模式' }}
        </span> -->
      </div>
      <div class="header-meta-grid">
        <div><strong>受查單位：</strong>{{ pageInfo.unitName }}</div>
        <div><strong>查核藥師：</strong>黃嘉偉 (4D231)</div>
        <!-- <div>
          <strong>狀態：</strong
          >{{ isPreviewMode ? '預覽中 (待雙人簽章)' : '現場盤點中' }}
        </div> -->
      </div>
    </div>

    <div v-if="hasControlledDrugs" class="audit-section card">
      <div class="section-title-bar">
        <span class="main-category-tag ctrl-tag"
          >🔴 查核單位管制藥品效期盤點</span
        >
        <button
          v-if="!isPreviewMode"
          class="btn-xs btn-outline-blue"
          @click="setAllDrugDates"
        >
          💡 更新藥庫效期
        </button>
      </div>
      <table class="form-table">
      <thead>
      <tr>
        <th width="30%">管制藥品名稱 (規格)</th>
        <th width="12%">管制級別</th>
        <th width="12%">標準量</th>
        <th width="12%">空瓶數</th>
        <th width="34%">有效期限核對 (推薦最近藥庫 5 個效期)</th>
      </tr>
    </thead>
        <tbody>
          <tr v-for="drug in controlledDrugList" :key="drug.id">
            <td class="font-bold">{{ drug.name }}</td>
            <td>
              <span class="level-badge">{{ drug.level }}</span>
            </td>
            <td class="font-bold text-blue">{{ drug.baseQty }}</td>

            <td class="text-center">
            <input
              v-model="drug.emptyBottleQty"
              type="number"
              min="0"
              class="empty-input"
            />
          </td>

            <td>
              <div class="date-select-group">
                <select
                  v-model="drug.selectedDateType"
                  class="table-input"
                  :disabled="isPreviewMode"
                >
                  <option v-for="d in stockDates" :key="d" :value="d">
                    {{ d }} (藥庫推薦)
                  </option>
                  <option value="custom">📅 自訂其他日期...</option>
                </select>
                <input
                  v-if="drug.selectedDateType === 'custom'"
                  type="date"
                  v-model="drug.customDate"
                  class="table-input inline-date"
                  :disabled="isPreviewMode"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="audit-section card">
      <div class="section-title-bar-main">
        <h3>📋 查核項目 (七大項)</h3>
        <button
          v-if="!isPreviewMode"
          class="btn-sm btn-success"
          @click="quickSelectAllPass"
        >
          ⚡ 一鍵全符合
        </button>
      </div>

      <div
        v-for="cat in structuredItems"
        :key="cat.categoryName"
        class="category-block"
      >
        <div class="category-block-header" :class="cat.tagClass">
          <h4>{{ cat.categoryName }}</h4>
        </div>

        <div class="category-block-body">
          <div
            v-for="item in cat.items"
            :key="item.id"
            class="item-row-wrapper"
          >
            <div
              class="item-main-row"
              :class="{ 'row-fail-bg': item.result === 'fail' }"
            >
              <div class="item-code-text">
                <span class="item-code-badge">{{ item.code }}</span>
                <span class="item-text-content">
                  {{ item.text }}
                  <span v-for="field in (item.inputFields || [])" :key="field.key" class="inline-count-zone">
                    {{ field.label }}：
                    <input v-if="field.type === 'NUMBER'" type="number" v-model="item.fieldValues[field.key]" class="inline-num-input" :disabled="isPreviewMode" />
                    <input v-else-if="field.type === 'DATE'" type="date" v-model="item.fieldValues[field.key]" class="inline-num-input" :disabled="isPreviewMode" />
                    <input v-else type="text" v-model="item.fieldValues[field.key]" class="inline-num-input" :disabled="isPreviewMode" />
                    {{ field.unit }}
                  </span>
                </span>
              </div>

              <div class="item-action-zone">
                <div
                  class="radio-group-three"
                  :class="{ disabled: isPreviewMode }"
                >
                  <label class="lbl-pass"
                    ><input
                      type="radio"
                      value="pass"
                      v-model="item.result"
                      :disabled="isPreviewMode"
                    />
                    符合</label
                  >
                  <label class="lbl-fail"
                    ><input
                      type="radio"
                      value="fail"
                      v-model="item.result"
                      :disabled="isPreviewMode"
                    />
                    不符</label
                  >
                  <label class="lbl-na"
                    ><input
                      type="radio"
                      value="na"
                      v-model="item.result"
                      :disabled="isPreviewMode"
                    />
                    不適用</label
                  >
                </div>
              </div>
            </div>

            <div v-if="item.result === 'fail'" class="inline-fail-panel">
              <div class="fail-header-label">
                ⚠️ 請填寫該項不符合之改善建議事項與拍照存證：
              </div>

              <div class="textarea-part">
                <!-- 常用原因 -->

                <select
                  class="reason-select"
                  v-model="item.reasonType"
                  :disabled="isPreviewMode"
                  @change="onReasonChange(item)"
                >
                  <option value="">請選擇不符合原因</option>

                  <option
                    v-for="reason in reasonOptions"
                    :key="reason"
                    :value="reason"
                  >
                    {{ reason }}
                  </option>
                </select>

                <!-- 自訂 -->

                <textarea
                  v-if="item.reasonType === '其他（自行輸入）'"
                  v-model="item.reason"
                  class="fail-textarea"
                  rows="2"
                  placeholder="請輸入其他不符合原因..."
                  :disabled="isPreviewMode"
                />
              </div>

              <div class="photo-management-zone">
                <div class="photo-grid">
                  <div
                    v-for="(img, imgIdx) in item.images"
                    :key="imgIdx"
                    class="uploaded-photo-item"
                  >
                    <img :src="img" class="fail-large-img" alt="現場異常照片" />
                    <button
                      v-if="!isPreviewMode"
                      class="btn-delete-photo-overlay"
                      @click="item.images.splice(imgIdx, 1)"
                    >
                      ✕
                    </button>
                  </div>

                  <button
                    v-if="
                      !isPreviewMode && (!item.images || item.images.length < 4)
                    "
                    class="btn-add-photo-square"
                    @click="simulateMultiUpload(item)"
                  >
                    <span class="plus-icon">＋</span>
                    <span class="plus-text">新增照片</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- =========================
     🚑 急救車盤點
========================= -->

    <div class="audit-section card">
      <h3>🚑 急救車效期盤點</h3>

      <!-- Tabs -->

      <div class="tabs">
        <button
          v-for="(car, index) in ambulances"
          :key="car.id"
          @click="activeCarIndex = index"
          :class="{ active: activeCarIndex === index }"
        >
          {{ car.customName }}
        </button>
      </div>

      <!-- 目前車輛 -->

      <div class="active-car-content" v-if="ambulances[activeCarIndex]">
        <h2 class="car-title">
          {{ ambulances[activeCarIndex].customName }}
        </h2>
        <div class="car-meta-inputs">
          <label>實際車號：<input v-model="ambulances[activeCarIndex].carNo" :disabled="isPreviewMode" placeholder="請輸入現場車號" /></label>
          <label>封條編號：<input v-model="ambulances[activeCarIndex].sealNo" :disabled="isPreviewMode" placeholder="請輸入封條編號" /></label>
        </div>

        <!-- <div class="ambulance-layout">
          <div class="top-label">內</div>

          <div class="middle-layout">
            <div class="side-label">左</div>

            <div class="drug-grid">
              <div
                class="drug-card"
                v-for="item in ambulances[activeCarIndex].items"
                :key="item.id"
              >
                <div class="drug-photo-wrap">
                  <img class="drug-photo" :src="item.img" />
                </div>

                <div class="drug-name">
                  {{ item.name }}
                </div>

                <div class="drug-row">
                  <span>數量：</span>
                  <strong>{{ item.qty }}</strong>
                </div>

                <div class="expire-title">最新有效日期</div>

                <select
                  class="expire-select"
                  v-model="item.expire"
                  :disabled="isPreviewMode"
                >
                  <option v-for="d in stockDates" :key="d" :value="d">
                    {{ d }}
                  </option>

                  <option value="custom">📅 自訂日期...</option>
                </select>
              </div>
            </div>

            <div class="side-label">右</div>
          </div>

          <div class="bottom-label">外</div>
        </div> -->
        <div
          v-if="ambulances[activeCarIndex].layout === '4x3'"
          class="ambulance-layout"
        >
          <div class="top-label">內</div>

          <div class="middle-layout">
            <div class="side-label">左</div>

            <div class="drug-grid">
              <div
                class="drug-card"
                v-for="item in ambulances[activeCarIndex].items"
                :key="item.id"
              >
                <div class="drug-photo-wrap">
                  <img class="drug-photo" :src="item.img" />
                </div>

                <div class="drug-name">
                  {{ item.name }}
                </div>

                <div class="drug-row">
                  <span>數量：</span>
                  <strong>{{ item.qty }}</strong>
                </div>

                <div class="expire-title">最新有效日期</div>

                <select
                  class="expire-select"
                  v-model="item.expire"
                  :disabled="isPreviewMode"
                >
                  <option v-for="d in stockDates" :key="d" :value="d">
                    {{ d }} (藥庫推薦)
                  </option>
                  <option value="custom">📅 自訂日期...</option>
                </select>
                <input
                  v-if="item.expire === 'custom'"
                  v-model="item.customExpire"
                  type="date"
                  class="expire-custom-input"
                  :disabled="isPreviewMode"
                />

              </div>
            </div>

            <div class="side-label">右</div>
          </div>

          <div class="bottom-label">外</div>
        </div>

        <!-- =========================
     👶 小兒外接箱
========================= -->
        <!-- =========================
     🎒 急救包藥盒
========================= -->
      </div>
    </div>

    <div class="bottom-action-bar card">
      <div v-if="!isPreviewMode" class="action-row-left-right">
        <button class="btn btn-secondary" @click="handleSaveDraft">
          💾 暫存單據變更
        </button>
        <button class="btn btn-success" @click="handleEnterPreview">
          👁️ 進行查核預覽
        </button>
      </div>

      <div v-else class="preview-mode-actions">
        <div class="preview-alert">
          💡
          單據預覽狀態已唯讀。確認內容無誤後即可送出；本查核表不需窗口簽章或藥師複核。
        </div>
        <div class="signature-status">
          <span>初查藥師：<strong class="text-green">黃嘉偉（填表人）</strong></span>
          <span class="text-muted">本查核表不需窗口簽章，也不需藥師複核。</span>
        </div>
        <div class="action-buttons-group">
          <button class="btn btn-secondary" @click="isPreviewMode = false">
            ✏️ 返回現場修改
          </button>
          <button class="btn btn-primary" @click="handleSubmitFinal">
            🚀 確認送出
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { auditStore } from '../store'
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { mockService } from '../mock/mockService'
import { mockAuditItemCategories } from '../mock/auditItems'
import { mockAmbulanceConfigurations } from '../mock/ambulance'
import { mockReasonOptions } from '../mock/auditForm'

const route = useRoute()
const router = useRouter()
const isPreviewMode = ref(false)
const activeDrawerSection = ref('top')
const activeCarIndex = ref(0)
const regCountInput = ref(24)

const pageInfo = ref({
  year: Number(route.query.year || 2026),
  month: Number(route.query.month || 6),
  unitId: String(route.query.unitId || '3A'),
  unitName: String(route.query.unitName || '3A 護理站'),
})

const assignment = computed(() => mockService.audits.getByUnitMonth(pageInfo.value.unitId, pageInfo.value.year, pageInfo.value.month))
const unit = computed(() => mockService.units.get(pageInfo.value.unitId))
const currentProfile = computed(() => mockService.auth.getUser(sessionStorage.getItem('username') || '4D231'))

const onReasonChange = (item) => {
  item.reason = item.reasonType === '其他（自行輸入）' ? '' : item.reasonType
}

const reasonOptions = ref([...mockReasonOptions])

// 依本次 AuditAssignment 的類別＋系統設定的題目即時建立七大項，不再使用舊的固定題目 Mock。
const structuredItems = ref([])
const buildStructuredItems = () => {
  const categoryIds = assignment.value?.auditCategoryIds || []
  structuredItems.value = categoryIds.map(categoryId => {
    const category = mockAuditItemCategories.find(item => item.id === categoryId)
    if (!category) return null
    const configuredItems = mockService.settings.getAuditItems(categoryId)
    return {
      categoryId,
      categoryName: `${category.code}. ${category.name}`,
      tagClass: category.tagClass,
      items: configuredItems.map(item => ({
        ...item,
        result: 'pass',
        reasonType: '',
        reason: '',
        images: [],
        fieldValues: Object.fromEntries((item.inputFields || []).map(field => [field.key, ''])),
      })),
    }
  }).filter(Boolean)
}
buildStructuredItems()

const hasControlledDrugs = computed(() => mockService.units.getControlledDrugs(pageInfo.value.unitId).length > 0)

// 管制藥品由醫院藥品 API Mock 提供；每項藥品的效期推薦取藥庫最近 5 筆。
const controlledDrugList = ref(mockService.units.getControlledDrugs(pageInfo.value.unitId).map(drug => {
  const expiryDates = [...(drug.expiryDates || [])].sort()
  return {
    id: drug.id,
    name: drug.drugName,
    level: drug.controlledLevel ? `${drug.controlledLevel}級` : '-',
    baseQty: `${drug.stockQty} 支`,
    emptyBottleQty: 0,
    expiryDates: expiryDates.slice(0, 5),
    selectedDateType: expiryDates[0] || 'custom',
    customDate: '',
  }
}))

const stockDates = computed(() => [...new Set(controlledDrugList.value.flatMap(d => d.expiryDates || []))].sort().slice(0, 5))

// 急救車類型／數量由醫院 API 提供，實體第幾台於本次查核展開，車號由現場輸入。
const ambulances = ref([])
const buildAmbulances = () => {
  const rows = mockService.units.getHospitalAmbulances(pageInfo.value.unitId)
  const result = []
  rows.forEach(row => {
    const config = mockAmbulanceConfigurations.find(item => item.id === row.ambulanceTypeId)
    if (!config) return
    for (let i = 1; i <= Number(row.quantity || 0); i++) {
      result.push({
        id: `${row.ambulanceTypeId}-${i}`,
        typeId: row.ambulanceTypeId,
        customName: `${config.name}第${i}台`,
        carNo: '',
        sealNo: '',
        layout: '4x3',
        items: config.items.map(item => ({
          id: item.id,
          position: item.position,
          name: item.name,
          qty: `${item.requiredQty} 支`,
          img: item.image,
          expire: stockDates.value[0] || '',
          result: '',
          customExpire: '',
        })),
      })
    }
  })
  ambulances.value = result
}
buildAmbulances()

const quickSelectAllPass = () => {
  structuredItems.value.forEach(cat => cat.items.forEach(item => item.result = 'pass'))
}

const setAllDrugDates = () => {
  controlledDrugList.value.forEach(d => {
    d.selectedDateType = d.expiryDates?.[0] || 'custom'
  })
}

const simulateMultiUpload = (item) => {
  if (!item.images) item.images = []
  const mockPhotos = [
    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1584308914594-1fddafe3a8f9?auto=format&fit=crop&w=400&q=80',
  ]
  item.images.push(mockPhotos[item.images.length % mockPhotos.length])
}

const getSectionFullName = sec => ({
  top: '車頂外部點檢 — 生理監視器與外觀清潔',
  A: '第一層抽屜 (A) — 急救核心藥品盒',
  B: '第二層抽屜 (B) — 高警訊與 LASA 藥品防錯區',
  C: '第三層抽屜 (C) — 大容量點滴液與電解質',
  D: '側邊掛架 (D) — 全院最新小兒劑量換算表盤',
}[sec] || sec)

const handleSaveDraft = () => {
  const key = `${pageInfo.value.unitId}-${pageInfo.value.year}-${pageInfo.value.month}`
  auditStore.setAuditStatus(key, 'processing')
  alert('💾 暫存成功！')
  router.push('/initial-audit')
}

const handleEnterPreview = () => {
  auditStore.pageInfo = {
    ...pageInfo.value,
    hospitalId: assignment.value?.hospitalId || unit.value?.hospitalId,
    pharmacistId: assignment.value?.pharmacistId || currentProfile.value?.id,
    pharmacistName: assignment.value?.pharmacistName || currentProfile.value?.name || '',
    defaultContactUserId: mockService.units.getConfig(pageInfo.value.unitId)?.contactUserId || '',
  }
  auditStore.structuredItems = structuredItems.value
  auditStore.controlledDrugList = controlledDrugList.value
  auditStore.ambulances = ambulances.value
  router.push('/audit-record-confirm')
}

const handleSubmitFinal = () => {
  const key = `${pageInfo.value.unitId}-${pageInfo.value.year}-${pageInfo.value.month}`
  auditStore.setAuditStatus(key, 'completed')
  alert('🚀 送出成功！')
  router.push('/initial-audit')
}
</script>

<style scoped>
.audit-form-container {
  padding: 24px;
  background-color: #f1f5f9;
  font-family: 'PingFang TC', sans-serif;
  color: #334155;
}
.card {
  background: #fff;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 22px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
}

.header-main {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}
.back-btn {
  background: #475569;
  color: #fff;
  border: none;
  padding: 6px 14px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}
.mode-badge {
  padding: 4px 14px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 0.85rem;
}
.mode-edit {
  background: #fef3c7;
  color: #d97706;
}
.mode-preview {
  background: #edf2f7;
  color: #2b6cb0;
  border: 2px solid #3182ce;
}
.header-meta-grid {
  display: flex;
  gap: 40px;
  background: #f8fafc;
  padding: 12px;
  border-radius: 6px;
  font-size: 0.9rem;
  border-left: 4px solid #475569;
}

.section-title-bar-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #cbd5e1;
}
.section-title-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 8px;
}

/* 💡 卡片式分類結構，絕不跑版 */
.category-block {
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  margin-bottom: 20px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
}
.category-block-header {
  padding: 10px 16px;
  font-weight: bold;
  font-size: 1rem;
  color: #fff;
}
.block-ctrl {
  background: #b91c1c;
}
.block-regular {
  background: #16a34a;
}
.block-alert {
  background: #d97706;
}
.block-ambulance {
  background: #0369a1;
}
.category-block-header h4 {
  margin: 0;
  letter-spacing: 0.5px;
}

/* 條文排版 */
.item-row-wrapper {
  border-bottom: 1px solid #e2e8f0;
}
.item-row-wrapper:last-child {
  border-bottom: none;
}
.item-main-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  transition: background 0.2s;
}
.item-code-text {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex: 1;
  padding-right: 20px;
}
.item-code-badge {
  background: #e2e8f0;
  color: #475569;
  font-weight: bold;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.85rem;
  min-width: 24px;
  text-align: center;
}
.item-text-content {
  font-size: 0.95rem;
  line-height: 1.5;
  font-weight: 500;
}

.row-fail-bg {
  background-color: #fff7ed !important;
}

/* 💡 核心變更：不符合直接在下方展開（獨立塊結構） */
.inline-fail-panel {
  background: #fff7ed;
  padding: 14px 16px;
  border-top: 1px dashed #f97316;
  border-bottom: 1px solid #f97316;
}
.fail-header-label {
  font-weight: bold;
  color: #ea580c;
  font-size: 0.85rem;
  margin-bottom: 8px;
}
.fail-flex-layout {
  display: flex;
  gap: 16px;
}
.textarea-part {
  flex: 1;
}
.upload-part {
  width: 140px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}
.fail-textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.9rem;
  resize: none;
  background: #fff;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);
}
.btn-upload {
  background: #fff;
  border: 1px dashed #ea580c;
  color: #ea580c;
  width: 100%;
  padding: 6px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

/* 照片嵌入即時預覽 */
.inline-photo-preview {
  margin-top: 4px;
  position: relative;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  overflow: hidden;
  width: 100px;
  height: 65px;
}
.inline-thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.btn-delete-photo {
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  border: none;
  font-size: 0.7rem;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  position: absolute;
  top: 2px;
  right: 2px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 管制藥表格 */
.form-table {
  width: 100%;
  border-collapse: collapse;
}
.form-table th {
  background: #f8fafc;
  padding: 12px;
  border-bottom: 2px solid #cbd5e1;
  text-align: left;
  font-weight: bold;
}
.form-table td {
  padding: 12px;
  border-bottom: 1px solid #edf2f7;
  vertical-align: middle;
}

/* 三態按鈕 */
.radio-group-three {
  display: flex;
  gap: 8px;
}
.radio-group-three label {
  padding: 6px 12px;
  border-radius: 4px;
  border: 1px solid #cbd5e1;
  cursor: pointer;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.85rem;
  background: #fff;
}
.lbl-pass {
  color: #16a34a;
}
.lbl-pass input:checked + * {
  background: #16a34a;
  color: #fff;
}
.lbl-fail {
  color: #dc2626;
}
.lbl-na {
  color: #64748b;
}
.radio-group-three.disabled {
  pointer-events: none;
  opacity: 0.6;
}

.level-badge {
  background: #fee2e2;
  color: #991b1b;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
}
.text-blue {
  color: #2563eb;
}
.date-select-group {
  display: flex;
  gap: 6px;
}
.table-input {
  padding: 6px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
}
.inline-num-input {
  width: 50px;
  padding: 4px;
  text-align: center;
}

/* ===============================
   🚑 急救車盤點
==================================*/

.tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 20px 0 25px;
}

.tabs button {
  padding: 10px 22px;

  background: #ffffff;

  border: 1px solid #cbd5e1;

  border-radius: 8px;

  cursor: pointer;

  font-size: 14px;

  font-weight: 600;

  transition: 0.25s;
}

.tabs button:hover {
  background: #eff6ff;

  border-color: #60a5fa;
}

.tabs button.active {
  background: #2563eb;

  color: #fff;

  border-color: #2563eb;
}

/* ============================= */

.ambulance-layout {
  display: flex;

  flex-direction: column;

  align-items: center;
}

.top-label {
  font-size: 30px;

  font-weight: bold;

  margin-bottom: 15px;
}

.bottom-label {
  font-size: 30px;

  font-weight: bold;

  margin-top: 15px;
}

.middle-layout {
  display: flex;

  align-items: center;

  width: 100%;
}

.side-label {
  width: 50px;

  font-size: 30px;

  font-weight: bold;

  writing-mode: vertical-rl;

  text-align: center;
}

.drug-grid {
  flex: 1;

  display: grid;

  grid-template-columns: repeat(4, 1fr);

  gap: 22px;
}

.drug-card {
  background: white;

  border: 1px solid #d4dce7;

  border-radius: 8px;

  padding: 14px;
  min-height: 330px;
}

.drug-photo {
  width: 100%;

  height: 180px;

  object-fit: cover;
}

.drug-name {
  margin-top: 8px;

  font-weight: bold;

  font-size: 16px;

  min-height: 48px;
}

.drug-row {
  display: flex;

  justify-content: flex-end;

  margin-top: 5px;
}

.expire-title {
  margin-top: 8px;

  font-size: 14px;

  font-weight: bold;
}

.expire-select {
  width: 100%;

  height: 34px;

  margin-top: 5px;

  border: 1px solid #cbd5e1;

  border-radius: 4px;
}

/* 底部 */
.action-row-left-right {
  display: flex;
  justify-content: space-between;
}
.preview-alert {
  background: #eff6ff;
  color: #1d4ed8;
  padding: 10px;
  border-radius: 6px;
  font-weight: bold;
  margin-bottom: 12px;
}
.signature-status {
  display: flex;
  gap: 40px;
  margin-bottom: 14px;
  font-size: 0.9rem;
  background: #f8fafc;
  padding: 8px 12px;
  border-radius: 4px;
}
.action-buttons-group {
  display: flex;
  gap: 12px;
}

.btn {
  border: none;
  padding: 10px 22px;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
}
.btn-sm {
  border: none;
  padding: 6px 14px;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  font-size: 0.85rem;
}
.btn-xs {
  border: none;
  padding: 4px 10px;
  border-radius: 4px;
  font-weight: bold;
  font-size: 0.75rem;
  cursor: pointer;
}
.btn-secondary {
  background: #64748b;
  color: #fff;
}
.btn-success {
  background: #059669;
  color: #fff;
}
.btn-purple {
  background: #7c3aed;
  color: #fff;
}
.btn-primary {
  background: #2563eb;
  color: #fff;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
}
.modal-card {
  background: #fff;
  width: 440px;
  border-radius: 8px;
  overflow: hidden;
}
.modal-header {
  background: #7c3aed;
  color: #fff;
  padding: 14px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.modal-body {
  padding: 20px;
}
.modal-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
}
.modal-footer {
  background: #f8fafc;
  padding: 12px 20px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-top: 1px solid #e2e8f0;
}
.text-green {
  color: #16a34a;
}
.text-red {
  color: #dc2626;
}
.mt-1 {
  margin-top: 4px;
}

/* 不符合展開區塊主體 */
.inline-fail-panel {
  background: #fff7ed;
  padding: 16px;
  border-top: 1px dashed #f97316;
  border-bottom: 1px solid #f97316;
}

.fail-header-label {
  font-weight: bold;
  color: #ea580c;
  font-size: 0.9rem;
  margin-bottom: 8px;
}

/* 輸入框全寬優化 */
.fail-textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.95rem;
  resize: none;
  background: #fff;
  box-sizing: border-box;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);
}

/* 照片管理區（移至輸入框下方，間距加大） */
.photo-management-zone {
  margin-top: 14px;
}

/* 使用 Grid 讓照片與加號按鈕完美橫向排隊 */
.photo-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

/* 放大後的照片外框（120x120 正方形） */
.uploaded-photo-item {
  position: relative;
  width: 120px;
  height: 120px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.fail-large-img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 確保照片滿版不變形 */
}

/* 懸浮在照片右上角的刪除按鈕 */
.btn-delete-photo-overlay {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(220, 38, 38, 0.85);
  color: #fff;
  border: none;
  font-size: 0.75rem;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  transition: background 0.2s;
}
.btn-delete-photo-overlay:hover {
  background: rgba(220, 38, 38, 1);
}

/* 💡 客戶最想看到的：空白正方形中間一個 + 號按鈕 */
.btn-add-photo-square {
  width: 120px;
  height: 120px;
  background: #fff;
  border: 2px dashed #cbd5e1;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #64748b;
  transition: all 0.2s;
}

.btn-add-photo-square:hover {
  border-color: #ea580c;
  color: #ea580c;
  background: #fff8f2;
}

.plus-icon {
  font-size: 2rem;
  font-weight: 300;
  line-height: 1;
  margin-bottom: 2px;
}

.plus-text {
  font-size: 0.75rem;
  font-weight: bold;
}

.reason-select {
  width: 100%;

  height: 42px;

  border: 1px solid #d7dce5;

  border-radius: 8px;

  padding: 0 12px;

  background: white;

  margin-bottom: 10px;
}

.reason-select:focus {
  outline: none;

  border-color: #2c8c82;
}

.fail-textarea {
  width: 100%;
}

.empty-input {
  width: 72px;
  height: 38px;
  padding: 0 10px;

  border: 1px solid #CBD5E1;
  border-radius: 10px;

  background: #fff;

  text-align: center;
  font-size: 14px;
  color: #1E293B;

  transition: all .2s;
}

.empty-input:focus {
  outline: none;
  border-color: #2C8C82;
  box-shadow: 0 0 0 3px rgba(44,140,130,.12);
}


/* 急救車自訂效期 */
.expire-custom-input { width: 100%; height: 36px; margin-top: 6px; border: 1px solid #cbd5e1; border-radius: 5px; padding: 0 8px; box-sizing: border-box; }

</style>
