# 任務清單 - iChef 商品管理 MCP Server

## 任務

- [x] 1.0 建立 MCP Server 基礎架構與核心通訊功能
- [x] 2.0 實現 iChef GraphQL API 整合與資料層
- [x] 3.0 開發商品管理核心功能（查詢、新增、編輯）
- [ ] 4.0 實現商品註記與註記群組查詢功能
- [ ] 5.0 建立完整的錯誤處理與驗證機制

### 相關檔案

- `src/server.ts` - MCP Server 主要入口點和工具註冊 ✅
- `src/index.ts` - 專案主要啟動檔案 ✅
- `src/api/graphqlClient.ts` - GraphQL 客戶端配置和連接管理 ✅
- `src/api/gql/menuItemListingQuery.ts` - 商品列表查詢 GraphQL 定義 ✅
- `src/api/gql/menuItemQuery.ts` - 單一商品詳細查詢 GraphQL 定義 ✅
- `src/api/gql/menuItemTagListingQuery.ts` - 商品註記與註記群組查詢 GraphQL 定義（待建立）
- `src/api/gql/createMenuItemMutation.ts` - 商品新增 mutation 定義 ✅
- `src/api/gql/updateMenuItemMutation.ts` - 商品更新 mutation 定義 ✅
- `src/api/gql/updateSoldOutMenuItemMutation.ts` - 商品停售狀態更新 mutation 定義 ✅
- `src/tools/getAllMenuItems.ts` - 取得所有商品列表工具 ✅
- `src/tools/getMenuItemDetails.ts` - 取得單一商品詳細資訊工具 ✅
- `src/tools/getMenuItemTags.ts` - 取得商品註記與註記群組資訊工具（待建立）
- `src/tools/createMenuItem.ts` - 商品新增工具 ✅
- `src/tools/updateMenuItem.ts` - 商品更新工具 ✅
- `src/tools/updateSoldOutMenuItem.ts` - 商品停售狀態更新工具 ✅
- `src/types/menuTypes.ts` - 商品與註記相關類型定義 ✅
- `src/types/mcpTypes.ts` - MCP 工具相關類型定義 ✅
- `src/utils/errorHandler.ts` - 統一錯誤處理邏輯 ✅
- `src/utils/validator.ts` - 資料驗證和格式檢查工具 ✅

---

基於 PRD: PRD-ICHEF-MENU-ITEM-MANAGEMENT.md
