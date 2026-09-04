<template>
<div class="login-bg">
  <div class="login-container">
    
    <div class="login-header">
      <div class="brand-title">
        <div class="hospital-logo">🏥</div>
        <div class="brand-text">
          <span class="company">義大醫療財團法人</span>
          <span class="en">E-DA HEALTHCARE GROUP</span>
        </div>
      </div>
      <h1 class="system-title">常備藥品查核系統 <span class="version">2.0</span></h1>
      <div class="demo-badge">展示與功能演示環境</div>
    </div>

    <div class="login-content-grid">
      
      <div class="login-box-real">
        <h3>🔐 系統登入</h3>
        <p class="subtitle-hint">說明：輸入帳號即可自動判斷角色與所屬院區</p>


        <div class="form-group">
          <label>員工編號 / 帳號</label>
          <input 
            type="text" 
            v-model="username" 
            placeholder="請輸入帳號 (試試：ph123 或 admin)" 
            class="input-field"
          />
        </div>

        <div class="form-group">
          <label>密碼</label>
          <input type="password" value="********" readonly class="input-field disabled" />
        </div>

        <div v-if="computedRole" class="role-detect-badge">
          ✨ 系統已識別身份：<strong>【{{ computedRole }}】</strong>
        </div>

        <button class="btn-primary" @click="handleRealLogin">
          驗證並登入系統
        </button>
      </div>

      <div class="login-box-quick">
        <h3>⚡ 快捷演示通道</h3>
        <p class="subtitle-hint">一鍵切換特定身份，免輸入直接查看各角色權限畫面</p>
        

                
        <div class="form-group">
        <label>展示院區</label>
        <select v-model="selectedHospital" class="input-field">
          <option v-for="h in hospitals" :key="h" :value="h">{{ h }}</option>
        </select>
      </div>
        <div class="quick-roles-list">
          <button class="btn-role" @click="handleQuickLogin('4D231', '義大醫院', '藥師')">
            <span class="role-title">藥師 填報入口</span>
            <span class="role-desc">填報常備藥品查核單、初查作業</span>
          </button>
          <button class="btn-role" @click="handleQuickLogin('AUDIT001', '義大醫院', '查核業務負責人(區院)')">
            <span class="role-title">查核業務負責人 (區院)</span>
            <span class="role-desc">單據覆核、退回與流程管理</span>
          </button>
          <button class="btn-role" @click="handleQuickLogin('MGR-EDA-A', '義大醫院', '藥劑部區院主管/部長')">
            <span class="role-title">藥劑部主管 / 部長</span>
            <span class="role-desc">查閱各院區季報表與結案統計</span>
          </button>
          <button class="btn-role" @click="handleQuickLogin('WARD3B', '義大醫院', '受核單位窗口(主管)')">
            <span class="role-title">受核單位窗口 (病房主管)</span>
            <span class="role-desc">接收異常通知、填寫改善追蹤報告</span>
          </button>
        </div>
      </div>

    </div>
  </div>
</div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { mockHospitals } from '../mock/login'

const router = useRouter()
const hospitals = structuredClone(mockHospitals)

// 表單綁定變數
const selectedHospital = ref('義大醫院')
const username = ref('')

// 模擬後端帳號規則自動判定角色 (關鍵邏輯)
const computedRole = computed(() => {
const user = username.value.trim().toLowerCase()
if (!user) return ''

if (user.includes('ph') || user.includes('pharmacist')) {
  return '藥師'
} else if (user.includes('audit') || user.includes('leader')) {
  return '查核業務負責人(區院)'
} else if (user.includes('boss') || user.includes('admin') || user.includes('director')) {
  return '藥劑部區院主管/部長'
} else if (user.includes('ward') || user.includes('nurse')) {
  return '受核單位窗口(主管)'
}
// 預設給個一般藥師
return '藥師 (自動識別)'
})

// 處理真實登入按鈕點擊
const handleRealLogin = () => {
if (!username.value.trim()) {
  alert('請輸入員工編號 / 帳號進行身份識別')
  return
}

const finalRole = computedRole.value
sessionStorage.setItem('userHospital', selectedHospital.value)
sessionStorage.setItem('userRole', finalRole)
sessionStorage.setItem('username', username.value.trim())
sessionStorage.setItem('userName', username.value.trim() || finalRole)

alert(`🔓 登入成功！\n系統自動判定為：[${selectedHospital.value}] - [${finalRole}]`)
router.push('/news')
}

// 處理右側快捷一鍵登入
const handleQuickLogin = (account, defaultHospital, roleLabel) => {
sessionStorage.setItem('userHospital', defaultHospital)
sessionStorage.setItem('userRole', roleLabel)
sessionStorage.setItem('username', account)
sessionStorage.setItem('userName', account)
router.push('/news')
}
</script>

<style scoped>
/* 背景與外框 */
.login-bg {
width: 100vw;
height: 100vh;
background: linear-gradient(135deg, #eef2f7 0%, #d9e2ec 100%);
display: flex;
justify-content: center;
align-items: center;
font-family: system-ui, -apple-system, sans-serif;
}
.login-container {
background: #ffffff;
padding: 40px;
border-radius: 16px;
box-shadow: 0 10px 40px rgba(0,0,0,0.06);
width: 960px; /* 拉寬容納雙欄 */
}

/* 標頭樣式 */
.login-header {
text-align: center;
margin-bottom: 30px;
border-bottom: 1px solid #edf2f7;
padding-bottom: 20px;
}
.brand-title {
display: flex;
align-items: center;
justify-content: center;
gap: 10px;
}
.hospital-logo { font-size: 26px; }
.brand-text { display: flex; flex-direction: column; text-align: left; }
.company { font-size: 15px; font-weight: bold; color: #486581; }
.en { font-size: 10px; color: #627D98; letter-spacing: 0.5px; }
.system-title { font-size: 28px; color: #102A43; margin: 12px 0 6px 0; font-weight: 700; }
.version { color: #11caa0; }
.demo-badge { display: inline-block; background: #E1F9F5; color: #11caa0; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; }

/* 左右雙欄佈局 */
.login-content-grid {
display: grid;
grid-template-columns: 1fr 1fr;
gap: 40px;
}

h3 { font-size: 18px; color: #102A43; margin: 0 0 6px 0; font-weight: 600; }
.subtitle-hint { font-size: 12px; color: #627D98; margin: 0 0 20px 0; }

/* 左側真實表單 */
.login-box-real {
border-right: 1px solid #edf2f7;
padding-right: 20px;
}
.form-group {
margin-bottom: 16px;
}
.form-group label {
display: block;
font-size: 13px;
font-weight: 600;
color: #486581;
margin-bottom: 6px;
}
.input-field {
width: 100%;
padding: 12px;
border: 1px solid #D9E2EC;
border-radius: 8px;
font-size: 14px;
box-sizing: border-box;
color: #334e68;
}
.input-field:focus {
outline: none;
border-color: #005088;
}
.input-field.disabled {
background-color: #f0f4f8;
color: #9fb3c8;
cursor: not-allowed;
}

/* 自動識別角色的 Badge */
.role-detect-badge {
background-color: #e6fffa;
border: 1px solid #b2f5ea;
color: #008170;
padding: 10px;
border-radius: 6px;
font-size: 13px;
margin-bottom: 16px;
}

.btn-primary {
width: 100%;
padding: 14px;
background-color: #005088;
color: #ffffff;
border: none;
border-radius: 8px;
font-size: 16px;
font-weight: 600;
cursor: pointer;
transition: background 0.2s;
}
.btn-primary:hover { background-color: #0a3a60; }

/* 右側快捷按鈕群 */
.quick-roles-list {
display: flex;
flex-direction: column;
gap: 12px;
}
.btn-role {
width: 100%;
padding: 12px 16px;
background: #ffffff;
border: 1px solid #D9E2EC;
border-radius: 8px;
text-align: left;
cursor: pointer;
transition: all 0.2s;
display: flex;
flex-direction: column;
gap: 2px;
}
.btn-role:hover {
border-color: #11caa0;
background: #f0fdfa;
transform: translateX(3px);
}
.role-title { font-size: 14px; font-weight: 600; color: #102A43; }
.role-desc { font-size: 11px; color: #627D98; }
</style>