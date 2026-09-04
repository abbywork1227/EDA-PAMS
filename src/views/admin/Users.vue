<template>
  <section class="page">
    <div class="page-head">
      <div>
        <div class="breadcrumb">管理維護作業 / 使用者管理</div>
        <h1>使用者管理</h1>
        <p>使用者由本系統自行維護；帳號統一使用員工工號。</p>
      </div>
      <button class="primary" @click="openCreate">＋ 新增使用者</button>
    </div>

    <div class="toolbar card">
      <div class="search"><span>⌕</span><input v-model="keyword" placeholder="搜尋工號、姓名、角色或單位" /></div>
      <div class="filters">
        <select v-model="hospitalFilter"><option value="">全部院區</option><option v-for="h in hospitals" :key="h.id" :value="h.id">{{ h.name }}</option></select>
        <select v-model="roleFilter"><option value="">全部角色</option><option v-for="role in roles" :key="role.id" :value="role.id">{{ role.name }}</option></select>
        <select v-model="enabledFilter"><option value="">全部狀態</option><option value="true">啟用</option><option value="false">停用</option></select>
      </div>
    </div>

    <div class="card table-card">
      <table>
        <thead><tr><th>帳號／工號</th><th>名稱</th><th>角色</th><th>院區</th><th>單位</th><th>是否啟用</th><th>功能</th></tr></thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user.id">
            <td class="account">{{ user.account }}</td>
            <td class="name">{{ user.name }}</td>
            <td>{{ roleName(user.roleId) }}</td>
            <td>{{ hospitalName(user.hospitalId) }}</td>
            <td>{{ user.unit || '—' }}</td>
            <td><span class="status" :class="user.enabled ? 'on' : 'off'">{{ user.enabled ? '開啟' : '停用' }}</span></td>
            <td class="actions"><button class="edit" @click="openEdit(user)">修改</button><button class="reset" @click="resetPassword(user)">重設密碼</button></td>
          </tr>
          <tr v-if="filteredUsers.length === 0"><td colspan="7" class="empty">沒有符合條件的使用者</td></tr>
        </tbody>
      </table>
    </div>

    <div class="note">初始密碼由系統統一設定；使用者登入後可自行變更密碼。若忘記密碼，請聯絡系統管理者協助重設。</div>
    <div v-if="message" class="toast">{{ message }}</div>

    <div v-if="showModal" class="modal-mask" @click.self="closeModal">
      <div class="modal">
        <div class="modal-head"><div><span class="kicker">使用者管理</span><h2>{{ editingId ? '編輯使用者' : '新增使用者' }}</h2></div><button class="close" @click="closeModal">×</button></div>
        <div class="modal-body">
          <label>帳號／工號*<input v-model="form.account" :disabled="!!editingId" placeholder="請輸入員工工號" /></label>
          <label>名稱*<input v-model="form.name" placeholder="請輸入姓名" /></label>
          <label>角色*<select v-model="form.roleId"><option v-for="role in roles" :key="role.id" :value="role.id">{{ role.name }}</option></select></label>
          <label>院區*<select v-model="form.hospitalId"><option v-for="h in hospitals" :key="h.id" :value="h.id">{{ h.name }}</option></select></label>
          <label>單位*<input v-model="form.unit" placeholder="例如：藥劑部、3A護理站" /></label>
          <div v-if="editingId" class="password-row"><span>密碼</span><button class="reset" @click="resetPasswordFromModal">重設密碼</button><small>使用者忘記密碼時，由系統管理者協助重設。</small></div>
          <label class="switch-row"><span>是否啟用*</span><input v-model="form.enabled" type="checkbox" /><b>{{ form.enabled ? '開啟' : '停用' }}</b></label>
        </div>
        <div class="modal-foot"><button class="ghost" @click="closeModal">取消</button><button class="primary" @click="saveUser">儲存</button></div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { mockHospitals, mockUsers } from '../../mock/users'
import { mockRoles } from '../../mock/roles'
import { mockService } from '../../mock/mockService'

const hospitals = mockHospitals
const roles = mockRoles
const users = mockUsers
const keyword = ref('')
const hospitalFilter = ref('')
const roleFilter = ref('')
const enabledFilter = ref('')
const showModal = ref(false)
const editingId = ref('')
const message = ref('')
const form = reactive({ account: '', name: '', roleId: 'PHARMACIST', hospitalId: hospitals[0]?.id || '', unit: '', enabled: true })

const roleName = id => roles.find(role => role.id === id)?.name || ''
const hospitalName = id => hospitals.find(h => h.id === id)?.name || ''
const filteredUsers = computed(() => {
  const q = keyword.value.trim().toLowerCase()
  return users.filter(user => {
    const haystack = [user.account, user.name, roleName(user.roleId), hospitalName(user.hospitalId), user.unit].join(' ').toLowerCase()
    return (!q || haystack.includes(q)) && (!hospitalFilter.value || user.hospitalId === hospitalFilter.value) && (!roleFilter.value || user.roleId === roleFilter.value) && (enabledFilter.value === '' || String(user.enabled) === enabledFilter.value)
  })
})
const resetForm = () => Object.assign(form, { account: '', name: '', roleId: 'PHARMACIST', hospitalId: hospitals[0]?.id || '', unit: '', enabled: true })
const openCreate = () => { editingId.value = ''; resetForm(); showModal.value = true }
const openEdit = user => { editingId.value = user.id; Object.assign(form, { account: user.account, name: user.name, roleId: user.roleId, hospitalId: user.hospitalId, unit: user.unit || '', enabled: user.enabled }); showModal.value = true }
const closeModal = () => { showModal.value = false }
const saveUser = () => {
  if (!form.account.trim() || !form.name.trim() || !form.roleId || !form.hospitalId || !form.unit.trim()) { alert('請完整填寫必填欄位'); return }
  if (editingId.value) {
    mockService.users.update(editingId.value, { name: form.name.trim(), roleId: form.roleId, hospitalId: form.hospitalId, unit: form.unit.trim(), enabled: form.enabled })
    message.value = '使用者資料已更新'
  } else {
    const created = mockService.users.create({ account: form.account.trim(), name: form.name.trim(), roleId: form.roleId, hospitalId: form.hospitalId, unit: form.unit.trim(), enabled: form.enabled })
    if (!created) { alert('帳號已存在，請確認工號'); return }
    message.value = '使用者已新增，初始密碼為系統預設密碼'
  }
  closeModal(); clearMessage()
}
const resetPassword = user => {
  if (!confirm(`確定要將「${user.name}」的密碼重設為系統初始密碼嗎？`)) return
  mockService.users.resetPassword(user.id); message.value = `${user.name} 的密碼已重設為系統初始密碼`; clearMessage()
}
const resetPasswordFromModal = () => { const user = mockService.users.get(editingId.value); if (user) resetPassword(user) }
const clearMessage = () => window.setTimeout(() => { message.value = '' }, 2200)
</script>

<style scoped>
.page{padding:28px 32px 40px;min-height:100%;box-sizing:border-box;background:#f7f8fa;color:#20242b}.page-head{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:22px}.breadcrumb{font-size:14px;color:#8a94a6;margin-bottom:7px}h1{margin:0;font-size:30px}.page-head p{margin:7px 0 0;color:#7b8492;font-size:15px}.primary,.edit,.reset,.ghost{border:0;border-radius:7px;padding:9px 15px;font-weight:700;cursor:pointer}.primary{background:#315e4a;color:#fff}.edit{background:#07519a;color:#fff}.reset{background:#a33a2b;color:#fff}.ghost{background:#fff;border:1px solid #dfe3e8;color:#667085}.toolbar{padding:15px 18px;display:flex;justify-content:space-between;gap:15px;margin-bottom:18px}.card{background:#fff;border:1px solid #e7e9ee;border-radius:12px;box-shadow:0 2px 8px rgba(15,23,42,.04)}.search{height:40px;border:1px solid #e0e4ea;border-radius:8px;display:flex;align-items:center;padding:0 11px;gap:8px;flex:1;max-width:520px}.search span{font-size:20px;color:#9aa2ae}.search input{border:0;outline:0;width:100%;font-size:14px}.filters{display:flex;gap:8px}.filters select{height:40px;border:1px solid #dfe3e8;border-radius:7px;background:#fff;padding:0 28px 0 10px}.table-card{overflow:auto}table{width:100%;border-collapse:collapse;min-width:920px}th,td{padding:16px 15px;border-bottom:1px solid #edf0f3;text-align:left;white-space:nowrap}th{font-size:15px;color:#4c5665;background:#fafbfc}td{font-size:14px;color:#4e5968}.account{color:#e43b43;font-weight:800}.name{font-weight:700;color:#252b35}.status{font-weight:700}.status.on{color:#2d7954}.status.off{color:#9a4b44}.actions{display:flex;gap:7px}.note{margin-top:12px;color:#7d8795;font-size:13px}.toast{position:fixed;right:28px;bottom:28px;background:#24332c;color:#fff;padding:12px 17px;border-radius:9px;box-shadow:0 8px 24px rgba(0,0,0,.16)}.modal-mask{position:fixed;inset:0;background:rgba(20,28,38,.42);display:flex;align-items:center;justify-content:center;padding:20px;z-index:20}.modal{width:min(620px,100%);background:#fff;border-radius:14px;box-shadow:0 18px 55px rgba(0,0,0,.22);overflow:hidden}.modal-head{display:flex;justify-content:space-between;align-items:center;padding:22px;border-bottom:1px solid #edf0f3}.kicker{font-size:13px;color:#8b95a3}.modal-head h2{margin:5px 0 0;font-size:24px}.close{border:0;background:none;font-size:28px;color:#87909d;cursor:pointer}.modal-body{padding:22px;display:grid;grid-template-columns:1fr 1fr;gap:16px}.modal-body label{display:flex;flex-direction:column;gap:7px;font-size:14px;font-weight:700;color:#4d5867}.modal-body input:not([type="checkbox"]),.modal-body select{height:42px;border:1px solid #a9d9ef;border-radius:7px;padding:0 12px;font-size:15px;box-sizing:border-box}.modal-body input:disabled{background:#f3f4f6;color:#7c8592}.password-row,.switch-row{grid-column:1/-1;display:flex;align-items:center;gap:10px}.password-row span,.switch-row span{font-weight:700}.password-row small{color:#8b95a3;font-weight:400}.switch-row input{width:18px;height:18px}.switch-row b{color:#2d7954}.modal-foot{display:flex;justify-content:flex-end;gap:8px;padding:15px 22px;background:#fafbfc}.empty{text-align:center!important;padding:40px!important;color:#9aa2ae}@media(max-width:900px){.toolbar{flex-direction:column}.filters{flex-wrap:wrap}.modal-body{grid-template-columns:1fr}.page{padding:20px}}
</style>
