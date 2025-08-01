# Combo Menu Item Creation - 任務清單

## 任務

- [ ] 1.0 GraphQL Mutation 擴展：更新 createMenuItemMutation 支援套餐商品資料結構
  - [ ] 1.1 在 createMenuItemMutation.ts 中的 GraphQL mutation 加入 comboItemCategories 欄位
    - 相關資訊：
      - GraphQL Mutation: `MENU_ITEM_CREATE_MUTATION` - 當前僅查詢 uuid，需擴展支援 comboItemCategories
      - Schema Type: `CreateMenuItemPayload` - 已包含 comboItemCategories 欄位定義
      - Fragment: `comboItemCategoryFields` - 已存在於 menuItemQuery.ts，可重用

- [ ] 2.0 MCP Tool 功能擴展：擴展 createMenuItem tool 支援套餐商品建立和驗證
  - [ ] 2.1 擴展 CreateMenuItemArgs 介面支援套餐分類參數
    - 相關資訊：
      - Interface: `CreateMenuItemArgs` - 需新增 comboItemCategories 欄位
      - Type: `ComboItemCategoryInput` - 來自 generated.ts，定義套餐分類輸入格式
      - Type: `ComboMenuItemInput` - 套餐選項輸入格式
  - [ ] 2.2 在 inputSchema 中新增套餐相關欄位的 JSON Schema 定義
    - 相關資訊：
      - Schema: 需支援嵌套的 comboItemCategories 陣列結構
      - Validation: name(必填), minimumSelection/maximumSelection(選填，預設1), comboMenuItems(必填陣列)
  - [ ] 2.3 實作套餐參數驗證邏輯
    - 相關資訊：
      - Function: 需驗證套餐至少有一個分類，每個分類至少有一個選項
      - UUID Validation: 複用現有的 uuidRegex 驗證 menuItemUuid
      - Price Validation: 自訂價格必須為非負數或未定義
  - [ ] 2.4 擴展 GraphQL payload 建構邏輯支援套餐資料
    - 相關資訊：
      - Current Logic: 第195-215行的 payload 建構需擴展
      - Type Mapping: 將 "combo" 映射為 GraphQL 的 "COMBO_ITEM"
      - Data Transform: comboItemCategories 結構轉換

- [ ] 3.0 套餐商品回應處理：實作套餐特有的回應格式化和錯誤處理機制
  - [ ] 3.1 實作套餐專用的成功回應格式化函數
    - 相關資訊：
      - Function: `formatCreateSuccessResponse` - 需根據 type 選擇不同格式化邏輯
      - Display Logic: 套餐需顯示分類結構和選項詳情
      - Data Structure: 需從 GraphQL 回應解析套餐結構
  - [ ] 3.2 擴展錯誤處理覆蓋套餐特有的錯誤情境
    - 相關資訊：
      - Error Cases: 套餐分類為空、選項缺失、UUID格式錯誤等
      - Error Messages: 提供具體位置資訊（第幾個分類、第幾個選項）
      - Consistency: 保持與現有錯誤格式一致（使用 ❌ 符號等）
  - [ ] 3.3 更新 GraphQL mutation 查詢回傳套餐完整結構
    - 相關資訊：
      - Query Fragment: 重用 `comboItemCategoryFields` fragment
      - Return Fields: uuid, name, comboMenuItems 等完整資訊
      - Performance: 避免過度查詢，僅在 type 為 combo 時查詢相關欄位

### 相關檔案

- `src/api/gql/createMenuItemMutation.ts` - 需要擴展 GraphQL mutation 包含 comboItemCategories 欄位
- `src/tools/createMenuItem.ts` - 需要擴展介面、驗證邏輯和回應格式化
- `src/types/generated.ts` - 包含 ComboItemCategoryInput, ComboMenuItemInput 等類型定義
- `src/types/menuTypes.ts` - 包含 ComboItemCategoryType 等相關類型
- `src/api/gql/menuItemQuery.ts` - 包含可重用的 comboItemCategoryFields fragment
