import { MENU_ITEM_LISTING_QUERY } from '../api/gql/menuItemListingQuery.js';
import { createGraphQLClient } from '../api/graphqlClient.js';
import { IChefMcpTool, McpToolResponse } from '../types/mcpTypes.js';
import { MenuItemListingResponse } from '../types/menuTypes.js';

// 格式化菜單資料的輔助函數
const formatMenuData = (data: MenuItemListingResponse): string => {
  const categories = data.restaurant.settings.menu.menuItemCategories;

  let result = '📋 餐廳菜單項目\n\n';

  categories.forEach((category, categoryIndex) => {
    result += `## ${category.name} (分類 ${categoryIndex + 1})\n`;
    result += `- 分類 ID: ${category.uuid}\n`;
    result += `- 排序索引: ${category.sortingIndex}\n`;
    result += `- 來自總部: ${category.isFromHq ? '是' : '否'}\n`;
    result += `- 商品數量: ${category.menuItems.length}\n\n`;

    if (category.menuItems.length > 0) {
      result += '### 商品列表:\n';
      category.menuItems.forEach((item, itemIndex) => {
        result += `${itemIndex + 1}. **${item.name}** (${item.uuid})\n`;
        result += `   - 價格: $${item.price}\n`;
        result += `   - 類型: ${item.type}\n`;
        result += `   - 狀態: ${item.enabled ? '啟用' : '停用'}\n`;
        result += `   - 排序: ${item.sortingIndex}\n`;
        result += `   - 完整性: ${item.isIncomplete ? '不完整' : '完整'}\n`;
        result += `   - 來自總部: ${item.isFromHq ? '是' : '否'}\n`;

        if (item.picture) {
          result += `   - 圖片: ${item.picture}\n`;
        }

        if (item.onlineRestaurantMenuItem?.uuid) {
          result += `   - 線上商品 ID: ${item.onlineRestaurantMenuItem.uuid}\n`;
        }

        result += '\n';
      });
    }

    result += '---\n\n';
  });

  return result;
};

const getAllMenuItems: IChefMcpTool = {
  name: 'getAllMenuItems',
  description: '取得所有菜單項目的詳細資訊，包括商品分類和商品列表',
  category: 'menu',
  version: '1.0.0',
  inputSchema: {
    type: 'object',
    properties: {},
    required: [],
  },
  handler: async (): Promise<McpToolResponse> => {
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
      } else if (
        errorMessage.includes('GRAPHQL_TOKEN') ||
        errorMessage.includes('Authentication')
      ) {
        errorMessage =
          '❌ 認證 Token 未設定或無效，請檢查 .env 檔案中的 GRAPHQL_TOKEN 或透過 MCP 參數提供';
      } else if (errorMessage.includes('fetch')) {
        errorMessage = `❌ 網路連線錯誤，請確認 API 端點是否正確: ${process.env.GRAPHQL_ENDPOINT}`;
      } else if (
        errorMessage.includes('401') ||
        errorMessage.includes('Unauthorized')
      ) {
        errorMessage = '❌ 認證失敗，請檢查 Token 是否正確或已過期';
      } else if (
        errorMessage.includes('403') ||
        errorMessage.includes('Forbidden')
      ) {
        errorMessage = '❌ 權限不足，請檢查 Token 是否有足夠的權限存取此 API';
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
        isError: true,
      };
    }
  },
};

export default getAllMenuItems;
