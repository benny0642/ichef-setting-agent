# updateComboMenuItem MCP Tool - 產品需求文件 (PRD)

## 1. 功能概述

擴充現有 `updateMenuItem` MCP tool，支援編輯套餐商品（COMBO_ITEM）的子品項結構。基於現有的 `UpdateMenuItemPayload.comboItemCategories` 欄位實現套餐分類和子商品的編輯功能。

## 2. API 規格

### 2.1 輸入參數（inputSchema）

```typescript
interface UpdateComboMenuItemArgs extends UpdateMenuItemArgs {
  comboItemCategories?: ComboItemCategoryInput[];
}

interface ComboItemCategoryInput {
  uuid?: string; // 用於更新現有分類
  name: string;
  allowRepeatableSelection: boolean;
  minimumSelection: number;
  maximumSelection: number;
  comboMenuItemSortingType?: string;
  comboMenuItems?: ComboMenuItemInput[];
}

interface ComboMenuItemInput {
  uuid?: string; // 用於更新現有子商品
  menuItemUuid: string; // 關聯的單品商品 UUID
  price?: string; // 加價金額（字串格式）
}
```

### 2.2 GraphQL API

- **Mutation**: 使用現有的 `MENU_ITEM_UPDATE_MUTATION`
- **Payload**: 利用 `UpdateMenuItemPayload.comboItemCategories` 欄位
- **驗證**: 確保商品類型為 `combo`

### 2.3 參數驗證規則

1. **uuid**: 必填，有效的 UUID 格式
2. **comboItemCategories**: 選填陣列
   - **name**: 必填字串，1-255 字元
   - **minimumSelection**: 必填，≥ 0 的整數
   - **maximumSelection**: 必填，≥ minimumSelection 的整數
   - **allowRepeatableSelection**: 必填布林值
3. **comboMenuItems**: 選填陣列
   - **menuItemUuid**: 必填，有效的 UUID 格式
   - **price**: 選填，數字字串格式

## 3. Response 格式

### 3.1 成功回應格式

```
✅ 套餐更新成功！

🆔 商品 UUID: [uuid]

📋 更新的套餐結構:
📂 分類: [分類名稱]
   ├─ 選擇規則: 最少 [min] 項，最多 [max] 項
   ├─ 重複選擇: [允許/不允許]
   └─ 子商品數量: [數量] 項
      ├─ 🍔 [子商品名稱] - 加價 $[價格]
      └─ 🍟 [子商品名稱] - 加價 $[價格]

💰 套餐基本資訊:
├─ 商品名稱: [名稱]
├─ 基本價格: $[價格]
└─ 狀態: [啟用/停用]
```

### 3.2 錯誤回應格式

```
🚨 更新套餐時發生錯誤:

[具體錯誤訊息]

💡 建議檢查:
- 商品 UUID 是否存在且為套餐類型
- 分類選擇規則是否合理 (min ≤ max)
- 關聯的子商品 UUID 是否有效
- 網路連線是否正常
- Token 是否有效

原始錯誤: [詳細錯誤資訊]
```

## 4. 技術實作要點

### 4.1 工具擴充方式

- **選項1**: 修改現有 `updateMenuItem` 工具，增加套餐相關參數
- **選項2**: 創建新的 `updateComboMenuItem` 工具，繼承基本更新功能

### 4.2 回應格式化

- 延續現有 `formatUpdateSuccessResponse` 函數的設計模式
- 增加套餐結構的層級化顯示
- 使用 emoji 和縮排提升可讀性

### 4.3 錯誤處理

- 沿用現有的錯誤分類和處理邏輯
- 增加套餐特定的驗證錯誤訊息
- 提供具體的修復建議

### 4.4 相容性考量

- 當商品類型為 `ITEM` 時，忽略 `comboItemCategories` 參數
- 保持現有 `updateMenuItem` 功能完全相容
