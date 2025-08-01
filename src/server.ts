import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  GetPromptRequestSchema,
  ListPromptsRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import winston from 'winston';
import createMenuItem from './tools/createMenuItem.js';
import getAllMenuItems from './tools/getAllMenuItems.js';
import getMenuItemDetails from './tools/getMenuItemDetails.js';
import getMenuItemTags from './tools/getMenuItemTags.js';
import updateMenuItem from './tools/updateMenuItem.js';
import updateOnlineRestaurantStatus from './tools/updateOnlineRestaurantStatus.js';
import updateSoldOutMenuItem from './tools/updateSoldOutMenuItem.js';

// 設定日誌記錄器 - 輸出到 stderr 避免干擾 MCP 協議
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    // 輸出到 stderr 而不是 stdout，避免干擾 MCP JSON 通訊
    new winston.transports.Console({
      stderrLevels: ['error', 'warn', 'info', 'debug', 'verbose', 'silly'],
      format: winston.format.simple(),
    }),
  ],
});

// 創建 MCP Server 實例
const server = new Server(
  {
    name: 'ichef-setting-agent',
    version: '1.0.1',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
      prompts: {},
    },
  }
);

// 註冊所有工具
const tools = [
  getAllMenuItems,
  createMenuItem,
  updateMenuItem,
  updateSoldOutMenuItem,
  getMenuItemDetails,
  getMenuItemTags,
  updateOnlineRestaurantStatus,
];

// 系統資源列表
const resources = [
  {
    uri: 'ichef://system/info',
    name: 'System Information',
    description: 'iChef MCP Server 系統資訊',
    mimeType: 'application/json',
  },
  {
    uri: 'ichef://api/status',
    name: 'API Status',
    description: 'iChef API 連接狀態',
    mimeType: 'application/json',
  },
  {
    uri: 'ichef://tools/stats',
    name: 'Tools Statistics',
    description: '工具使用統計資訊',
    mimeType: 'application/json',
  },
];

// 系統提示模板
const prompts = [
  {
    name: 'menu-management-help',
    description: '菜單管理操作說明',
    arguments: [],
  },
  {
    name: 'error-troubleshooting',
    description: '錯誤排除指南',
    arguments: [
      {
        name: 'error_type',
        description: '錯誤類型',
        required: false,
      },
    ],
  },
];

// 註冊工具列表處理器
server.setRequestHandler(ListToolsRequestSchema, async () => {
  logger.info('Received ListTools request');

  return {
    tools: tools.map(tool => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
    })),
  };
});

// 註冊工具呼叫處理器
server.setRequestHandler(CallToolRequestSchema, async request => {
  const { name, arguments: args } = request.params;

  logger.info(`Received CallTool request for: ${name}`, { args });

  try {
    // 尋找對應的工具
    const tool = tools.find(t => t.name === name);

    if (!tool) {
      const error = `Unknown tool: ${name}`;
      logger.error(error);
      throw new Error(error);
    }

    // 執行工具
    const result = await tool.handler(args);
    logger.info(`Tool ${name} executed successfully`);

    // 返回符合 MCP 格式的回應
    return {
      content: result.content,
      isError: result.isError || false,
    };
  } catch (error) {
    logger.error(`Error executing tool ${name}:`, error);

    // 返回錯誤回應
    return {
      content: [
        {
          type: 'text',
          text: `執行工具 ${name} 時發生錯誤: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

// 註冊資源列表處理器
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  logger.info('Received ListResources request');

  return {
    resources: resources,
  };
});

// 註冊資源讀取處理器
server.setRequestHandler(ReadResourceRequestSchema, async request => {
  const { uri } = request.params;

  logger.info(`Received ReadResource request for: ${uri}`);

  try {
    switch (uri) {
      case 'ichef://system/info':
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(
                {
                  name: 'iChef Setting Agent',
                  version: '1.0.1',
                  description: 'iChef 餐廳商品管理 MCP Server',
                  capabilities: ['tools', 'resources', 'prompts'],
                  tools: tools.map(t => ({
                    name: t.name,
                    category: t.category,
                  })),
                  uptime: process.uptime(),
                  memory: process.memoryUsage(),
                  platform: process.platform,
                  nodeVersion: process.version,
                },
                null,
                2
              ),
            },
          ],
        };

      case 'ichef://api/status':
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(
                {
                  status: 'operational',
                  endpoint:
                    process.env.GRAPHQL_ENDPOINT ||
                    'http://localhost:8026/api/graphql/',
                  hasToken: !!process.env.GRAPHQL_TOKEN,
                  lastCheck: new Date().toISOString(),
                },
                null,
                2
              ),
            },
          ],
        };

      case 'ichef://tools/stats':
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(
                {
                  totalTools: tools.length,
                  toolsByCategory: tools.reduce(
                    (acc, tool) => {
                      const category = tool.category || 'unknown';
                      acc[category] = (acc[category] || 0) + 1;
                      return acc;
                    },
                    {} as Record<string, number>
                  ),
                  toolsList: tools.map(t => ({
                    name: t.name,
                    category: t.category,
                    version: t.version,
                  })),
                },
                null,
                2
              ),
            },
          ],
        };

      default:
        throw new Error(`Unknown resource: ${uri}`);
    }
  } catch (error) {
    logger.error(`Error reading resource ${uri}:`, error);
    throw error;
  }
});

// 註冊提示列表處理器
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  logger.info('Received ListPrompts request');

  return {
    prompts: prompts,
  };
});

// 註冊提示取得處理器
server.setRequestHandler(GetPromptRequestSchema, async request => {
  const { name, arguments: args } = request.params;

  logger.info(`Received GetPrompt request for: ${name}`, { args });

  try {
    switch (name) {
      case 'menu-management-help':
        return {
          description: '菜單管理操作說明',
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: '我需要關於菜單管理的幫助',
              },
            },
            {
              role: 'assistant',
              content: {
                type: 'text',
                text: `# iChef 菜單管理操作指南

## 可用工具

### 1. getAllMenuItems
- **功能**: 取得所有菜單項目和分類
- **使用方式**: 直接呼叫，無需參數
- **回應**: 完整的菜單結構，包含所有商品和分類資訊

### 2. createMenuItem
- **功能**: 新增新的菜單商品
- **必填參數**:
  - name: 商品名稱
  - price: 商品價格
  - categoryUuid: 商品分類 UUID
- **選填參數**:
  - type: 商品類型 (item/combo)
  - enabled: 是否啟用
  - sortingIndex: 排序索引
  - picture: 商品圖片 URL

## 使用範例

1. 查看所有菜單項目:
   \`\`\`
   使用 getAllMenuItems 工具
   \`\`\`

2. 新增商品:
   \`\`\`
   使用 createMenuItem 工具
   參數: {"name": "新商品", "price": 150, "categoryUuid": "分類UUID"}
   \`\`\`

## 注意事項

- 確保 API 端點和認證 Token 已正確設定
- 商品分類 UUID 必須是有效的現有分類
- 價格必須是正數`,
              },
            },
          ],
        };

      case 'error-troubleshooting': {
        const errorType = args?.error_type as string;
        return {
          description: '錯誤排除指南',
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: `我遇到了${errorType ? `${errorType}相關的` : ''}錯誤，需要幫助`,
              },
            },
            {
              role: 'assistant',
              content: {
                type: 'text',
                text: `# 錯誤排除指南

## 常見錯誤類型

### 1. 網路連線錯誤
- 檢查 API 端點設定
- 確認網路連線狀態
- 驗證防火牆設定

### 2. 認證錯誤
- 檢查 Authorization Token
- 確認 Token 是否過期
- 驗證 Token 權限

### 3. GraphQL 錯誤
- 檢查查詢語法
- 確認欄位名稱正確
- 驗證參數類型

### 4. 資料驗證錯誤
- 檢查必填欄位
- 確認資料格式
- 驗證數值範圍

## 除錯步驟

1. 查看系統資訊: 使用 ichef://system/info 資源
2. 檢查 API 狀態: 使用 ichef://api/status 資源
3. 查看工具統計: 使用 ichef://tools/stats 資源
4. 檢查日誌輸出
5. 聯繫技術支援

${errorType ? `\n### 針對 ${errorType} 的特定建議\n請提供更多錯誤詳情以獲得更精確的協助。` : ''}`,
              },
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown prompt: ${name}`);
    }
  } catch (error) {
    logger.error(`Error getting prompt ${name}:`, error);
    throw error;
  }
});

// 伺服器初始化函數
export async function initializeServer() {
  try {
    logger.info('Initializing iChef Setting MCP Server...');

    // 驗證環境變數
    if (!process.env.GRAPHQL_ENDPOINT) {
      logger.warn(
        'GRAPHQL_ENDPOINT not set, using default: http://localhost:8026/api/graphql/'
      );
    }

    if (!process.env.GRAPHQL_TOKEN) {
      logger.warn('GRAPHQL_TOKEN not set, API requests may fail');
    }

    // 註冊程序終止處理器
    process.on('SIGINT', () => {
      logger.info('Received SIGINT, shutting down gracefully...');
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      logger.info('Received SIGTERM, shutting down gracefully...');
      process.exit(0);
    });

    logger.info('iChef Setting MCP Server initialized successfully');
    logger.info(
      `Registered ${tools.length} tools, ${resources.length} resources, ${prompts.length} prompts`
    );

    return server;
  } catch (error) {
    logger.error('Failed to initialize server:', error);
    throw error;
  }
}

export { logger };
export default server;
