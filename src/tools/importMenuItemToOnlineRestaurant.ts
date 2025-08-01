import { MENU_ITEM_QUERY } from '../api/gql/menuItemQuery.js';
import { ONLINE_RESTAURANT_MENU_ITEM_IMPORT_MUTATION } from '../api/gql/onlineRestaurantMenuItemImportMutation.js';
import { createGraphQLClient } from '../api/graphqlClient.js';
import { IChefMcpTool, McpToolResponse } from '../types/mcpTypes.js';
import {
  ImportMenuItemArgs,
  ImportResult,
  MenuItemQueryResponse,
  MenuItemType,
  OnlineRestaurantMenuItemImportResponse,
} from '../types/menuTypes.js';
import { handleError } from '../utils/errorHandler.js';
import { MenuItemValidators } from '../utils/validator.js';

/**
 * 檢查商品狀態並過濾停用商品
 */
async function checkMenuItemsStatus(ichefMenuItemUuids: string[]): Promise<{
  validItems: MenuItemType[];
  disabledItems: Array<{ uuid: string; name: string }>;
  notFoundItems: string[];
}> {
  const client = createGraphQLClient();
  const validItems: MenuItemType[] = [];
  const disabledItems: Array<{ uuid: string; name: string }> = [];
  const notFoundItems: string[] = [];

  for (const uuid of ichefMenuItemUuids) {
    try {
      const data = await client.request<MenuItemQueryResponse>(
        MENU_ITEM_QUERY,
        {
          uuid,
        }
      );

      const menuItem = data.restaurant?.settings?.menu?.menuItem;
      if (!menuItem) {
        notFoundItems.push(uuid);
        continue;
      }

      if (!menuItem.enabled) {
        disabledItems.push({ uuid, name: menuItem.name });
      } else {
        validItems.push(menuItem);
      }
    } catch (error) {
      console.warn(`查詢商品 ${uuid} 時發生錯誤:`, error);
      notFoundItems.push(uuid);
    }
  }

  return { validItems, disabledItems, notFoundItems };
}

/**
 * 檢查重複商品（簡化版本，實際需要根據 API 調整）
 * 目前假設所有商品都不重複，實際使用時需要實作檢查邏輯
 */
async function checkDuplicateItems(
  categoryUuid: string,
  menuItems: MenuItemType[]
): Promise<{
  newItems: MenuItemType[];
  duplicateItems: Array<{ uuid: string; name: string }>;
}> {
  // TODO: 實作重複商品檢測邏輯
  // 這裡需要根據實際的 API 來檢查商品是否已經在目標分類中存在
  // 目前假設所有商品都是新的
  return {
    newItems: menuItems,
    duplicateItems: [],
  };
}

/**
 * 格式化匯入預檢查結果
 */
function formatPreCheckResult(
  categoryUuid: string,
  validItems: MenuItemType[],
  disabledItems: Array<{ uuid: string; name: string }>,
  duplicateItems: Array<{ uuid: string; name: string }>,
  notFoundItems: string[]
): string {
  let message = '📋 **商品匯入預檢查結果**\n\n';
  message += `🎯 目標分類: ${categoryUuid}\n\n`;

  if (validItems.length > 0) {
    message += `✅ **可匯入的商品** (${validItems.length} 項):\n`;
    message += '| 商品名稱 | UUID | 價格 | 狀態 |\n';
    message += '|----------|------|------|------|\n';
    validItems.forEach(item => {
      message += `| ${item.name} | ${item.uuid} | $${item.price} | ✅ 啟用 |\n`;
    });
    message += '\n';
  }

  if (disabledItems.length > 0) {
    message += `⚠️ **停用商品將被跳過** (${disabledItems.length} 項):\n`;
    message += '| 商品名稱 | UUID | 原因 |\n';
    message += '|----------|------|------|\n';
    disabledItems.forEach(item => {
      message += `| ${item.name} | ${item.uuid} | ❌ 商品已停用 |\n`;
    });
    message += '\n';
  }

  if (duplicateItems.length > 0) {
    message += `🔄 **重複商品將被跳過** (${duplicateItems.length} 項):\n`;
    message += '| 商品名稱 | UUID | 原因 |\n';
    message += '|----------|------|------|\n';
    duplicateItems.forEach(item => {
      message += `| ${item.name} | ${item.uuid} | 🔄 已存在於目標分類 |\n`;
    });
    message += '\n';
  }

  if (notFoundItems.length > 0) {
    message += `❌ **找不到的商品** (${notFoundItems.length} 項):\n`;
    notFoundItems.forEach(uuid => {
      message += `- ${uuid} (商品不存在或無權限存取)\n`;
    });
    message += '\n';
  }

  return message;
}

/**
 * 格式化匯入結果
 */
function formatImportResult(
  result: ImportResult,
  categoryUuid: string
): string {
  const timestamp = new Date().toLocaleString('zh-TW');

  let message = `🎉 **商品匯入完成** (${timestamp})\n\n`;
  message += `🎯 目標分類: ${categoryUuid}\n\n`;

  message += '📊 **匯入統計:**\n';
  message += `- 總數: ${result.total} 項\n`;
  message += `- ✅ 成功匯入: ${result.successful} 項\n`;
  message += `- ⚠️ 跳過項目: ${result.skipped} 項\n`;
  message += `- ❌ 失敗項目: ${result.failed} 項\n\n`;

  if (result.successfulItems.length > 0) {
    message += `✅ **成功匯入的商品 UUID:**\n`;
    result.successfulItems.forEach(uuid => {
      message += `- ${uuid}\n`;
    });
    message += '\n';
  }

  if (result.skippedItems.length > 0) {
    message += `⚠️ **跳過的商品:**\n`;
    result.skippedItems.forEach(item => {
      message += `- ${item.uuid}: ${item.reason}\n`;
    });
    message += '\n';
  }

  if (result.failedItems.length > 0) {
    message += `❌ **失敗的商品:**\n`;
    result.failedItems.forEach(item => {
      message += `- ${item.uuid}: ${item.error}\n`;
    });
    message += '\n';
  }

  return message;
}

const importMenuItemToOnlineRestaurant: IChefMcpTool = {
  name: 'importMenuItemToOnlineRestaurant',
  description:
    '批量匯入 iChef 商品到線上餐廳分類，支援商品狀態檢查和重複項目偵測。',
  category: 'menu',
  version: '1.0.0',
  inputSchema: {
    type: 'object',
    properties: {
      categoryUuid: {
        type: 'string',
        description: '目標線上餐廳分類的 UUID（必填）',
        pattern:
          '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
      },
      ichefMenuItemUuids: {
        type: 'array',
        items: {
          type: 'string',
          pattern:
            '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
        },
        description: '要匯入的 iChef 商品 UUID 陣列（必填，最多 50 項）',
        minItems: 1,
        maxItems: 50,
      },
    },
    required: ['categoryUuid', 'ichefMenuItemUuids'],
  },
  handler: async (args?: Record<string, unknown>): Promise<McpToolResponse> => {
    try {
      // 參數驗證
      const importArgs = args as unknown as ImportMenuItemArgs;

      // 驗證輸入參數
      const validationResult = MenuItemValidators.validateImportMenuItemArgs(
        importArgs as unknown as Record<string, unknown>
      );
      if (!validationResult.valid) {
        throw new Error(`參數驗證失敗: ${validationResult.errors.join(', ')}`);
      }

      const { categoryUuid, ichefMenuItemUuids } = importArgs;

      // 檢查商品狀態和重複項目
      const { validItems, disabledItems, notFoundItems } =
        await checkMenuItemsStatus(ichefMenuItemUuids);

      const { newItems, duplicateItems } = await checkDuplicateItems(
        categoryUuid,
        validItems
      );

      // 顯示預檢查結果
      const preCheckMessage = formatPreCheckResult(
        categoryUuid,
        newItems,
        disabledItems,
        duplicateItems,
        notFoundItems
      );

      // 如果沒有可匯入的商品，直接回傳預檢查結果
      if (newItems.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: `${preCheckMessage}\n⚠️ **沒有可匯入的商品**，請檢查商品狀態後重試。`,
            },
          ],
        };
      }

      // 準備匯入結果統計
      const result: ImportResult = {
        total: ichefMenuItemUuids.length,
        successful: 0,
        skipped: disabledItems.length + duplicateItems.length,
        failed: notFoundItems.length,
        successfulItems: [],
        skippedItems: [
          ...disabledItems.map(item => ({
            uuid: item.uuid,
            reason: '商品已停用',
          })),
          ...duplicateItems.map(item => ({
            uuid: item.uuid,
            reason: '商品已存在於目標分類',
          })),
        ],
        failedItems: notFoundItems.map(uuid => ({
          uuid,
          error: '商品不存在或無權限存取',
        })),
      };

      // 執行匯入
      try {
        const client = createGraphQLClient();
        const importUuids = newItems.map(item => item.uuid);

        const data =
          await client.request<OnlineRestaurantMenuItemImportResponse>(
            ONLINE_RESTAURANT_MENU_ITEM_IMPORT_MUTATION,
            {
              categoryUuid,
              ichefMenuItemUuids: importUuids,
            }
          );

        // 檢查回應的分類陣列
        const importedCategories =
          data.restaurant?.settings?.menu?.integration?.onlineRestaurant
            ?.importMenuItemToCategory;

        if (importedCategories && importedCategories.length > 0) {
          // 從回應中提取成功匯入的商品 UUID
          const importedItemUuids: string[] = [];
          importedCategories.forEach(category => {
            if (category?.menuItems) {
              category.menuItems.forEach(item => {
                if (item?.ichefUuid) {
                  importedItemUuids.push(item.ichefUuid);
                }
              });
            }
          });

          result.successful = importedItemUuids.length;
          result.successfulItems = importedItemUuids;

          // 計算匯入失敗的商品
          const failedImportUuids = importUuids.filter(
            uuid => !importedItemUuids.includes(uuid)
          );
          if (failedImportUuids.length > 0) {
            result.failed += failedImportUuids.length;
            result.failedItems.push(
              ...failedImportUuids.map(uuid => ({
                uuid,
                error: '匯入時發生錯誤',
              }))
            );
          }
        } else {
          // 如果沒有回傳分類陣列，表示匯入失敗
          result.failed += importUuids.length;
          result.failedItems.push(
            ...importUuids.map(uuid => ({
              uuid,
              error: '匯入時發生錯誤，API 未回傳成功狀態',
            }))
          );
        }
      } catch {
        // 匯入失敗，所有待匯入商品都標記為失敗
        result.failed += newItems.length;
        result.failedItems.push(
          ...newItems.map(item => ({
            uuid: item.uuid,
            error: '匯入 API 呼叫失敗',
          }))
        );
      }

      // 格式化並回傳結果（包含預檢查和執行結果）
      const resultMessage = formatImportResult(result, categoryUuid);

      return {
        content: [
          {
            type: 'text',
            text: `${preCheckMessage}\n---\n\n${resultMessage}`,
          },
        ],
      };
    } catch (error) {
      // 錯誤處理
      const { userMessage } = handleError(error, {
        tool: 'importMenuItemToOnlineRestaurant',
        args,
      });

      return {
        content: [
          {
            type: 'text',
            text: `🚨 匯入商品時發生錯誤:\n\n${userMessage}`,
          },
        ],
        isError: true,
      };
    }
  },
};

export default importMenuItemToOnlineRestaurant;
