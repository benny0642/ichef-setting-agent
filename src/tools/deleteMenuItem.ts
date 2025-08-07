import { COMBO_DEPENDENCY_CHECK_QUERY } from '../api/gql/comboDependencyCheckQuery.js';
import { DELETE_MENU_ITEM_MUTATION } from '../api/gql/deleteMenuItemMutation.js';
import { MENU_ITEM_QUERY } from '../api/gql/menuItemQuery.js';
import { createGraphQLClient } from '../api/graphqlClient.js';
import { IChefMcpTool, McpToolResponse } from '../types/mcpTypes.js';
import {
  ComboDependencyCheckResponse,
  MenuItemDeleteResponse,
  MenuItemType,
} from '../types/menuTypes.js';

// 商品刪除參數介面
interface DeleteMenuItemArgs {
  uuid: string;
}

// 商品詳細資訊查詢回應介面
interface MenuItemQueryResponse {
  restaurant: {
    settings: {
      menu: {
        menuItem: MenuItemType;
        __typename?: string;
      };
      __typename?: string;
    };
    __typename?: string;
  };
}

// 格式化刪除成功回應的輔助函數
const formatDeleteSuccessResponse = (
  deletedItem: MenuItemType,
  deletedUuid: string
): string => {
  let result = '✅ 商品刪除成功！\n\n';
  result += `🆔 已刪除商品 UUID: ${deletedUuid}\n`;
  result += `📝 商品名稱: ${deletedItem.name}\n`;
  result += `💰 價格: $${deletedItem.price}\n`;
  result += `🏷️ 類型: ${deletedItem.type === 'combo' ? '套餐' : '單品'}\n`;
  result += `📂 分類 UUID: ${deletedItem.menuItemCategoryUuid}\n`;
  result += `🔄 原狀態: ${deletedItem.enabled ? '啟用' : '停用'}\n`;

  if (
    deletedItem.sortingIndex !== undefined &&
    deletedItem.sortingIndex !== null
  ) {
    result += `📊 排序索引: ${deletedItem.sortingIndex}\n`;
  }

  if (deletedItem.picture) {
    result += `🖼️ 圖片: ${deletedItem.picture}\n`;
  }

  // 如果是套餐商品，顯示套餐結構
  if (
    deletedItem.type === 'combo' &&
    deletedItem.comboItemCategories &&
    deletedItem.comboItemCategories.length > 0
  ) {
    result += '\n📋 已刪除的套餐結構:\n';
    deletedItem.comboItemCategories.forEach((category, categoryIndex) => {
      result += `\n📂 分類 ${categoryIndex + 1}: ${category.name}\n`;
      result += `   └─ 商品選項 (${category.comboMenuItems.length} 項):\n`;

      category.comboMenuItems.forEach((item, itemIndex) => {
        const priceDisplay =
          item.price && parseFloat(item.price.toString()) > 0
            ? ` (+$${item.price})`
            : '';
        result += `      ${itemIndex + 1}. ${item.name}${priceDisplay}\n`;
      });
    });
  }

  return result;
};

// 檢查商品是否已上架到外帶外送
const checkOnlineRestaurantStatus = (menuItem: MenuItemType): string[] => {
  const issues: string[] = [];

  if (
    menuItem.onlineRestaurantMenuItem &&
    Array.isArray(menuItem.onlineRestaurantMenuItem) &&
    menuItem.onlineRestaurantMenuItem.length > 0
  ) {
    issues.push('❌ 此商品已上架到外帶外送服務，無法直接刪除');
    issues.push('💡 請先到外帶外送管理介面將商品下架，然後再嘗試刪除');
  }

  return issues;
};

// 檢查套餐依賴關係
const checkComboDependencies = async (
  menuItemUuid: string,
  client: any
): Promise<string[]> => {
  const issues: string[] = [];

  try {
    // 查詢所有套餐商品
    const response = (await client.request(
      COMBO_DEPENDENCY_CHECK_QUERY
    )) as ComboDependencyCheckResponse;

    const menuCategories =
      response.restaurant?.settings?.menu?.menuItemCategories || [];

    // 檢查每個套餐商品
    for (const category of menuCategories) {
      for (const menuItem of category.menuItems) {
        // 只檢查套餐類型的商品
        if (menuItem.type === 'combo' && menuItem.comboItemCategories) {
          for (const comboCategory of menuItem.comboItemCategories) {
            // 檢查此分類中是否包含要刪除的商品
            const hasTargetItem = comboCategory.comboMenuItems.some(
              (item: any) => item.menuItemUuid === menuItemUuid
            );

            if (hasTargetItem) {
              // 檢查此分類是否只有一個選項且為必選
              const itemCount = comboCategory.comboMenuItems.length;
              const minSelection = comboCategory.minimumSelection || 1;

              if (itemCount === 1 && minSelection > 0) {
                // 這是套餐分類的唯一且必選商品，不能刪除
                issues.push(
                  `❌ 此商品是套餐「${menuItem.name}」中分類「${comboCategory.name}」的唯一必選項目，無法刪除`
                );
                issues.push(
                  `💡 請先修改套餐「${menuItem.name}」的設定，添加其他選項或修改選擇規則後再嘗試刪除`
                );
              } else if (itemCount <= minSelection) {
                // 刪除後會導致選項數量少於最少選擇數量
                issues.push(
                  `❌ 此商品是套餐「${menuItem.name}」中分類「${comboCategory.name}」的重要選項`
                );
                issues.push(
                  `⚠️ 刪除後選項數量 (${itemCount - 1}) 將少於最少選擇數量 (${minSelection})`
                );
                issues.push(
                  `💡 請先調整套餐的最少選擇數量或添加其他選項後再嘗試刪除`
                );
              }
            }
          }
        }
      }
    }
  } catch (error) {
    // 如果查詢失敗，記錄警告但不阻止刪除
    console.warn('套餐依賴關係檢查失敗:', error);
    issues.push('⚠️ 無法完成套餐依賴關係檢查，請手動確認此商品未被套餐使用');
  }

  return issues;
};

const deleteMenuItem = {
  name: 'deleteMenuItem',
  description: '安全地刪除一個菜單商品項目，包含完整的刪除前檢查機制',
  category: 'menu',
  version: '1.0.0',
  inputSchema: {
    type: 'object',
    properties: {
      uuid: {
        type: 'string',
        description: '要刪除的商品 UUID（必填）',
        pattern:
          '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
      },
    },
    required: ['uuid'],
  },
  handler: async (args?: Record<string, unknown>): Promise<McpToolResponse> => {
    try {
      // 類型轉換和基本驗證
      const deleteArgs = args as unknown as DeleteMenuItemArgs;

      // 驗證必填欄位
      if (!deleteArgs.uuid || typeof deleteArgs.uuid !== 'string') {
        throw new Error('商品 UUID 是必填項目且必須是字串');
      }

      if (deleteArgs.uuid.trim().length === 0) {
        throw new Error('商品 UUID 不能為空');
      }

      // 驗證 UUID 格式
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(deleteArgs.uuid)) {
        throw new Error('商品 UUID 格式不正確');
      }

      // 建立 GraphQL 客戶端
      const client = createGraphQLClient();

      // 第一步：查詢商品詳細資訊
      let menuItem: MenuItemType;
      try {
        const queryResponse = await client.request<MenuItemQueryResponse>(
          MENU_ITEM_QUERY,
          { uuid: deleteArgs.uuid }
        );

        if (!queryResponse.restaurant?.settings?.menu?.menuItem) {
          throw new Error(`找不到 UUID 為 ${deleteArgs.uuid} 的商品`);
        }

        menuItem = queryResponse.restaurant.settings.menu.menuItem;
      } catch (error) {
        if (error instanceof Error && error.message.includes('找不到')) {
          throw error;
        }
        throw new Error(
          `查詢商品資訊時發生錯誤: ${error instanceof Error ? error.message : String(error)}`
        );
      }

      // 第二步：執行安全檢查
      const safetyIssues: string[] = [];

      // 檢查外帶外送狀態
      const onlineIssues = checkOnlineRestaurantStatus(menuItem);
      safetyIssues.push(...onlineIssues);

      // 檢查套餐依賴關係
      const comboIssues = await checkComboDependencies(deleteArgs.uuid, client);
      safetyIssues.push(...comboIssues);

      // 如果有安全性問題，回傳錯誤訊息
      if (safetyIssues.length > 0) {
        const errorMessage = `🚨 無法刪除商品 "${menuItem.name}"，發現以下問題:\n\n${safetyIssues.join('\n')}\n\n請解決上述問題後再嘗試刪除。`;

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

      const deleteResponse = await client.request<MenuItemDeleteResponse>(
        DELETE_MENU_ITEM_MUTATION,
        { uuid: deleteArgs.uuid }
      );

      // 檢查刪除回應是否成功
      if (!deleteResponse.restaurant?.settings?.menu?.deleteMenuItem?.uuid) {
        throw new Error('API 回應格式不正確或刪除失敗');
      }

      const deletedUuid =
        deleteResponse.restaurant.settings.menu.deleteMenuItem.uuid;

      // 格式化成功回應
      const formattedResponse = formatDeleteSuccessResponse(
        menuItem,
        deletedUuid
      );

      return {
        content: [
          {
            type: 'text',
            text: formattedResponse,
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
          '❌ 認證 Token 未設定或無效，請檢查 .env 檔案中的 GRAPHQL_TOKEN';
      } else if (errorMessage.includes('fetch')) {
        errorMessage = `❌ 網路連線錯誤，請確認 API 端點是否正確`;
      } else if (
        errorMessage.includes('401') ||
        errorMessage.includes('Unauthorized')
      ) {
        errorMessage = '❌ 認證失敗，請檢查 Token 是否正確或已過期';
      } else if (
        errorMessage.includes('403') ||
        errorMessage.includes('Forbidden')
      ) {
        errorMessage = '❌ 權限不足，請檢查 Token 是否有足夠的權限刪除商品';
      } else if (
        errorMessage.includes('400') ||
        errorMessage.includes('Bad Request')
      ) {
        errorMessage = '❌ 請求參數錯誤，請檢查商品 UUID 是否正確';
      } else if (
        errorMessage.includes('找不到') ||
        errorMessage.includes('not found')
      ) {
        errorMessage = '❌ 商品不存在，請檢查 UUID 是否正確';
      }

      return {
        content: [
          {
            type: 'text',
            text: `🚨 刪除商品時發生錯誤:\n\n${errorMessage}\n\n💡 建議檢查:\n- 商品 UUID 是否存在\n- 商品是否已上架到外帶外送\n- 商品是否被套餐使用\n- 網路連線是否正常\n- Token 是否有效\n\n原始錯誤: ${error}`,
          },
        ],
        isError: true,
      };
    }
  },
};

export default deleteMenuItem as IChefMcpTool;
