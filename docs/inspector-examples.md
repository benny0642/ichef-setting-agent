# MCP Inspector 使用範例

## 快速開始

1. **啟動 Inspector**

   ```bash
   npm run start:inspector
   ```

2. **開啟瀏覽器**
   - Inspector 會自動開啟 http://localhost:3000
   - 如果沒有自動開啟，請手動前往該網址

3. **連接到伺服器**
   - 在左側面板選擇 "ichef-setting-agent"
   - 點擊 "Connect" 連接到伺服器

## 工具測試範例

### 1. 測試 getAllMenuItems

**目的**: 取得所有菜單項目列表

**步驟**:

1. 在左側工具列表中點擊 `getAllMenuItems`
2. 不需要輸入任何參數
3. 點擊 "Execute" 執行

**預期結果**:

```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "cat_123",
        "name": "主餐",
        "items": [
          {
            "id": "item_456",
            "name": "牛肉麵",
            "price": 180,
            "available": true
          }
        ]
      }
    ]
  }
}
```

### 2. 測試 getMenuItemDetails

**目的**: 取得特定菜單項目的詳細資訊

**步驟**:

1. 點擊 `getMenuItemDetails`
2. 輸入參數：
   ```json
   {
     "itemId": "item_456"
   }
   ```
3. 點擊 "Execute"

**預期結果**:

```json
{
  "success": true,
  "data": {
    "id": "item_456",
    "name": "牛肉麵",
    "description": "香濃牛肉湯配手工麵條",
    "price": 180,
    "category": "主餐",
    "available": true,
    "soldOut": false,
    "images": ["https://example.com/beef-noodle.jpg"],
    "ingredients": ["牛肉", "麵條", "青菜"],
    "allergens": ["麩質"]
  }
}
```

### 3. 測試 createMenuItem (單品)

**目的**: 建立新的菜單項目

**步驟**:

1. 點擊 `createMenuItem`
2. 輸入參數：
   ```json
   {
     "name": "雞肉飯",
     "price": 120,
     "menuItemCategoryUuid": "550e8400-e29b-41d4-a716-446655440000",
     "type": "item",
     "enabled": true
   }
   ```
3. 點擊 "Execute"

### 4. 測試 createMenuItem (套餐)

**目的**: 建立新的套餐商品

**步驟**:

1. 點擊 `createMenuItem`
2. 輸入參數：
   ```json
   {
     "name": "午餐套餐",
     "price": 250,
     "menuItemCategoryUuid": "550e8400-e29b-41d4-a716-446655440000",
     "type": "combo",
     "enabled": true,
     "comboItemCategories": [
       {
         "name": "主餐",
         "minimumSelection": 1,
         "maximumSelection": 1,
         "comboMenuItems": [
           {
             "menuItemUuid": "550e8400-e29b-41d4-a716-446655440001"
           },
           {
             "menuItemUuid": "550e8400-e29b-41d4-a716-446655440002",
             "price": "20"
           }
         ]
       },
       {
         "name": "飲料",
         "minimumSelection": 1,
         "maximumSelection": 2,
         "allowRepeatableSelection": true,
         "comboMenuItems": [
           {
             "menuItemUuid": "550e8400-e29b-41d4-a716-446655440003"
           },
           {
             "menuItemUuid": "550e8400-e29b-41d4-a716-446655440004",
             "price": "10"
           }
         ]
       }
     ]
   }
   ```
3. 點擊 "Execute"

**預期結果**:

```json
{
  "success": true,
  "data": {
    "id": "item_789",
    "name": "雞肉飯",
    "description": "香嫩雞肉配白飯",
    "price": 120,
    "categoryId": "cat_123",
    "available": true,
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "message": "菜單項目已成功建立"
}
```

### 4. 測試 updateMenuItem

**目的**: 更新現有菜單項目

**步驟**:

1. 點擊 `updateMenuItem`
2. 輸入參數：
   ```json
   {
     "itemId": "item_456",
     "name": "特製牛肉麵",
     "price": 200,
     "description": "升級版牛肉麵，加料更豐富"
   }
   ```
3. 點擊 "Execute"

**預期結果**:

```json
{
  "success": true,
  "data": {
    "id": "item_456",
    "name": "特製牛肉麵",
    "description": "升級版牛肉麵，加料更豐富",
    "price": 200,
    "updatedAt": "2024-01-15T11:00:00Z"
  },
  "message": "菜單項目已成功更新"
}
```

### 5. 測試 updateSoldOutMenuItem

**目的**: 更新菜單項目的售完狀態

**步驟**:

1. 點擊 `updateSoldOutMenuItem`
2. 輸入參數：
   ```json
   {
     "itemId": "item_456",
     "soldOut": true
   }
   ```
3. 點擊 "Execute"

**預期結果**:

```json
{
  "success": true,
  "data": {
    "id": "item_456",
    "name": "特製牛肉麵",
    "soldOut": true,
    "updatedAt": "2024-01-15T11:15:00Z"
  },
  "message": "菜單項目售完狀態已更新"
}
```

## 錯誤處理測試

### 測試無效的項目 ID

**步驟**:

1. 使用 `getMenuItemDetails` 工具
2. 輸入不存在的 itemId：
   ```json
   {
     "itemId": "invalid_id"
   }
   ```

**預期結果**:

```json
{
  "success": false,
  "error": "ITEM_NOT_FOUND",
  "message": "找不到指定的菜單項目",
  "details": {
    "itemId": "invalid_id"
  }
}
```

### 測試缺少必要參數

**步驟**:

1. 使用 `createMenuItem` 工具
2. 輸入不完整的參數：
   ```json
   {
     "name": "測試項目"
   }
   ```

**預期結果**:

```json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "參數驗證失敗",
  "details": {
    "missingFields": ["price", "categoryId"],
    "invalidFields": []
  }
}
```

## 除錯技巧

### 1. 查看詳細日誌

在 Inspector 介面中：

- 點擊右上角的 "Console" 標籤
- 查看伺服器的即時日誌輸出
- 注意錯誤訊息和警告

### 2. 檢查網路請求

使用瀏覽器開發者工具：

- 按 F12 開啟開發者工具
- 切換到 "Network" 標籤
- 執行工具時觀察 HTTP 請求

### 3. 測試 API 連接

確認 API 設定正確：

1. 檢查 `.env` 檔案中的 `GRAPHQL_ENDPOINT` 和 `GRAPHQL_TOKEN`
2. 使用 `getAllMenuItems` 測試基本連接
3. 查看錯誤訊息判斷是否為認證問題

### 4. 驗證參數格式

常見的參數格式錯誤：

- JSON 格式不正確（缺少引號、逗號等）
- 資料類型錯誤（字串 vs 數字）
- 必要欄位缺失

## 常見問題排除

### Q: Inspector 無法連接到伺服器

**解決方案**:

1. 確認已執行 `npm run build`
2. 檢查 `mcp-config.json` 設定
3. 確認 `.env` 檔案設定正確
4. 查看 Console 中的錯誤訊息

### Q: 工具執行失敗

**解決方案**:

1. 檢查參數格式是否正確
2. 確認 API Token 是否有效
3. 檢查網路連線
4. 查看伺服器日誌

### Q: 資料格式不符預期

**解決方案**:

1. 檢查 API 文件確認資料格式
2. 使用 `getAllMenuItems` 先查看現有資料結構
3. 確認 GraphQL schema 是否最新

## 進階使用

### 自動化測試腳本

您可以建立測試腳本來自動化常見的測試場景：

```javascript
// test-scenarios.js
const testScenarios = [
  {
    tool: 'getAllMenuItems',
    params: {},
    expected: { success: true },
  },
  {
    tool: 'getMenuItemDetails',
    params: { itemId: 'item_456' },
    expected: { success: true },
  },
];

// 在 Inspector 的 Console 中執行
testScenarios.forEach(scenario => {
  console.log(`Testing ${scenario.tool}...`);
  // 執行測試邏輯
});
```

### 效能測試

使用 Inspector 進行效能測試：

1. 記錄工具執行時間
2. 測試大量資料的處理
3. 檢查記憶體使用情況
4. 監控 API 回應時間
