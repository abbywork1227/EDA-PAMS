<template>
  <aside class="sidebar-container">
    <div class="logo-area">
      <div class="logo-placeholder" @click="goToLogin" title="返回展示入口">
        <span class="logo-icon">🌐</span>
        <div class="logo-text">
          <span class="brand">億威電子</span>
          <span class="abbr">EMMT</span>
        </div>
      </div>
    </div>

    <nav class="menu-list">
    <router-link to="/news" class="menu-item">藥劑最新資訊</router-link>
      <router-link to="/initial-audit" class="menu-item">藥師初查</router-link>
      <router-link to="/approval" class="menu-item">簽核作業</router-link>
      <router-link to="/reports/periodic?tab=progress" class="menu-item"
        >單位查核總覽</router-link
      >

      <div class="menu-group" :class="{ 'is-open': openGroups.reports }">
        <div class="group-header" @click="toggleGroup('reports')">
          <span>查核報表</span>
          <span class="arrow-icon">▼</span>
        </div>
        <div class="sub-menu">
          <router-link to="/reports/periodic" class="sub-item"
            >季報表、年報表查詢</router-link
          >
          <router-link to="/reports/closed" class="sub-item"
            >結案報表查詢</router-link
          >
        </div>
      </div>

      <div
        v-if="currentRole !== '藥師'"
        class="menu-group"
        :class="{ 'is-open': openGroups.admin }"
      >
        <div class="group-header" @click="toggleGroup('admin')">
          <span>管理維護作業</span>
          <span class="arrow-icon">▼</span>
        </div>
        <div class="sub-menu">
          <router-link to="/admin/roles" class="sub-item">角色管理</router-link>
          <router-link to="/admin/users" class="sub-item"
            >使用者管理</router-link
          >
          <router-link to="/admin/workflow" class="sub-item"
            >簽核流程管理</router-link
          >
          <router-link to="/admin/unit-config" class="sub-item"
            >受查單位配置</router-link
          >
        </div>
      </div>

      <div
        v-if="currentRole !== '藥師'"
        class="menu-group"
        :class="{ 'is-open': openGroups.settings }"
      >
        <div class="group-header" @click="toggleGroup('settings')">
          <span>系統設定</span>
          <span class="arrow-icon">▼</span>
        </div>
        <div class="sub-menu">
          <router-link to="/settings/items" class="sub-item"
            >查核項目、頻率管理</router-link
          >
          <router-link to="/settings/units" class="sub-item"
            >受查單位管理</router-link
          >
          <router-link to="/settings/ambulance" class="sub-item"
            >急救車查核管理</router-link
          >
        </div>
      </div>
    </nav>
  </aside>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
// 儲存目前登入的角色
const currentRole = ref('藥師');

onMounted(() => {
  // 從 sessionStorage 撈取登入時選擇的角色，預設為 '藥師'
  currentRole.value = sessionStorage.getItem('userRole') || '藥師';
});

const goToLogin = () => {
  router.push('/login')
}

// 控制哪些子群組預設是要展開的
const openGroups = reactive({
  reports: true,
  admin: true,
  settings: true,
});

const toggleGroup = (groupName) => {
  openGroups[groupName] = !openGroups[groupName];
};
</script>

<style scoped>
/* 保持原本的 CSS 樣式不變 */
.sidebar-container {
  width: 296px;
  height: 100vh;
  background-color: #ffffff;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  font-family: system-ui, -apple-system, sans-serif;
}
.logo-area {
  padding: 24px 20px;
  border-bottom: 1px solid #edf2f7;
}
.logo-placeholder {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer; /* 💡 讓滑鼠移上去時變成手勢，提醒這可以點擊 */
}
.logo-icon {
  font-size: 28px;
}
.logo-text {
  display: flex;
  flex-direction: column;
}
.brand {
  font-size: 20px;
  font-weight: bold;
  color: #1a202c;
  letter-spacing: 1px;
}
.abbr {
  font-size: 11px;
  color: #718096;
  font-weight: 600;
}
.menu-list {
  flex: 1;
  padding: 16px 0;
  overflow-y: auto;
}
.menu-item {
  display: block;
  padding: 14px 24px;
  color: #2d3748;
  text-decoration: none;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}
.menu-item:hover {
  background-color: #f7fafc;
  color: #005088;
}
.menu-item.router-link-active {
  background-color: #e2f0fd;
  color: #005088;
  font-weight: 600;
}
.menu-group {
  margin-bottom: 4px;
}
.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 24px;
  color: #2d3748;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
}
.group-header:hover {
  background-color: #f7fafc;
}
.arrow-icon {
  font-size: 10px;
  color: #a0aec0;
  transition: transform 0.2s ease;
}
.is-open .arrow-icon {
  transform: rotate(180deg);
}
.sub-menu {
  display: none;
  padding-left: 44px;
  position: relative;
}
.is-open .sub-menu {
  display: block;
}
.sub-menu::before {
  content: '';
  position: absolute;
  left: 32px;
  top: 0;
  bottom: 16px;
  width: 1px;
  background-color: #e2e8f0;
}
.sub-item {
  display: block;
  padding: 10px 0;
  color: #4a5568;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s ease;
}
.sub-item:hover {
  color: #005088;
}
.sub-item.router-link-active {
  color: #005088;
  font-weight: 600;
}
</style>
