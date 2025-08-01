# Batch Delete Online Restaurant Menu Items - 任務清單

## 任務

- [ ] 1.0 GraphQL Mutation 和 Schema 準備
  - [ ] 1.1 建立 onlineRestaurantMenuItemBatchDeleteMutation GraphQL mutation 檔案
    - 相關資訊：
      - 檔案位置: `src/api/gql/onlineRestaurantMenuItemBatchDeleteMutation.ts`
      - Mutation 名稱: `onlineRestaurantMenuItemBatchDeleteMutation`
      - 參數: `menuItemUuids: [UUID]!`
      - 回應: `{ deletedMenuItemUuids: [UUID] }`
      - GraphQL 路徑: `restaurant.settings.menu.integration.onlineRestaurant.deleteMenu`
  - [ ] 1.2 更新 GraphQL index.ts 匯出新的 mutation
    - 相關資訊：
      - 檔案: `src/api/gql/index.ts`
      - 需要 export 新建立的 mutation
  - [ ] 1.3 新增批次刪除相關型別定義
    - 相關資訊：
      - 檔案: `src/types/menuTypes.ts`
      - 新增 `BatchDeleteMenuItemArgs` 介面
      - 新增 `BatchDeleteMenuItemResponse` 介面
      - 確保 UUID 型別正確引用

- [ ] 2.0 MCP Tool 實作和輸入驗證
  - [ ] 2.1 建立主要工具檔案架構
    - 相關資訊：
      - 檔案: `src/tools/batchDeleteOnlineRestaurantMenuItems.ts`
      - 實作 IChefMcpTool 介面
      - 參考 `createMenuItem.ts` 的架構模式
      - 工具名稱: `batch-delete-online-restaurant-menu-items`
  - [ ] 2.2 實作輸入參數型別定義和 JSON Schema
    - 相關資訊：
      - Interface: `BatchDeleteMenuItemArgs`
      - 屬性: `menuItemUuids: string[]` (UUID 陣列)
      - JSON Schema 驗證 UUID 格式
      - 最少需要 1 個 UUID (minItems: 1)
  - [ ] 2.3 實作 UUID 格式驗證邏輯
    - 相關資訊：
      - UUID 正規表達式: `^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$`
      - 驗證每個輸入的 UUID 格式
      - 提供詳細的格式錯誤訊息
  - [ ] 2.4 實作確認機制顯示項目清單
    - 相關資訊：
      - 在執行刪除前顯示即將下架的 UUID 清單
      - 格式化顯示項目數量
      - 提供清楚的確認訊息
  - [ ] 2.5 實作批次刪除執行邏輯
    - 相關資訊：
      - 使用 `onlineRestaurantMenuItemBatchDeleteMutation`
      - 使用 `createGraphQLClient()` 建立客戶端
      - 處理 GraphQL 回應資料

- [ ] 3.0 錯誤處理和使用者回饋機制
  - [ ] 3.1 實作完整的錯誤處理機制
    - 相關資訊：
      - 網路連線錯誤處理
      - GraphQL 錯誤回應處理
      - 認證失敗處理
      - 參考 `errorHandler.ts` 現有模式
  - [ ] 3.2 實作格式化成功回應函數
    - 相關資訊：
      - 顯示成功下架的項目數量
      - 列出所有處理的 UUID
      - 使用 emoji 圖示增進可讀性
      - 參考 PRD 中的回應格式範例
  - [ ] 3.3 實作特殊情況處理
    - 相關資訊：
      - 空陣列輸入的處理
      - 部分成功/失敗的情況
      - 提供具指導性的錯誤訊息
  - [ ] 3.4 更新 MCP server 註冊新工具
    - 相關資訊：
      - 檔案: `src/server.ts`
      - 在 import 區段新增工具
      - 在 tools Map 中註冊新工具
      - 確保工具在 MCP 協議中可用

### 相關檔案

**需要建立的檔案：**

- `src/api/gql/onlineRestaurantMenuItemBatchDeleteMutation.ts` - 批次刪除 GraphQL mutation
- `src/tools/batchDeleteOnlineRestaurantMenuItems.ts` - 主要的 MCP tool 實作

**需要修改的檔案：**

- `src/types/menuTypes.ts` - 新增批次刪除相關的型別定義
- `src/api/gql/index.ts` - 匯出新的 mutation
- `src/server.ts` - 註冊新的 MCP tool

**參考現有檔案：**

- `src/tools/createMenuItem.ts` - MCP tool 架構模式參考
- `src/api/gql/deleteMenuItemMutation.ts` - GraphQL mutation 實作參考
- `src/utils/errorHandler.ts` - 錯誤處理機制
- `src/utils/validator.ts` - 輸入驗證邏輯
