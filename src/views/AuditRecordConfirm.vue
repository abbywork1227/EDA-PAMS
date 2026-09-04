<template>
<div class="page-bg">
  <div class="paper">
    <div class="header">
    <h1>

    常備藥查核表
  
    <span
      v-if="hasFailItems"
      class="danger-tag"
    >
      （含改善案件）
    </span>
  
  </h1>
    <p>
    {{
      hasFailItems
        ? '本次查核包含不符合項目，請確認改善內容後送出。'
        : '送出前請再次確認所有查核內容。'
    }}
  </p>
    </div>

    <section class="card">
      <h2>基本資料</h2>
      <table class="info-table">
      <tbody>
        <tr>
          <th>受核單位</th>
          <td>{{ audit.pageInfo?.unitName || '-' }}</td>
          <th>年度</th>
          <td>{{ audit.pageInfo?.year }}</td>
        </tr>
        <tr>
          <th>月份</th>
          <td>{{ audit.pageInfo?.month }}</td>
          <th>查核藥師</th>
          <td>黃嘉偉 (4D231)</td>
        </tr>
      </tbody>
    </table>
    </section>

    <!-- <section class="card">
      <h2>查核結果</h2>
      <div v-for="cat in audit.structuredItems" :key="cat.categoryName" class="category">
        <h3>{{ cat.categoryName }}</h3>
        <table class="result-table">
          <thead><tr><th>項次</th><th>內容</th><th>結果</th><th>改善原因</th></tr></thead>
          <tbody>
            <tr v-for="item in cat.items" :key="item.id">
              <td>{{ item.code }}</td>
              <td>{{ item.text }}</td>
              <td>
                <span :class="item.result">{{ resultText(item.result) }}</span>
              </td>
              <td>{{ item.reason || '-' }}</td>
            </tr>
            <tr v-for="item in cat.items.filter(i=>i.images && i.images.length)" :key="item.id+'img'">
              <td colspan="4">
                <div class="photos">
                  <img v-for="(img,index) in item.images" :key="index" :src="img" />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section> -->

    <section class="card">

    <h2 class="section-title">查核結果</h2>

    <section class="card" v-if="audit.controlledDrugList.length">

    <h3>管制藥品效期盤點</h3>
  
    <table class="confirm-table">
  
      <thead>
        <tr>
          <th width="35%">管制藥品名稱 (規格)</th>
          <th width="12%">管制級別</th>
          <th width="12%">標準量</th>
          <th width="12%">空瓶數</th>
          <th>有效期限核對</th>
        </tr>
      </thead>
  
      <tbody>
  
        <tr
          v-for="drug in audit.controlledDrugList"
          :key="drug.id"
        >
          <td>{{ drug.name }}</td>
  
          <td>{{ drug.level }}</td>
  
          <td>{{ drug.baseQty }}</td>
  
          <td>{{ drug.emptyBottleQty || 0 }} 瓶</td>
  
          <td>{{ drug.selectedExpiry || '-' }}</td>
  
        </tr>
  
      </tbody>
  
    </table>
  
  </section>
  
    <div
      v-for="cat in audit.structuredItems"
      :key="cat.categoryName"
      class="confirm-block"
    >
  
      <div class="confirm-header">
  
        {{ cat.categoryName }}
  
      </div>
  
      <table class="confirm-table">
  
        <thead>
  
          <tr>
  
            <th width="70">項次</th>
  
            <th>查核內容</th>
  
            <th width="90">結果</th>
  
          </tr>
  
        </thead>
  
        <tbody>
  
          <template
            v-for="item in cat.items"
            :key="item.id"
          >
  
            <tr>
  
              <td>{{ item.code }}</td>
  
              <td>{{ item.text }}</td>
  
              <td >
  
                <span :class="item.result">
  
                  {{ resultText(item.result) }}
  
                </span>
  
              </td>
  
            </tr>
  
            <!-- 不符合才展開 -->
  
            <tr
              v-if="item.result=='fail'"
              class="fail-row"
            >
  
              <td></td>
  
              <td colspan="2">
  
                <div class="fail-box">
  
                  <div>
  
                    <b>改善原因：</b>
  
                    {{ item.reason || '未填寫' }}
  
                  </div>
  
                  <div
                    class="photos"
                    v-if="item.images && item.images.length"
                  >
  
                    <img
  
                      v-for="(img,index) in item.images"
  
                      :key="index"
  
                      :src="img"
  
                    >
  
                  </div>
  
                </div>
  
              </td>
  
            </tr>
  
          </template>
  
        </tbody>
  
      </table>
  
    </div>
  
  </section>

    <section class="card">
      <h2>急救車盤點</h2>
      <div v-for="car in audit.ambulances" :key="car.id" class="car-block">
      <div class="car-header">

      <div class="car-name">
        🚑 {{ car.customName }}
      </div>
    
      <div class="seal-no">
        封條：{{ car.sealNo }}
      </div>
    
    </div>
        <div class="layout">
          <div class="top">內</div>
          <div class="middle">
            <div class="side">左</div>
            <div class="grid">
              <div class="drug" v-for="item in car.items" :key="item.id">
                <img :src="item.img" />
                <div>{{ item.name }}</div>
                <small>{{ item.qty }}</small>
                <small>{{ item.expire }}</small>
              </div>
            </div>
            <div class="side">右</div>
          </div>
          <div class="bottom">外</div>
        </div>
      </div>
    </section>

    <section class="card" v-if="hasFailItems">

    <h2 class="danger-tag" >改善案件</h2>
  
    <div
      v-for="cat in audit.structuredItems"
      :key="cat.categoryName+'f'"
    >
  
      <div
        v-for="item in cat.items.filter(i=>i.result==='fail')"
        :key="item.id"
        class="improve"
      >
  
        <h4>
  
          {{ item.code }}
  
          {{ item.text }}
  
        </h4>
  
        <p>
  
          <b>不符合原因：</b>
  
          {{ item.reason || '-' }}
  
        </p>
  
        <div
          class="origin-photo-block"
          v-if="item.images && item.images.length"
        >
  
          <div class="photo-title">
  
            查核照片
  
          </div>
  
          <div class="origin-photo-list">
  
            <img
              v-for="(img,index) in item.images"
              :key="index"
              :src="img"
            >
  
          </div>
  
        </div>
</div>
  
    </div>

     <div class="notice-box unified-improvement-notice">
       📌 本查核送出後，系統將自動建立改善案件，並通知受核單位填寫改善回覆。
     </div>

  
  </section>

    <section v-if="hasFailItems" class="card improvement-contact-card">
      <h2>NG 改善窗口</h2>
      <p class="contact-hint">預設帶入「受查單位管理」目前窗口；藥師可在本次 NG 送出前直接更換，送出後會同步更新該受查單位目前窗口。</p>
      <div class="contact-row">
        <label for="improvement-contact">受查單位窗口</label>
        <select id="improvement-contact" v-model="selectedContactId">
          <option value="">請選擇受查單位窗口</option>
          <option v-for="person in contactOptions" :key="person.id" :value="person.id">
            {{ person.name }}（{{ person.account }}）{{ person.department ? `｜${person.department}` : '' }}
          </option>
        </select>
      </div>
    </section>

    <div class="footer-btn">
    <button
    class="btn-back"
    @click="router.back()"
    >
    
    返回修改
    
    </button>
    
    <button
    class="btn-submit"
    @click="showSignDialog=true"
    >
    
    確認送出
    
    </button>
    </div>
  </div>
  <div
  v-if="showSignDialog"
  class="dialog-mask"
>

  <div class="dialog">

      <div class="dialog-title">

          🔐 受查單位人員確認

      </div>

      <div class="dialog-body">

      <div class="tip">
    
        本次查核已由查核藥師完成檢核，請 受查單位人員確認內容無誤後完成電子簽章。
    
      </div>
    
      <div class="sign-info">
    
        <div class="row">
    
          <span>查核藥師</span>
    
          <strong>黃嘉偉（4D231）</strong>
    
          <span class="done">✔ 已完成查核</span>
    
        </div>
    
      </div>
    
      <div class="field">
    
        <label> 受查單位人員帳號</label>
    
        <input
          v-model="signer.account"
          placeholder="請輸入員工編號"
        >
    
      </div>
    
      <div class="field">
    
        <label>密碼</label>
    
        <input
          type="password"
          v-model="signer.password"
          placeholder="請輸入登入密碼"
        >
    
      </div>
    
      <label class="agree-box">
    
        <input
          type="checkbox"
          v-model="signer.agree"
        >
    
        <span>
    
          我已確認本次查核內容無誤，並同意完成共同盤點電子簽章。
    
        </span>
    
      </label>
    
    </div>

      <div class="dialog-footer">

          <button
              class="btn-cancel"
              @click="showSignDialog=false"
          >

              取消

          </button>

          <button
              class="btn-confirm"
              @click="submit"
          >

              確認送出

          </button>

      </div>

  </div>

</div>


</div>



</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { auditStore } from '../store.js'
import { mockService } from '../mock/mockService'

const router = useRouter()
const audit = auditStore
const showSignDialog = ref(false)
const signer = ref({ account: '', password: '', agree: false })

const hasFailItems = computed(() => audit.structuredItems.some(cat => cat.items.some(item => item.result === 'fail')))
const resultText = r => r === 'pass' ? '符合' : r === 'fail' ? '不符合' : '不適用'

const currentUnitId = computed(() => audit.pageInfo.unitId || '')
const currentHospitalId = computed(() => audit.pageInfo.hospitalId || mockService.units.get(currentUnitId.value)?.hospitalId || '')
const currentAssignment = computed(() => mockService.units.getConfig(currentUnitId.value))
const contactOptions = computed(() => mockService.users.getByHospitalAndRole(currentHospitalId.value, 'UNIT_CONTACT'))
const selectedContactId = ref(audit.pageInfo.defaultContactUserId || currentAssignment.value?.contactUserId || '')

const getStatusKey = () => `${audit.pageInfo.unitId}-${audit.pageInfo.year}-${audit.pageInfo.month}`
const nextSerial = () => {
const n = Number(sessionStorage.getItem('auditSerial') || '0') + 1
sessionStorage.setItem('auditSerial', String(n))
return String(n).padStart(4, '0')
}

const submit = () => {
if (hasFailItems.value) {
  if (!selectedContactId.value) return alert('請先選擇 NG 改善窗口')
  const selectedContact = contactOptions.value.find(p => p.id === selectedContactId.value)
  if (!selectedContact) return alert('NG 改善窗口不存在或已停用')
  mockService.units.updateConfig(currentUnitId.value, { contactUserId: selectedContactId.value })
  audit.pageInfo.improvementContactUserId = selectedContactId.value
  audit.pageInfo.improvementContactName = selectedContact.name
}

if (!signer.value.account.trim()) return alert('請輸入 受查單位人員帳號')
if (!signer.value.password.trim()) return alert('請輸入密碼')
if (!signer.value.agree) return alert('請勾選確認聲明')

// Demo 階段不驗證受查單位人員帳密；只要有輸入帳號、密碼並勾選確認即可繼續。
// 正式串接帳號系統時，再改回由 API 驗證身分、院區與窗口權限。
const resultCode = hasFailItems.value ? 'NG' : 'OK'
const hospital = audit.pageInfo.hospitalId || currentHospitalId.value || 'EDA'
const unitCode = audit.pageInfo.unitId || 'UNIT'
const yearMonth = `${audit.pageInfo.year}${String(audit.pageInfo.month).padStart(2, '0')}`
const documentNo = `${hospital}-${unitCode}-${resultCode}-${yearMonth}-${nextSerial()}`

showSignDialog.value = false
audit.lastSubmittedRecord = {
  documentNo,
  resultCode,
  unitId: unitCode,
  hospitalId: hospital,
  year: audit.pageInfo.year,
  month: audit.pageInfo.month,
  improvementContactUserId: audit.pageInfo.improvementContactUserId || null,
  improvementContactName: audit.pageInfo.improvementContactName || null,
  submittedBy: signer.value.account.trim(),
  submittedAt: new Date().toISOString(),
}
audit.setAuditStatus(getStatusKey(), 'completed')

alert(`查核單送出成功！\n\n單號：${documentNo}`)
audit.clear()
router.push('/initial-audit')
}
</script>

<style scoped>
body,.page-bg{background:#eef2f7}.page-bg{padding:30px}.paper{max-width:1000px;margin:auto;background:#fff;padding:40px;border-radius:10px;box-shadow:0 4px 20px rgba(0,0,0,.08)}.header{text-align:center;border-bottom:2px solid #333;padding-bottom:20px;margin-bottom:20px}.card{margin-bottom:28px}.info-table,.result-table{
  width:100%;
  border-collapse:collapse;
  table-layout:fixed;
  margin-top:8px;
}.info-table th,.info-table td,.result-table th,.result-table td{border:1px solid #ddd;padding:8px}.pass{color:#16a34a;font-weight:bold}.fail{color:#dc2626;font-weight:bold}.na{color:#64748b}.photos{display:flex;gap:10px;flex-wrap:wrap}.photos img{width:90px;height:90px;object-fit:cover;border-radius:6px}.layout{text-align:center}.middle{display:flex;align-items:center}.side{width:40px;font-weight:bold}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;flex:1}.drug{border:1px solid #ddd;padding:8px;border-radius:6px}.drug img{width:100%;height:90px;object-fit:cover}.footer-btn{display:flex;justify-content:flex-end;gap:12px}
.section-title{

margin-bottom:20px;

}

.confirm-block{

border:1px solid #dbe4ee;

border-radius:10px;

overflow:hidden;

margin-bottom:28px;

}

.confirm-header{

background:#eff6ff;

color:#1e3a8a;

font-weight:700;

padding:12px 18px;

font-size:18px;

}

.confirm-table{

width:100%;

border-collapse:collapse;

table-layout:fixed;

}

.confirm-table th{

background:#f8fafc;

border:1px solid #dbe4ee;

padding:12px;

text-align:center;

}

.confirm-table td{

border:1px solid #dbe4ee;

padding:12px;

vertical-align:top;

line-height:1.7;

}

.confirm-table td:nth-child(2){

text-align:left;

}

.fail-row{

background:#fff7f7;

}

.fail-box{

padding:8px;

}


.header h1 {
color: #111827;
transition: 0.2s;
}


.car-block{

background:#ffffff;

border:2px solid #cbd5e1;

border-radius:14px;

overflow:hidden;

margin-bottom:35px;

box-shadow:0 2px 8px rgba(0,0,0,.06);

}

.car-header{

background:#1e3a8a;

color:white;

display:flex;

justify-content:space-between;

align-items:center;

padding:12px 18px;

}

.car-name{

font-size:20px;

font-weight:700;

}

.seal-no{

font-size:14px;

opacity:.9;

}
.layout{

background:#f8fafc;

border-top:1px solid #e2e8f0;

padding:20px;

}
.danger-tag{
color:#dc2626;
font-weight:700;
}

.dialog-mask{

position:fixed;

inset:0;

background:rgba(0,0,0,.45);

display:flex;

justify-content:center;

align-items:center;

z-index:999;

}

.dialog{

width:560px;

  max-width:90vw;

background:white;

border-radius:14px;

overflow:hidden;

box-shadow:0 20px 60px rgba(0,0,0,.25);

}

.dialog-title{

background:#2563eb;

color:white;

padding:16px 20px;

font-size:20px;

font-weight:700;

}

.dialog-body{

padding:24px;

}

.tip{

background:#eff6ff;

border-left:4px solid #2563eb;

padding:12px;

margin-bottom:20px;

line-height:1.6;

}

.field{

margin-bottom:18px;

}

.field label{

display:block;

margin-bottom:6px;

font-weight:600;

}

.field input{

width:100%;

height:42px;

border:1px solid #d7dce5;

border-radius:8px;

padding:0 12px;

box-sizing:border-box;

}



.dialog-footer{

display:flex;

justify-content:flex-end;

gap:10px;

padding:18px;

border-top:1px solid #e5e7eb;

}

.btn-cancel{


background:#ffffff;

border:1px solid #cbd5e1;

color:#334155;

padding:10px 22px;

border-radius:8px;

cursor:pointer;

transition:.2s;

}

.btn-cancel:hover{

background:#f8fafc;

}

.btn-confirm{

background:#2563eb;

color:white;

border:none;

border-radius:8px;

padding:10px 24px;

cursor:pointer;

transition:.2s;

}

.btn-confirm:hover{

background:#1d4ed8;

}

.btn-back{

background:white;

border:1px solid #cbd5e1;

padding:10px 22px;

border-radius:8px;

cursor:pointer;

}

.btn-back:hover{

background:#f8fafc;

}

.btn-submit{

background:#2563eb;

color:white;

border:none;

padding:10px 24px;

border-radius:8px;

cursor:pointer;

}

.btn-submit:hover{

background:#1d4ed8;

}

.sign-info{

background:#f8fafc;

border:1px solid #dbe4ee;

border-radius:10px;

padding:15px;

margin-bottom:20px;

}

.sign-info .row{

display:flex;

align-items:center;

gap:12px;

}

.done{

color:#16a34a;

font-weight:bold;

}

.agree-box{

display:flex;

align-items:flex-start;

gap:10px;

margin-top:20px;

padding:12px;

background:#fff7ed;

border:1px solid #fed7aa;

border-radius:8px;

cursor:pointer;

}

.agree-box input{

margin-top:3px;

}
.notice-box{

margin-top:18px;

background:#eff6ff;

border-left:5px solid #2563eb;

padding:14px 16px;

border-radius:8px;

color:#1e3a8a;

line-height:1.8;

}
.origin-photo-list{

display:grid;

grid-template-columns:repeat(auto-fill,minmax(180px,1fr));

gap:16px;

}

.origin-photo-list img{

width:100%;

aspect-ratio:4/3;

object-fit:cover;

border-radius:8px;

border:1px solid #dbe4ee;

}

.improvement-contact-card{border:1px solid #fecaca;background:#fffafa;padding:20px;border-radius:10px}.improvement-contact-card h2{margin:0 0 8px;color:#991b1b}.contact-hint{margin:0 0 16px;color:#64748b}.contact-row{display:flex;align-items:center;gap:18px}.contact-row label{font-weight:700;min-width:120px}.contact-row select{min-width:360px;padding:10px 12px;border:1px solid #cbd5e1;border-radius:6px;background:#fff}
</style>
