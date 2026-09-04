import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/login', name: 'Login', component: () => import('../views/Login.vue') },
  {
    path: '/',
    component: () => import('../layout/MainLayout.vue'),
    redirect: '/login',
    children: [
      { path: 'news', component: () => import('../views/News.vue') },
      { path: 'initial-audit', component: () => import('../views/InitialAudit.vue') },
      { path: 'audit-form', name: 'AuditForm', component: () => import('../views/AuditForm.vue') },
      { path: 'audit-record-confirm', name: 'AuditRecordConfirm', component: () => import('../views/AuditRecordConfirm.vue') },
      { path: 'approval', component: () => import('../views/Approval.vue') },
      { path: 'unit-overview', redirect: '/reports/periodic?tab=progress' },
      { path: 'reports/periodic', component: () => import('../views/Periodic.vue') },
      { path: 'reports/closed', component: () => import('../views/reports/ClosedReport.vue') },
      { path: 'admin/roles', component: () => import('../views/admin/Roles.vue') },
      { path: 'admin/users', component: () => import('../views/admin/Users.vue') },
      { path: 'admin/workflow', component: () => import('../views/admin/Workflow.vue') },
      { path: 'admin/unit-config', component: () => import('../views/admin/UnitConfig.vue') },
      { path: 'settings/items', component: () => import('../views/settings/Items.vue') },
      { path: 'settings/units', component: () => import('../views/settings/Units.vue') },
      { path: 'settings/ambulance', component: () => import('../views/settings/Ambulance.vue') }
    ]
  }
]
export const router = createRouter({ history: createWebHashHistory(), routes })
