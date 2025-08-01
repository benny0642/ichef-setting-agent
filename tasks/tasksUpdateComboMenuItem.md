# Update Combo Menu Item - 任務清單

## 任務

- [ ] 1.0 擴充 TypeScript 類型定義以支援套餐商品結構
  - [ ] 1.1 在 `src/types/menuTypes.ts` 中新增套餐相關的 Input 介面
    - 相關資訊：
      - 類型: `ComboItemCategoryInput`, `ComboMenuItemInput` - 已存在於 `src/types/generated.ts`
      - 參考: PRD 中定義的 `UpdateComboMenuItemArgs` 介面
  - [ ] 1.2 擴充現有的 `UpdateMenuItemArgs` 介面，加入 `comboItemCategories` 欄位
    - 相關資訊：
      - 檔案: `src/tools/updateMenuItem.ts` 第 10-24 行
      - 類型: 基於 `generated.ts` 中的 `ComboItemCategoryInput[]`
  - [ ] 1.3 更新類型轉換器以支援套餐結構驗證
    - 相關資訊：
      - 檔案: `src/types/typeConverters.ts` - `convertToUpdateMenuItemPayload` 函數
      - 檔案: `src/types/typeValidators.ts` - `validateUpdateMenuItemPayload` 函數

- [ ] 2.0 修改現有 updateMenuItem 工具以支援套餐編輯功能
  - [ ] 2.1 更新 inputSchema 定義，新增套餐相關參數
    - 相關資訊：
      - 檔案: `src/tools/updateMenuItem.ts` 第 133-244 行
      - Schema: 需要定義 `comboItemCategories` 的 JSON Schema 結構
  - [ ] 2.2 擴充參數驗證邏輯，加入套餐特定驗證規則
    - 相關資訊：
      - 檔案: `src/tools/updateMenuItem.ts` 第 262-412 行的驗證邏輯
      - 驗證項目: UUID 格式、選擇規則 (min ≤ max)、關聯商品存在性
  - [ ] 2.3 修改 GraphQL payload 建構邏輯，支援 `comboItemCategories` 欄位
    - 相關資訊：
      - 檔案: `src/tools/updateMenuItem.ts` 第 414-464 行
      - API: 使用現有的 `MENU_ITEM_UPDATE_MUTATION`
      - Payload: `UpdateMenuItemPayload.comboItemCategories` 欄位已存在
  - [ ] 2.4 增加商品類型驗證，確保只有 `combo` 類型商品可使用套餐功能
    - 相關資訊：
      - 邏輯: 當提供 `comboItemCategories` 時，檢查商品 `type` 是否為 `COMBO_ITEM`
      - 錯誤訊息: 當類型不符時提供清楚的錯誤說明

- [ ] 3.0 實作套餐專用的回應格式化和錯誤處理
  - [ ] 3.1 擴充 `formatUpdateSuccessResponse` 函數，增加套餐結構顯示
    - 相關資訊：
      - 檔案: `src/tools/updateMenuItem.ts` 第 27-126 行
      - 格式: 參考 PRD 中定義的層級化顯示格式
      - 內容: 分類名稱、選擇規則、子商品列表
  - [ ] 3.2 新增套餐特定的錯誤處理和建議訊息
    - 相關資訊：
      - 檔案: `src/tools/updateMenuItem.ts` 第 494-554 行錯誤處理邏輯
      - 新增錯誤類型: 套餐結構驗證失敗、關聯商品不存在等
  - [ ] 3.3 實作套餐更新成功時的詳細資訊顯示
    - 相關資訊：
      - 顯示內容: 更新的分類數量、子商品變更、選擇規則調整
      - 格式: 使用 emoji 和縮排提升可讀性

### 相關檔案

- `src/tools/updateMenuItem.ts` - 主要工具檔案，需要擴充以支援套餐編輯功能
- `src/types/menuTypes.ts` - 包含商品相關類型定義，需要新增套餐 Input 介面
- `src/types/generated.ts` - 包含 GraphQL 自動生成的類型，包括 `ComboItemCategoryInput` 和 `ComboMenuItemInput`
- `src/api/gql/updateMenuItemMutation.ts` - 包含更新商品的 GraphQL mutation，已支援 `comboItemCategories`
- `src/types/typeConverters.ts` - 包含類型轉換函數，需要擴充支援套餐結構
- `src/types/typeValidators.ts` - 包含驗證邏輯，需要新增套餐相關驗證規則
