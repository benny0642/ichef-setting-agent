import { UPDATE_SOLD_OUT_MENU_ITEM_MUTATION } from '../api/gql/updateSoldOutMenuItemMutation.js';
import { createGraphQLClient } from '../api/graphqlClient.js';
import { IChefMcpTool, McpToolResponse } from '../types/mcpTypes.js';
import { UpdateSoldOutMenuItemResponse } from '../types/menuTypes.js';

// 停售商品參數介面
interface UpdateSoldOutMenuItemArgs {
  items: Array<{
    uuid: string;
    isSoldOut: boolean;
  }>;
}

// 格式化停售更新成功回應的輔助函數
const formatSoldOutUpdateSuccessResponse = (
  data: UpdateSoldOutMenuItemResponse
): string => {
  const result = data.restaurant.settings.menu.updateSoldOutItems;

  let response = '✅ 商品停售狀態更新成功！\n\n';

  // 顯示更新的商品
  if (result.updatedSoldOutMenuItems.length > 0) {
    response += '📦 已更新的商品:\n';
    result.updatedSoldOutMenuItems.forEach((item, index) => {
      const statusText = item.isSoldOut ? '🔴 停售' : '🟢 恢復販售';
      response += `${index + 1}. UUID: ${item.uuid} - ${statusText}\n`;
    });
    response += '\n';
  }

  // 統計資訊
  const totalUpdated = result.updatedSoldOutMenuItems.length;
  const soldOutCount = result.updatedSoldOutMenuItems.filter(
    item => item.isSoldOut
  ).length;
  const resumeCount = totalUpdated - soldOutCount;

  response += `📊 更新統計:\n`;
  response += `- 總計更新: ${totalUpdated} 項\n`;
  response += `- 設為停售: ${soldOutCount} 項\n`;
  response += `- 恢復販售: ${resumeCount} 項\n`;

  return response;
};

// 驗證 UUID 格式的輔助函數
const isValidUUID = (uuid: string): boolean => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

// 驗證輸入參數的輔助函數
const validateUpdateSoldOutArgs = (
  args: UpdateSoldOutMenuItemArgs
): string | null => {
  if (!args.items || !Array.isArray(args.items)) {
    return '❌ items 參數必須是陣列';
  }

  if (args.items.length === 0) {
    return '❌ 至少需要提供一個商品';
  }

  if (args.items.length > 50) {
    return '❌ 一次最多只能處理 50 個商品';
  }

  // 檢查每個商品的格式
  for (let i = 0; i < args.items.length; i++) {
    const item = args.items[i];

    if (!item.uuid || typeof item.uuid !== 'string') {
      return `❌ 第 ${i + 1} 個商品的 uuid 必須是字串`;
    }

    if (!isValidUUID(item.uuid)) {
      return `❌ 第 ${i + 1} 個商品的 uuid 格式不正確: ${item.uuid}`;
    }

    if (typeof item.isSoldOut !== 'boolean') {
      return `❌ 第 ${i + 1} 個商品的 isSoldOut 必須是布林值`;
    }
  }

  // 檢查是否有重複的 UUID
  const uuids = args.items.map(item => item.uuid);
  const uniqueUuids = new Set(uuids);
  if (uuids.length !== uniqueUuids.size) {
    return '❌ 商品 UUID 不能重複';
  }

  return null;
};

const updateSoldOutMenuItem: IChefMcpTool = {
  name: 'updateSoldOutMenuItem',
  description: '批次更新商品的停售狀態',
  inputSchema: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        description: '要更新停售狀態的商品列表',
        items: {
          type: 'object',
          properties: {
            uuid: {
              type: 'string',
              description: '商品的 UUID',
            },
            isSoldOut: {
              type: 'boolean',
              description: '是否停售 (true: 停售, false: 恢復販售)',
            },
          },
          required: ['uuid', 'isSoldOut'],
        },
      },
    },
    required: ['items'],
  },

  handler: async (args?: Record<string, unknown>): Promise<McpToolResponse> => {
    try {
      // 類型轉換和基本驗證
      const updateArgs = args as unknown as UpdateSoldOutMenuItemArgs;

      // 驗證輸入參數
      const validationError = validateUpdateSoldOutArgs(updateArgs);
      if (validationError) {
        return {
          content: [
            {
              type: 'text',
              text: validationError,
            },
          ],
          isError: true,
        };
      }

      // 建構 GraphQL 變數
      const variables = {
        soldOutMenuItems: updateArgs.items.map(item => ({
          uuid: item.uuid,
          isSoldOut: item.isSoldOut,
        })),
      };

      // 建立 GraphQL 客戶端並執行查詢
      const client = createGraphQLClient();
      const data = await client.request<UpdateSoldOutMenuItemResponse>(
        UPDATE_SOLD_OUT_MENU_ITEM_MUTATION,
        variables
      );

      // 檢查回應是否包含預期的資料結構
      if (!data?.restaurant?.settings?.menu?.updateSoldOutItems) {
        return {
          content: [
            {
              type: 'text',
              text: '❌ 伺服器回應格式異常，請稍後再試',
            },
          ],
          isError: true,
        };
      }

      // 格式化成功回應
      const successMessage = formatSoldOutUpdateSuccessResponse(data);

      return {
        content: [
          {
            type: 'text',
            text: successMessage,
          },
        ],
      };
    } catch (error) {
      let errorMessage = '❌ 更新商品停售狀態時發生錯誤：';

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

export default updateSoldOutMenuItem;
