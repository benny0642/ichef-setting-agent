# 產品需求文件（PRD）- iChef 商品管理 MCP Server

## 1. 概述/總覽

本專案旨在開發一個 MCP (Model Context Protocol) Server，提供 iChef 餐廳商品管理功能。餐廳管理者可以透過 Claude 接上此 MCP Server 來進行商品的查詢、新增、編輯、停售狀態管理，以及商品註記（menuItemTag）的查詢操作。

**目標**：建立一個穩定、易用的 MCP Server，作為 Claude 與 iChef API 之間的橋樑，讓餐廳管理者能夠透過自然語言操作商品管理功能。

## 2. 目標

- 提供完整的商品管理功能，包括查詢、新增、編輯和註記管理
- 實現與 iChef GraphQL API 的穩定整合
- 確保錯誤處理機制完善，提供清晰的錯誤訊息
- 建立可擴展的架構，便於未來功能擴充
- 作為 POC (Proof of Concept) 驗證 MCP Server 的可行性

## 3. 用戶故事

### 3.1 商品查詢

- **身為**餐廳管理者，**我想要**透過 Claude 查詢所有商品資訊，**以便**了解目前的菜單狀況
- **身為**餐廳管理者，**我想要**查詢特定商品的詳細資訊，**以便**確認商品設定是否正確

### 3.2 商品新增

- **身為**餐廳管理者，**我想要**透過 Claude 新增新商品，**以便**快速更新菜單
- **身為**餐廳管理者，**我想要**在新增商品時收到驗證提示，**以便**確保資料正確性

### 3.3 商品編輯

- **身為**餐廳管理者，**我想要**編輯現有商品的資訊，**以便**調整價格或商品描述
- **身為**餐廳管理者，**我想要**部分更新商品資訊，**以便**只修改需要變更的欄位

### 3.4 商品註記查詢

- **身為**餐廳管理者，**我想要**查詢所有可用的商品註記（menuItemTag）和註記群組（tagGroup），**以便**了解可以為商品加上哪些標籤
- **身為**餐廳管理者，**我想要**看到註記和註記群組的詳細資訊（包括價格和子標籤），**以便**正確地為商品設定合適的標籤
- **身為**餐廳管理者，**我想要**了解註記群組內的子註記結構，**以便**選擇合適的註記組合

## 4. 功能需求

### 4.1 商品查詢功能

1. **取得所有商品列表**：系統必須能夠查詢並返回所有商品的完整資訊
2. **商品資訊欄位**：返回的商品資訊必須包含以下欄位：
   - `uuid`：商品唯一識別碼
   - `name`：商品名稱
   - `price`：商品價格
   - `type`：商品類型（ITEM, COMBO_ITEM）
   - `sortingIndex`：商品排序索引
   - `enabled`：商品啟用狀態
   - `isIncomplete`：商品完整性狀態
   - `menuItemCategoryUuid`：商品分類UUID
   - `isFromHq`：是否來自總部
   - `picture`：商品圖片
   - `comboItemCategoryUuidsMappedWithOnlineOrdering`：線上訂餐組合分類對應
   - `onlineRestaurantMenuItem`：線上餐廳商品資訊

### 4.2 商品新增功能

3. **新增商品**：系統必須支援新增新商品到菜單中
4. **必填欄位驗證**：新增商品時必須驗證商品名稱、價格、類別等必填欄位
5. **資料格式驗證**：系統必須驗證輸入資料的格式正確性

### 4.3 商品編輯功能

6. **部分更新支援**：系統必須支援商品資訊的部分更新
7. **欄位保護**：系統必須保護不可修改的欄位（如 uuid）
8. **更新驗證**：編輯時必須驗證商品是否存在

### 4.4 商品註記查詢功能

9. **取得所有註記資訊**：系統必須能夠查詢並返回所有可用的商品註記（menuItemTag）和註記群組（tagGroup）資訊
10. **註記（menuItemTag）詳細資訊**：返回的註記資訊必須包含以下欄位：
    - `uuid`：註記唯一識別碼
    - `name`：註記名稱
    - `type`：註記類型
    - `enabled`：註記啟用狀態
    - `price`：註記價格
    - `sortingIndex`：註記排序索引
11. **註記群組（tagGroup）詳細資訊**：返回的註記群組資訊必須包含以下欄位：
    - `uuid`：註記群組唯一識別碼
    - `name`：註記群組名稱
    - `enabled`：註記群組啟用狀態
    - `sortingIndex`：註記群組排序索引
    - `subTags`：子註記列表（包含上述 menuItemTag 資訊）
12. **註記與商品關聯**：系統必須能夠顯示註記與商品之間的關聯關係

### 4.5 錯誤處理

12. **API 錯誤處理**：系統必須捕捉並處理 iChef API 的錯誤回應
13. **用戶友好錯誤訊息**：系統必須提供清晰的錯誤訊息和處理建議
14. **錯誤日誌記錄**：系統必須記錄錯誤日誌以便除錯

## 5. 非目標（範圍外）

- 不包含用戶權限管理系統
- 不包含商品庫存管理
- 不包含訂單處理功能
- 不包含財務報表功能
- 不包含多餐廳管理
- 不包含即時通知功能
- 不包含商品圖片上傳功能
- 不包含批次操作功能（如批次停售、批次恢復販售）
- 不包含認證與授權機制（依賴外部配置）

## 6. 設計考量

### 6.1 API 整合

- **GraphQL 端點**：`http://localhost:8026/api/graphql/`（開發環境）
- **查詢操作**：
  - 使用 `menuItemListingQuery` 查詢商品列表
  - 使用 `menuItemQuery` 查詢單一商品詳細資訊
  - 新增 `menuItemTagListingQuery` 查詢所有商品註記（menuItemTag）與註記群組資訊
- **變更操作**：
  - 使用 `createMenuItemMutation` 新增商品
  - 使用 `updateMenuItemMutation` 更新商品
  - 使用 `updateSoldOutMenuItemMutation` 更新商品停售狀態

### 6.2 資料結構

- 遵循 iChef GraphQL schema 定義的資料結構
- 支援商品分類（MenuItemCategory）和商品項目（MenuItem）的層級關係
- 支援註記系統的雙層結構：
  - 註記群組（tagGroup）作為父層，包含多個子註記
  - 商品註記（menuItemTag）作為子層，可獨立存在或隸屬於註記群組
- 處理商品類型（ITEM, COMBO_ITEM）的差異
- 處理註記與商品之間的多對多關聯關係

### 6.3 MCP Server 架構

- 實現標準的 MCP Server 介面
- 提供清晰的工具（tools）定義
- 支援 Claude 的自然語言操作

## 7. 技術考量

### 7.1 依賴項目

- 需要與 iChef GraphQL API 整合
- 需要實現 MCP Server 協議
- 需要支援 TypeScript 開發環境

### 7.2 環境配置

- 開發環境：`http://localhost:8026/api/graphql/`
- 測試環境：獨立網域（待確認）
- 需要配置 Authorization token

### 7.3 錯誤處理策略

- 實現完整的錯誤捕捉機制
- 提供有意義的錯誤訊息
- 支援錯誤恢復建議

## 8. 成功指標

### 8.1 功能完整性

- 所有五個核心功能正常運作：
  - ✅ 商品查詢（getAllMenuItems, getMenuItemDetails）
  - ✅ 商品新增（createMenuItem）
  - ✅ 商品編輯（updateMenuItem）
  - ✅ 商品停售狀態管理（updateSoldOutMenuItem）
  - 🔄 商品註記查詢（getMenuItemTags）- 待實作
- 錯誤處理機制有效運作
- API 整合穩定可靠

### 8.2 用戶體驗

- Claude 能夠正確理解和執行商品管理指令
- 錯誤訊息清晰易懂
- 操作回應時間在可接受範圍內

### 8.3 技術指標

- API 調用成功率 > 95%
- 錯誤處理覆蓋率 100%
- 代碼通過 TypeScript 編譯檢查

## 9. 待解決問題

1. **註記 API 端點**：需要確認查詢所有商品註記（menuItemTag）和註記群組（tagGroup）的 GraphQL 查詢語法和欄位定義
2. **商品圖片處理**：商品圖片的上傳和管理方式需要釐清
3. **組合商品邏輯**：`comboItemCategoryUuidsMappedWithOnlineOrdering` 欄位的具體用途需要確認
4. **`isIncomplete` 欄位**：此欄位的確切意義和用途需要確認
5. **註記關聯邏輯**：商品與註記之間的關聯關係查詢和更新機制需要進一步確認
6. **getMenuItemTags 實作**：目前此工具尚未實際建立，需要完成實作

---

**文件版本**：1.0  
**建立日期**：2024年12月  
**目標開發者**：Junior Developer  
**專案類型**：POC (Proof of Concept)
