# 藥劑部查核系統｜Mock 說明

本版延續既有 Prototype / Mock 架構，並把「結案查核紀錄」正式整理成後續 BI／報表共用的核心資料來源。

## 本版資料架構

### `src/mock/mockAuditRecords.js`

- 一筆資料代表一張「已完成全部流程並結案」的查核紀錄快照。
- 不是 BI 專用統計資料，也不直接保存 98.2%、96.5% 這類預先計算好的 KPI。
- 每筆紀錄包含：
  - 查核單號、院區、受查單位、單位類型
  - 查核年月、查核藥師
  - 初評結果 `result`
  - 結案前最後結果 `finalResult`
  - A～G 適用查核類別與逐題結果
  - 管制藥品資料
  - 急救車資料
  - NG 原因與改善案件
  - 改善前／後照片
  - 藥師複查結果
  - 簽核歷程與結案日期

## 歷史 Mock 範圍

- 2021～2026 年。
- 四院區：EDA、ECM、DACHANG、PINGTUNG。
- 每院區包含門診、急診、住院、醫技等單位類型。
- 依目前已確認的查核頻率產生：
  - A 管制藥品：有管制藥品的單位每月。
  - B～G：6 月、12 月。
- 共建立大量結案資料，讓月／季／年趨勢、院區比較、單位比較、A～G 缺失分析與改善分析都有足夠資料可展示。

## Service 介面

`src/mock/mockService.js` 新增：

- `mockService.auditRecords.getAll(filters)`
- `mockService.auditRecords.getCompleted(filters)`
- `mockService.auditRecords.get(id)`
- `mockService.auditRecords.getRaw()`

正式環境可將這層由 Mock 改成 API，不需要讓 BI 頁面自己管理資料來源。

## 報表資料原則

- 「結案報表查詢」與「BI 月／季／年分析」共用同一批 `mockAuditRecords`。
- BI 由結案紀錄重新計算 KPI、趨勢、缺失與改善成果，不另外維護一份 `mockKpis`。
- `查核完成率` 與「應查核件數」有關，正式實作時仍需要查核計畫／排程資料作為分母；單純只有結案紀錄無法推導未完成或逾期案件。因此後續可再補 `mockAuditPlans`，不與查核結果紀錄混在一起。

## 注意

本版仍為前端 Mock 示意，不代表正式後端資料庫已建立或寫入。
批次簽核目前只保留 UI，尚未啟用實際批次核准。
