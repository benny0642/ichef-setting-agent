# batchDeleteOnlineRestaurantMenuItems - 產品需求文件 (PRD)

## 1. 引言/概述

本功能為一個 MCP tool，用於批次下架線上餐廳（外帶外送）的菜單項目。此工具能夠透過 GraphQL mutation 一次性處理多個菜單項目的下架作業，提高營運效率，避免需要逐一手動下架商品的繁瑣操作。

## 2. 目標

- 目標 1：提供批次下架線上餐廳菜單項目的能力，提升營運效率
- 目標 2：實作安全的確認機制，避免誤刪重要商品
- 目標 3：提供清楚的操作結果回饋，讓使用者了解執行狀況
- 目標 4：遵循專案既有的 MCP tool 架構模式，保持程式碼一致性

## 3. 功能需求

### 3.1 核心功能

1. 系統必須能夠接受多個菜單項目 UUID 作為輸入參數（陣列格式，來自 OnlineRestaurantMenuItemOutput type 的 uuid 欄位，非 ichefUuid）
2. 系統必須在執行刪除前顯示即將下架的項目清單供使用者確認
3. 系統必須透過 GraphQL mutation `onlineRestaurantMenuItemBatchDeleteMutation` 執行批次下架
4. 系統必須返回已成功下架的菜單項目 UUID 列表
5. 使用者應能夠透過 MCP 協議呼叫此工具
6. 系統應提供清楚的成功回饋訊息，包含處理結果統計

### 3.2 輔助功能

1. 系統應提供完整的輸入參數驗證（UUID 格式檢查）
2. 系統應提供標準化的錯誤處理機制
3. 當發生錯誤時，系統必須提供清楚的錯誤訊息和建議解決方案
4. 系統應支援空陣列輸入的處理（提示使用者無項目可刪除）

## 4. 非目標 (超出範圍)

- 非目標 1：不處理單一菜單項目下架（已有其他工具處理）
- 非目標 2：不處理內用菜單的項目管理
- 非目標 3：不實作複雜的權限控制機制
- 非目標 4：不處理相關聯資料的清理（如訂單、庫存等）
- 非目標 5：不設定批次處理數量上限
- 非目標 6：不處理部分失敗的重試機制（由後端 API 處理）

## 5. 設計考量

- UI/UX 需求：
  - 延續專案既有的 MCP tool 回應格式
  - 使用清楚的 emoji 圖示增進可讀性
  - 提供結構化的回應訊息
- 使用者互動流程：
  1. 使用者提供菜單項目 UUID 陣列
  2. 系統驗證輸入格式
  3. 系統顯示即將下架的項目（如有需要可先查詢項目資訊）
  4. 使用者確認執行
  5. 系統執行批次下架
  6. 系統回報執行結果
- 無障礙設計考量：
  - 提供清楚的文字描述，避免僅依賴圖示
  - 錯誤訊息應具備指導性

## 6. 技術考量

- 技術架構：
  - 遵循現有 MCP tool 架構模式（參考 `createMenuItem.ts`）
  - 使用相同的 GraphQL 客戶端設定
  - 採用 TypeScript 強型別設計
- GraphQL 整合：
  - 使用提供的 mutation：`onlineRestaurantMenuItemBatchDeleteMutation`
  - 輸入參數：`menuItemUuids: [UUID]`
  - 回應格式：`{ deletedMenuItemUuids: [UUID] }`
- 錯誤處理：
  - 採用專案既有的錯誤處理模式
  - 提供分層的錯誤訊息（網路、認證、業務邏輯）
- 檔案結構：
  - 工具檔案：`src/tools/batchDeleteOnlineRestaurantMenuItems.ts`
  - GraphQL 檔案：`src/api/gql/onlineRestaurantMenuItemBatchDeleteMutation.ts`
  - 型別定義：新增至 `src/types/menuTypes.ts`

## 7. 成功指標

- 量化指標：
  - 工具能夠成功處理批次下架請求的成功率 > 95%
  - 錯誤處理涵蓋率達 100%（網路、認證、格式錯誤等）
  - 符合 MCP 協議規範的回應格式
- 質化指標：
  - 使用者能夠清楚理解操作結果
  - 錯誤訊息具備指導性，幫助使用者解決問題
  - 程式碼符合專案既有的開發模式和風格

## 8. 開放問題

- [x] 批次處理數量限制：確認無需設定上限
- [x] 部分失敗處理：確認由後端 API 統一處理
- [x] 確認機制：確認需要在執行前顯示項目清單
- [ ] 項目資訊查詢：是否需要在確認階段顯示項目詳細資訊（名稱、價格等）
- [ ] 空陣列處理：確認空輸入的回應訊息格式
- [ ] 執行前警告：確認是否需要額外的警告訊息（如「此操作不可復原」）

## 9. 技術實作細節

### 9.1 輸入參數 Schema

```typescript
{
  type: 'object',
  properties: {
    menuItemUuids: {
      type: 'array',
      items: {
        type: 'string',
        pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      },
      description: '要下架的菜單項目 UUID 陣列（來自 OnlineRestaurantMenuItemOutput type 的 uuid 欄位，非 ichefUuid）',
      minItems: 1
    }
  },
  required: ['menuItemUuids']
}
```

**重要說明：**

- `menuItemUuids` 必須使用 `OnlineRestaurantMenuItemOutput` type 中的 `uuid` 欄位值
- **不是** `ichefUuid` 欄位值
- 這些 UUID 是線上餐廳系統特定的識別碼，用於外帶外送平台的菜單管理

### 9.2 GraphQL Mutation

```graphql
mutation onlineRestaurantMenuItemBatchDeleteMutation($menuItemUuids: [UUID]) {
  restaurant {
    settings {
      menu {
        integration {
          onlineRestaurant {
            deleteMenu(menuItemUuids: $menuItemUuids) {
              deletedMenuItemUuids
            }
          }
        }
      }
    }
  }
}
```

### 9.3 回應格式範例

成功回應：

```
✅ 批次下架完成！

📊 處理結果:
   - 成功下架項目數: 3
   - 處理的 UUID:
     • abc123e4-5678-90ab-cdef-1234567890ab
     • def456e7-8901-23cd-ef45-6789012345cd
     • ghi789e0-1234-56ef-78ab-9012345678ef

🎉 所有指定的線上餐廳菜單項目已成功下架！
```

錯誤回應：

```
❌ 批次下架失敗

錯誤原因: [具體錯誤訊息]

💡 建議檢查:
- UUID 格式是否正確
- 項目是否存在
- 網路連線是否正常
- Token 是否有效
```
