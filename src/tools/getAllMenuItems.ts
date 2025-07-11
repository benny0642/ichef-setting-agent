import { Tool as McpTool } from '@modelcontextprotocol/sdk/types.js';
import { MENU_ITEM_LISTING_QUERY } from '../api/gql/menuQueries.js';
import { createGraphQLClient } from '../api/graphqlClient.js';
import { MenuItemListingResponse } from '../types/menuTypes.js';

interface Tool extends McpTool {
  handler: () => Promise<{ content: { type: 'text'; text: string }[] }>;
}

// 格式化菜單資料的輔助函數
const formatMenuData = (data: MenuItemListingResponse): string => {
  const categories = data.restaurant.settings.menu.menuItemCategories;

  let result = '📋 餐廳菜單項目\n\n';

  categories.forEach((category, categoryIndex) => {
    result += `## ${category.name} (分類 ${categoryIndex + 1})\n`;
    result += `- 分類 ID: ${category.uuid}\n`;
    result += `- 排序索引: ${category.sortingIndex}\n`;
    result += `- 來自總部: ${category.isFromHq ? '是' : '否'}\n`;
    result += `- 菜單項目數量: ${category.menuItems.length}\n\n`;

    if (category.menuItems.length > 0) {
      result += '### 菜單項目:\n';
      category.menuItems.forEach((item, itemIndex) => {
        result += `${itemIndex + 1}. **${item.name}**\n`;
        result += `   - 價格: $${item.price}\n`;
        result += `   - 類型: ${item.type}\n`;
        result += `   - 啟用狀態: ${item.enabled ? '啟用' : '停用'}\n`;
        result += `   - 完整性: ${item.isIncomplete ? '不完整' : '完整'}\n`;
        result += `   - UUID: ${item.uuid}\n`;
        if (item.picture) {
          result += `   - 圖片: ${item.picture}\n`;
        }
        result += '\n';
      });
    } else {
      result += '   (此分類暫無菜單項目)\n';
    }

    result += '\n---\n\n';
  });

  return result;
};

export const getAllMenuItems: Tool = {
  name: 'getAllMenuItems',
  description:
    'Get all menu items from GraphQL API with categories and detailed information',
  inputSchema: {
    type: 'object',
    properties: {},
  },
  handler: async () => {
    try {
      // 建立 GraphQL 客戶端
      const client = createGraphQLClient();

      // 發送 GraphQL 請求
      const data = await client.request<MenuItemListingResponse>(
        MENU_ITEM_LISTING_QUERY
      );

      // 格式化回應資料
      const formattedData = formatMenuData(data);

      return {
        content: [
          {
            type: 'text',
            text: formattedData,
          },
        ],
      };
    } catch (error) {
      // 詳細的錯誤處理
      let errorMessage = 'Unknown error occurred';

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      // 根據不同錯誤類型提供不同的錯誤訊息
      if (errorMessage.includes('GRAPHQL_ENDPOINT')) {
        errorMessage =
          '❌ GraphQL 端點未設定，請檢查 .env 檔案中的 GRAPHQL_ENDPOINT';
      } else if (errorMessage.includes('GRAPHQL_TOKEN')) {
        errorMessage =
          '❌ GraphQL Token 未設定，請檢查 .env 檔案中的 GRAPHQL_TOKEN';
      } else if (errorMessage.includes('fetch')) {
        errorMessage = `❌ 網路連線錯誤，請確認 API 端點是否正確: ${process.env.GRAPHQL_ENDPOINT}`;
      } else if (
        errorMessage.includes('401') ||
        errorMessage.includes('Unauthorized')
      ) {
        errorMessage = '❌ 認證失敗，請檢查 Token 是否正確';
      } else if (
        errorMessage.includes('400') ||
        errorMessage.includes('Bad Request')
      ) {
        errorMessage = '❌ GraphQL 查詢語法錯誤';
      }

      return {
        content: [
          {
            type: 'text',
            text: `🚨 取得菜單項目時發生錯誤:\n\n${errorMessage}\n\n原始錯誤: ${error}`,
          },
        ],
      };
    }
  },
};

export default getAllMenuItems;
