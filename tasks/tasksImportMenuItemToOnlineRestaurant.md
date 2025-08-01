# Import Menu Item To Online Restaurant - 任務清單

## 任務

- [ ] 1.0 建立 GraphQL mutation 和 API 整合
  - [ ] 1.1 建立 onlineRestaurantMenuItemImportMutation GraphQL mutation 檔案
    - 相關資訊：
      - 檔案位置: `src/api/gql/onlineRestaurantMenuItemImportMutation.ts`
      - Mutation 名稱: `onlineRestaurantMenuItemImportMutation`
      - 參數: `categoryUuid: UUID!`, `ichefMenuItemUuids: [UUID]!`
      - 回應: 匯入成功的商品 UUID 清單
  - [ ] 1.2 更新 GraphQL index.ts 匯出新的 mutation
    - 相關資訊：
      - 檔案: `src/api/gql/index.ts`
      - 需要 export 新建立的 mutation
  - [ ] 1.3 驗證 GraphQL client 設定支援新的 mutation
    - 相關資訊：
      - 檔案: `src/api/graphqlClient.ts`
      - 確保 createGraphQLClient() 函數正常運作

- [ ] 2.0 開發 importMenuItemToOnlineRestaurant 工具
  - [ ] 2.1 建立主要工具檔案架構
    - 相關資訊：
      - 檔案: `src/tools/importMenuItemToOnlineRestaurant.ts`
      - 實作 IChefMcpTool 介面
      - 參考現有工具如 `createMenuItem.ts` 的架構
  - [ ] 2.2 實作輸入參數型別定義和 Schema
    - 相關資訊：
      - Interface: `ImportMenuItemArgs`
      - 屬性: `categoryUuid: string`, `ichefMenuItemUuids: string[]`
      - JSON Schema 驗證規則
  - [ ] 2.3 實作商品狀態檢查邏輯
    - 相關資訊：
      - 使用 `menuItemQuery` 查詢商品詳細資訊
      - 檢查 `enabled: true` 狀態
      - 過濾停用商品並記錄
  - [ ] 2.4 實作重複商品檢測機制
    - 相關資訊：
      - 檢查商品是否已存在於目標分類
      - 跳過重複商品但不中斷流程
      - 記錄跳過的商品資訊
  - [ ] 2.5 實作批量匯入執行邏輯
    - 相關資訊：
      - 使用 `onlineRestaurantMenuItemImportMutation`
      - 處理批量操作的成功和失敗情況
      - 記錄每個商品的處理結果

- [ ] 3.0 實作參數驗證和錯誤處理機制
  - [ ] 3.1 建立 UUID 格式驗證函數
    - 相關資訊：
      - 檔案: `src/utils/validator.ts` 或新建專用檔案
      - 使用正規表達式驗證 UUID 格式
      - 驗證單一 UUID 和 UUID 陣列
  - [ ] 3.2 實作輸入參數完整性檢查
    - 相關資訊：
      - 檢查 categoryUuid 非空且格式正確
      - 檢查 ichefMenuItemUuids 陣列非空且每個元素有效
      - 提供詳細的參數錯誤訊息
  - [ ] 3.3 建立專案標準錯誤處理機制
    - 相關資訊：
      - 參考現有的 `src/utils/errorHandler.ts`
      - 處理所有 PRD 中定義的錯誤類型
      - 提供中文錯誤訊息

- [ ] 4.0 建立使用者確認和回饋介面
  - [ ] 4.1 實作匯入前確認訊息格式化
    - 相關資訊：
      - 使用表格格式顯示商品清單
      - 包含商品名稱、UUID、價格、狀態
      - 使用 emoji 視覺標示（✅、❌、⚠️）
  - [ ] 4.2 實作執行結果統計和回饋機制
    - 相關資訊：
      - 統計成功匯入、跳過重複、停用排除的數量
      - 使用表格格式呈現結果
      - 包含時間戳記和目標分類資訊
  - [ ] 4.3 實作使用者確認互動流程
    - 相關資訊：
      - 顯示確認訊息後等待使用者回應
      - 處理使用者確認或取消的操作
      - 確保只有確認後才執行實際匯入

### 相關檔案

- `src/api/gql/onlineRestaurantMenuItemImportMutation.ts` - 需要建立的 GraphQL mutation 檔案
- `src/tools/importMenuItemToOnlineRestaurant.ts` - 需要建立的主要工具檔案 (參考現有的 `createMenuItem.ts` 實作)
- `src/api/gql/index.ts` - 需要更新以匯出新的 mutation
- `src/api/gql/menuItemQuery.ts` - 用於查詢商品詳細資訊和狀態檢查
- `src/api/graphqlClient.ts` - GraphQL 客戶端設定
- `src/utils/validator.ts` - 參數驗證工具函數
- `src/utils/errorHandler.ts` - 錯誤處理機制
- `src/types/mcpTypes.ts` - MCP 工具介面定義
- `src/types/menuTypes.ts` - 菜單相關型別定義
