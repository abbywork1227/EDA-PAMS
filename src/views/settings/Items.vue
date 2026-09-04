<template>
  <section class="settings-page">
    <div class="page-title-row">
      <div>
        <div class="breadcrumb">系統設定 / 查核項目、頻率管理</div>
        <h1>查核項目、頻率管理</h1>
        <p>以查核大類設定查核月份，並管理各查核項目的輸入型態。</p>
      </div>
    </div>

    <div class="category-tabs">
      <button
        v-for="category in categories"
        :key="category.id"
        class="category-tab"
        :class="{ active: selectedCategoryId === category.id }"
        @click="selectCategory(category.id)"
      >
        <span class="category-code">{{ category.code }}</span>{{ category.name }}
      </button>
    </div>

    <div class="frequency-card">
      <div class="section-heading">
        <div>
          <h2>查核頻率設定</h2>
          <p>{{ selectedCategory.code }} {{ selectedCategory.name }}：可複選應查核月份</p>
        </div>
        <div class="frequency-tools"><div class="frequency-summary">目前：{{ selectedFrequency.name }}</div><button class="secondary-button" @click="saveFrequency">儲存頻率</button></div>
      </div>

      <div class="month-grid">
        <button
          v-for="month in 12"
          :key="month"
          class="month-button"
          :class="{ selected: selectedFrequency.months.includes(month) }"
          @click="toggleMonth(month)"
        >
          {{ month }}
        </button>
      </div>

      <div class="frequency-hint">
        目前已選：{{ selectedFrequency.months.length ? selectedFrequency.months.join('、') + ' 月' : '尚未設定' }}
      </div>
    </div>

    <div class="items-card">
      <div class="section-heading item-heading">
        <div>
          <h2>查核項目</h2>
          <p>目前共 {{ filteredItems.length }} 項</p>
        </div>
        <button class="primary-button" @click="openAddItem">＋ 新增項目</button>
      </div>

      <div v-if="filteredItems.length" class="item-list">
        <div v-for="item in filteredItems" :key="item.id" class="item-row">
          <div class="item-code">{{ item.code }}</div>

          <div class="item-main">
            <div class="item-text">{{ item.text }}</div>

            <div class="item-meta">
              <span>{{ resultTypeLabel(item.resultType) }}</span>
              <span v-if="item.inputFields?.length">輸入 {{ item.inputFields.length }} 欄</span>
              <span v-else>無額外輸入</span>
            </div>
          </div>

          <div class="item-input-preview">
            <template v-if="item.inputFields?.length">
              <div v-for="field in item.inputFields" :key="field.key" class="preview-field">
                <span>{{ field.label }}</span>
                <span class="type-badge">{{ fieldTypeLabel(field.type) }}</span>
                <span v-if="field.unit" class="unit-text">{{ field.unit }}</span>
              </div>
            </template>
            <span v-else class="empty-input">—</span>
          </div>

          <div class="item-actions">
            <button class="secondary-button" @click="openEditItem(item)">編輯</button>
            <button class="danger-button" @click="removeItem(item)">刪除</button>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">目前沒有查核項目。</div>
    </div>

    <div v-if="showItemEditor" class="modal-mask" @click.self="closeEditor">
      <div class="modal-card">
        <div class="modal-header">
          <div>
            <h2>{{ editorMode === 'add' ? '新增查核項目' : '編輯查核項目' }}</h2>
            <p>查核項目的輸入欄位會影響 AuditForm 的實際呈現。</p>
          </div>
          <button class="close-button" @click="closeEditor">×</button>
        </div>

        <div class="form-grid">
          <label>
            項次編號
            <input v-model="editor.code" placeholder="例如 B-9" />
          </label>
          <label>
            查核結果型態
            <select v-model="editor.resultType">
              <option value="PASS_FAIL_NA">符合／不符合／不適用</option>
              <option value="PASS_FAIL">符合／不符合</option>
            </select>
          </label>
        </div>

        <label class="full-field">
          查核項目內容
          <textarea v-model="editor.text" rows="3" placeholder="請輸入查核項目內容"></textarea>
        </label>

        <div class="input-setting-box">
          <div class="input-setting-header">
            <div>
              <h3>輸入欄位設定</h3>
              <p>如果此題需要填數值、文字或日期，就在這裡建立輸入欄位。</p>
            </div>
            <button class="primary-button small" @click="addInputField">＋ 新增輸入欄位</button>
          </div>

          <div v-if="editor.inputFields.length" class="input-field-list">
            <div v-for="(field, index) in editor.inputFields" :key="field._key" class="input-field-card">
              <div class="input-field-title">輸入欄位 {{ index + 1 }}</div>
              <div class="input-field-grid">
                <label>
                  欄位名稱
                  <input v-model="field.label" placeholder="例如 實際常備品項數" />
                </label>
                <label>
                  輸入型態
                  <select v-model="field.type">
                    <option value="NUMBER">數字</option>
                    <option value="TEXT">文字</option>
                    <option value="TEXTAREA">多行文字</option>
                    <option value="DATE">日期</option>
                  </select>
                </label>
                <label>
                  單位
                  <input v-model="field.unit" placeholder="例如 項、℃、%" />
                </label>
                <label class="required-option">
                  是否必填
                  <select v-model="field.required">
                    <option :value="true">是</option>
                    <option :value="false">否</option>
                  </select>
                </label>
              </div>
              <button class="remove-field" @click="removeInputField(index)">移除此欄位</button>
            </div>
          </div>
          <div v-else class="no-fields">目前設定為「不需要額外輸入資料」。</div>
        </div>

        <div class="preview-box">
          <div class="preview-title">查核表預覽</div>
          <div class="preview-question">
            <span class="preview-code">{{ editor.code || 'B-9' }}</span>
            <span>{{ editor.text || '查核項目內容預覽' }}</span>
          </div>
          <div class="preview-result">○ 符合　 ○ 不符合　 ○ 不適用</div>
          <div v-for="field in editor.inputFields" :key="field._key" class="preview-rendered-field">
            <span>{{ field.label || '輸入欄位' }}：</span>
            <input :type="field.type === 'NUMBER' ? 'number' : field.type === 'DATE' ? 'date' : 'text'" disabled />
            <span v-if="field.unit">{{ field.unit }}</span>
          </div>
        </div>

        <div class="modal-actions">
          <button class="secondary-button" @click="closeEditor">取消</button>
          <button class="primary-button" @click="saveEditor">儲存</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { mockAuditItemCategories, mockAuditItems } from '../../mock/auditItems'
import { mockAuditFrequency } from '../../mock/auditFrequency'
import { mockService } from '../../mock/mockService'

const categories = mockAuditItemCategories

// 這一頁使用獨立的 reactive 狀態，避免直接修改 ES module 的 plain array
// 導致 Vue 不重新渲染。儲存後再同步回 Mock 主檔。
const frequencyState = reactive(
  Object.fromEntries(
    mockAuditFrequency.map(item => [item.categoryId, { ...item, months: [...item.months] }])
  )
)
const itemsState = ref(mockAuditItems.map(item => ({
  ...item,
  inputFields: (item.inputFields || []).map(field => ({ ...field }))
})))

const selectedCategoryId = ref(categories[0]?.id || '')
const showItemEditor = ref(false)
const editorMode = ref('add')
const editingItemId = ref(null)
let inputKeySeed = 0

const selectedCategory = computed(() => categories.find(item => item.id === selectedCategoryId.value) || categories[0])
const selectedFrequency = computed(() => frequencyState[selectedCategoryId.value] || { months: [], name: '未設定' })
const filteredItems = computed(() => itemsState.value.filter(item => item.categoryId === selectedCategoryId.value))

const editor = reactive({
  code: '',
  text: '',
  resultType: 'PASS_FAIL_NA',
  inputFields: [],
})

const selectCategory = (id) => {
  selectedCategoryId.value = id
  editingItemId.value = null
}

const toggleMonth = (month) => {
  const frequency = frequencyState[selectedCategoryId.value]
  if (!frequency) return
  const index = frequency.months.indexOf(month)
  if (index >= 0) frequency.months.splice(index, 1)
  else frequency.months.push(month)
  frequency.months.sort((a, b) => a - b)
  frequency.name = frequency.months.length === 12
    ? '每月'
    : frequency.months.length === 2 && frequency.months[0] === 6 && frequency.months[1] === 12
      ? '半年'
      : frequency.months.length
        ? `每年 ${frequency.months.join('、')} 月`
        : '未設定'
}

const saveFrequency = () => {
  const frequency = frequencyState[selectedCategoryId.value]
  if (!frequency) return
  mockService.settings.setFrequencyMonths(selectedCategoryId.value, frequency.months)
  window.alert(`${selectedCategory.value.code} ${selectedCategory.value.name} 查核月份已更新。`)
}

const resultTypeLabel = (type) => type === 'PASS_FAIL' ? '符合／不符合' : '符合／不符合／不適用'
const fieldTypeLabel = (type) => ({ NUMBER: '數字', TEXT: '文字', TEXTAREA: '多行文字', DATE: '日期' }[type] || type)

const resetEditor = () => {
  editor.code = ''
  editor.text = ''
  editor.resultType = 'PASS_FAIL_NA'
  editor.inputFields = []
}

const openAddItem = () => {
  resetEditor()
  editorMode.value = 'add'
  showItemEditor.value = true
}

const openEditItem = (item) => {
  editorMode.value = 'edit'
  editingItemId.value = item.id
  editor.code = item.code
  editor.text = item.text
  editor.resultType = item.resultType
  editor.inputFields = (item.inputFields || []).map(field => ({ ...field, _key: `${field.key}-${++inputKeySeed}` }))
  showItemEditor.value = true
}

const closeEditor = () => {
  showItemEditor.value = false
  editingItemId.value = null
}

const addInputField = () => {
  editor.inputFields.push({
    _key: `new-${++inputKeySeed}`,
    key: `field${inputKeySeed}`,
    label: '',
    type: 'NUMBER',
    unit: '',
    required: true,
  })
}

const removeInputField = (index) => editor.inputFields.splice(index, 1)

const saveEditor = () => {
  if (!editor.code.trim() || !editor.text.trim()) {
    window.alert('請填寫項次編號與查核項目內容。')
    return
  }

  const normalizedFields = editor.inputFields.map((field, index) => ({
    key: field.key || `field_${index + 1}`,
    label: field.label || `輸入欄位${index + 1}`,
    type: field.type,
    unit: field.unit,
    required: field.required,
  }))

  if (editorMode.value === 'add') {
    itemsState.value.push({
      id: `${selectedCategory.value.code}-${Date.now()}`,
      categoryId: selectedCategoryId.value,
      code: editor.code.trim(),
      text: editor.text.trim(),
      resultType: editor.resultType,
      inputFields: normalizedFields,
    })
  } else {
    const item = itemsState.value.find(item => item.id === editingItemId.value)
    if (item) {
      item.code = editor.code.trim()
      item.text = editor.text.trim()
      item.resultType = editor.resultType
      item.inputFields = normalizedFields
    }
  }

  closeEditor()
}

const removeItem = (item) => {
  if (!window.confirm(`確定要刪除 ${item.code} 嗎？`)) return
  const index = itemsState.value.findIndex(current => current.id === item.id)
  if (index >= 0) itemsState.value.splice(index, 1)
}

</script>

<style scoped>
.settings-page { min-height: 100%; padding: 28px 32px 48px; box-sizing: border-box; background: #f7f9fc; color: #243447; }
.page-title-row { margin-bottom: 22px; }
.breadcrumb { font-size: 13px; color: #7b8794; margin-bottom: 7px; }
h1 { margin: 0; color: #1f2d3d; font-size: 28px; font-weight: 700; }
.page-title-row p, .section-heading p { margin-top: 5px; color: #7b8794; font-size: 14px; }
.category-tabs { display: flex; gap: 0; border-bottom: 1px solid #d9e0e8; overflow-x: auto; background: #fff; padding: 0 8px; }
.category-tab { border: 0; background: transparent; padding: 15px 18px 13px; color: #7a8088; font-size: 16px; font-weight: 700; cursor: pointer; border-bottom: 3px solid transparent; white-space: nowrap; }
.category-tab:hover { color: #155ea8; background: #f7fbff; }
.category-tab.active { color: #17212b; border-bottom-color: #155ea8; }
.category-code { font-weight: 800; margin-right: 2px; }
.frequency-card, .items-card { margin-top: 18px; background: #fff; border: 1px solid #dfe5ec; border-radius: 10px; box-shadow: 0 2px 8px rgba(25, 45, 70, .04); }
.frequency-card { padding: 20px 22px 18px; }
.items-card { overflow: hidden; }
.section-heading { display: flex; align-items: center; justify-content: space-between; gap: 20px; }
h2 { margin: 0; color: #233548; font-size: 20px; font-weight: 750; }
h3 { margin: 0; color: #233548; font-size: 17px; }
.frequency-tools { display: flex; align-items: center; gap: 10px; }
.frequency-summary { padding: 7px 12px; border-radius: 20px; background: #eef5fc; color: #155ea8; font-size: 14px; font-weight: 700; }
.month-grid { display: grid; grid-template-columns: repeat(12, minmax(44px, 1fr)); gap: 8px; margin-top: 18px; }
.month-button { border: 1px solid #cbd5e1; background: #f8fafc; color: #526273; border-radius: 6px; height: 46px; font-size: 16px; font-weight: 700; cursor: pointer; }
.month-button:hover { border-color: #76a9d8; }
.month-button.selected { background: #6c9ed6; border-color: #6c9ed6; color: #fff; }
.frequency-hint { margin-top: 10px; color: #697889; font-size: 13px; }
.item-heading { padding: 18px 22px; border-bottom: 1px solid #e1e6ec; }
.primary-button, .secondary-button, .danger-button { border: 0; border-radius: 6px; padding: 9px 15px; font-size: 14px; font-weight: 700; cursor: pointer; }
.primary-button { background: #1c9a4a; color: #fff; }
.primary-button:hover { background: #16843e; }
.primary-button.small { padding: 8px 12px; }
.secondary-button { background: #e8f0f8; color: #14578f; }
.secondary-button:hover { background: #dce9f5; }
.danger-button { background: #f52d35; color: #fff; }
.danger-button:hover { background: #d92129; }
.item-row { display: grid; grid-template-columns: 62px minmax(300px, 1fr) minmax(240px, 330px) 150px; align-items: center; min-height: 78px; border-bottom: 1px solid #e5e9ee; }
.item-row:last-child { border-bottom: 0; }
.item-code { align-self: stretch; display: flex; align-items: center; padding: 0 16px; color: #263646; font-weight: 800; font-size: 15px; }
.item-main { padding: 12px 14px; min-width: 0; }
.item-text { color: #1f2b37; line-height: 1.55; font-size: 15px; }
.item-text-input { width: 100%; box-sizing: border-box; border: 1px solid #155ea8; border-radius: 6px; padding: 9px 10px; font-size: 15px; }
.item-meta { display: flex; gap: 12px; margin-top: 6px; color: #82909e; font-size: 12px; }
.item-input-preview { padding: 10px 14px; border-left: 1px solid #edf0f3; }
.preview-field { display: flex; align-items: center; gap: 8px; min-height: 28px; color: #445566; font-size: 13px; }
.type-badge { background: #f0f4f8; color: #526476; padding: 2px 7px; border-radius: 12px; }
.unit-text { color: #6d7b89; }
.empty-input { color: #a5afb9; }
.item-actions { display: flex; justify-content: flex-end; gap: 7px; padding: 0 14px; }
.empty-state { padding: 40px; text-align: center; color: #8794a1; }
.modal-mask { position: fixed; inset: 0; background: rgba(16, 27, 39, .42); display: flex; justify-content: center; align-items: center; padding: 24px; z-index: 100; }
.modal-card { width: min(920px, 100%); max-height: calc(100vh - 48px); overflow-y: auto; background: #fff; border-radius: 12px; box-shadow: 0 18px 50px rgba(0,0,0,.18); padding: 24px; box-sizing: border-box; }
.modal-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
.modal-header p { margin-top: 5px; color: #7a8795; font-size: 13px; }
.close-button { border: 0; background: transparent; color: #657383; font-size: 28px; cursor: pointer; line-height: 1; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
label { display: flex; flex-direction: column; gap: 6px; color: #445365; font-size: 13px; font-weight: 700; }
input, select, textarea { font: inherit; color: #253342; border: 1px solid #cfd8e2; border-radius: 6px; padding: 9px 10px; background: #fff; box-sizing: border-box; }
textarea { resize: vertical; }
.full-field { margin-top: 16px; }
.input-setting-box { margin-top: 20px; padding: 18px; border: 1px solid #dbe3eb; border-radius: 9px; background: #f9fbfd; }
.input-setting-header { display: flex; justify-content: space-between; align-items: center; gap: 15px; }
.input-setting-header p { margin-top: 4px; color: #7b8896; font-size: 12px; }
.input-field-list { display: flex; flex-direction: column; gap: 12px; margin-top: 14px; }
.input-field-card { position: relative; padding: 15px; background: #fff; border: 1px solid #dce4ec; border-radius: 8px; }
.input-field-title { margin-bottom: 12px; color: #155ea8; font-weight: 800; font-size: 13px; }
.input-field-grid { display: grid; grid-template-columns: 1.3fr 1fr .8fr .7fr; gap: 12px; }
.remove-field { margin-top: 12px; border: 0; background: transparent; color: #d8272f; font-size: 12px; cursor: pointer; font-weight: 700; }
.no-fields { margin-top: 14px; padding: 15px; background: #fff; border: 1px dashed #ccd6e0; border-radius: 7px; color: #8793a0; font-size: 13px; }
.preview-box { margin-top: 18px; padding: 16px; border: 1px solid #dbe3eb; border-radius: 9px; background: #fff; }
.preview-title { color: #155ea8; font-size: 13px; font-weight: 800; margin-bottom: 12px; }
.preview-question { display: flex; gap: 10px; line-height: 1.5; }
.preview-code { font-weight: 800; white-space: nowrap; }
.preview-result { margin: 10px 0; color: #526273; font-size: 13px; }
.preview-rendered-field { display: inline-flex; align-items: center; gap: 6px; margin-right: 20px; color: #455565; font-size: 13px; }
.preview-rendered-field input { width: 90px; padding: 6px 8px; background: #f5f7f9; }
.modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 22px; padding-top: 16px; border-top: 1px solid #e2e7ed; }
@media (max-width: 1000px) {
  .month-grid { grid-template-columns: repeat(6, 1fr); }
  .item-row { grid-template-columns: 55px 1fr; padding: 10px 0; }
  .item-input-preview { grid-column: 2; border-left: 0; padding-top: 0; }
  .item-actions { grid-column: 2; justify-content: flex-start; padding-top: 8px; }
  .input-field-grid { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 640px) {
  .settings-page { padding: 20px 14px 35px; }
  .form-grid, .input-field-grid { grid-template-columns: 1fr; }
  .month-grid { grid-template-columns: repeat(4, 1fr); }
}
</style>
