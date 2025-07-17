import { MENU_ITEM_TAG_LISTING_QUERY } from '../api/gql/menuItemTagListingQuery.js';
import { createGraphQLClient } from '../api/graphqlClient.js';
import { IChefMcpTool, McpToolResponse } from '../types/mcpTypes.js';
import {
  MenuItemTagListingResponse,
  MenuItemTagType,
  TagGroupType,
} from '../types/menuTypes.js';

// 格式化註記資料的輔助函數
const formatTagData = (data: MenuItemTagListingResponse): string => {
  const { menuItemTags, tagGroups } = data.restaurant.settings.menu;

  let result = '🏷️ 商品註記與註記群組資訊\n\n';

  // 顯示獨立的商品註記
  if (menuItemTags && menuItemTags.length > 0) {
    result += '## 📋 商品註記 (MenuItemTags)\n\n';
    menuItemTags.forEach((tag: MenuItemTagType, index: number) => {
      result += `${index + 1}. **${tag.name}** (${tag.uuid})\n`;
      result += `   - 類型: ${tag.type}\n`;
      result += `   - 價格: $${tag.price}\n`;
      result += `   - 狀態: ${tag.enabled ? '啟用' : '停用'}\n`;
      result += `   - 排序: ${tag.sortingIndex}\n\n`;
    });
    result += '---\n\n';
  } else {
    result += '## 📋 商品註記 (MenuItemTags)\n\n';
    result += '目前沒有獨立的商品註記。\n\n';
    result += '---\n\n';
  }

  // 顯示註記群組
  if (tagGroups && tagGroups.length > 0) {
    result += '## 📂 註記群組 (TagGroups)\n\n';
    tagGroups.forEach((group: TagGroupType, groupIndex: number) => {
      result += `${groupIndex + 1}. **${group.name}** (${group.uuid})\n`;
      result += `   - 狀態: ${group.enabled ? '啟用' : '停用'}\n`;
      result += `   - 排序: ${group.sortingIndex}\n`;
      result += `   - 子註記數量: ${group.subTags?.length || 0}\n`;

      if (group.subTags && group.subTags.length > 0) {
        result += '   - 子註記列表:\n';
        group.subTags.forEach((subTag: MenuItemTagType, subIndex: number) => {
          result += `     ${subIndex + 1}. **${subTag.name}** (${subTag.uuid})\n`;
          result += `        - 類型: ${subTag.type}\n`;
          result += `        - 價格: $${subTag.price}\n`;
          result += `        - 狀態: ${subTag.enabled ? '啟用' : '停用'}\n`;
          result += `        - 排序: ${subTag.sortingIndex}\n`;
        });
      }
      result += '\n';
    });
  } else {
    result += '## 📂 註記群組 (TagGroups)\n\n';
    result += '目前沒有註記群組。\n\n';
  }

  // 提供使用建議
  result += '---\n\n';
  result += '## 💡 使用說明\n\n';
  result += '- **獨立註記**：可直接使用 menuItemTagUuid 加到商品上\n';
  result +=
    '- **註記群組**：使用 tagGroupUuid 來選擇整個群組，或選擇群組內的特定子註記\n';
  result += '- **價格**：註記可能會影響商品的最終價格\n';
  result += '- **狀態**：只有啟用的註記才能使用\n';

  return result;
};

const getMenuItemTags: IChefMcpTool = {
  name: 'getMenuItemTags',
  description:
    '取得所有可用的商品註記（menuItemTag）和註記群組（tagGroup）資訊，包括註記的詳細屬性和群組內的子註記結構',
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
      const data = await client.request<MenuItemTagListingResponse>(
        MENU_ITEM_TAG_LISTING_QUERY
      );

      // 格式化回應資料
      const formattedData = formatTagData(data);

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
      } else if (errorMessage.includes('menuItemTags')) {
        errorMessage = '❌ 註記查詢失敗，可能是 API 結構變更或欄位不存在';
      } else if (errorMessage.includes('tagGroups')) {
        errorMessage = '❌ 註記群組查詢失敗，可能是 API 結構變更或欄位不存在';
      }

      return {
        content: [
          {
            type: 'text',
            text: `🚨 取得商品註記資訊時發生錯誤:\n\n${errorMessage}\n\n原始錯誤: ${error}`,
          },
        ],
        isError: true,
      };
    }
  },
};

export default getMenuItemTags;
