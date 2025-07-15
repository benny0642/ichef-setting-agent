# 使用 MCP Inspector 進行開發

## 什麼是 MCP Inspector？

MCP Inspector 是一個用於測試和除錯 Model Context Protocol (MCP) 伺服器的工具。它提供了一個圖形化介面，讓您可以：

- 測試 MCP 伺服器的工具 (tools)
- 檢查伺服器的資源 (resources)
- 除錯伺服器的行為
- 查看伺服器的日誌

## 設定步驟

### 1. 安裝依賴

```bash
npm install --save-dev @modelcontextprotocol/inspector
```

### 2. 建置專案

```bash
npm run build
```

### 3. 啟動 Inspector

```bash
npm run inspector
```

或者使用組合指令（建置後啟動）：

```bash
npm run dev:inspector
```

## 使用方式

### 1. 啟動 Inspector

執行 `npm run inspector` 後，Inspector 會：

- 啟動一個本地網頁伺服器
- 自動開啟瀏覽器
- 顯示 MCP 伺服器的管理介面

### 2. 連接到您的伺服器

Inspector 會讀取 `mcp-config.json` 檔案來了解如何連接到您的伺服器：

```json
{
  "mcpServers": {
    "ichef-setting-agent": {
      "command": "node",
      "args": ["./build/index.js"],
      "env": {
        "NODE_ENV": "development"
      }
    }
  }
}
```

### 3. 測試工具

在 Inspector 介面中，您可以：

1. **查看可用工具**：在左側面板查看所有註冊的工具
2. **測試工具**：點擊工具名稱，填入參數，執行測試
3. **查看結果**：在右側面板查看工具執行結果
4. **檢查日誌**：查看伺服器的除錯資訊

## 可用的工具

目前 iChef Setting Agent 提供以下工具：

- `getAllMenuItems`: 取得所有菜單項目
- `getMenuItemDetails`: 取得特定菜單項目詳細資訊
- `createMenuItem`: 建立新的菜單項目
- `updateMenuItem`: 更新菜單項目
- `updateSoldOutMenuItem`: 更新菜單項目的售完狀態

## 開發工作流程

### 1. 修改程式碼

在 `src/` 目錄下修改您的程式碼。

### 2. 建置並測試

```bash
npm run build
npm run inspector
```

### 3. 在 Inspector 中測試

- 測試新增或修改的工具
- 檢查參數驗證
- 確認回傳值格式

### 4. 除錯

如果遇到問題：

- 查看 Inspector 的錯誤訊息
- 檢查伺服器日誌
- 使用 `console.log` 或 `logger` 進行除錯

## 環境變數設定

建立 `.env` 檔案（參考 `.env.example`）：

```env
# iChef API Configuration
ICHEF_API_URL=https://api.ichef.com/graphql
ICHEF_API_TOKEN=your_api_token_here

# Development Configuration
NODE_ENV=development
LOG_LEVEL=debug
```

## 常見問題

### Q: Inspector 無法連接到伺服器？

**A**: 確認：

1. 已執行 `npm run build`
2. `mcp-config.json` 設定正確
3. 環境變數設定完整

### Q: 工具執行失敗？

**A**: 檢查：

1. 參數格式是否正確
2. API Token 是否有效
3. 網路連線是否正常

### Q: 如何查看詳細的除錯資訊？

**A**:

1. 設定 `LOG_LEVEL=debug` 在環境變數中
2. 在 Inspector 中查看 Console 標籤
3. 使用瀏覽器開發者工具

## 進階用法

### 自定義設定

您可以修改 `mcp-config.json` 來自定義設定：

```json
{
  "mcpServers": {
    "ichef-setting-agent": {
      "command": "node",
      "args": ["./build/index.js"],
      "env": {
        "NODE_ENV": "development",
        "LOG_LEVEL": "debug",
        "ICHEF_API_URL": "https://staging-api.ichef.com/graphql"
      }
    }
  }
}
```

### 同時測試多個伺服器

您可以在 `mcp-config.json` 中定義多個伺服器：

```json
{
  "mcpServers": {
    "ichef-setting-agent": {
      "command": "node",
      "args": ["./build/index.js"]
    },
    "another-server": {
      "command": "node",
      "args": ["./path/to/another/server.js"]
    }
  }
}
```

## 相關資源

- [MCP Inspector 官方文件](https://github.com/modelcontextprotocol/inspector)
- [MCP SDK 文件](https://github.com/modelcontextprotocol/sdk)
- [iChef API 文件](https://api-docs.ichef.com)
