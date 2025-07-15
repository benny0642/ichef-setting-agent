# 任務清單 - iChef 商品管理 MCP Server

## 任務

- [x] 1.0 建立專案基礎架構與 MCP Server 核心功能
  - [x] 1.1 設定 MCP Server 依賴項目和配置
  - [x] 1.2 建立 MCP Server 主要入口點和初始化邏輯
  - [x] 1.3 定義 MCP Server 工具（tools）介面和規格
  - [x] 1.4 實現 MCP Server 的基本通訊協議
  - [x] 1.5 建立專案目錄結構和模組化架構

- [x] 2.0 實現 iChef GraphQL API 整合層
  - [x] 2.1 設定 GraphQL 客戶端和連接配置
  - [x] 2.2 實現 API 認證機制（Authorization token）
  - [x] 2.3 建立 GraphQL 查詢和 mutation 定義
  - [x] 2.4 實現 API 回應資料的類型定義

- [ ] 3.0 開發商品管理核心功能
  - [x] 3.1 實現商品查詢功能（取得所有商品列表）
  - [x] 3.2 實現商品新增功能和必填欄位驗證
  - [x] 3.3 實現商品編輯功能（支援部分更新）
  - [x] 3.4 實現停售商品功能（批次更新商品停售狀態）
  - [x] 3.5 實現商品新增、修改註記功能（支援商品標籤和標籤群組）
  - [ ] 3.6 建立商品資料轉換和格式化邏輯

- [ ] 4.0 實現錯誤處理與驗證機制
  - [ ] 4.1 建立統一的錯誤處理架構
  - [ ] 4.2 實現 API 錯誤捕捉和處理邏輯
  - [ ] 4.3 建立用戶友好的錯誤訊息系統
  - [ ] 4.4 實現資料驗證和格式檢查機制
  - [ ] 4.5 建立錯誤日誌記錄系統

- [ ] 5.0 建立測試與部署流程
  - [ ] 5.1 撰寫單元測試覆蓋核心功能
  - [ ] 5.2 建立整合測試驗證 API 連接
  - [ ] 5.3 設定開發環境和測試環境配置
  - [ ] 5.4 建立部署腳本和文件
  - [ ] 5.5 驗證 MCP Server 與 Claude 的整合

### 相關檔案

- `src/server.ts` - MCP Server 主要入口點和初始化邏輯 ✅
- `src/index.ts` - 專案主要啟動檔案 ✅
- `src/api/graphqlClient.ts` - GraphQL 客戶端配置和連接管理 ✅
- `src/api/gql/menuItemListingQuery.ts` - 商品列表查詢 GraphQL 定義 ✅
- `src/api/gql/createMenuItemMutation.ts` - 商品新增 mutation 定義 ✅
- `src/api/gql/updateMenuItemMutation.ts` - 商品更新 mutation 定義 ✅
- `src/api/gql/updateSoldOutMenuItemMutation.ts` - 商品停售狀態更新 mutation 定義 ✅
- `src/api/gql/menuItemQuery.ts` - 單一商品查詢和分類查詢 GraphQL 定義 ✅
- `src/api/gql/deleteMenuItemMutation.ts` - 商品刪除 mutation 定義 ✅
- `src/api/gql/index.ts` - GraphQL 查詢和 mutation 統一匯出 ✅
- `src/tools/getAllMenuItems.ts` - 取得所有商品列表工具 ✅
- `src/tools/createMenuItem.ts` - 商品新增工具 ✅
- `src/tools/updateMenuItem.ts` - 商品更新工具（支援註記編輯）✅
- `src/tools/updateSoldOutMenuItem.ts` - 商品停售狀態更新工具 ✅
- `src/tools/getMenuItemTags.ts` - 取得商品註記資訊工具 ✅
- `src/types/menuTypes.ts` - 商品相關類型定義（包含註記類型）✅
- `src/types/mcpTypes.ts` - MCP 工具相關類型定義 ✅

---

基於 PRD: PRD-ICHEF-MENU-ITEM-MANAGEMENT.md
