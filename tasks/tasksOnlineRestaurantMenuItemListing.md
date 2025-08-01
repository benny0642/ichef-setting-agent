# Online Restaurant Menu Item Listing - 任務清單

## 任務

- [ ] 1.0 GraphQL Query 定義與型別建立
  - [ ] 1.1 建立 `onlineRestaurantMenuItemListingQuery.ts` 檔案
    - 相關資訊：
      - GraphQL Query: `onlineRestaurantMenuItemListingQuery` - 查詢外送平台完整菜單結構
      - Fragment: `onlineRestaurantMenuItemCategoryListingFragment` - 分類資訊片段
      - Fragment: `onlineRestaurantMenuItemItemListingFragment` - 菜單項目資訊片段
  - [ ] 1.2 在 `menuTypes.ts` 中新增相關型別定義
    - 相關資訊：
      - Type: `OnlineRestaurantMenuCategory` - 外送菜單分類型別
      - Type: `OnlineRestaurantMenuItem` - 外送菜單項目型別
      - Type: `OnlineRestaurantMenuStructure` - 完整菜單結構型別
  - [ ] 1.3 建立型別驗證器
    - 相關資訊：
      - 檔案: `typeValidators.ts` - 資料驗證邏輯
      - 驗證: 分類和菜單項目必要欄位檢查

- [ ] 2.0 工具核心功能實作
  - [ ] 2.1 建立 `getOnlineRestaurantMenuItemListing.ts` 工具檔案
    - 相關資訊：
      - 檔案結構: 遵循現有工具的 `IChefMcpTool` 介面
      - GraphQL Client: 使用 `createGraphQLClient()` 建立連線
      - 工具分類: `menu` 類別
  - [ ] 2.2 實作 GraphQL 查詢執行邏輯
    - 相關資訊：
      - API: 使用 `graphql-request` 套件發送查詢
      - 查詢: `onlineRestaurantMenuItemListingQuery`
      - 回傳: 巢狀結構的分類和菜單項目資料
  - [ ] 2.3 實作資料處理和結構整理邏輯
    - 相關資訊：
      - 資料轉換: 將 GraphQL 回傳的巢狀資料整理成易處理格式
      - 分類整理: 按分類組織菜單項目
      - 排序處理: 使用 sortingIndex 進行正確排序
  - [ ] 2.4 整合工具到主要工具管理器
    - 相關資訊：
      - 檔案: `toolManager.ts` - 工具註冊邏輯
      - 檔案: `index.ts` - 工具匯出設定

- [ ] 3.0 輸出格式化與使用者體驗優化
  - [ ] 3.1 設計和實作結構化文字輸出格式
    - 相關資訊：
      - 格式: 使用 emoji 和清晰的分層結構
      - 內容: 分類 ID、名稱、菜單項目詳細資訊
      - 參考: `getAllMenuItems` 工具的輸出格式風格
  - [ ] 3.2 實作錯誤處理機制
    - 相關資訊：
      - 檔案: `errorHandler.ts` - 統一錯誤處理邏輯
      - 錯誤類型: GraphQL 錯誤、認證錯誤、網路錯誤等
      - 回傳格式: 使用者友善的錯誤訊息
  - [ ] 3.3 新增使用說明和整合指引
    - 相關資訊：
      - 說明內容: 如何搭配 `importMenuItemToOnlineRestaurant` 使用
      - 重點資訊: 分類 UUID 的用途和取得方式
      - 格式: 在輸出末尾提供清晰的使用指引
  - [ ] 3.4 進行整合測試和效能驗證
    - 相關資訊：
      - 測試案例: 大型菜單結構查詢（100+ 分類，1000+ 項目）
      - 效能目標: 查詢回應時間 < 3 秒
      - 驗證: 與 `importMenuItemToOnlineRestaurant` 的搭配使用流程

### 相關檔案

- `src/api/gql/onlineRestaurantMenuItemListingQuery.ts` - 需要建立的 GraphQL 查詢檔案 (參考現有的 `menuItemListingQuery.ts` 格式)
- `src/tools/getOnlineRestaurantMenuItemListing.ts` - 需要建立的主要工具檔案 (參考現有的 `getAllMenuItems.ts` 實作)
- `src/types/generated.ts` - 現有的 GraphQL 型別定義，包含 `OnlineRestaurantMenuItemOutput` 和 `OnlineRestaurantMenuCategoryOutput`
- `src/types/menuTypes.ts` - 需要擴充的菜單型別定義檔案
- `src/types/typeValidators.ts` - 需要新增驗證邏輯的檔案
- `src/api/graphqlClient.ts` - 現有的 GraphQL 客戶端，使用 `createGraphQLClient()` 函數
- `src/utils/errorHandler.ts` - 現有的錯誤處理工具
- `src/utils/toolManager.ts` - 工具註冊和管理邏輯
- `src/index.ts` - 需要匯出新工具的主要入口檔案
