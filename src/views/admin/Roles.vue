<template>
  <section class="page">
    <div class="page-head">
      <div>
        <div class="breadcrumb">管理維護作業 / 角色管理</div>
        <h1>角色管理</h1>
        <p>系統角色目前由系統固定定義，本頁提供角色與功能權限查看。</p>
      </div>
      <div class="badge">固定角色</div>
    </div>

    <div class="workspace">
      <aside class="card role-list">
        <div class="card-title">角色列表 <span>{{ roles.length }} 個</span></div>
        <button v-for="role in roles" :key="role.id" class="role-row" :class="{ active: selectedRole.id === role.id }" @click="selectedRole = role">
          <span class="role-icon">權</span>
          <span><strong>{{ role.name }}</strong><small>{{ role.permissions.length }} 項功能權限</small></span>
        </button>
      </aside>

      <main class="card permission-card">
        <div class="permission-head">
          <div><span class="label">角色名稱</span><h2>{{ selectedRole.name }}</h2></div>
          <span class="readonly">唯讀查看</span>
        </div>

        <div class="permission-grid">
          <div v-for="group in permissionGroups" :key="group.id" class="permission-group">
            <div class="group-title">{{ group.name }}</div>
            <label v-for="item in group.children" :key="item.id" class="permission-item">
              <input type="checkbox" :checked="hasPermission(item.id)" disabled />
              <span>{{ item.name }}</span>
            </label>
          </div>
        </div>

        <div class="notice">角色新增、刪除及權限調整目前不開放，由系統固定定義。</div>
      </main>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { mockPermissionGroups, mockRoles } from '../../mock/roles'

const roles = mockRoles
const permissionGroups = mockPermissionGroups
const selectedRole = ref(roles[0])
const hasPermission = (permissionId) => selectedRole.value.permissions.includes(permissionId)
</script>

<style scoped>
.page{padding:28px 32px 40px;min-height:100%;box-sizing:border-box;background:#f7f8fa;color:#20242b}.page-head{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:22px}.breadcrumb{font-size:14px;color:#8a94a6;margin-bottom:7px}h1{margin:0;font-size:30px}.page-head p{margin:7px 0 0;color:#7b8492;font-size:15px}.badge{padding:9px 14px;border-radius:9px;background:#eef5f2;color:#2d6d50;font-weight:700}.workspace{display:grid;grid-template-columns:310px minmax(0,1fr);gap:18px;max-width:1180px;margin:auto}.card{background:#fff;border:1px solid #e7e9ee;border-radius:12px;box-shadow:0 2px 8px rgba(15,23,42,.04)}.role-list{padding:18px}.card-title{font-weight:800;font-size:17px;margin-bottom:12px}.card-title span{float:right;color:#9aa2ae;font-size:13px;font-weight:600}.role-row{width:100%;border:1px solid transparent;background:#fff;border-radius:9px;padding:13px 10px;display:flex;align-items:center;gap:11px;text-align:left;cursor:pointer;margin-bottom:5px}.role-row:hover{background:#fafbfc}.role-row.active{background:#f0f6f3;border-color:#cce2d7}.role-icon{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:#edf1f5;color:#465363;font-size:12px;font-weight:800;flex:none}.role-row strong,.role-row small{display:block}.role-row strong{font-size:14px}.role-row small{font-size:12px;color:#9099a8;margin-top:3px}.permission-card{padding:24px}.permission-head{display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #edf0f3;padding-bottom:18px}.label{font-size:13px;color:#8b95a3}.permission-head h2{margin:5px 0 0;font-size:24px}.readonly{padding:7px 11px;border-radius:7px;background:#f4f5f7;color:#7c8592;font-size:13px}.permission-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;padding:22px 0}.permission-group{border:1px solid #edf0f3;border-radius:10px;padding:15px}.group-title{font-weight:800;margin-bottom:11px;color:#303743}.permission-item{display:flex;align-items:center;gap:9px;padding:8px 0;color:#4e5968}.permission-item input{width:17px;height:17px;accent-color:#315e4a}.notice{padding:12px 14px;background:#fafbfc;border-radius:8px;color:#7d8795;font-size:13px}@media(max-width:850px){.workspace{grid-template-columns:1fr}.permission-grid{grid-template-columns:1fr}.page{padding:20px}.page-head{align-items:flex-start;gap:12px;flex-direction:column}}
</style>
