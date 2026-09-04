<template>
  <header class="app-header">
    <div class="header-left">
      <div class="system-name">常備藥品查核系統 <span class="version">2.0</span></div>
      <span class="divider">/</span>
      <div class="page-title">{{ pageTitle }}</div>
    </div>

    <div class="header-right">
      <span class="hospital">📍 {{ hospital }}</span>
      <span class="divider">｜</span>
      <span class="role">👤 {{ displayName }} · {{ role }}</span>
      <button class="logout-btn" @click="logout">登出</button>
    </div>
  </header>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const hospital = ref('義大醫院')
const role = ref('藥師')
const displayName = ref('未登入')

const pageTitles = {
  '/news': '藥劑最新資訊',
  '/initial-audit': '藥師初查',
  '/audit-form': '查核表',
  '/audit-record-confirm': '查核紀錄確認',
  '/approval': '簽核作業',
  '/unit-overview': '受查單位總覽',
  '/reports/periodic': '季報表、年報表查詢',
  '/reports/closed': '結案報表查詢',
  '/admin/roles': '角色管理',
  '/admin/users': '使用者管理',
  '/admin/workflow': '簽核流程管理',
  '/admin/unit-config': '受查單位配置',
  '/settings/items': '查核項目、頻率管理',
  '/settings/units': '受查單位管理',
  '/settings/ambulance': '急救車查核管理'
}

const pageTitle = computed(() => {
  if (pageTitles[route.path]) return pageTitles[route.path]
  if (route.path.startsWith('/audit-form')) return '查核表'
  if (route.path.startsWith('/audit-record-confirm')) return '查核紀錄確認'
  return '系統首頁'
})

onMounted(() => {
  hospital.value = sessionStorage.getItem('userHospital') || '義大醫院'
  role.value = sessionStorage.getItem('userRole') || '藥師'
  displayName.value = sessionStorage.getItem('userName') || sessionStorage.getItem('username') || role.value
})

const logout = () => {
  router.push('/login')
}
</script>

<style scoped>
.app-header {
  height: 64px;
  flex: 0 0 64px;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-sizing: border-box;
}
.header-left,
.header-right {
  display: flex;
  align-items: center;
}
.header-left { gap: 12px; min-width: 0; }
.system-name {
  color: #102a43;
  font-size: 16px;
  font-weight: 700;
  white-space: nowrap;
}
.version {
  color: #718096;
  font-size: 12px;
  font-weight: 600;
}
.divider { color: #cbd5e0; }
.page-title {
  color: #627d98;
  font-size: 14px;
  white-space: nowrap;
}
.header-right {
  gap: 8px;
  color: #102a43;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
}
.hospital { color: #627d98; }
.role { color: #102a43; }
.logout-btn {
  margin-left: 12px;
  padding: 6px 12px;
  border: 1px solid #cbd5e0;
  border-radius: 6px;
  background: #fff;
  color: #4a5568;
  cursor: pointer;
}
.logout-btn:hover {
  background: #f7fafc;
  color: #005088;
}
</style>
