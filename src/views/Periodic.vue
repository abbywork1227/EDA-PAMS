<template>
  <div class="bi-page">
    <div class="page-head">
      <div>
        <div class="eyebrow">BI / 統計分析</div>
        <h1>季報表、年報表查詢</h1>
        <p>依查核原始資料動態統計；下方查詢條件會同步套用至所有分析區塊</p>
      </div>
    </div>

    <div class="report-tabs">
      <button :class="['report-tab', { active: activeTab === 'progress' }]" @click="switchTab('progress')">查核進度總覽</button>
      <button :class="['report-tab', { active: activeTab === 'analysis' }]" @click="switchTab('analysis')">統計分析</button>
    </div>

    <UnitOverview v-if="activeTab === 'progress'" />

    <template v-else>
    <section class="query-panel">
      <div class="query-title">
        <div>
          <h2>報表查詢條件</h2>
          <p>先選擇統計範圍，再查看下方合格率與缺失分析</p>
        </div>
        <span class="query-hint">目前篩選：{{ filterSummary }}</span>
      </div>
      <div class="filters">
        <select v-model="period">
          <option value="month">月</option>
          <option value="quarter">季</option>
          <option value="year">年</option>
        </select>
        <select v-model.number="year">
          <option v-for="y in years" :key="y" :value="y">{{ y }} 年</option>
        </select>
        <select v-if="period === 'month'" v-model.number="month">
          <option v-for="m in 12" :key="m" :value="m">{{ m }} 月</option>
        </select>
        <select v-if="period === 'quarter'" v-model.number="quarter">
          <option v-for="q in 4" :key="q" :value="q">第 {{ q }} 季</option>
        </select>
        <select v-model="hospitalId">
          <option value="">全部院區</option>
          <option value="EDA">義大醫院</option>
          <option value="ECM">義大癌醫</option>
          <option value="DACHANG">大昌醫院</option>
          <option value="PINGTUNG">屏東醫院</option>
        </select>
        <select v-model="unitType">
          <option value="">全部單位類型</option>
          <option v-for="x in unitTypes" :key="x" :value="x">{{ x }}</option>
        </select>
        <select v-model="unitKey">
          <option value="">全部受查單位</option>
          <option v-for="x in unitOptions" :key="x.key" :value="x.key">{{ x.unitId }} {{ x.unitName }}｜{{ x.hospitalName }}</option>
        </select>
        <select v-model="category">
          <option value="">全部查核類別（A～G）</option>
          <option v-for="x in categories" :key="x.code" :value="x.code">{{ x.code }} {{ x.name }}</option>
        </select>
      </div>
    </section>

    <div class="summary-grid">
      <div class="summary-card">
        <span>初評合格率</span>
        <strong>{{ data.summary.initialPassRate }}%</strong>
        <small>初評 OK / 實際查核</small>
      </div>
      <div class="summary-card accent">
        <span>複評合格率</span>
        <strong>{{ data.summary.reviewPassRate }}%</strong>
        <small>結案前最後結果</small>
      </div>
      <div class="summary-card">
        <span>查核完成率</span>
        <strong>{{ data.summary.completionRate }}%</strong>
        <small>{{ data.summary.auditCount }} / {{ data.summary.plannedCount }} 筆</small>
      </div>
      <div class="summary-card warning">
        <span>缺失單位數</span>
        <strong>{{ data.summary.defectUnitCount }}</strong>
        <small>至少有 1 項 NG 的單位</small>
      </div>
    </div>

    <div class="two-col top-analysis">
      <section class="panel">
        <div class="panel-head">
          <div>
            <h2>查核單位類型分布</h2>
            <p>目前期間實際查核單位占比</p>
          </div>
        </div>
        <div class="distribution-wrap">
          <div class="pie-chart" :style="pieStyle"><span>{{ distributionTotal }}<small> 個單位</small></span></div>
          <div class="pie-legend">
            <div v-for="x in data.unitDistribution" :key="x.unitType" class="pie-legend-row">
              <i :class="`legend-${x.unitType}`"></i><span>{{ x.unitType }}</span><b>{{ x.count }} 個（{{ x.percentage }}%）</b>
            </div>
          </div>
        </div>
      </section>

      <section class="panel">
        <div class="panel-head">
          <div>
            <h2>單位合格率</h2>
            <p>整體＋門／急／住／醫技，並區分初評與複評</p>
          </div>
          <span class="period-tag">{{ periodLabel }}</span>
        </div>
        <div class="rate-chart">
          <div class="rate-legend">
            <span><i class="dot initial"></i>初評</span>
            <span><i class="dot review"></i>複評</span>
          </div>
          <div v-for="x in data.unitTypeStats" :key="x.unitType" class="rate-row">
            <div class="rate-name">{{ x.unitType }}</div>
            <div class="dual-bars">
              <div class="bar-track"><i class="bar initial" :style="{ width: `${x.initialPassRate}%` }"></i></div>
              <div class="bar-track"><i class="bar review" :style="{ width: `${x.reviewPassRate}%` }"></i></div>
            </div>
            <div class="rate-values"><b>{{ x.initialPassRate }}%</b><b>{{ x.reviewPassRate }}%</b></div>
          </div>
        </div>
      </section>
    </div>

    <section class="panel">
      <div class="panel-head trend-head">
        <div>
          <h2>年度／月份合格率趨勢</h2>
          <p>目前依「{{ period === 'month' ? '月份' : period === 'quarter' ? '季度' : '年度' }}」顯示趨勢：{{ period === 'month' ? '1～12 月' : period === 'quarter' ? 'Q1～Q4' : '年度趨勢' }}</p>
        </div>

      </div>
      <div class="trend-legend">
        <span><i class="dot initial"></i>初評</span>
        <span><i class="dot review"></i>複評</span>
      </div>
      <div class="trend-chart">
        <div v-for="x in data.trend" :key="x.month" class="trend-item">
          <div class="trend-values">
            <span>{{ x.initialPassRate }}%</span>
            <span>{{ x.reviewPassRate }}%</span>
          </div>
          <div class="trend-track">
            <i class="trend-bar initial" :style="{ height: `${Math.max(x.initialPassRate, 4)}%` }"></i>
            <i class="trend-bar review" :style="{ height: `${Math.max(x.reviewPassRate, 4)}%` }"></i>
          </div>
          <small>{{ x.month }}</small>
        </div>
      </div>
    </section>

    <section class="panel">
      <div class="panel-head">
        <div>
          <h2>各查核大類單位合格率</h2>
          <p>統計對象為「接受該大類查核的單位」；三個百分比彼此不是加總 100%</p>
        </div>
      </div>
      <div class="category-grid">
        <div v-for="x in data.categoryStats" :key="x.category" class="category-card">
          <div class="category-title"><b>{{ x.category }}</b><span>{{ x.categoryName }}</span></div>
          <div class="category-number">{{ x.auditCount }} <small>筆查核</small></div>
          <div class="category-line"><span>初評</span><b>{{ x.initialPassRate }}%</b></div>
          <div class="category-line"><span>複評</span><b>{{ x.reviewPassRate }}%</b></div>
          <div class="category-line"><span>缺失單位占比</span><b>{{ x.affectedUnitRate }}%</b></div>
        </div>
      </div>
    </section>

    <section class="panel">
      <div class="panel-head">
        <div>
          <h2>單位缺失分析</h2>
          <p>依單位看初評／複評合格率與缺失數，協助找出需要改善的單位</p>
        </div>
      </div>
      <table>
        <thead><tr><th>院區</th><th>單位</th><th>類型</th><th>查核次數</th><th>初評</th><th>複評</th><th>A</th><th>B</th><th>C</th><th>D</th><th>E</th><th>缺失數</th></tr></thead>
        <tbody>
          <tr v-for="x in data.defectAnalysis.units" :key="`${x.hospitalId}-${x.unitId}`">
            <td>{{ x.hospitalName }}</td><td>{{ x.unitName }}</td><td>{{ x.unitType }}</td><td>{{ x.auditCount }}</td>
            <td>{{ x.initialPassRate }}%</td><td>{{ x.reviewPassRate }}%</td>
            <td>{{ x.categories?.A || 0 }}</td><td>{{ x.categories?.B || 0 }}</td><td>{{ x.categories?.C || 0 }}</td><td>{{ x.categories?.D || 0 }}</td><td>{{ x.categories?.E || 0 }}</td>
            <td><button class="link-btn" @click="showUnitDefects(x, `${x.hospitalName}｜${x.unitId} ${x.unitName}`)"><b>{{ x.defectCount }}</b> 個｜查看</button></td>
          </tr>
        <tr v-if="data.defectAnalysis.units.length" class="total-row"><td colspan="11"><b>總計</b></td><td><b>{{ defectUnitTotal }}</b></td></tr>
        </tbody>
      </table>
    </section>


    <div class="two-col">
      <section class="panel">
        <div class="panel-head">
          <div>
            <h2>缺失大類排行</h2>
            <p>依缺失筆數排序，可再往細項分析</p>
          </div>
        </div>
        <table>
          <thead><tr><th>排名</th><th>類別</th><th>缺失筆數</th><th>影響單位</th><th>缺失單位占比</th></tr></thead>
          <tbody>
            <tr v-for="(x, i) in data.defectAnalysis.category" :key="x.category">
              <td>{{ i + 1 }}</td><td>{{ x.category }} {{ x.categoryName }}</td><td>{{ x.defectCount }}</td><td><button class="link-btn" @click="showAffectedUnits(x, `${x.category} ${x.categoryName}`)">{{ x.affectedUnitCount }} 個｜查看</button></td><td>{{ x.affectedUnitRate }}%</td>
            </tr>
            <tr v-if="data.defectAnalysis.category.length" class="total-row"><td colspan="2"><b>總計</b></td><td><b>{{ defectCategoryTotal }}</b></td><td>—</td><td>—</td></tr>
            <tr v-if="!data.defectAnalysis.category.length"><td colspan="5" class="empty">此範圍無缺失</td></tr>
          </tbody>
        </table>
      </section>


      <section class="panel defect-item-panel">
        <div class="panel-head">
          <div>
            <h2>缺失查核項目排行</h2>
            <p>直接由每筆查核項目結果統計，依缺失數由高至低排列</p>
          </div>
          <span class="period-tag">共 {{ data.defectAnalysis.item.length }} 項</span>
        </div>
        <div class="table-scroll">
          <table>
            <thead><tr><th>排名</th><th>查核項目</th><th>缺失筆數</th><th>影響單位</th></tr></thead>
            <tbody>
              <tr v-for="(x, i) in pagedDefectItems" :key="`${x.category}-${x.itemCode}`">
                <td>{{ defectItemPage * defectItemPageSize + i + 1 }}</td>
                <td><span class="item-category">{{ x.category }}</span> <b>{{ x.itemCode }}</b> {{ x.itemText }}</td>
                <td>{{ x.defectCount }}</td>
                <td><button class="link-btn" @click="showAffectedUnits(x, `${x.category} ${x.itemCode} ${x.itemText}`)">{{ x.affectedUnitCount }} 個｜查看</button></td>
              </tr>
              <tr v-if="data.defectAnalysis.item.length" class="total-row"><td colspan="2"><b>總計</b></td><td><b>{{ defectItemTotal }}</b></td><td>—</td></tr>
              <tr v-if="!data.defectAnalysis.item.length"><td colspan="4" class="empty">此範圍無缺失</td></tr>
            </tbody>
          </table>
        </div>
        <div v-if="defectItemPageCount > 1" class="pagination">
          <button :disabled="defectItemPage === 0" @click="defectItemPage--">‹</button>
          <span>第 {{ defectItemPage + 1 }} / {{ defectItemPageCount }} 頁</span>
          <button :disabled="defectItemPage >= defectItemPageCount - 1" @click="defectItemPage++">›</button>
        </div>
      </section>

    </div>

    <div v-if="affectedModal.open" class="modal-backdrop" @click.self="affectedModal.open = false">
      <div class="affected-modal">
        <div class="modal-head">
          <div><h3>{{ affectedModal.mode === 'units' ? '影響單位' : '單位缺失項目' }}</h3><p>{{ affectedModal.title }}</p></div>
          <button class="close-btn" @click="affectedModal.open = false">×</button>
        </div>

        <template v-if="affectedModal.mode === 'units'">
          <div class="modal-summary">共 {{ affectedModal.units.length }} 個影響單位，共 {{ affectedUnitDefectTotal }} 筆缺失</div>
          <table>
            <thead><tr><th>院區</th><th>單位類型</th><th>單位代碼</th><th>單位名稱</th><th>缺失數</th></tr></thead>
            <tbody>
              <tr v-for="u in affectedModal.units" :key="`${u.hospitalId}-${u.unitId}`">
                <td>{{ u.hospitalName }}</td><td>{{ u.unitType || '—' }}</td><td>{{ u.unitId }}</td><td><b>{{ u.unitName }}</b></td><td><b>{{ u.defectCount }}</b></td>
              </tr>
              <tr class="total-row"><td colspan="4"><b>總計</b></td><td><b>{{ affectedUnitDefectTotal }}</b></td></tr>
            </tbody>
          </table>
        </template>

        <template v-else>
          <div class="modal-summary">共 {{ affectedModal.items.length }} 項缺失，應與外部「缺失數」一致</div>
          <table>
            <thead><tr><th>#</th><th>查核大類</th><th>查核項目</th></tr></thead>
            <tbody>
              <tr v-for="(item, i) in affectedModal.items" :key="`${item.category}-${item.itemCode}-${i}`">
                <td>{{ i + 1 }}</td><td>{{ item.category }}</td><td><b>{{ item.itemCode }}</b> {{ item.itemText }}</td>
              </tr>
              <tr class="total-row"><td colspan="2"><b>總計</b></td><td><b>{{ affectedModal.items.length }}</b></td></tr>
            </tbody>
          </table>
        </template>
      </div>
    </div>
    </template>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { mockService } from '../mock/mockService'
import UnitOverview from './UnitOverview.vue'

const route = useRoute()
const router = useRouter()
const activeTab = ref(route.query.tab === 'progress' ? 'progress' : 'analysis')

const period = ref('year')
const year = ref(2026)
const month = ref(12)
const quarter = ref(4)
const hospitalId = ref('')
const unitType = ref('')
const unitKey = ref('')
const category = ref('')
const affectedModal = ref({ open: false, title: '', mode: 'units', units: [], items: [] })

const years = [2026, 2025, 2024, 2023, 2022, 2021]
const unitTypes = ['門診', '急診', '住院', '醫技']
const categories = [
  { code: 'A', name: '管制藥品' },
  { code: 'B', name: '一般常備藥品' },
  { code: 'C', name: '高警訊' },
  { code: 'D', name: '急救車' },
  { code: 'E', name: '冷藏' },
  { code: 'F', name: '自備藥' },
  { code: 'G', name: '其他' },
]

const unitOptions = computed(() => {
  const rows = mockService.auditRecords.getRaw()
    .filter(r => !hospitalId.value || r.hospitalId === hospitalId.value)
    .filter(r => !unitType.value || r.unitType === unitType.value)
  const map = new Map()
  rows.forEach(r => {
    const key = `${r.hospitalId}|${r.unitId}`
    if (!map.has(key)) map.set(key, { key, hospitalId: r.hospitalId, unitId: r.unitId, unitName: r.unitName, unitType: r.unitType, hospitalName: r.hospitalName })
  })
  return [...map.values()].sort((a, b) => `${a.hospitalName}${a.unitId}`.localeCompare(`${b.hospitalName}${b.unitId}`, 'zh-Hant'))
})

const selectedUnit = computed(() => unitOptions.value.find(x => x.key === unitKey.value) || null)

const filters = computed(() => ({
  period: period.value,
  year: year.value,
  month: period.value === 'month' ? month.value : null,
  quarter: period.value === 'quarter' ? quarter.value : null,
  hospitalId: hospitalId.value || null,
  unitType: unitType.value || null,
  unitId: selectedUnit.value?.unitId || null,
  unitHospitalId: selectedUnit.value?.hospitalId || null,
  category: category.value || null,
}))

const data = computed(() => mockService.bi.getDashboard(filters.value))
const defectItemPage = ref(0)
const defectItemPageSize = 10
const defectItemPageCount = computed(() => Math.max(1, Math.ceil(data.value.defectAnalysis.item.length / defectItemPageSize)))
const pagedDefectItems = computed(() => data.value.defectAnalysis.item.slice(defectItemPage.value * defectItemPageSize, (defectItemPage.value + 1) * defectItemPageSize))
watch(filters, () => { defectItemPage.value = 0 }, { deep: true })
watch([hospitalId, unitType], () => {
  if (unitKey.value && !unitOptions.value.some(x => x.key === unitKey.value)) unitKey.value = ''
})
watch(() => route.query.tab, (tab) => {
  activeTab.value = tab === 'progress' ? 'progress' : 'analysis'
})

function switchTab(tab) {
  activeTab.value = tab
  router.replace({ query: { ...route.query, tab: tab === 'progress' ? 'progress' : undefined } })
}

watch(defectItemPageCount, () => {
  if (defectItemPage.value >= defectItemPageCount.value) defectItemPage.value = Math.max(0, defectItemPageCount.value - 1)
})


const defectCategoryTotal = computed(() => data.value.defectAnalysis.category.reduce((sum, x) => sum + x.defectCount, 0))
const defectItemTotal = computed(() => data.value.defectAnalysis.item.reduce((sum, x) => sum + x.defectCount, 0))
const defectUnitTotal = computed(() => data.value.defectAnalysis.units.reduce((sum, x) => sum + x.defectCount, 0))
const affectedUnitDefectTotal = computed(() => affectedModal.value.units.reduce((sum, x) => sum + (x.defectCount || 0), 0))
const distributionTotal = computed(() => data.value.unitDistribution.reduce((sum, x) => sum + x.count, 0))
const pieStyle = computed(() => {
  let start = 0
  const segments = data.value.unitDistribution.map((x, i) => {
    const end = start + x.percentage
    const segment = `${pieColors[i % pieColors.length]} ${start}% ${end}%`
    start = end
    return segment
  })
  return { background: segments.length ? `conic-gradient(${segments.join(', ')})` : '#edf1f3' }
})
const pieColors = ['#5f8f88', '#8aa6b8', '#d7a85f', '#9a8fb0']
const filterSummary = computed(() => `${periodLabel.value}・${hospitalId.value || '全部院區'}・${unitType.value || '全部單位類型'}・${selectedUnit.value ? `${selectedUnit.value.unitId} ${selectedUnit.value.unitName}` : '全部受查單位'}・${category.value || '全部查核類別'}`)

function showAffectedUnits(row, title) {
  affectedModal.value = { open: true, title, mode: 'units', units: row.affectedUnits || [], items: [] }
}

function showUnitDefects(row, title) {
  affectedModal.value = { open: true, title, mode: 'items', units: [], items: row.defectItems || [] }
}

const periodLabel = computed(() => {
  if (period.value === 'month') return `${year.value} / ${month.value}`
  if (period.value === 'quarter') return `${year.value} / Q${quarter.value}`
  return `${year.value} 全年`
})
</script>

<style scoped>
.bi-page{min-height:100vh;padding:24px;background:#f4f7fa;color:#1f2937}
.page-head{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;margin-bottom:18px}
.eyebrow{font-size:12px;color:#64748b;letter-spacing:.08em;margin-bottom:5px}
.page-head h1{margin:0 0 5px;font-size:24px}
.page-head p,.panel-head p{margin:0;color:#64748b;font-size:13px}
.report-tabs{display:flex;gap:4px;margin-bottom:12px;border-bottom:1px solid #dbe4ee}.report-tab{border:1px solid transparent;border-bottom:0;background:transparent;padding:11px 18px;border-radius:8px 8px 0 0;color:#64748b;font-weight:700;cursor:pointer}.report-tab:hover{background:#f8fafc}.report-tab.active{background:#fff;color:#005088;border-color:#dbe4ee;position:relative;bottom:-1px}.query-panel{background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:16px 18px;margin-bottom:14px;box-shadow:0 1px 2px #00000008}.query-title{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:12px}.query-title h2{margin:0 0 4px;font-size:15px}.query-title p{margin:0;color:#64748b;font-size:12px}.query-hint{font-size:12px;color:#64748b;background:#f8fafc;border:1px solid #e8edf1;border-radius:999px;padding:6px 10px}.filters{display:flex;flex-wrap:wrap;gap:8px;justify-content:flex-start}
.filters select{min-width:105px;border:1px solid #d8e0e7;border-radius:8px;background:#fff;padding:9px 11px;color:#334155}
.summary-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:14px}
.summary-card{background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:17px;box-shadow:0 1px 2px #00000008}
.summary-card span{font-size:13px;color:#64748b}.summary-card strong{display:block;font-size:29px;margin:8px 0 3px}.summary-card small{color:#94a3b8}.summary-card.accent strong{color:#256f67}.summary-card.warning strong{color:#b45309}
.total-row td{background:#f8fafc;border-top:2px solid #cbd5e1}.total-row b{font-weight:800}.panel{background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:18px;margin-bottom:14px;box-shadow:0 1px 2px #00000008}
.panel-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:16px}.panel h2{font-size:17px;margin:0 0 4px}.period-tag{font-size:12px;padding:5px 9px;border:1px solid #dbe3e8;border-radius:999px;color:#64748b}
.rate-legend{display:flex;gap:18px;margin-bottom:10px;font-size:12px;color:#64748b}.rate-legend span{display:flex;align-items:center;gap:6px}.dot{width:8px;height:8px;border-radius:50%;display:inline-block}.dot.initial{background:#64748b}.dot.review{background:#2c8c82}
.rate-row{display:grid;grid-template-columns:60px 1fr 105px;gap:12px;align-items:center;margin:13px 0}.rate-name{font-size:14px}.dual-bars{display:grid;gap:6px}.bar-track{height:12px;background:#edf1f3;border-radius:8px;overflow:hidden}.bar{display:block;height:100%;border-radius:8px}.bar.initial{background:#94a3b8}.bar.review{background:#2c8c82}.rate-values{display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:12px}.rate-values b{text-align:right}
.two-col{display:grid;grid-template-columns:1fr 1fr;gap:14px}.top-analysis{align-items:stretch}.trend-legend{display:flex;gap:18px;margin:0 0 8px;font-size:12px;color:#64748b}.trend-legend span{display:flex;align-items:center;gap:6px}
.trend-chart{height:225px;display:flex;align-items:end;gap:7px;padding:8px 4px 0}.trend-item{flex:1;height:100%;display:flex;flex-direction:column;justify-content:end;align-items:center;gap:5px;min-width:0}.trend-values{display:flex;flex-direction:column;font-size:9px;color:#64748b;line-height:1.15}.trend-track{height:165px;width:100%;display:flex;align-items:end;justify-content:center;gap:3px;background:linear-gradient(to top,transparent 24.5%,#eef2f4 25%,transparent 25.5%,transparent 49.5%,#eef2f4 50%,transparent 50.5%,transparent 74.5%,#eef2f4 75%,transparent 75.5%)}.trend-bar{width:12px;max-width:34%;min-height:4px;border-radius:4px 4px 0 0}.trend-bar.initial{background:#94a3b8}.trend-bar.review{background:#2c8c82}.trend-item small{font-size:10px;color:#64748b}
.distribution-wrap{display:flex;align-items:center;justify-content:center;gap:28px;min-height:220px}.pie-chart{width:175px;height:175px;border-radius:50%;display:grid;place-items:center;flex:0 0 auto}.pie-chart span{width:92px;height:92px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;flex-direction:column;font-size:23px;font-weight:800;box-shadow:0 1px 5px #00000012}.pie-chart small{font-size:11px;color:#64748b;font-weight:400;margin-top:2px}.pie-legend{min-width:180px}.pie-legend-row{display:grid;grid-template-columns:12px 1fr auto;gap:8px;align-items:center;margin:13px 0;font-size:12px}.pie-legend-row i{width:10px;height:10px;border-radius:50%;display:block}.legend-門診{background:#5f8f88}.legend-急診{background:#8aa6b8}.legend-住院{background:#d7a85f}.legend-醫技{background:#9a8fb0}.pie-legend-row b{font-weight:600;color:#475569}
.category-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.category-card{border:1px solid #e5eaf0;border-radius:10px;padding:14px}.category-title{display:flex;gap:7px;align-items:center}.category-title b{font-size:17px}.category-title span{font-size:12px;color:#64748b}.category-number{font-size:20px;font-weight:700;margin:12px 0}.category-number small{font-size:11px;font-weight:400;color:#94a3b8}.category-line{display:flex;justify-content:space-between;padding-top:8px;margin-top:8px;border-top:1px solid #f0f2f4;font-size:12px}.category-line span{color:#64748b}
.link-btn{border:0;background:transparent;padding:0;color:#256f67;cursor:pointer;font-weight:600}.link-btn:hover{text-decoration:underline}.item-category{display:inline-block;font-size:11px;padding:2px 5px;border-radius:4px;background:#eef5f4;color:#256f67;margin-right:3px}.modal-backdrop{position:fixed;inset:0;background:#00000045;display:flex;align-items:center;justify-content:center;padding:20px;z-index:50}.affected-modal{width:min(720px,100%);max-height:80vh;overflow:auto;background:#fff;border-radius:14px;padding:20px;box-shadow:0 16px 50px #00000025}.modal-head{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;margin-bottom:12px}.modal-head h3{margin:0 0 4px;font-size:18px}.modal-head p{margin:0;color:#64748b;font-size:13px}.close-btn{border:0;background:#f1f5f9;border-radius:8px;width:32px;height:32px;font-size:22px;cursor:pointer;color:#475569}.modal-summary{background:#f8fafc;border-radius:8px;padding:9px 11px;margin-bottom:12px;font-size:13px;color:#475569}table{width:100%;border-collapse:collapse}th,td{padding:10px 8px;border-bottom:1px solid #edf1f3;text-align:left;font-size:13px;vertical-align:top}th{background:#f8fafc;color:#475569;font-weight:600}.empty{text-align:center;color:#94a3b8;padding:20px}
@media(max-width:1100px){.query-title{flex-direction:column}.distribution-wrap{gap:18px}.summary-grid{grid-template-columns:repeat(2,1fr)}.category-grid{grid-template-columns:repeat(2,1fr)}.page-head{flex-direction:column}.filters{justify-content:flex-start}}
@media(max-width:760px){.summary-grid,.two-col{grid-template-columns:1fr}.category-grid{grid-template-columns:1fr}.rate-row{grid-template-columns:48px 1fr 90px}}

.trend-head{align-items:flex-start}
.trend-switch{display:flex;gap:6px;flex-shrink:0}
.trend-switch button{border:1px solid #cbd5dc;background:#fff;border-radius:7px;padding:6px 14px;font-weight:700;color:#5b6770;cursor:pointer}
.trend-switch button.active{background:#2f7f78;color:#fff;border-color:#2f7f78}
.pagination{display:flex;justify-content:center;align-items:center;gap:14px;padding-top:12px}
.pagination button{width:32px;height:30px;border:1px solid #cbd5dc;background:#fff;border-radius:6px;cursor:pointer;font-size:18px}
.pagination button:disabled{opacity:.4;cursor:not-allowed}
.table-scroll{overflow-x:auto}
.defect-item-panel table{min-width:760px}
.dot.initial{background:#2f80ed !important}
.dot.review{background:#e67e22 !important}
.bar.initial,.trend-bar.initial{background:#2f80ed !important}
.bar.review,.trend-bar.review{background:#e67e22 !important}

.trend-head{align-items:flex-start}
</style>
