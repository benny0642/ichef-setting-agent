import { MENU_ITEM_QUERY } from '../api/gql/menuItemQuery.js';
import { createGraphQLClient } from '../api/graphqlClient.js';
import { IChefMcpTool, McpToolResponse } from '../types/mcpTypes.js';
import {
  ItemTagRelationshipType,
  MenuItemQueryResponse,
  MenuItemTagInItemType,
  MenuItemType,
  TagGroupInItemType,
} from '../types/menuTypes.js';

// 取得商品完整資訊參數介面
interface GetMenuItemDetailsArgs {
  uuid: string;
}

// 格式化註記資訊的輔助函數
const formatTagRelationships = (
  tagRelationships: ItemTagRelationshipType[]
): string => {
  if (!tagRelationships || tagRelationships.length === 0) {
    return '📝 註記資訊: 此商品目前沒有設定註記\n\n';
  }

  let result = '📝 註記資訊:\n\n';

  tagRelationships.forEach((relationship, index) => {
    result += `${index + 1}. `;

    if (relationship.tagLikeObject) {
      if (relationship.tagLikeObject.__typename === 'MenuItemTagInItemType') {
        const menuItemTag = relationship.tagLikeObject as MenuItemTagInItemType;
        result += `🏷️ 商品標籤\n`;
        result += `   - 標籤 UUID: ${menuItemTag.menuItemTagUuid || 'N/A'}\n`;
      } else if (
        relationship.tagLikeObject.__typename === 'TagGroupInItemType'
      ) {
        const tagGroup = relationship.tagLikeObject as TagGroupInItemType;
        result += `📂 標籤群組\n`;
        result += `   - 群組 UUID: ${tagGroup.tagGroupUuid || 'N/A'}\n`;

        if (tagGroup.subTagInItems && tagGroup.subTagInItems.length > 0) {
          result += `   - 子標籤:\n`;
          tagGroup.subTagInItems.forEach((subTag, subIndex) => {
            const enabled =
              subTag.enabledInformation?.subTagInItemEnabled ?? false;
            const statusIcon = enabled ? '✅' : '❌';
            result += `     ${subIndex + 1}. ${statusIcon} UUID: ${subTag.subTagUuid || 'N/A'}\n`;
            if (subTag.menuItemTagName) {
              result += `        名稱: ${subTag.menuItemTagName}\n`;
            }
          });
        }
      }
    }

    if (relationship.followingSeparatorCount !== undefined) {
      result += `   - 分隔符數量: ${relationship.followingSeparatorCount}\n`;
    }

    if (relationship.customSortingIndex !== undefined) {
      result += `   - 自訂排序: ${relationship.customSortingIndex}\n`;
    }

    if (relationship.defaultSortingIndex !== undefined) {
      result += `   - 預設排序: ${relationship.defaultSortingIndex}\n`;
    }

    result += '\n';
  });

  return result;
};

// 格式化商品完整資訊的輔助函數
const formatMenuItemDetails = (menuItem: MenuItemType): string => {
  let result = '📦 商品完整資訊\n';
  result += '═'.repeat(50) + '\n\n';

  // 基本資訊
  result += '🆔 基本資訊:\n';
  result += `   - UUID: ${menuItem.uuid}\n`;
  result += `   - 名稱: ${menuItem.name}\n`;
  result += `   - 價格: $${menuItem.price}\n`;
  result += `   - 類型: ${menuItem.type === 'combo' ? '套餐' : '單品'}\n`;
  result += `   - 狀態: ${menuItem.enabled ? '✅ 啟用' : '❌ 停用'}\n`;
  result += `   - 是否不完整: ${menuItem.isIncomplete ? '❌ 是' : '✅ 否'}\n`;
  result += `   - 來自總部: ${menuItem.isFromHq ? '✅ 是' : '❌ 否'}\n\n`;

  // 分類資訊
  if (menuItem.menuItemCategoryUuid) {
    result += '📂 分類資訊:\n';
    result += `   - 分類 UUID: ${menuItem.menuItemCategoryUuid}\n\n`;
  }

  // 圖片資訊
  if (menuItem.picture) {
    result += '🖼️ 圖片資訊:\n';
    result += `   - 圖片: ${menuItem.picture}\n`;
    if (menuItem.originalPicture) {
      result += `   - 原始圖片: ${JSON.stringify(menuItem.originalPicture)}\n`;
    }
    if (menuItem.croppedInfo) {
      result += `   - 裁切資訊: ${menuItem.croppedInfo}\n`;
    }
    result += '\n';
  }

  // 排序資訊
  if (menuItem.sortingIndex !== undefined) {
    result += '🔢 排序資訊:\n';
    result += `   - 排序索引: ${menuItem.sortingIndex}\n\n`;
  }

  // 外部 ID
  if (menuItem.externalId) {
    result += '🔗 外部 ID:\n';
    result += `   - 外部 ID: ${menuItem.externalId}\n\n`;
  }

  // 稅務設定
  if (menuItem.customizedTaxEnabled) {
    result += '💰 稅務設定:\n';
    result += `   - 自訂稅務: ${menuItem.customizedTaxEnabled ? '✅ 啟用' : '❌ 停用'}\n`;
    if (menuItem.customizedTaxType) {
      result += `   - 稅務類型: ${menuItem.customizedTaxType === 'PERCENTAGE' ? '百分比' : '固定金額'}\n`;
    }
    if (menuItem.customizedTaxRate) {
      result += `   - 稅率: ${menuItem.customizedTaxRate}\n`;
    }
    result += '\n';
  }

  // 線上訂餐資訊
  if (
    menuItem.onlineRestaurantMenuItem ||
    menuItem.grabfoodMenuItem ||
    menuItem.ubereatsMenuItem ||
    menuItem.foodpandaMenuItem
  ) {
    result += '🌐 線上訂餐資訊:\n';
    if (menuItem.onlineRestaurantMenuItem) {
      result += `   - 線上餐廳: UUID ${menuItem.onlineRestaurantMenuItem.uuid}, 可見性: ${menuItem.onlineRestaurantMenuItem.visible ? '✅' : '❌'}\n`;
    }
    if (menuItem.grabfoodMenuItem) {
      result += `   - GrabFood: UUID ${menuItem.grabfoodMenuItem.uuid}, 可見性: ${menuItem.grabfoodMenuItem.visible ? '✅' : '❌'}\n`;
    }
    if (menuItem.ubereatsMenuItem) {
      result += `   - UberEats: UUID ${menuItem.ubereatsMenuItem.uuid}, 可見性: ${menuItem.ubereatsMenuItem.visible ? '✅' : '❌'}\n`;
    }
    if (menuItem.foodpandaMenuItem) {
      result += `   - FoodPanda: UUID ${menuItem.foodpandaMenuItem.uuid}, 可見性: ${menuItem.foodpandaMenuItem.visible ? '✅' : '❌'}\n`;
    }
    result += '\n';
  }

  // 套餐分類資訊
  if (menuItem.comboItemCategories && menuItem.comboItemCategories.length > 0) {
    result += '🍱 套餐分類:\n';
    menuItem.comboItemCategories.forEach((category, index) => {
      result += `   ${index + 1}. 分類名稱: ${category.name}\n`;
      result += `      - UUID: ${category.uuid}\n`;
      result += `      - 排序方式: ${category.comboMenuItemSortingType}\n`;

      // 子品項資訊
      if (category.comboMenuItems && category.comboMenuItems.length > 0) {
        result += `      - 🔸 子品項 (共 ${category.comboMenuItems.length} 項):\n`;
        category.comboMenuItems.forEach((comboItem, comboIndex) => {
          result += `        ${comboIndex + 1}. ${comboItem.name}\n`;
          result += `           - UUID: ${comboItem.uuid}\n`;
          result += `           - 價格: $${comboItem.price}\n`;
          result += `           - 關聯商品 UUID: ${comboItem.menuItemUuid}\n`;

          // 線上訂餐平台可見性
          if (comboItem.onlineRestaurantMenuItem) {
            result += `           - 線上訂餐: ${comboItem.onlineRestaurantMenuItem.visible ? '✅ 可見' : '❌ 隱藏'}\n`;
          }
          if (comboItem.instoreOrderingMenuItem) {
            result += `           - 店內點餐: ${comboItem.instoreOrderingMenuItem.visible ? '✅ 可見' : '❌ 隱藏'}\n`;
          }
          if (comboItem.ubereatsV2MenuItem) {
            result += `           - Uber Eats: ${comboItem.ubereatsV2MenuItem.visible ? '✅ 可見' : '❌ 隱藏'}\n`;
          }
        });
      } else {
        result += `      - 🔸 子品項: 此分類目前沒有設定子品項\n`;
      }
      result += '\n';
    });
  }

  // 註記資訊
  const tagRelationships = menuItem.itemTagRelationshipList || [];
  result += formatTagRelationships(tagRelationships);

  return result;
};

// 驗證 UUID 格式的輔助函數
const isValidUUID = (uuid: string): boolean => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

const getMenuItemDetails: IChefMcpTool = {
  name: 'getMenuItemDetails',
  description:
    '取得商品的完整詳細資訊，包含基本資料、註記、註記群組等所有相關資訊',
  inputSchema: {
    type: 'object',
    properties: {
      uuid: {
        type: 'string',
        description: '商品的 UUID',
      },
    },
    required: ['uuid'],
  },

  handler: async (args?: Record<string, unknown>): Promise<McpToolResponse> => {
    try {
      // 類型轉換和基本驗證
      const queryArgs = args as unknown as GetMenuItemDetailsArgs;

      // 驗證必填欄位
      if (!queryArgs.uuid || typeof queryArgs.uuid !== 'string') {
        return {
          content: [
            {
              type: 'text',
              text: '❌ 商品 UUID 是必填項目且必須是字串',
            },
          ],
          isError: true,
        };
      }

      // 驗證 UUID 格式
      if (!isValidUUID(queryArgs.uuid)) {
        return {
          content: [
            {
              type: 'text',
              text: '❌ 商品 UUID 格式不正確',
            },
          ],
          isError: true,
        };
      }

      // 建立 GraphQL 客戶端並執行查詢
      const client = createGraphQLClient();
      const data = await client.request<MenuItemQueryResponse>(
        MENU_ITEM_QUERY,
        { uuid: queryArgs.uuid }
      );

      // 檢查回應是否包含預期的資料結構
      if (!data?.restaurant?.settings?.menu?.menuItem) {
        return {
          content: [
            {
              type: 'text',
              text: '❌ 找不到指定的商品，請檢查商品 UUID 是否正確',
            },
          ],
          isError: true,
        };
      }

      const menuItem = data.restaurant.settings.menu.menuItem;

      // 格式化商品完整資訊
      const result = formatMenuItemDetails(menuItem);

      return {
        content: [
          {
            type: 'text',
            text: result,
          },
        ],
      };
    } catch (error) {
      let errorMessage = '❌ 取得商品詳細資訊時發生錯誤：';

      if (error instanceof Error) {
        // 處理常見的 GraphQL 錯誤
        if (error.message.includes('UNAUTHENTICATED')) {
          errorMessage += '身份驗證失敗，請檢查 API 金鑰設定';
        } else if (error.message.includes('PERMISSION_DENIED')) {
          errorMessage += '權限不足，請檢查帳號權限設定';
        } else if (error.message.includes('NOT_FOUND')) {
          errorMessage += '找不到指定的商品，請檢查商品 UUID 是否正確';
        } else if (error.message.includes('INVALID_ARGUMENT')) {
          errorMessage += '參數格式錯誤，請檢查輸入資料';
        } else {
          errorMessage += error.message;
        }
      } else {
        errorMessage += '未知錯誤，請稍後再試';
      }

      return {
        content: [
          {
            type: 'text',
            text: errorMessage,
          },
        ],
        isError: true,
      };
    }
  },
};

export default getMenuItemDetails;
