<template>
  <section class="page">
    <div class="page-head">
      <div>
        <div class="breadcrumb">管理維護作業 / 受查單位配置</div>
        <h1>受查單位配置</h1>
        <p>從藥師角度批次配置負責的受查單位；與「受查單位管理」共用同一份配置資料。</p>
      </div>
      <div class="head-badge">目前配置 {{ selectedCount }} 個單位</div>
    </div>

    <div class="workspace">
      <aside class="pharmacist-panel card">
        <div class="card-title"><span>查核藥師</span><span class="count">{{ pharmacists.length }} 人</span></div>
        <div class="search-box"><span>⌕</span><input v-model="pharmacistKeyword" placeholder="搜尋藥師姓名或帳號" /></div>
        <button v-for="user in filteredPharmacists" :key="user.id" class="pharmacist-row" :class="{ active: selectedPharmacist?.id === user.id }" @click="selectPharmacist(user)">
          <span class="avatar">{{ user.name.slice(0,1) }}</span>
          <span class="user-info"><strong>{{ user.name }}</strong><small>{{ user.account }} · {{ hospitalMap[user.hospitalId] }}</small></span>
          <span class="assigned-count">{{ countByPharmacist(user.id) }} 個</span>
        </button>
      </aside>

      <main class="config-panel">
        <div class="card toolbar-card">
          <div class="selected-user">
            <span class="avatar large">{{ selectedPharmacist?.name?.slice(0,1) }}</span>
            <div><strong>{{ selectedPharmacist?.name }}</strong><span>{{ hospitalMap[selectedPharmacist?.hospitalId] }} · {{ selectedPharmacist?.account }}</span></div>
          </div>
          <div class="toolbar-actions">
            <label class="field compact"><span>院區</span><select v-model="selectedHospitalId" :disabled="!selectedPharmacist"><option v-for="h in availableHospitals" :key="h.id" :value="h.id">{{ h.name }}</option></select></label>
            <button class="ghost" @click="selectAllVisible">{{ allVisibleSelected ? '取消全選' : '全選目前顯示' }}</button>
          </div>
        </div>

        <div class="card units-card">
          <div class="units-head">
            <div><h2>受查單位</h2><span>{{ selectedHospitalName }} · {{ filteredUnits.length }} 個單位</span></div>
            <div class="filters"><button :class="{ on: unitFilter === 'all' }" @click="unitFilter='all'">全部</button><button :class="{ on: unitFilter === 'assigned' }" @click="unitFilter='assigned'">目前負責</button><button :class="{ on: unitFilter === 'unassigned' }" @click="unitFilter='unassigned'">尚未配置</button></div>
          </div>
          <div class="unit-search"><span>⌕</span><input v-model="unitKeyword" placeholder="搜尋單位代碼或單位名稱" /></div>

          <div class="unit-list">
            <div v-if="filteredUnits.length === 0" class="empty">沒有符合條件的單位</div>
            <label v-for="unit in filteredUnits" :key="unit.id" class="unit-row">
              <input type="checkbox" :checked="selectedUnitIds.includes(unit.id)" @change="toggleUnit(unit.id)" />
              <span class="unit-code">{{ unit.id }}</span>
              <span class="unit-name"><strong>{{ unit.name }}</strong><small>{{ unit.type }}</small></span>
              <span class="current-owner" :class="{ mine: ownerId(unit.id) === selectedPharmacist?.id }">{{ ownerName(unit.id) || '尚未配置' }}</span>
            </label>
          </div>

          <div class="save-bar">
            <span>已選擇 <b>{{ selectedCount }}</b> 個單位</span>
            <div><button class="ghost" @click="resetSelection">取消變更</button><button class="primary" @click="saveConfig">儲存配置</button></div>
          </div>
        </div>
      </main>
    </div>
    <div v-if="message" class="toast">{{ message }}</div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import { mockService } from '../../mock/mockService'
import { mockHospitals, mockUsers } from '../../mock/users'
import { mockUnits } from '../../mock/units'

const hospitalMap = Object.fromEntries(mockHospitals.map(h => [h.id, h.name]))
const pharmacists = mockUsers.filter(u => u.roleId === 'PHARMACIST' && u.enabled)
const selectedPharmacist = ref(pharmacists[0] || null)
const selectedHospitalId = ref(selectedPharmacist.value?.hospitalId || mockHospitals[0]?.id || '')
const pharmacistKeyword = ref('')
const unitKeyword = ref('')
const unitFilter = ref('all')
const selectedUnitIds = ref([])
const message = ref('')

const availableHospitals = computed(() => mockHospitals.filter(h => h.id === selectedPharmacist.value?.hospitalId))
const selectedHospitalName = computed(() => hospitalMap[selectedHospitalId.value] || '')
const filteredPharmacists = computed(() => {
  const q = pharmacistKeyword.value.trim().toLowerCase()
  return !q ? pharmacists : pharmacists.filter(u => [u.name, u.account].some(v => String(v).toLowerCase().includes(q)))
})
const rows = computed(() => mockUnits.filter(u => u.hospitalId === selectedHospitalId.value && u.enabled))
const filteredUnits = computed(() => {
  const q = unitKeyword.value.trim().toLowerCase()
  return rows.value.filter(unit => {
    const matchesSearch = !q || [unit.id, unit.name, unit.type].some(v => String(v).toLowerCase().includes(q))
    const mine = ownerId(unit.id) === selectedPharmacist.value?.id
    const matchesFilter = unitFilter.value === 'all' || (unitFilter.value === 'assigned' && mine) || (unitFilter.value === 'unassigned' && !ownerId(unit.id))
    return matchesSearch && matchesFilter
  })
})
const selectedCount = computed(() => selectedUnitIds.value.length)
const allVisibleSelected = computed(() => filteredUnits.value.length > 0 && filteredUnits.value.every(u => selectedUnitIds.value.includes(u.id)))

const ownerId = (unitId) => mockService.units.getConfig(unitId)?.pharmacistId || ''
const ownerName = (unitId) => {
  const id = ownerId(unitId)
  return pharmacists.find(u => u.id === id)?.name || ''
}
const countByPharmacist = (id) => mockUnits.filter(u => u.hospitalId === selectedHospitalId.value && ownerId(u.id) === id).length

const loadSelection = () => {
  selectedUnitIds.value = mockUnits.filter(u => u.hospitalId === selectedHospitalId.value && ownerId(u.id) === selectedPharmacist.value?.id).map(u => u.id)
}
const selectPharmacist = (user) => {
  selectedPharmacist.value = user
  selectedHospitalId.value = user.hospitalId
  unitFilter.value = 'all'
  unitKeyword.value = ''
  loadSelection()
}
const toggleUnit = (unitId) => {
  selectedUnitIds.value = selectedUnitIds.value.includes(unitId) ? selectedUnitIds.value.filter(id => id !== unitId) : [...selectedUnitIds.value, unitId]
}
const selectAllVisible = () => {
  const ids = filteredUnits.value.map(u => u.id)
  selectedUnitIds.value = allVisibleSelected.value ? selectedUnitIds.value.filter(id => !ids.includes(id)) : [...new Set([...selectedUnitIds.value, ...ids])]
}
const resetSelection = loadSelection
const saveConfig = () => {
  const hospitalUnitIds = rows.value.map(u => u.id)
  hospitalUnitIds.forEach(unitId => {
    mockService.units.updateConfig(unitId, { pharmacistId: selectedUnitIds.value.includes(unitId) ? selectedPharmacist.value.id : (ownerId(unitId) === selectedPharmacist.value.id ? '' : ownerId(unitId)) })
  })
  message.value = `${selectedPharmacist.value.name} 的受查單位配置已儲存`
  window.setTimeout(() => { message.value = '' }, 2200)
}
loadSelection()
</script>

<style scoped>
.page{padding:28px 32px 40px;min-height:100%;box-sizing:border-box;background:#f7f8fa;color:#374151}.page-head{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:22px}.breadcrumb{font-size:14px;color:#8a94a6;margin-bottom:7px}h1{margin:0;font-size:30px;color:#20242b}.page-head p{margin:7px 0 0;color:#7b8492;font-size:15px}.head-badge{padding:9px 14px;border-radius:9px;background:#eef6f2;color:#29704d;font-size:14px;font-weight:700}.workspace{display:grid;grid-template-columns:300px minmax(0,1fr);gap:18px;max-width:1320px;margin:auto}.card{background:#fff;border:1px solid #e7e9ee;border-radius:12px;box-shadow:0 2px 8px rgba(15,23,42,.04)}.pharmacist-panel{padding:18px}.card-title{display:flex;justify-content:space-between;font-weight:800;color:#252b35;margin-bottom:14px}.count{font-size:13px;color:#9099a8;font-weight:600}.search-box,.unit-search{height:40px;border:1px solid #e0e4ea;border-radius:8px;display:flex;align-items:center;padding:0 11px;gap:8px;background:#fff;margin-bottom:12px}.search-box span,.unit-search span{font-size:20px;color:#9aa2ae}.search-box input,.unit-search input{border:0;outline:0;width:100%;font-size:14px}.pharmacist-row{width:100%;border:1px solid transparent;background:#fff;border-radius:9px;padding:11px 8px;display:flex;align-items:center;gap:10px;text-align:left;cursor:pointer;margin-bottom:5px}.pharmacist-row:hover{background:#f7f9fb}.pharmacist-row.active{background:#f0f6f3;border-color:#cce2d7}.avatar{width:36px;height:36px;border-radius:50%;display:grid;place-items:center;background:#edf1f5;color:#4e5968;font-weight:800;flex:none}.avatar.large{width:44px;height:44px}.user-info{display:flex;flex-direction:column;min-width:0;flex:1}.user-info strong{font-size:14px;color:#252b35}.user-info small,.selected-user span{font-size:12px;color:#8b95a3;margin-top:2px}.assigned-count{font-size:12px;color:#667085;white-space:nowrap}.toolbar-card{padding:15px 18px;display:flex;justify-content:space-between;align-items:center;margin-bottom:18px}.selected-user{display:flex;align-items:center;gap:11px}.selected-user div{display:flex;flex-direction:column}.selected-user strong{font-size:17px;color:#20252d}.toolbar-actions{display:flex;align-items:end;gap:10px}.field{display:flex;flex-direction:column;gap:5px}.field span{font-size:12px;color:#788292}.field select{height:38px;border:1px solid #dfe3e8;border-radius:7px;padding:0 28px 0 10px;background:#fff;font-size:14px}.units-card{overflow:hidden}.units-head{display:flex;justify-content:space-between;align-items:center;padding:19px 20px 12px}.units-head h2{margin:0 0 3px;font-size:18px;color:#272d36}.units-head span{font-size:13px;color:#8b95a3}.filters{display:flex;gap:4px}.filters button,.ghost{border:1px solid #e0e4ea;background:#fff;color:#626d7c;border-radius:7px;padding:8px 11px;font-size:13px;cursor:pointer}.filters button.on{background:#eef5f2;color:#276d4b;border-color:#cfe0d7}.unit-search{margin:0 20px 10px}.unit-list{border-top:1px solid #edf0f3}.unit-row{min-height:58px;display:grid;grid-template-columns:32px 80px minmax(150px,1fr) 150px;align-items:center;gap:8px;padding:0 20px;border-bottom:1px solid #f0f2f5;cursor:pointer}.unit-row:hover{background:#fafbfc}.unit-row input{width:17px;height:17px}.unit-code{font-weight:800;color:#354052}.unit-name{display:flex;flex-direction:column}.unit-name strong{font-size:14px;color:#343b46}.unit-name small{font-size:12px;color:#9aa2ae;margin-top:2px}.current-owner{font-size:13px;color:#8d96a4;text-align:right}.current-owner.mine{color:#2d7954;font-weight:700}.save-bar{display:flex;justify-content:space-between;align-items:center;padding:14px 20px;background:#fafbfc;color:#697386;font-size:14px}.save-bar b{color:#252b35}.save-bar div{display:flex;gap:8px}.primary{border:0;border-radius:7px;background:#315e4a;color:#fff;padding:9px 16px;font-weight:700;cursor:pointer}.toast{position:fixed;right:28px;bottom:28px;background:#24332c;color:#fff;padding:12px 17px;border-radius:9px;box-shadow:0 8px 24px rgba(0,0,0,.16);font-size:14px}.empty{padding:50px;text-align:center;color:#9aa2ae}@media(max-width:900px){.workspace{grid-template-columns:1fr}.page-head{align-items:flex-start;gap:15px;flex-direction:column}.toolbar-card{align-items:flex-start;gap:15px;flex-direction:column}.unit-row{grid-template-columns:28px 60px 1fr}.current-owner{display:none}}
</style>
