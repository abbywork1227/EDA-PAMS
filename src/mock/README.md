# 查核系統 Mock 資料層

本資料層先模擬未來 DB / API 的資料結構，現階段不改既有 UI。

## 核心關係

users → unitAssignments → units
                     ↓
auditItems + auditFrequency
                     ↓
             auditAssignments
                     ↑
hospitalMedicationData (未來改為醫院 API)
                     ↑
               ambulance

## 業務規則

- 使用者由系統內維護；登入後依帳號取得院區與角色。
- 受查單位配置負責「哪個單位由哪個藥師負責」及查核屬性／急救車類型。
- 醫院實際藥品資料目前用 `hospitalMedicationData.js` 模擬，未來由醫院 API 取代。
- 管制藥品存在：該單位 1~12 月皆需查核。
- 無管制藥品：該單位於 6、12 月查核。
- 查核任務保留前一年、本年度、後一年窗口，以支援跨年度資料使用。
- 急救車標準目前三種：成人急救車、小兒急救車、小兒外接箱；藥品位置採 4×3（row-column）。

## UI 接法

下一階段再由頁面透過 `mockService` 取得資料。現在既有頁面與既有 Mock export 保留，不在本階段直接改 UI。
