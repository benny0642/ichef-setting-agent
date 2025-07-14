import { MENU_ITEM_UPDATE_MUTATION } from '../api/gql/updateMenuItemMutation.js';
import { createGraphQLClient } from '../api/graphqlClient.js';
import { IChefMcpTool, McpToolResponse } from '../types/mcpTypes.js';
import { MenuItemUpdateResponse } from '../types/menuTypes.js';

// 商品更新參數介面
interface UpdateMenuItemArgs {
  uuid: string;
  name?: string;
  price?: number;
  menuItemCategoryUuid?: string;
  type?: 'ITEM' | 'COMBO_ITEM';
  enabled?: boolean;
  sortingIndex?: number;
  picture?: string;
  externalId?: string;
  customizedTaxEnabled?: boolean;
  customizedTaxType?: string;
  customizedTaxRate?: number;
}

// 格式化更新成功回應的輔助函數
const formatUpdateSuccessResponse = (
  data: MenuItemUpdateResponse,
  args: UpdateMenuItemArgs
): string => {
  const updatedItem = data.restaurant.settings.menu.updateMenuItem;

  let result = '✅ 商品更新成功！\n\n';
  result += `🆔 商品 UUID: ${updatedItem.uuid}\n`;

  // 顯示更新的欄位
  const updatedFields: string[] = [];

  if (args.name !== undefined) {
    updatedFields.push(`📝 商品名稱: ${args.name}`);
  }

  if (args.price !== undefined) {
    updatedFields.push(`💰 價格: $${args.price}`);
  }

  if (args.menuItemCategoryUuid !== undefined) {
    updatedFields.push(`📂 分類 UUID: ${args.menuItemCategoryUuid}`);
  }

  if (args.type !== undefined) {
    updatedFields.push(
      `🏷️ 類型: ${args.type === 'COMBO_ITEM' ? '套餐' : '單品'}`
    );
  }

  if (args.enabled !== undefined) {
    updatedFields.push(`🔄 狀態: ${args.enabled ? '啟用' : '停用'}`);
  }

  if (args.sortingIndex !== undefined) {
    updatedFields.push(`📊 排序索引: ${args.sortingIndex}`);
  }

  if (args.picture !== undefined) {
    updatedFields.push(`🖼️ 圖片: ${args.picture}`);
  }

  if (args.externalId !== undefined) {
    updatedFields.push(`🔗 外部 ID: ${args.externalId}`);
  }

  if (args.customizedTaxEnabled !== undefined) {
    updatedFields.push(
      `💸 自訂稅務: ${args.customizedTaxEnabled ? '啟用' : '停用'}`
    );
    if (args.customizedTaxEnabled && args.customizedTaxType) {
      updatedFields.push(`   稅務類型: ${args.customizedTaxType}`);
    }
    if (args.customizedTaxEnabled && args.customizedTaxRate !== undefined) {
      updatedFields.push(`   稅率: ${args.customizedTaxRate}%`);
    }
  }

  if (updatedFields.length > 0) {
    result += '\n📋 更新的欄位:\n';
    updatedFields.forEach(field => {
      result += `${field}\n`;
    });
  } else {
    result += '\n⚠️ 未指定任何要更新的欄位\n';
  }

  return result;
};

const updateMenuItem: IChefMcpTool = {
  name: 'updateMenuItem',
  description: '更新現有商品的資訊，支援部分更新（只更新指定的欄位）',
  category: 'menu',
  version: '1.0.0',
  inputSchema: {
    type: 'object',
    properties: {
      uuid: {
        type: 'string',
        description: '商品 UUID（必填）',
        pattern:
          '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
      },
      name: {
        type: 'string',
        description: '商品名稱（選填）',
        minLength: 1,
        maxLength: 255,
      },
      price: {
        type: 'number',
        description: '商品價格（選填，需為正數）',
        minimum: 0,
      },
      menuItemCategoryUuid: {
        type: 'string',
        description: '商品分類 UUID（選填）',
        pattern:
          '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
      },
      type: {
        type: 'string',
        enum: ['ITEM', 'COMBO_ITEM'],
        description: '商品類型（選填）',
      },
      enabled: {
        type: 'boolean',
        description:
          '啟用/停用商品（選填），停用與停售不同，停售要用 updateSoldOutItems',
      },
      sortingIndex: {
        type: 'number',
        description: '商品排序索引（選填）',
        minimum: 0,
      },
      picture: {
        type: 'string',
        description: '商品圖片 URL（選填）',
      },
      externalId: {
        type: 'string',
        description: '外部系統 ID（選填）',
      },
      customizedTaxEnabled: {
        type: 'boolean',
        description: '是否啟用自訂稅務（選填）',
      },
      customizedTaxType: {
        type: 'string',
        description: '自訂稅務類型（選填，例如：TX）',
      },
      customizedTaxRate: {
        type: 'number',
        description: '自訂稅率（選填，百分比）',
        minimum: 0,
        maximum: 100,
      },
    },
    required: ['uuid'],
  },
  handler: async (args?: Record<string, unknown>): Promise<McpToolResponse> => {
    try {
      // 類型轉換和基本驗證
      const updateArgs = args as unknown as UpdateMenuItemArgs;

      // 驗證必填欄位
      if (!updateArgs.uuid || typeof updateArgs.uuid !== 'string') {
        throw new Error('商品 UUID 是必填項目且必須是字串');
      }

      // 驗證 UUID 格式
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(updateArgs.uuid)) {
        throw new Error('商品 UUID 格式不正確');
      }

      // 驗證是否至少有一個欄位要更新
      const updateableFields = [
        'name',
        'price',
        'menuItemCategoryUuid',
        'type',
        'enabled',
        'sortingIndex',
        'picture',
        'externalId',
        'customizedTaxEnabled',
        'customizedTaxType',
        'customizedTaxRate',
      ];

      const hasUpdateFields = updateableFields.some(
        field => updateArgs[field as keyof UpdateMenuItemArgs] !== undefined
      );
      if (!hasUpdateFields) {
        throw new Error('至少需要指定一個要更新的欄位');
      }

      // 驗證商品名稱
      if (updateArgs.name !== undefined) {
        if (
          typeof updateArgs.name !== 'string' ||
          updateArgs.name.trim().length === 0
        ) {
          throw new Error('商品名稱必須是非空字串');
        }
      }

      // 驗證商品價格
      if (updateArgs.price !== undefined) {
        if (typeof updateArgs.price !== 'number' || updateArgs.price <= 0) {
          throw new Error('商品價格必須是大於 0 的數字');
        }
      }

      // 驗證分類 UUID
      if (updateArgs.menuItemCategoryUuid !== undefined) {
        if (
          typeof updateArgs.menuItemCategoryUuid !== 'string' ||
          !uuidRegex.test(updateArgs.menuItemCategoryUuid)
        ) {
          throw new Error('商品分類 UUID 格式不正確');
        }
      }

      // 驗證商品類型
      if (updateArgs.type !== undefined) {
        const validTypes = ['ITEM', 'COMBO_ITEM'];
        if (!validTypes.includes(updateArgs.type)) {
          throw new Error('商品類型必須是 ITEM 或 COMBO_ITEM');
        }
      }

      // 驗證排序索引
      if (updateArgs.sortingIndex !== undefined) {
        if (
          typeof updateArgs.sortingIndex !== 'number' ||
          updateArgs.sortingIndex < 0
        ) {
          throw new Error('排序索引必須是非負數');
        }
      }

      // 驗證自訂稅務設定
      if (updateArgs.customizedTaxRate !== undefined) {
        if (
          typeof updateArgs.customizedTaxRate !== 'number' ||
          updateArgs.customizedTaxRate < 0 ||
          updateArgs.customizedTaxRate > 100
        ) {
          throw new Error('自訂稅率必須是 0-100 之間的數字');
        }
      }

      // 構建 GraphQL mutation payload（只包含要更新的欄位）
      const payload: Record<string, unknown> = {};

      if (updateArgs.name !== undefined) {
        payload.name = updateArgs.name.trim();
      }

      if (updateArgs.price !== undefined) {
        payload.price = updateArgs.price.toString(); // API 需要字串格式的價格
      }

      if (updateArgs.menuItemCategoryUuid !== undefined) {
        payload.menuItemCategoryUuid = updateArgs.menuItemCategoryUuid;
      }

      if (updateArgs.type !== undefined) {
        payload.type = updateArgs.type;
      }

      if (updateArgs.enabled !== undefined) {
        payload.enabled = updateArgs.enabled;
      }

      if (updateArgs.sortingIndex !== undefined) {
        payload.sortingIndex = updateArgs.sortingIndex;
      }

      if (updateArgs.picture !== undefined) {
        payload.picture = updateArgs.picture;
      }

      if (updateArgs.externalId !== undefined) {
        payload.externalId = updateArgs.externalId;
      }

      if (updateArgs.customizedTaxEnabled !== undefined) {
        payload.customizedTaxEnabled = updateArgs.customizedTaxEnabled;
      }

      if (updateArgs.customizedTaxType !== undefined) {
        payload.customizedTaxType = updateArgs.customizedTaxType;
      }

      if (updateArgs.customizedTaxRate !== undefined) {
        payload.customizedTaxRate = updateArgs.customizedTaxRate.toString();
      }

      // 建立 GraphQL 客戶端
      const client = createGraphQLClient();

      // 發送 GraphQL mutation
      const data = await client.request<MenuItemUpdateResponse>(
        MENU_ITEM_UPDATE_MUTATION,
        {
          uuid: updateArgs.uuid,
          payload,
        }
      );

      // 檢查回應是否成功
      if (!data.restaurant?.settings?.menu?.updateMenuItem?.uuid) {
        throw new Error('API 回應格式不正確或更新失敗');
      }

      // 格式化成功回應
      const formattedResponse = formatUpdateSuccessResponse(data, updateArgs);

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
        errorMessage = '❌ 權限不足，請檢查 Token 是否有足夠的權限編輯商品';
      } else if (
        errorMessage.includes('400') ||
        errorMessage.includes('Bad Request')
      ) {
        errorMessage = '❌ 請求參數錯誤，請檢查商品資訊是否正確';
      } else if (
        errorMessage.includes('not found') ||
        errorMessage.includes('找不到')
      ) {
        errorMessage = '❌ 找不到指定的商品，請檢查商品 UUID 是否正確';
      } else if (
        errorMessage.includes('duplicate') ||
        errorMessage.includes('已存在')
      ) {
        errorMessage = '❌ 商品名稱已存在，請使用不同的名稱';
      } else if (
        errorMessage.includes('category') ||
        errorMessage.includes('分類')
      ) {
        errorMessage = '❌ 商品分類不存在或無效，請檢查分類 UUID 是否正確';
      }

      return {
        content: [
          {
            type: 'text',
            text: `🚨 更新商品時發生錯誤:\n\n${errorMessage}\n\n💡 建議檢查:\n- 商品 UUID 是否存在\n- 商品名稱是否重複\n- 分類 UUID 是否存在\n- 價格是否為正數\n- 網路連線是否正常\n- Token 是否有效\n\n原始錯誤: ${error}`,
          },
        ],
        isError: true,
      };
    }
  },
};

export default updateMenuItem;
