# iChef Setting Agent - MCP Server

一個用於管理 iChef 餐廳商品的 Model Context Protocol (MCP) Server。

## 📋 功能特色

- 🔍 **商品查詢**: 取得所有菜單項目和分類資訊
- ➕ **商品新增**: 新增新的菜單商品項目
- ✏️ **商品編輯**: 編輯現有商品資訊（開發中）
- 🔄 **批次操作**: 批次停售/恢復販售商品（開發中）
- 🛠️ **錯誤處理**: 完善的錯誤處理和用戶友好的錯誤訊息
- 📊 **系統監控**: 提供系統資訊、API 狀態和工具統計
- 📖 **內建幫助**: 提供操作指南和錯誤排除說明

## 🏗️ 專案結構

```
ichef-setting-agent/
├── src/
│   ├── api/                    # API 相關模組
│   │   ├── gql/               # GraphQL 查詢和 mutation
│   │   │   ├── createMenuItemMutation.ts
│   │   │   └── menuItemListingQuery.ts
│   │   └── graphqlClient.ts   # GraphQL 客戶端配置
│   ├── config/                # 配置管理
│   │   └── apiConfig.ts       # API 和環境變數配置
│   ├── tools/                 # MCP 工具實現
│   │   ├── createMenuItem.ts  # 新增商品工具
│   │   └── getAllMenuItems.ts # 查詢商品工具
│   ├── types/                 # TypeScript 類型定義
│   │   ├── mcpTypes.ts       # MCP 相關類型
│   │   └── menuTypes.ts      # 菜單相關類型
│   ├── utils/                 # 工具函數
│   │   ├── errorHandler.ts   # 錯誤處理工具
│   │   ├── toolManager.ts    # 工具管理器
│   │   └── validator.ts      # 資料驗證工具
│   ├── index.ts              # 主要入口點
│   └── server.ts             # MCP Server 核心實現
├── tasks/                     # 任務和文件
│   ├── PRD-ICHEF-MENU-ITEM-MANAGEMENT.md
│   └── TASKS-PRD-ICHEF-MENU-ITEM-MANAGEMENT.md
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 快速開始

### 1. 安裝依賴項目

```bash
npm install
```

### 2. 環境變數設定

創建 `.env` 檔案（**必須設定**）：

```env
# GraphQL API 設定（必填）
GRAPHQL_ENDPOINT=http://localhost:8026/api/graphql/
GRAPHQL_TOKEN=your-api-token-here

# API 連接設定（選填，有預設值）
API_TIMEOUT=30000
API_RETRY_ATTEMPTS=3
API_RETRY_DELAY=1000

# 伺服器設定（選填，有預設值）
SERVER_NAME=ichef-setting-agent
SERVER_VERSION=1.0.1
LOG_LEVEL=info
NODE_ENV=development
```

> ⚠️ **重要**: `GRAPHQL_ENDPOINT` 和 `GRAPHQL_TOKEN` 是必填項目，沒有設定會導致伺服器無法啟動。

### 3. 編譯專案

```bash
npm run build
```

### 4. 啟動伺服器

```bash
npm start
```

或者開發模式：

```bash
npm run dev
```

### 5. 使用 MCP Inspector 進行開發（推薦）

我們提供了 MCP Inspector 來幫助您測試和除錯伺服器：

```bash
# 快速啟動 Inspector（建議）
npm run start:inspector

# 或者分別執行
npm run build
npm run inspector
```

Inspector 會：

- 🌐 在瀏覽器中開啟圖形化介面
- 🔧 讓您測試所有工具功能
- 📊 顯示伺服器狀態和日誌
- 🐛 協助除錯和開發

詳細使用說明請參考：[MCP Inspector 開發指南](docs/development-with-inspector.md)

### 6. Claude Desktop 配置

在 Claude Desktop 中使用此 MCP Server，需要在 Claude 的配置檔案中加入以下設定：

**macOS 配置檔案位置**: `~/Library/Application Support/Claude/claude_desktop_config.json`

**Windows 配置檔案位置**: `%APPDATA%/Claude/claude_desktop_config.json`

**配置內容**:

```json
{
  "mcpServers": {
    "ichef-setting-agent": {
      "command": "node",
      "args": ["build/index.js"],
      "cwd": "/path/to/your/ichef-setting-agent",
      "env": {
        "GRAPHQL_ENDPOINT": "http://localhost:8026/api/graphql/",
        "GRAPHQL_TOKEN": "your-api-token-here",
        "API_TIMEOUT": "30000",
        "API_RETRY_ATTEMPTS": "3",
        "API_RETRY_DELAY": "1000",
        "SERVER_NAME": "ichef-setting-agent",
        "SERVER_VERSION": "1.0.1",
        "LOG_LEVEL": "info",
        "NODE_ENV": "production"
      }
    }
  }
}
```

**配置步驟**:

1. 確保專案已編譯完成 (`npm run build`)
2. 將上述配置加入 Claude Desktop 配置檔案
3. 修改 `cwd` 路徑為你的專案實際路徑
4. 更新環境變數中的 API 端點和 Token
5. 重新啟動 Claude Desktop
6. 在 Claude 中即可使用 iChef 商品管理功能

**驗證配置**:

配置完成後，在 Claude 中可以使用以下指令測試：

- "請幫我查詢所有菜單項目"
- "請幫我新增一個商品"
- "顯示系統狀態"

## 🔧 可用工具

### 1. getAllMenuItems

取得所有菜單項目和分類的詳細資訊。

**使用方式**: 直接呼叫，無需參數

**回應**: 完整的菜單結構，包含所有商品和分類資訊

### 2. createMenuItem

新增一個新的菜單商品項目。

**必填參數**:

- `name`: 商品名稱
- `price`: 商品價格
- `categoryUuid`: 商品分類 UUID

**選填參數**:

- `type`: 商品類型 (`item` 或 `combo`)
- `enabled`: 是否啟用商品
- `sortingIndex`: 排序索引
- `picture`: 商品圖片 URL

**範例**:

```json
{
  "name": "新商品",
  "price": 150,
  "categoryUuid": "12345678-1234-1234-1234-123456789012",
  "type": "item",
  "enabled": true
}
```

## 📊 系統資源

### 系統資訊 (`ichef://system/info`)

提供伺服器的基本資訊，包括版本、運行時間、記憶體使用等。

### API 狀態 (`ichef://api/status`)

顯示 iChef API 的連接狀態和配置資訊。

### 工具統計 (`ichef://tools/stats`)

提供工具使用統計和分類資訊。

## 🆘 內建幫助

### 菜單管理說明 (`menu-management-help`)

提供詳細的操作指南和使用範例。

### 錯誤排除指南 (`error-troubleshooting`)

提供常見錯誤的排除方法和建議。

## 🔍 開發指南

### 新增工具

1. 在 `src/tools/` 目錄下創建新的工具文件
2. 實現 `IChefMcpTool` 介面
3. 在 `src/server.ts` 中註冊工具
4. 新增相應的驗證邏輯到 `src/utils/validator.ts`

### 錯誤處理

使用 `src/utils/errorHandler.ts` 中的工具函數：

```typescript
import { handleError } from '../utils/errorHandler.js';

try {
  // 你的程式碼
} catch (error) {
  const { userMessage } = handleError(error, { context: 'additional info' });
  return {
    content: [{ type: 'text', text: userMessage }],
    isError: true,
  };
}
```

### 資料驗證

使用 `src/utils/validator.ts` 中的驗證器：

```typescript
import { MenuItemValidators, validateAndThrow } from '../utils/validator.js';

// 驗證新增商品資料
validateAndThrow(data, MenuItemValidators.validateCreateMenuItem);
```

## 🧪 測試

```bash
npm test
```

## 📝 腳本命令

- `npm run build`: 編譯 TypeScript 程式碼
- `npm run dev`: 開發模式（監聽檔案變化）
- `npm start`: 啟動編譯後的伺服器
- `npm run format`: 格式化程式碼
- `npm run lint`: 程式碼檢查
- `npm run lint:fix`: 自動修正程式碼問題

## 🤝 貢獻指南

1. Fork 專案
2. 創建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交變更 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 開啟 Pull Request

## 📄 授權

此專案使用 ISC 授權條款。

## 🔗 相關連結

- [Model Context Protocol](https://modelcontextprotocol.io/)
- [iChef API 文件](https://your-api-docs-link)

---

**版本**: 1.0.1  
**狀態**: 開發中（POC）  
**維護者**: 開發團隊
