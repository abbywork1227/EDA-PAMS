<template>
<div class="app-layout">
  <Sidebar /> 
  
  <main class="main-content">
    <AppHeader />
    <div class="page-view">
      <router-view />
    </div>
  </main>
</div>
</template>

<script setup>
import Sidebar from '../components/Sidebar.vue'
import AppHeader from '../components/AppHeader.vue'

</script>

<style scoped>
.app-layout { display: flex; height: 100vh; overflow: hidden; }
.main-content { flex: 1; display: flex; flex-direction: column; background: #f5f7f9; }
.page-view { flex: 1; padding: 24px; overflow-y: auto; }
</style>