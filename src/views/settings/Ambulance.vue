<template>
  <section class="page">
    <div class="page-head">
      <div>
        <div class="breadcrumb">系統設定 / 急救車查核管理</div>
        <h1>急救車查核管理</h1>
        <p>維護各急救車標準配置；每種車型固定為 4 欄 × 3 列，共 12 個藥品位置。</p>
      </div>
      <div class="api-badge">標準設定 · Mock</div>
    </div>

    <div class="type-tabs card">
      <button v-for="type in types" :key="type.id" :class="{ active: selectedTypeId === type.id }" @click="selectType(type.id)">
        <span><b>{{ type.name }}</b><small>4 欄 × 3 列</small></span>
      </button>
    </div>

    <div class="layout card">
      <div class="layout-head">
        <div>
          <h2>{{ selectedType.name }}</h2>
          <span>標準藥品配置 · 共 12 個位置</span>
        </div>
        <span class="save-hint">每個位置修改後可直接套用並儲存</span>
      </div>

      <div class="cart-area">
        <div class="orientation left-orientation">
          <span>內</span>
          <i></i>
          <span>外</span>
        </div>

        <div class="cart-grid-wrap">
          <div class="position-grid">
            <button
              v-for="pos in positions"
              :key="pos"
              class="position-card"
              :class="{ empty: !itemAt(pos) }"
              @click="selectPosition(pos)"
            >
              <div class="image-box">
                <img v-if="itemAt(pos)?.image" :src="itemAt(pos).image" :alt="itemAt(pos)?.name || pos" />
                <span v-else>尚未設定圖片</span>
              </div>
              <div class="item-info">
                <span class="position-label">{{ pos }}</span>
                <div class="item-name">{{ itemAt(pos)?.name || '尚未設定藥品' }}</div>
                <div class="item-qty">標準數量：{{ itemAt(pos)?.requiredQty ?? 0 }} 支</div>
              </div>
            </button>
          </div>

          <div class="orientation bottom-orientation">
            <span>左</span>
            <i></i>
            <span>右</span>
          </div>
        </div>
      </div>
    </div>

    <div class="note">
      <b>資料來源說明</b>
      <span>此頁維護的是「標準車型配置」。醫院實際有哪些急救車、各類型有幾台由醫院 API 提供；現場實體車號於查核時輸入。</span>
    </div>

    <div v-if="message" class="toast">{{ message }}</div>

    <div v-if="selectedPosition" class="modal-mask" @click.self="closeEditor">
      <div class="modal">
        <div class="modal-head">
          <div>
            <span class="modal-kicker">{{ selectedType.name }}</span>
            <h3>位置 {{ selectedPosition }}</h3>
          </div>
          <button class="close" @click="closeEditor">×</button>
        </div>

        <div class="modal-body">
          <label>
            藥品名稱
            <input v-model="editor.name" placeholder="請輸入藥品名稱" />
          </label>

          <label>
            標準數量
            <div class="input-with-unit"><input v-model.number="editor.requiredQty" type="number" min="0" /><span>支</span></div>
          </label>

          <div class="image-source">
            <div class="field-title">藥品圖片</div>
            <div class="source-tabs">
              <button :class="{ active: editor.imageSource === 'url' }" @click="editor.imageSource = 'url'">圖片 URL</button>
              <button :class="{ active: editor.imageSource === 'local' }" @click="editor.imageSource = 'local'">選擇本機圖片</button>
            </div>

            <div v-if="editor.imageSource === 'url'" class="source-panel">
              <input v-model="editor.image" placeholder="https://..." />
              <small>可貼上圖片網址，儲存後由系統載入。</small>
            </div>

            <div v-else class="source-panel">
              <label class="file-picker">
                <input type="file" accept="image/*" @change="handleLocalImage" />
                <span>選擇圖片</span>
                <small>{{ editor.imageFileName || '尚未選擇檔案' }}</small>
              </label>
              <small>目前僅作為前端 Mock 預覽；正式環境需確認圖片上傳／儲存方式。</small>
            </div>

            <div v-if="editor.image" class="image-preview">
              <img :src="editor.image" alt="圖片預覽" />
            </div>
          </div>
        </div>

        <div class="modal-foot">
          <button class="ghost" @click="closeEditor">取消</button>
          <button class="primary" @click="saveItem">套用並儲存</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import { mockAmbulanceConfigurations } from '../../mock/ambulance'
import { mockService } from '../../mock/mockService'

const types = ref(mockAmbulanceConfigurations.map(type => ({
  ...type,
  items: type.items.map(item => ({ ...item })),
})))
const selectedTypeId = ref(types.value[0]?.id || '')
const selectedPosition = ref('')
const editor = ref({ name: '', requiredQty: 0, image: '', imageSource: 'url', imageFileName: '' })
const message = ref('')

// 固定 4 欄 × 3 列：1-1 ~ 1-4、2-1 ~ 2-4、3-1 ~ 3-4
const positions = Array.from({ length: 12 }, (_, i) => `${Math.floor(i / 4) + 1}-${(i % 4) + 1}`)
const selectedType = computed(() => types.value.find(type => type.id === selectedTypeId.value) || types.value[0])
const itemAt = (pos) => selectedType.value?.items.find(item => item.position === pos)

const selectType = (typeId) => {
  selectedTypeId.value = typeId
  selectedPosition.value = ''
}

const selectPosition = (pos) => {
  selectedPosition.value = pos
  const item = itemAt(pos)
  editor.value = item
    ? {
        name: item.name,
        requiredQty: item.requiredQty,
        image: item.image || '',
        imageSource: item.imageSource || 'url',
        imageFileName: item.imageFileName || '',
      }
    : { name: '', requiredQty: 0, image: '', imageSource: 'url', imageFileName: '' }
}

const closeEditor = () => {
  selectedPosition.value = ''
}

const handleLocalImage = (event) => {
  const file = event.target.files?.[0]
  if (!file) return
  editor.value.imageSource = 'local'
  editor.value.imageFileName = file.name

  const reader = new FileReader()
  reader.onload = () => {
    editor.value.image = String(reader.result || '')
  }
  reader.readAsDataURL(file)
}

const saveItem = () => {
  const type = selectedType.value
  if (!type || !selectedPosition.value) return

  let item = itemAt(selectedPosition.value)
  if (!item) {
    const [row, column] = selectedPosition.value.split('-').map(Number)
    item = {
      id: `${type.code}-${selectedPosition.value}`,
      typeId: type.id,
      row,
      column,
      position: selectedPosition.value,
      name: '',
      requiredQty: 0,
      image: '',
      imageSource: 'url',
      imageFileName: '',
    }
    type.items.push(item)
  }

  Object.assign(item, editor.value)
  mockService.ambulance.updatePosition(type.id, selectedPosition.value, { ...editor.value })
  message.value = `位置 ${selectedPosition.value} 已儲存`
  closeEditor()
  window.setTimeout(() => { message.value = '' }, 1800)
}

</script>

<style scoped>
.page{padding:28px 32px 40px;min-height:100%;box-sizing:border-box;background:#f7f8fa;color:#374151}.page-head{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:20px}.breadcrumb{font-size:14px;color:#8a94a6;margin-bottom:7px}h1{margin:0;font-size:30px;color:#20242b}.page-head p{margin:7px 0 0;color:#7b8492;font-size:15px}.api-badge{padding:9px 14px;border-radius:9px;background:#eef6f2;color:#29704d;font-size:14px;font-weight:700}.card{background:#fff;border:1px solid #e7e9ee;border-radius:12px;box-shadow:0 2px 8px rgba(15,23,42,.04)}.type-tabs{display:flex;overflow:hidden;margin-bottom:18px}.type-tabs button{flex:1;background:#fff;border:0;border-right:1px solid #edf0f3;padding:15px 12px;cursor:pointer;color:#606a78}.type-tabs button:last-child{border-right:0}.type-tabs button.active{background:#f0f6f3;color:#2d6d50;box-shadow:inset 0 -3px #3c795d}.type-tabs b{display:block;font-size:16px}.type-tabs small{display:block;font-size:12px;color:#9aa2ae;margin-top:3px}.layout{overflow:hidden}.layout-head{display:flex;justify-content:space-between;align-items:center;padding:18px 22px;border-bottom:1px solid #edf0f3}.layout-head h2{margin:0 0 3px;font-size:20px;color:#252b35}.layout-head span{font-size:13px;color:#8b95a3}.save-hint{font-size:13px;color:#2d6d50!important;font-weight:700}.primary{border:0;border-radius:7px;background:#315e4a;color:#fff;padding:9px 16px;font-weight:700;cursor:pointer}.cart-area{display:flex;justify-content:center;gap:20px;padding:24px 38px 26px;background:#fafbfc}.cart-grid-wrap{width:min(920px,100%)}.position-grid{display:grid;grid-template-columns:repeat(4,minmax(150px,1fr));gap:12px}.position-card{min-width:0;text-align:left;background:#fff;border:1px solid #2c6ebd;border-radius:6px;padding:8px;cursor:pointer;transition:.15s;box-shadow:0 1px 2px rgba(15,23,42,.03)}.position-card:hover{transform:translateY(-1px);box-shadow:0 4px 12px rgba(15,23,42,.08)}.position-card.empty{border-color:#cfd6df}.image-box{height:116px;border-radius:3px;background:#f1f3f5;display:flex;align-items:center;justify-content:center;overflow:hidden;margin-bottom:7px}.image-box img{width:100%;height:100%;object-fit:contain}.image-box span{font-size:12px;color:#9aa2ae}.item-info{padding:0 1px 2px}.position-label{display:inline-block;font-size:11px;color:#8a94a3;margin-bottom:3px}.item-name{font-size:13px;line-height:1.25;min-height:33px;color:#20252d;font-weight:600}.item-qty{font-size:12px;color:#687384;margin-top:5px}.orientation{color:#20242b;font-size:21px;font-weight:700}.left-orientation{display:flex;flex-direction:column;align-items:center;justify-content:space-between;min-height:390px;padding:3px 0}.left-orientation i{width:4px;height:260px;background:#ef2929;position:relative}.left-orientation i:after{content:'';position:absolute;bottom:-1px;left:50%;width:17px;height:17px;border-right:4px solid #ef2929;border-bottom:4px solid #ef2929;transform:translateX(-50%) rotate(45deg)}.bottom-orientation{display:flex;align-items:center;gap:18px;justify-content:center;margin-top:14px}.bottom-orientation i{height:4px;flex:1;background:#ef2929;position:relative}.bottom-orientation i:after{content:'';position:absolute;right:-1px;top:50%;width:17px;height:17px;border-right:4px solid #ef2929;border-top:4px solid #ef2929;transform:translateY(-50%) rotate(45deg)}.note{max-width:1000px;margin:16px auto 0;display:flex;gap:10px;padding:13px 16px;border:1px solid #e5e9ee;border-radius:9px;background:#fff;font-size:13px;color:#7b8492}.note b{color:#4d5867;white-space:nowrap}.toast{position:fixed;right:28px;bottom:28px;background:#24332c;color:#fff;padding:12px 17px;border-radius:9px;box-shadow:0 8px 24px rgba(0,0,0,.16);font-size:14px}.modal-mask{position:fixed;inset:0;background:rgba(15,23,42,.42);display:flex;align-items:center;justify-content:center;padding:20px;z-index:50}.modal{width:min(560px,100%);background:#fff;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,.2);overflow:hidden}.modal-head{display:flex;justify-content:space-between;align-items:flex-start;padding:20px 22px;border-bottom:1px solid #edf0f3}.modal-kicker{font-size:12px;color:#7c8795}.modal h3{margin:3px 0 0;font-size:21px;color:#242a33}.close{border:0;background:transparent;font-size:27px;color:#8993a0;cursor:pointer;line-height:1}.modal-body{padding:20px 22px}.modal-body>label{display:flex;flex-direction:column;gap:6px;font-size:13px;color:#697386;margin-bottom:16px}.modal-body input{height:40px;border:1px solid #dfe3e8;border-radius:7px;padding:0 10px;font-size:14px;outline:none;box-sizing:border-box}.input-with-unit{display:flex;align-items:center;gap:8px}.input-with-unit input{flex:1}.input-with-unit span{color:#6f7987}.field-title{font-size:13px;color:#697386;margin-bottom:7px}.source-tabs{display:flex;border-bottom:1px solid #e3e7ec;margin-bottom:12px}.source-tabs button{border:0;background:transparent;padding:9px 13px;font-size:13px;color:#7a8492;cursor:pointer}.source-tabs button.active{color:#2f7052;font-weight:700;border-bottom:2px solid #3c795d}.source-panel>input{width:100%}.source-panel small{display:block;margin-top:6px;color:#9aa2ae;font-size:12px;line-height:1.5}.file-picker{display:flex;align-items:center;gap:10px!important;flex-direction:row!important}.file-picker input{display:none}.file-picker span{display:inline-flex;align-items:center;justify-content:center;height:38px;padding:0 14px;border:1px solid #d5dce4;border-radius:7px;background:#fff;color:#4d5867;font-size:13px;cursor:pointer}.file-picker small{margin:0!important;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.image-preview{margin-top:12px;height:130px;border:1px dashed #d8dee6;border-radius:8px;background:#fafbfc;display:flex;align-items:center;justify-content:center;overflow:hidden}.image-preview img{max-width:100%;max-height:100%;object-fit:contain}.modal-foot{display:flex;justify-content:flex-end;gap:8px;padding:14px 22px;background:#fafbfc;border-top:1px solid #edf0f3}.ghost{border:1px solid #e0e4ea;background:#fff;color:#626d7c;border-radius:7px;padding:9px 15px;font-size:13px;cursor:pointer}@media(max-width:900px){.cart-area{padding:20px 18px}.position-grid{grid-template-columns:repeat(2,minmax(150px,1fr))}.left-orientation{display:none}}@media(max-width:560px){.position-grid{grid-template-columns:1fr}.type-tabs{overflow:auto}.type-tabs button{min-width:180px}}
</style>
