import {
  CreateMenuItemArgs,
  IChefMcpTool,
  McpToolResponse,
} from '../types/mcpTypes.js';

export const createMenuItem: IChefMcpTool = {
  name: 'createMenuItem',
  description: '新增一個新的菜單商品項目',
  category: 'item',
  version: '1.0.0',
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: '商品名稱',
      },
      price: {
        type: 'number',
        description: '商品價格',
      },
      categoryUuid: {
        type: 'string',
        description: '商品分類 UUID',
      },
      type: {
        type: 'string',
        enum: ['item', 'combo'],
        description: '商品類型',
      },
      enabled: {
        type: 'boolean',
        description: '是否啟用商品',
      },
      sortingIndex: {
        type: 'number',
        description: '商品排序索引',
      },
      picture: {
        type: 'string',
        description: '商品圖片 URL',
      },
    },
    required: ['name', 'price', 'categoryUuid'],
  },
  handler: async (args?: Record<string, unknown>): Promise<McpToolResponse> => {
    try {
      // 類型轉換和驗證
      const createArgs = args as unknown as CreateMenuItemArgs;

      // 基本驗證
      if (!createArgs.name || typeof createArgs.name !== 'string') {
        throw new Error('商品名稱是必填項目且必須是字串');
      }

      if (!createArgs.price || typeof createArgs.price !== 'number') {
        throw new Error('商品價格是必填項目且必須是數字');
      }

      if (
        !createArgs.categoryUuid ||
        typeof createArgs.categoryUuid !== 'string'
      ) {
        throw new Error('商品分類 UUID 是必填項目且必須是字串');
      }

      // TODO: 實作新增商品功能
      // 這裡需要實作實際的 GraphQL mutation 來新增商品

      return {
        content: [
          {
            type: 'text',
            text: `⚠️ 新增商品功能尚未實作，請等待後續開發\n\n接收到的參數:\n- 商品名稱: ${createArgs.name}\n- 價格: $${createArgs.price}\n- 分類 UUID: ${createArgs.categoryUuid}\n- 類型: ${createArgs.type || 'item'}\n- 啟用狀態: ${createArgs.enabled !== false ? '啟用' : '停用'}`,
          },
        ],
      };
    } catch (error) {
      // 詳細的錯誤處理
      let errorMessage = 'Unknown error occurred';

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      return {
        content: [
          {
            type: 'text',
            text: `🚨 新增商品時發生錯誤:\n\n${errorMessage}\n\n原始錯誤: ${error}`,
          },
        ],
        isError: true,
      };
    }
  },
};
