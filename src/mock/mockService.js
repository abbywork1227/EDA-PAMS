// Mock Service：先統一資料取得介面，下一階段 UI 只需要改這一層即可由 Mock 切到真正 API。
import {
  getMockUserProfile,
  getUsersByHospitalAndRole,
  getMockUserById,
  createMockUser,
  updateMockUser,
  resetMockUserPassword,
  getMockUsers,
} from './users'
import { getHospitalAmbulancesByUnit } from './hospitalAmbulanceData'
import { getUnitById } from './units'
import { getUnitAssignment, updateUnitAssignment, getAssignmentsForPharmacist } from './unitAssignments'
import { getHospitalMedicationByUnit, getControlledDrugsByUnit, getRegularDrugsByUnit } from './hospitalMedicationData'
import { getAmbulanceConfig, updateAmbulancePosition } from './ambulance'
import { mockAuditFrequency, getFrequency, getFrequencyMonths } from './auditFrequency'
import { getAuditItemsByCategory, getAuditItemById } from './auditItems'
import { getApprovalRecords, getApprovalContext, approveApprovalRecord, rejectApprovalRecord, getApprovalDisplay, saveApprovalImprovement, recheckApprovalRecord } from './approvalRecords'
import { getWorkflowConfig, updateWorkflowConfig } from './workflow'
import { getCompletedAuditRecords, getAuditRecordById, mockAuditRecords } from './mockAuditRecords'
import { biMock } from './biDashboard'
import {
  getAuditAssignment,
  getAuditAssignmentByUnitMonth,
  getAuditAssignmentsForPharmacist,
  getAuditYearWindow,
} from './auditAssignments'

export const mockService = {
  bi: {
    getDashboard(filters = {}) { return biMock.getDashboard(filters) },
  },
  auth: {
    getUser(account) {
      return getMockUserProfile(account)
    },
  },
  users: {
    getByHospitalAndRole(hospitalId, roleId) {
      return getUsersByHospitalAndRole(hospitalId, roleId)
    },
    getAll() {
      return getMockUsers()
    },
    get(id) {
      return getMockUserById(id)
    },
    create(data) {
      return createMockUser(data)
    },
    update(id, changes) {
      return updateMockUser(id, changes)
    },
    resetPassword(id) {
      return resetMockUserPassword(id)
    },
  },
  units: {
    get(unitId) {
      return getUnitById(unitId)
    },
    getConfig(unitId) {
      return getUnitAssignment(unitId)
    },
    getAssignmentsForPharmacist(pharmacistId) {
      return getAssignmentsForPharmacist(pharmacistId)
    },
    updateConfig(unitId, changes) {
      return updateUnitAssignment(unitId, changes)
    },
    getMedication(unitId) {
      return getHospitalMedicationByUnit(unitId)
    },
    getControlledDrugs(unitId) {
      return getControlledDrugsByUnit(unitId)
    },
    getRegularDrugs(unitId) {
      return getRegularDrugsByUnit(unitId)
    },
    getHospitalAmbulances(unitId) {
      return getHospitalAmbulancesByUnit(unitId)
    },
  },
  ambulance: {
    get(typeId) {
      return getAmbulanceConfig(typeId)
    },
    updatePosition(typeId, position, changes) {
      return updateAmbulancePosition(typeId, position, changes)
    },
  },
  settings: {
    getFrequency(categoryId) {
      return getFrequency(categoryId)
    },
    getFrequencyMonths(categoryId) {
      return getFrequencyMonths(categoryId)
    },
    setFrequencyMonths(categoryId, months) {
      const frequency = mockAuditFrequency.find(item => item.categoryId === categoryId)
      if (!frequency) return null
      frequency.months = [...new Set(months)].sort((a, b) => a - b)
      frequency.name = frequency.months.length === 12 ? '每月' : frequency.months.length === 2 && frequency.months[0] === 6 && frequency.months[1] === 12 ? '半年' : `每年 ${frequency.months.join('、')} 月`
      return frequency
    },
    getAuditItems(categoryId) {
      return getAuditItemsByCategory(categoryId)
    },
    getAuditItem(id) {
      return getAuditItemById(id)
    },
  },
  workflow: {
    get(hospitalId) { return getWorkflowConfig(hospitalId) },
    update(hospitalId, changes) { return updateWorkflowConfig(hospitalId, changes) },
    getConfig(hospitalId) { return getWorkflowConfig(hospitalId) },
    updateConfig(hospitalId, changes) { return updateWorkflowConfig(hospitalId, changes) },
  },
  approval: {
    getAll() { return getApprovalRecords().map(getApprovalDisplay) },
    getContext(record, userId, roleId) { return getApprovalContext(record, userId, roleId) },
    approve(id, userId, suggestion) { return approveApprovalRecord(id, userId, suggestion) },
    reject(id, userId, suggestion) { return rejectApprovalRecord(id, userId, suggestion) },
    saveImprovement(id, userId, itemId, response, photos, submit) { return saveApprovalImprovement(id, userId, itemId, response, photos, submit) },
    recheck(id, userId, pass, comment) { return recheckApprovalRecord(id, userId, pass, comment) },
  },
  auditRecords: {
    getAll(filters = {}) {
      return getCompletedAuditRecords(filters)
    },
    getCompleted(filters = {}) {
      return getCompletedAuditRecords(filters)
    },
    get(id) {
      return getAuditRecordById(id)
    },
    getRaw() {
      return mockAuditRecords
    },
  },
  audits: {
    get(id) {
      return getAuditAssignment(id)
    },
    getByUnitMonth(unitId, year, month) {
      return getAuditAssignmentByUnitMonth(unitId, year, month)
    },
    getForPharmacist(pharmacistId, year) {
      return getAuditAssignmentsForPharmacist(pharmacistId, year)
    },
    getYearWindow(year) {
      return getAuditYearWindow(year)
    },
  },
}
