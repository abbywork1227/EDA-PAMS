import { reactive } from 'vue'

export const auditStore = reactive({
  pageInfo: {},

  structuredItems: [],

  controlledDrugList: [],

  ambulances: [],

  isNurseSigned: false,
  auditStatuses: {},
  lastSubmittedRecord: null,

  setAuditStatus(key, status) {
    this.auditStatuses[key] = status
  },

  clear() {
    this.pageInfo = {}
    this.structuredItems = []
    this.controlledDrugList = []
    this.ambulances = []
    this.isNurseSigned = false
    this.lastSubmittedRecord = null
  }
})