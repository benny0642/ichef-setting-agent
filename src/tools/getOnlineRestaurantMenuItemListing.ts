import { ONLINE_RESTAURANT_MENU_ITEM_LISTING_QUERY } from '../api/gql/onlineRestaurantMenuItemListingQuery.js';
import { createGraphQLClient } from '../api/graphqlClient.js';
import { IChefMcpTool, McpToolResponse } from '../types/mcpTypes.js';
import { OnlineRestaurantMenuStructure } from '../types/menuTypes.js';
import { formatErrorForUser } from '../utils/errorHandler.js';

// 格式化線上餐廳菜單資料的輔助函數
const formatOnlineRestaurantMenuData = (
  data: OnlineRestaurantMenuStructure
): string => {
  const categories =
    data.restaurant.settings.menu.integration.onlineRestaurant.categories;

  // 按照 sortingIndex 排序分類
  const sortedCategories = [...categories].sort(
    (a, b) => a.sortingIndex - b.sortingIndex
  );

  let result = '🏪 外帶外送菜單結構\n\n';

  if (sortedCategories.length === 0) {
    result += '📋 目前沒有設定任何外送菜單分類\n\n';
    result += '💡 **使用提示**:\n';
    result += '- 請先在 iChef 系統中設定外送菜單分類和項目\n';
    result +=
      '- 設定完成後可以使用 `importMenuItemToOnlineRestaurant` 工具來匯入商品\n';
    return result;
  }

  sortedCategories.forEach((category, categoryIndex) => {
    result += `## ${category.name} (分類 ${categoryIndex + 1})\n`;
    result += `- 分類 UUID: ${category.uuid}\n`;
    result += `- 排序索引: ${category.sortingIndex}\n`;
    result += `- 菜單項目數量: ${category.menuItems.length}\n\n`;

    if (category.menuItems.length > 0) {
      // 按照 sortingIndex 排序菜單項目
      const sortedMenuItems = [...category.menuItems].sort(
        (a, b) => a.sortingIndex - b.sortingIndex
      );

      result += '### 菜單項目:\n';
      sortedMenuItems.forEach((item, itemIndex) => {
        result += `${itemIndex + 1}. **${item.customizedName || item.originalName}** (${item.uuid})\n`;
        result += `   - iChef UUID: ${item.ichefUuid}\n`;
        result += `   - 原始名稱: ${item.originalName}\n`;

        if (item.customizedName && item.customizedName !== item.originalName) {
          result += `   - 自訂名稱: ${item.customizedName}\n`;
        }

        result += `   - 價格: $${item.originalPrice}\n`;
        result += `   - 類型: ${item.menuItemType}\n`;
        result += `   - 排序: ${item.sortingIndex}\n`;
        result += `   - 來自總部: ${item.menuItem.isFromHq ? '是' : '否'}\n`;

        if (item.pictureFilename) {
          result += `   - 圖片: ${item.pictureFilename}\n`;
        }

        result += '\n';
      });
    } else {
      result += '### 📝 此分類目前沒有菜單項目\n\n';
    }

    result += '---\n\n';
  });

  // 使用說明
  result += '💡 **使用說明**:\n';
  result +=
    '- 分類 UUID 可用於 `importMenuItemToOnlineRestaurant` 工具的 `categoryUuid` 參數\n';
  result += '- 菜單項目的 UUID 可用於識別和管理特定的外送菜單項目\n';
  result += '- iChef UUID 連結到原始的店內菜單項目\n';
  result += '- 排序索引決定在外送平台上的顯示順序\n\n';

  result += '🔗 **相關工具**:\n';
  result +=
    '- 使用 `importMenuItemToOnlineRestaurant` 來新增菜單項目到外送分類\n';
  result += '- 使用 `getAllMenuItems` 來查看店內完整菜單\n';

  return result;
};

const getOnlineRestaurantMenuItemListing: IChefMcpTool = {
  name: 'getOnlineRestaurantMenuItemListing',
  description: '取得外帶外送平台的完整菜單結構，包括分類和菜單項目資訊',
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
      const data = await client.request<OnlineRestaurantMenuStructure>(
        ONLINE_RESTAURANT_MENU_ITEM_LISTING_QUERY
      );

      // 格式化回應資料
      const formattedData = formatOnlineRestaurantMenuData(data);

      return {
        content: [
          {
            type: 'text',
            text: formattedData,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `🚨 取得外送菜單列表時發生錯誤:\n\n${formatErrorForUser(error)}`,
          },
        ],
        isError: true,
      };
    }
  },
};

export default getOnlineRestaurantMenuItemListing;
