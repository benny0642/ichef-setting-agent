# getOnlineRestaurantMenuItemListingQuery - 產品需求文件 (PRD)

## 1. 引言/概述

本功能為 iChef MCP（Model Control Protocol）工具包的新增功能，名為 `getOnlineRestaurantMenuItemListingQuery`。此功能主要用於查詢外帶外送平台的完整菜單結構，包括分類（categories）和菜單項目（menu items）資訊。

該功能解決了在使用 `importMenuItemToOnlineRestaurant` 工具匯入菜單項目前，需要先獲取外送平台現有分類 UUID 和菜單結構的需求，提供完整的外送菜單查詢能力，確保匯入操作的準確性。

此查詢針對的是 POS 系統的外送菜單，與一般內部菜單查詢不同，專門用於外帶外送平台的菜單管理。

## 2. 目標

- 目標 1：提供完整的外送平台菜單結構查詢功能，包含所有分類和菜單項目
- 目標 2：支援 `importMenuItemToOnlineRestaurant` 工具的前置作業，提供必要的 category UUID 資訊
- 目標 3：以巢狀結構回傳資料，按分類組織菜單項目，提供清晰的菜單層級結構
- 目標 4：建立與現有工具一致的錯誤處理機制和使用者體驗

## 3. 功能需求

### 3.1 核心功能

1. **完整菜單結構查詢**
   - 系統必須查詢外送平台的完整菜單結構
   - 使用 GraphQL query `onlineRestaurantMenuItemListingQuery` 執行查詢操作
   - 一次性回傳所有分類和對應的菜單項目資訊

2. **分類資訊提供**
   - 系統必須回傳每個分類的基本資訊：
     - `_id`: UUID（別名）
     - `uuid`: 分類唯一識別碼
     - `name`: 分類名稱
   - 提供分類資訊供後續匯入操作使用

3. **菜單項目詳細資訊**
   - 系統必須回傳每個菜單項目的完整資訊：
     - `_id`: UUID（別名）
     - `uuid`: 項目唯一識別碼
     - `ichefUuid`: iChef 系統中的對應 UUID
     - `originalName`: 原始商品名稱
     - `customizedName`: 自訂商品名稱
     - `originalPrice`: 原始價格
     - `menuItemType`: 菜單項目類型
     - `pictureFilename`: 圖片檔案名稱
     - `sortingIndex`: 排序索引
     - `category`: 所屬分類資訊（包含 uuid 和 sortingIndex）
     - `menuItem`: 相關 iChef 菜單項目資訊（包含 isFromHq）

4. **巢狀結構組織**
   - 系統必須以巢狀結構回傳資料
   - 分類作為父層級，包含該分類下的所有菜單項目
   - 每個分類包含 `menuItems` 陣列，列出所有屬於該分類的項目

### 3.2 輔助功能

1. **無參數查詢**
   - 系統應支援無參數的完整查詢
   - 每次查詢回傳完整的菜單結構
   - 不支援篩選功能，確保資料完整性

2. **格式化輸出**
   - 系統應提供易讀的文字格式輸出
   - 使用表格或結構化格式呈現分類和菜單項目
   - 突出顯示重要資訊如 UUID、名稱、價格等

3. **與匯入工具的整合支援**
   - 系統應在輸出中清楚標示可用於匯入的分類 UUID
   - 提供使用說明，指導如何配合 `importMenuItemToOnlineRestaurant` 使用

## 4. 非目標 (超出範圍)

- 非目標 1：不支援單一分類或特定項目的篩選查詢
- 非目標 2：不支援菜單項目的編輯或修改功能
- 非目標 3：不支援菜單項目的新增或刪除操作
- 非目標 4：不支援狀態篩選（如已匯入、未匯入等）
- 非目標 5：不支援自訂輸出格式或結構

## 5. 設計考量

- **UI/UX 需求**：
  - 使用清晰的文字格式呈現菜單結構
  - 採用縮排或表格格式區分分類和項目層級
  - 重要資訊（如 UUID）使用粗體或特殊標記突出顯示

- **設計系統規範**：
  - 遵循現有 MCP 工具的輸出格式慣例
  - 使用 emoji 圖示增強視覺辨識度
  - 保持與 `getAllMenuItems` 工具類似的格式風格

- **響應式設計要求**：
  - 輸出格式適應不同終端寬度
  - 長文字內容支援適當的換行處理

- **無障礙設計考量**：
  - 使用純文字格式確保螢幕閱讀器相容性
  - 避免僅依賴顏色或特殊符號傳達資訊

## 6. 技術考量

- **技術架構**：
  - 使用 TypeScript 開發，遵循現有專案的型別定義慣例
  - 複用現有的 GraphQL 客戶端架構（`createGraphQLClient`）
  - 遵循現有工具的檔案結構和命名慣例

- **第三方整合**：
  - 依賴 iChef 的 GraphQL API
  - 使用 `graphql-request` 套件處理 GraphQL 查詢
  - 整合現有的型別定義（`generated.ts`）

- **效能要求**：
  - 單次查詢回應時間應在 3 秒內完成
  - 支援大型菜單結構（100+ 分類，1000+ 項目）的查詢
  - 記憶體使用量控制在合理範圍內

- **資安考量**：
  - 使用現有的認證機制（GraphQL Token）
  - 遵循最小權限原則，僅查詢必要的欄位
  - 敏感資訊（如價格）的顯示需符合業務規範

- **與現有系統的整合**：
  - 遵循現有 MCP 工具的介面定義（`IChefMcpTool`）
  - 使用統一的錯誤處理機制
  - 整合現有的型別驗證和轉換邏輯

## 7. 成功指標

- **量化指標**：
  - 查詢成功率達到 99% 以上
  - 查詢回應時間平均在 2 秒以內
  - 減少使用者在匯入前查詢分類資訊的時間 80%

- **質化指標**：
  - 使用者能夠快速找到所需的分類 UUID
  - 與 `importMenuItemToOnlineRestaurant` 的搭配使用流程順暢
  - 輸出格式清晰易讀，降低使用者操作錯誤率

## 8. 實作細節

### 8.1 工具基本資訊

- **工具名稱**：`getOnlineRestaurantMenuItemListingQuery`
- **描述**：查詢外帶外送平台的完整菜單結構，包括分類和菜單項目資訊
- **分類**：`menu`
- **版本**：`1.0.0`

### 8.2 輸入參數 Schema

```typescript
interface GetOnlineRestaurantMenuItemListingArgs {
  // 無參數 - 固定查詢完整菜單結構
}
```

prdOnlineRestaurantMenuItemListing

### 8.3 GraphQL Query 結構

基於提供的 query 結構：

```graphql
query onlineRestaurantMenuItemListingQuery {
  restaurant {
    settings {
      menu {
        integration {
          onlineRestaurant {
            categories {
              ...onlineRestaurantMenuItemCategoryListingFragment
              menuItems {
                ...onlineRestaurantMenuItemItemListingFragment
              }
            }
          }
        }
      }
    }
  }
}

fragment onlineRestaurantMenuItemCategoryListingFragment on OnlineRestaurantMenuCategoryOutput {
  _id: uuid
  uuid
  name
}

fragment onlineRestaurantMenuItemItemListingFragment on OnlineRestaurantMenuItemOutput {
  _id: uuid
  uuid
  ichefUuid
  originalName
  customizedName
  originalPrice
  menuItemType
  pictureFilename
  sortingIndex
  category {
    uuid
    sortingIndex
  }
  menuItem {
    isFromHq
  }
}
```

### 8.4 處理流程

1. **建立 GraphQL 客戶端**：使用 `createGraphQLClient()` 建立連線
2. **執行查詢**：發送 `onlineRestaurantMenuItemListingQuery`
3. **資料處理**：將回傳的巢狀結構整理成易讀格式
4. **格式化輸出**：產生結構化的文字輸出
5. **錯誤處理**：處理各種可能的錯誤情況

### 8.5 回應格式範例

```
🏪 外帶外送菜單結構

## 主餐類 (分類 1)
- 分類 ID: abc-123-def-456
- 菜單項目數量: 5

### 菜單項目:
1. **經典牛肉漢堡** (item-uuid-001)
   - iChef UUID: ichef-uuid-001
   - 原始名稱: 經典牛肉漢堡
   - 自訂名稱: 招牌牛肉堡
   - 價格: $180
   - 類型: MAIN
   - 排序: 1
   - 來自總部: 否

2. **炸雞腿排飯** (item-uuid-002)
   - iChef UUID: ichef-uuid-002
   - 原始名稱: 炸雞腿排飯
   - 自訂名稱: 香酥雞腿飯
   - 價格: $150
   - 類型: MAIN
   - 排序: 2
   - 來自總部: 是

---

## 飲品類 (分類 2)
- 分類 ID: def-456-ghi-789
- 菜單項目數量: 3

### 菜單項目:
1. **可樂** (item-uuid-003)
   - iChef UUID: ichef-uuid-003
   - 原始名稱: 可口可樂
   - 自訂名稱: 冰涼可樂
   - 價格: $30
   - 類型: DRINK
   - 排序: 1
   - 來自總部: 是

---

📝 使用說明:
- 分類 ID 可用於 importMenuItemToOnlineRestaurant 工具
- 搭配使用流程: 先查詢此菜單結構 → 選擇目標分類 → 執行匯入操作
```

### 8.6 錯誤處理

遵循現有工具的錯誤處理模式：

- GraphQL 端點未設定錯誤
- 認證 Token 無效錯誤
- 網路連線錯誤
- API 權限錯誤
- 查詢語法錯誤

### 8.7 檔案結構

```
src/
├── api/gql/
│   └── onlineRestaurantMenuItemListingQuery.ts  # GraphQL query 定義
├── tools/
│   └── getOnlineRestaurantMenuItemListing.ts    # 主要工具實作
└── types/
    ├── menuTypes.ts                              # 新增相關型別定義
    └── generated.ts                              # 現有型別定義參考
```

## 9. 開放問題

- [ ] 是否需要支援分頁查詢以處理超大型菜單？
- [ ] 輸出格式是否需要支援 JSON 或其他結構化格式？
- [ ] 是否需要快取機制以提升查詢效能？
- [ ] 是否需要支援即時更新或變更通知？
- [ ] 錯誤處理是否需要更細緻的分類和處理邏輯？
