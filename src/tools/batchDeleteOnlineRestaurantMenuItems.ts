import { ONLINE_RESTAURANT_MENU_ITEM_BATCH_DELETE_MUTATION } from '../api/gql/onlineRestaurantMenuItemBatchDeleteMutation.js';
import { createGraphQLClient } from '../api/graphqlClient.js';
import { IChefMcpTool, McpToolResponse } from '../types/mcpTypes.js';
import {
  BatchDeleteMenuItemArgs,
  BatchDeleteMenuItemResponse,
} from '../types/menuTypes.js';
import { handleError } from '../utils/errorHandler.js';

/**
 * UUID 格式驗證正規表達式
 */
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * 驗證 UUID 格式
 */
function validateUuid(uuid: string): boolean {
  return UUID_REGEX.test(uuid);
}

/**
 * 驗證輸入參數
 */
function validateBatchDeleteArgs(args: unknown): BatchDeleteMenuItemArgs {
  if (!args || typeof args !== 'object') {
    throw new Error('參數必須是物件');
  }

  const { menuItemUuids } = args as Record<string, unknown>;

  // 驗證 menuItemUuids 是否存在且為陣列
  if (!menuItemUuids || !Array.isArray(menuItemUuids)) {
    throw new Error('menuItemUuids 必須是陣列');
  }

  // 驗證陣列不為空
  if (menuItemUuids.length === 0) {
    throw new Error('menuItemUuids 不能為空，至少需要一個 UUID');
  }

  // 驗證陣列大小限制
  if (menuItemUuids.length > 50) {
    throw new Error('一次最多只能刪除 50 個項目');
  }

  // 驗證每個 UUID 格式
  const validatedUuids: string[] = [];
  const invalidUuids: string[] = [];

  for (let i = 0; i < menuItemUuids.length; i++) {
    const uuid = menuItemUuids[i];

    if (typeof uuid !== 'string') {
      invalidUuids.push(`索引 ${i}: 不是字串類型`);
      continue;
    }

    if (!validateUuid(uuid)) {
      invalidUuids.push(`索引 ${i}: ${uuid} 格式不正確`);
      continue;
    }

    validatedUuids.push(uuid);
  }

  // 如果有無效的 UUID，拋出錯誤
  if (invalidUuids.length > 0) {
    throw new Error(
      `以下 UUID 格式不正確:\n${invalidUuids.join('\n')}\n\n` +
        'UUID 格式應為: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx（32 位十六進位字符，用連字號分隔）'
    );
  }

  // 檢查重複的 UUID
  const uniqueUuids = [...new Set(validatedUuids)];
  if (uniqueUuids.length !== validatedUuids.length) {
    throw new Error('UUID 列表中包含重複項目，請移除重複的 UUID');
  }

  return {
    menuItemUuids: uniqueUuids,
  };
}

/**
 * 格式化確認訊息
 */
function formatConfirmationMessage(uuids: string[]): string {
  return (
    `🗑️ 準備批次下架線上餐廳菜單項目\n\n` +
    `📊 項目數量: ${uuids.length} 個\n\n` +
    `📋 即將下架的項目 UUID:\n` +
    uuids.map((uuid, index) => `${index + 1}. ${uuid}`).join('\n') +
    `\n\n⚠️ 此操作將從線上餐廳平台下架這些菜單項目，確定要繼續嗎？`
  );
}

/**
 * 格式化成功回應
 */
function formatSuccessResponse(
  response: BatchDeleteMenuItemResponse,
  requestedUuids: string[]
): string {
  const deletedUuids =
    response.restaurant.settings.menu.integration.onlineRestaurant.deleteMenu
      .deletedMenuItemUuids || [];

  let result = `🗑️ 執行批次下架線上餐廳菜單項目\n\n`;
  result += `📋 處理項目清單:\n`;
  requestedUuids.forEach(uuid => {
    result += `     • ${uuid}\n`;
  });
  result += `\n✅ 批次下架完成！\n\n`;
  result += `📊 處理結果:\n`;
  result += `   • 請求下架: ${requestedUuids.length} 個項目\n`;
  result += `   • 成功下架: ${deletedUuids.length} 個項目\n`;

  if (deletedUuids.length > 0) {
    result += `\n🗑️ 成功下架的項目 UUID:\n`;
    deletedUuids.forEach(uuid => {
      result += `     • ${uuid}\n`;
    });
  }

  // 檢查是否有部分失敗的情況
  const failedUuids = requestedUuids.filter(
    uuid => !deletedUuids.includes(uuid)
  );
  if (failedUuids.length > 0) {
    result += `\n❌ 下架失敗的項目 UUID:\n`;
    failedUuids.forEach(uuid => {
      result += `     • ${uuid}\n`;
    });
    result += `\n💡 失敗原因可能包括:\n`;
    result += `   • 項目不存在\n`;
    result += `   • 項目已經下架\n`;
    result += `   • 權限不足\n`;
  }

  // 根據PRD要求，如果全部成功則顯示完成訊息
  if (failedUuids.length === 0) {
    result += `\n🎉 所有指定的線上餐廳菜單項目已成功下架！`;
  }

  return result;
}

/**
 * 批次刪除線上餐廳菜單項目工具
 */
const batchDeleteOnlineRestaurantMenuItems: IChefMcpTool = {
  name: 'batchDeleteOnlineRestaurantMenuItems',
  description:
    '批次下架線上餐廳菜單項目，一次可下架多個項目。請注意：此操作會立即執行且無法復原。',
  category: 'menu',
  version: '1.0.0',
  inputSchema: {
    type: 'object',
    properties: {
      menuItemUuids: {
        type: 'array',
        description: '要下架的菜單項目 UUID 陣列（必填）',
        items: {
          type: 'string',
          pattern:
            '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
          description: 'UUID 格式：xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
        },
        minItems: 1,
        maxItems: 50,
        uniqueItems: true,
      },
    },
    required: ['menuItemUuids'],
  },
  handler: async (args?: Record<string, unknown>): Promise<McpToolResponse> => {
    try {
      // 驗證輸入參數
      const validatedArgs = validateBatchDeleteArgs(args);

      // 建立 GraphQL 客戶端
      const client = createGraphQLClient();

      // 發送 GraphQL mutation
      const response = await client.request<BatchDeleteMenuItemResponse>(
        ONLINE_RESTAURANT_MENU_ITEM_BATCH_DELETE_MUTATION,
        { menuItemUuids: validatedArgs.menuItemUuids }
      );

      // 檢查回應格式
      if (
        !response.restaurant?.settings?.menu?.integration?.onlineRestaurant
          ?.deleteMenu
      ) {
        throw new Error('API 回應格式不正確或刪除失敗');
      }

      // 格式化成功回應
      const successMessage = formatSuccessResponse(
        response,
        validatedArgs.menuItemUuids
      );

      return {
        content: [
          {
            type: 'text',
            text: successMessage,
          },
        ],
      };
    } catch (error) {
      // 使用統一的錯誤處理機制
      const errorResult = handleError(error, {
        tool: 'batchDeleteOnlineRestaurantMenuItems',
        operation: 'batch_delete',
      });

      return {
        content: [
          {
            type: 'text',
            text: `🚨 批次下架菜單項目時發生錯誤:\n\n${errorResult.userMessage}\n\n💡 請檢查:\n- UUID 格式是否正確\n- 項目是否存在於線上餐廳\n- 網路連線是否正常\n- Token 是否有效且有足夠權限\n\n原始錯誤: ${error}`,
          },
        ],
        isError: true,
      };
    }
  },
};

export default batchDeleteOnlineRestaurantMenuItems;
