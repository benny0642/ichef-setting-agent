# Delete Menu Item - 任務清單

## 任務

- [ ] 1.0 建立 deleteMenuItem 工具基本架構
  - [ ] 1.1 創建 deleteMenuItem.ts 工具檔案
    - 相關資訊：
      - 參考檔案: `src/tools/createMenuItem.ts` - 用作架構模板
      - 類型定義: `IChefMcpTool, McpToolResponse` - 定義於 `src/types/mcpTypes.ts`
      - 工具管理: `src/utils/toolManager.ts` - 工具註冊管理
  - [ ] 1.2 定義輸入參數介面和 JSON Schema
    - 相關資訊：
      - 參數格式: `DeleteMenuItemArgs { uuid: string }` - 單一 UUID 參數
      - UUID 驗證: 使用正規表達式 `^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$`
  - [ ] 1.3 實作基本參數驗證和錯誤處理架構
    - 相關資訊：
      - 錯誤處理: 參考 `src/tools/createMenuItem.ts` 的錯誤處理模式
      - 驗證器: `src/utils/validator.ts` - 可能包含通用驗證函數

- [ ] 2.0 實作商品資訊查詢與安全檢查機制
  - [ ] 2.1 建立商品詳細資訊查詢功能
    - 相關資訊：
      - GraphQL Query: `menuItemQuery` - 定義於 `src/api/gql/menuItemQuery.ts`
      - 類型定義: `MenuItemType` - 定義於 `src/types/generated.ts`
      - GraphQL 客戶端: `createGraphQLClient()` - 定義於 `src/api/graphqlClient.ts`
  - [ ] 2.2 實作外帶外送狀態檢查
    - 相關資訊：
      - 檢查欄位: `onlineRestaurantMenuItem` 陣列 - 來自 MenuItemType
      - 檢查邏輯: 陣列非空即表示已上架
  - [ ] 2.3 實作套餐依賴關係檢查
    - 相關資訊：
      - 套餐查詢: 需要查詢所有套餐的 `comboItemCategories.comboMenuItems`
      - 檢查邏輯: 確認目標商品是否為套餐分類的唯一選項
      - 可能需要: 批量查詢或篩選套餐商品
  - [ ] 2.4 整合所有安全檢查並格式化錯誤訊息
    - 相關資訊：
      - 錯誤類型: 外帶外送限制、套餐依賴限制、商品不存在
      - 訊息格式: 提供具體指引和解決建議

- [ ] 3.0 實作刪除操作與回應處理
  - [ ] 3.1 建立刪除 GraphQL Mutation
    - 相關資訊：
      - Mutation: `menuItemItemDeleteMutation` - 需要在 `src/api/gql/` 建立
      - 參數: `{ uuid: UUID! }`
      - 回應: `{ restaurant.settings.menu.deleteMenuItem.uuid }`
  - [ ] 3.2 實作刪除執行邏輯
    - 相關資訊：
      - 前置檢查: 必須通過所有安全檢查
      - 執行確認: 顯示「哈囉，我要執行了」訊息
      - 錯誤處理: GraphQL 錯誤、網路錯誤等
  - [ ] 3.3 格式化成功回應和被刪除商品資訊
    - 相關資訊：
      - 顯示資訊: UUID、名稱、類型、分類等商品詳細資訊
      - 格式參考: `src/tools/createMenuItem.ts` 的 `formatCreateSuccessResponse`
  - [ ] 3.4 註冊工具到工具管理系統
    - 相關資訊：
      - 工具註冊: `src/utils/toolManager.ts` 或相關入口檔案
      - 匯出設定: 確保工具可被 MCP 系統識別

### 相關檔案

- `src/tools/createMenuItem.ts` - 作為架構和錯誤處理的參考模板
- `src/types/mcpTypes.ts` - MCP 工具介面定義
- `src/types/generated.ts` - GraphQL 類型定義，包含 MenuItemType
- `src/api/gql/menuItemQuery.ts` - 商品查詢 GraphQL
- `src/api/graphqlClient.ts` - GraphQL 客戶端設定
- `src/utils/errorHandler.ts` - 錯誤處理工具
- `src/utils/validator.ts` - 驗證工具函數
