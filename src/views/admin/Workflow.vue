<template>
  <section class="workflow-page">
    <div class="page-header">
      <div>
        <h1>簽核流程管理</h1>
        <p>依院區設定簽核關卡與簽核人員；各受查單位直接套用所屬院區流程。</p>
      </div>
      <div class="header-badge">共 {{ hospitals.length }} 個院區</div>
    </div>

    <div class="workflow-layout">
      <!-- 左側：院區 -->
      <aside class="card hospital-panel">
        <div class="panel-title">
          <div>
            <h2>院區</h2>
            <p>選擇要設定的院區</p>
          </div>
        </div>

        <div class="hospital-list">
          <button
            v-for="hospital in hospitals"
            :key="hospital.id"
            class="hospital-item"
            :class="{ active: selectedHospitalId === hospital.id }"
            @click="selectHospital(hospital.id)"
          >
            <span class="hospital-dot" :class="{ off: !hospitalConfig(hospital.id)?.enabled }"></span>
            <span class="hospital-info">
              <strong>{{ hospital.name }}</strong>
              <small>{{ hospitalConfig(hospital.id)?.enabled ? '簽核流程已啟用' : '簽核流程未啟用' }}</small>
            </span>
            <span class="hospital-arrow">›</span>
          </button>
        </div>
      </aside>

      <!-- 右側：設定 + 流程預覽 -->
      <main v-if="config" class="right-content">
        <section class="card settings-card">
          <div class="card-heading">
            <div>
              <span class="eyebrow">目前設定院區</span>
              <h2>{{ currentHospital?.name }}</h2>
            </div>
            <div class="enabled-control">
              <span>啟用本院區簽核流程</span>
              <label class="switch">
                <input v-model="form.enabled" type="checkbox" />
                <span class="slider"></span>
              </label>
              <b :class="form.enabled ? 'on' : 'off'">{{ form.enabled ? '啟用' : '停用' }}</b>
            </div>
          </div>

          <div class="settings-grid">
            <div class="person-setting">
              <label>查核業務負責人</label>
              <select v-model="form.businessOwnerId" class="form-select">
                <option value="">請選擇查核業務負責人</option>
                <option v-for="user in businessOwners" :key="user.id" :value="user.id">
                  {{ user.name }}{{ user.unit ? `｜${user.unit}` : '' }}
                </option>
              </select>
              <small>此人為該院區固定的查核業務負責人。</small>
            </div>

            <div class="person-setting">
              <label>藥劑部部長</label>
              <select v-model="form.pharmacyManagerId" class="form-select">
                <option value="">請選擇藥劑部部長</option>
                <option v-for="user in managers" :key="user.id" :value="user.id">
                  {{ user.name }}{{ user.unit ? `｜${user.unit}` : '' }}
                </option>
              </select>
              <small>固定最終審核關卡。</small>
            </div>

            <div class="area-setting">
              <div class="area-toggle-row">
                <div>
                  <label>院區主管審核</label>
                  <small>各院區可自行決定是否加入此關卡。</small>
                </div>
                <label class="switch">
                  <input v-model="form.areaManagerEnabled" type="checkbox" />
                  <span class="slider"></span>
                </label>
                <b :class="form.areaManagerEnabled ? 'on' : 'off'">{{ form.areaManagerEnabled ? '啟用' : '不啟用' }}</b>
              </div>

              <select
                v-if="form.areaManagerEnabled"
                v-model="form.areaManagerId"
                class="form-select"
              >
                <option value="">請選擇院區主管</option>
                <option v-for="user in managers" :key="user.id" :value="user.id">
                  {{ user.name }}{{ user.unit ? `｜${user.unit}` : '' }}
                </option>
              </select>
              <div v-else class="disabled-hint">未啟用院區主管關卡，案件將直接送部長審核。</div>
            </div>
          </div>

          <div v-if="form.areaManagerEnabled && form.areaManagerId === form.pharmacyManagerId && form.areaManagerId" class="warning">
            ⚠️ 院區主管與部長目前選到同一人，請確認是否符合該院區實際流程。
          </div>

          <div class="action-bar">
            <button class="btn secondary" @click="resetForm">重設</button>
            <button class="btn primary" @click="saveConfig">儲存院區流程設定</button>
          </div>
        </section>

        <section class="card preview-card">
          <div class="preview-header">
            <div>
              <span class="eyebrow">流程預覽</span>
              <h2>{{ currentHospital?.name }}案件怎麼跑</h2>
            </div>
            <span class="live-tag" :class="{ disabled: !form.enabled }">{{ form.enabled ? '啟用中' : '未啟用' }}</span>
          </div>

          <div class="flow-section">
            <div class="flow-title">
              <h3>一般查核／無改善案件</h3>
              <span>一般案件完成查核後依院區設定往下簽</span>
            </div>
            <div class="flow-scroll">
              <div class="flow-track">
                <template v-for="(step, index) in normalFlow" :key="step.key">
                  <div class="flow-node" :class="{ optional: step.optional }">
                    <span class="node-index">{{ index + 1 }}</span>
                    <div class="node-content">
                      <strong>{{ step.title }}</strong>
                      <small>{{ step.person }}</small>
                    </div>
                    <em v-if="step.optional">可選</em>
                  </div>
                  <div v-if="index < normalFlow.length - 1" class="flow-arrow">→</div>
                </template>
              </div>
            </div>
          </div>

          <div class="flow-divider"></div>

          <div class="flow-section">
            <div class="flow-title">
              <h3>NG／改善案件</h3>
              <span>NG 案件先由窗口改善，再回到原查核藥師複查</span>
            </div>
            <div class="flow-scroll">
              <div class="flow-track">
                <template v-for="(step, index) in ngFlow" :key="step.key">
                  <div class="flow-node" :class="{ special: step.special, optional: step.optional }">
                    <span class="node-index">{{ index + 1 }}</span>
                    <div class="node-content">
                      <strong>{{ step.title }}</strong>
                      <small>{{ step.person }}</small>
                    </div>
                    <em v-if="step.optional">可選</em>
                  </div>
                  <div v-if="index < ngFlow.length - 1" class="flow-arrow">→</div>
                </template>
              </div>
            </div>
          </div>

          <div class="preview-note">
            <div><b>流程原則</b><span>查核表本身不需要窗口簽章，也不需要藥師覆核；只有 NG 案件會增加「窗口改善 → 藥師複查」。</span></div>
            <div><b>案件套用</b><span>同一院區的受查單位不另外設定流程，直接依本院區設定執行。</span></div>
          </div>
        </section>
      </main>
    </div>
  </section>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { mockHospitals } from '../../mock/users'
import { mockService } from '../../mock/mockService'

const hospitals = mockHospitals
const selectedHospitalId = ref(hospitals[0]?.id || '')
const config = computed(() => mockService.workflow.get(selectedHospitalId.value))
const currentHospital = computed(() => hospitals.find(item => item.id === selectedHospitalId.value))

const form = reactive({
  enabled: true,
  businessOwnerId: '',
  areaManagerEnabled: false,
  areaManagerId: '',
  pharmacyManagerId: '',
})

const hospitalConfig = (hospitalId) => mockService.workflow.get(hospitalId)
const businessOwners = computed(() => mockService.users.getByHospitalAndRole(selectedHospitalId.value, 'AUDIT_OWNER'))
const managers = computed(() => mockService.users.getByHospitalAndRole(selectedHospitalId.value, 'PHARMACY_MANAGER'))
const userName = (id, fallback = '尚未設定') => mockService.users.get(id)?.name || fallback

const copyConfigToForm = () => {
  const value = config.value
  Object.assign(form, {
    enabled: value?.enabled !== false,
    businessOwnerId: value?.businessOwnerId || '',
    areaManagerEnabled: Boolean(value?.areaManagerEnabled),
    areaManagerId: value?.areaManagerId || '',
    pharmacyManagerId: value?.pharmacyManagerId || '',
  })
}

const selectHospital = (hospitalId) => {
  selectedHospitalId.value = hospitalId
  copyConfigToForm()
}

copyConfigToForm()

const normalFlow = computed(() => {
  const list = [
    { key: 'pharmacist', title: '藥師初查', person: '原填表藥師' },
    { key: 'business', title: '查核業務負責人', person: userName(form.businessOwnerId) },
  ]
  if (form.areaManagerEnabled) {
    list.push({ key: 'area', title: '院區主管審核', person: userName(form.areaManagerId), optional: true })
  }
  list.push({ key: 'manager', title: '藥劑部部長', person: userName(form.pharmacyManagerId) })
  list.push({ key: 'closed', title: '結案', person: '系統自動結案' })
  return list
})

const ngFlow = computed(() => [
  { key: 'pharmacist', title: '藥師初查', person: '原填表藥師' },
  { key: 'contact', title: '受查單位窗口改善', person: '本次案件指定窗口', special: true },
  { key: 'recheck', title: '藥師複查', person: '原查核藥師' },
  { key: 'business', title: '查核業務負責人', person: userName(form.businessOwnerId) },
  ...(form.areaManagerEnabled ? [{ key: 'area', title: '院區主管審核', person: userName(form.areaManagerId), optional: true }] : []),
  { key: 'manager', title: '藥劑部部長', person: userName(form.pharmacyManagerId) },
  { key: 'closed', title: '結案', person: '系統自動結案' },
])

const resetForm = () => copyConfigToForm()

const saveConfig = () => {
  if (!form.businessOwnerId || !form.pharmacyManagerId) {
    alert('請先設定查核業務負責人與藥劑部部長。')
    return
  }
  if (form.areaManagerEnabled && !form.areaManagerId) {
    alert('已啟用院區主管審核，請選擇院區主管。')
    return
  }
  mockService.workflow.update(selectedHospitalId.value, {
    enabled: form.enabled,
    businessOwnerId: form.businessOwnerId,
    areaManagerEnabled: form.areaManagerEnabled,
    areaManagerId: form.areaManagerId,
    pharmacyManagerId: form.pharmacyManagerId,
  })
  alert(`「${currentHospital.value?.name}」簽核流程設定已儲存。`)
}
</script>

<style scoped>
.workflow-page{min-height:100%;padding:28px;background:#f5f7fb;box-sizing:border-box;color:#24364b}
.page-header{display:flex;justify-content:space-between;align-items:flex-end;gap:20px;margin-bottom:18px}
.page-header h1{margin:0 0 8px;font-size:26px;color:#17365d}.page-header p{margin:0;color:#70839a;font-size:14px}
.header-badge{padding:8px 13px;border-radius:999px;background:#edf5fb;color:#2b6a95;font-size:13px;white-space:nowrap}
.card{background:#fff;border:1px solid #dce5ee;border-radius:16px;box-shadow:0 2px 8px rgba(30,55,80,.05)}
.workflow-layout{display:grid;grid-template-columns:260px minmax(0,1fr);gap:18px;align-items:start}
.hospital-panel{padding:14px;position:sticky;top:20px}.panel-title{padding:4px 6px 12px;border-bottom:1px solid #edf1f5}.panel-title h2{margin:0;font-size:17px;color:#203b56}.panel-title p{margin:4px 0 0;color:#8797a7;font-size:12px}
.hospital-list{display:flex;flex-direction:column;gap:6px;padding-top:8px}.hospital-item{width:100%;display:flex;align-items:center;gap:10px;padding:14px 10px;border:1px solid transparent;background:#fff;border-radius:11px;text-align:left;cursor:pointer;color:#52677d}.hospital-item:hover{background:#f7fafc}.hospital-item.active{background:#e8f2fb;border-color:#bfd8ec;color:#14558a}.hospital-dot{width:9px;height:9px;flex:0 0 9px;border-radius:50%;background:#2c9a72}.hospital-dot.off{background:#aab7c4}.hospital-info{min-width:0;display:flex;flex-direction:column;gap:4px}.hospital-info strong{font-size:14px}.hospital-info small{font-size:11px;color:#8192a3}.hospital-item.active .hospital-info small{color:#4e7798}.hospital-arrow{margin-left:auto;font-size:22px;color:#91a2b3}
.right-content{display:flex;flex-direction:column;gap:18px;min-width:0}.settings-card{padding:22px 24px}.card-heading{display:flex;justify-content:space-between;align-items:center;gap:20px;padding-bottom:17px;border-bottom:1px solid #edf1f5}.eyebrow{display:block;color:#8293a4;font-size:12px;margin-bottom:4px}.card-heading h2,.preview-header h2{margin:0;color:#173b5c;font-size:21px}.enabled-control{display:flex;align-items:center;gap:10px;color:#536a80;font-size:13px}.enabled-control b,.area-toggle-row b{font-size:12px}.on{color:#248565}.off{color:#9aa8b5}
.switch{position:relative;display:inline-flex;width:42px;height:24px;flex:0 0 42px}.switch input{opacity:0;width:0;height:0}.slider{position:absolute;inset:0;background:#cbd5df;border-radius:20px;cursor:pointer;transition:.2s}.slider:before{content:'';position:absolute;width:18px;height:18px;left:3px;top:3px;background:#fff;border-radius:50%;box-shadow:0 1px 3px rgba(0,0,0,.2);transition:.2s}.switch input:checked+.slider{background:#2d8c82}.switch input:checked+.slider:before{transform:translateX(18px)}
.settings-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px 20px;padding-top:18px}.person-setting label,.area-setting label{display:block;margin-bottom:7px;font-weight:700;font-size:14px;color:#30485e}.form-select{width:100%;min-height:43px;padding:0 12px;border:1px solid #cfdbe7;border-radius:9px;background:#fff;color:#2b4055;font-size:14px;box-sizing:border-box}.person-setting small,.area-toggle-row small{display:block;margin-top:6px;color:#8494a4;font-size:11px}.area-setting{grid-column:1/-1;padding:15px;border:1px solid #dbe5ed;border-radius:11px;background:#fbfcfd}.area-toggle-row{display:flex;align-items:center;gap:12px}.area-toggle-row>div{flex:1}.area-toggle-row label{margin:0}.area-setting .form-select{margin-top:12px}.disabled-hint{margin-top:10px;padding:9px 11px;border-radius:8px;background:#f3f5f7;color:#8795a2;font-size:12px}.warning{margin-top:14px;color:#8c6800;background:#fff8e5;padding:9px 11px;border-radius:8px;font-size:12px}.action-bar{display:flex;justify-content:flex-end;gap:10px;padding-top:18px;margin-top:18px;border-top:1px solid #edf1f5}.btn{border:0;border-radius:9px;padding:10px 18px;font-size:14px;cursor:pointer}.btn.primary{background:#1769a8;color:#fff}.btn.secondary{background:#eef2f6;color:#50657a}
.preview-card{padding:22px 24px;min-width:0}.preview-header{display:flex;justify-content:space-between;align-items:center;gap:15px}.live-tag{padding:6px 11px;border-radius:999px;background:#eaf7f2;color:#278362;font-size:12px}.live-tag.disabled{background:#f0f2f4;color:#8795a2}.flow-section{margin-top:20px}.flow-title{display:flex;align-items:baseline;gap:10px;margin-bottom:11px}.flow-title h3{margin:0;color:#2a4057;font-size:16px}.flow-title span{color:#8a99a8;font-size:11px}.flow-scroll{width:100%;overflow-x:auto;padding-bottom:7px}.flow-track{display:flex;align-items:center;min-width:max-content;padding:2px 2px}.flow-node{width:155px;min-height:70px;box-sizing:border-box;display:flex;align-items:center;gap:9px;padding:10px;border:1px solid #cfe0ee;border-radius:10px;background:#fafdff;position:relative}.flow-node.optional{border-style:dashed;background:#f8fbff}.flow-node.special{border-color:#a8d9d1;background:#f1fbf9}.node-index{width:24px;height:24px;flex:0 0 24px;border-radius:50%;display:grid;place-items:center;background:#e5edf5;color:#506b84;font-size:12px;font-weight:700}.node-content{min-width:0}.node-content strong{display:block;font-size:13px;color:#2a425a;line-height:1.35}.node-content small{display:block;margin-top:4px;color:#7c8ea0;font-size:10px;line-height:1.35}.flow-node em{position:absolute;right:7px;top:6px;font-size:9px;color:#5f7fa0;font-style:normal;background:#edf4fb;padding:3px 5px;border-radius:999px}.flow-arrow{width:38px;flex:0 0 38px;text-align:center;color:#9aabb9;font-size:20px}.flow-divider{border-top:1px solid #edf1f5;margin:22px 0 2px}.preview-note{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:20px}.preview-note>div{padding:11px 13px;border-radius:10px;background:#f7fafc;color:#65788c;font-size:11px;line-height:1.6}.preview-note b{display:block;color:#435a70;margin-bottom:3px}
@media(max-width:900px){.workflow-layout{grid-template-columns:1fr}.hospital-panel{position:static}.hospital-list{display:grid;grid-template-columns:1fr 1fr}.settings-grid{grid-template-columns:1fr}.area-setting{grid-column:auto}.preview-note{grid-template-columns:1fr}}
@media(max-width:560px){.workflow-page{padding:16px}.hospital-list{grid-template-columns:1fr}.card-heading{align-items:flex-start;flex-direction:column}.enabled-control{width:100%}}
</style>
