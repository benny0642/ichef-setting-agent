import { MENU_ITEM_CREATE_MUTATION } from '../api/gql/createMenuItemMutation.js';
import { createGraphQLClient } from '../api/graphqlClient.js';
import { IChefMcpTool, McpToolResponse } from '../types/mcpTypes.js';
import { MenuItemCreateResponse } from '../types/menuTypes.js';

// 商品新增參數介面
interface CreateMenuItemArgs {
  name: string;
  price: number;
  menuItemCategoryUuid: string;
  type?: 'ITEM' | 'COMBO_ITEM';
  enabled?: boolean;
  sortingIndex?: number;
  picture?: string;
  externalId?: string;
  customizedTaxEnabled?: boolean;
  customizedTaxType?: string;
  customizedTaxRate?: number;
}

// 格式化新增成功回應的輔助函數
const formatCreateSuccessResponse = (
  data: MenuItemCreateResponse,
  args: CreateMenuItemArgs
): string => {
  const newItem = data.restaurant.settings.menu.createMenuItem;

  let result = '✅ 商品新增成功！\n\n';
  result += `🆔 商品 UUID: ${newItem.uuid}\n`;
  result += `📝 商品名稱: ${args.name}\n`;
  result += `💰 價格: $${args.price}\n`;
  result += `📂 分類 UUID: ${args.menuItemCategoryUuid}\n`;
  result += `🏷️ 類型: ${args.type === 'COMBO_ITEM' ? '套餐' : '單品'}\n`;
  result += `🔄 狀態: ${args.enabled !== false ? '啟用' : '停用'}\n`;

  if (args.sortingIndex !== undefined) {
    result += `📊 排序索引: ${args.sortingIndex}\n`;
  }

  if (args.picture) {
    result += `🖼️ 圖片: ${args.picture}\n`;
  }

  if (args.externalId) {
    result += `🔗 外部 ID: ${args.externalId}\n`;
  }

  if (args.customizedTaxEnabled) {
    result += `💸 自訂稅務: 啟用\n`;
    if (args.customizedTaxType) {
      result += `   稅務類型: ${args.customizedTaxType}\n`;
    }
    if (args.customizedTaxRate) {
      result += `   稅率: ${args.customizedTaxRate}%\n`;
    }
  }

  return result;
};

const createMenuItem: IChefMcpTool = {
  name: 'createMenuItem',
  description: '新增一個新的菜單商品項目，支援完整的商品資訊設定，要執行前請跟使用者說一聲「哈囉，我要執行了」。',
  category: 'menu',
  version: '1.0.0',
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: '商品名稱（必填）',
        minLength: 1,
        maxLength: 255,
      },
      price: {
        type: 'number',
        description: '商品價格（必填，需為正數）',
        minimum: 0,
      },
      menuItemCategoryUuid: {
        type: 'string',
        description: '商品分類 UUID（必填）',
        pattern:
          '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
      },
      type: {
        type: 'string',
        enum: ['ITEM', 'COMBO_ITEM'],
        description: '商品類型（預設為 ITEM）',
        default: 'ITEM',
      },
      enabled: {
        type: 'boolean',
        description: '是否啟用商品（預設為 true）',
        default: true,
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
        default: false,
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
    required: ['name', 'price', 'menuItemCategoryUuid'],
  },
  handler: async (args?: Record<string, unknown>): Promise<McpToolResponse> => {
    try {
      // 類型轉換和基本驗證
      const createArgs = args as unknown as CreateMenuItemArgs;

      // 驗證必填欄位
      if (!createArgs.name || typeof createArgs.name !== 'string') {
        throw new Error('商品名稱是必填項目且必須是字串');
      }

      if (createArgs.name.trim().length === 0) {
        throw new Error('商品名稱不能為空');
      }

      if (!createArgs.price || typeof createArgs.price !== 'number') {
        throw new Error('商品價格是必填項目且必須是數字');
      }

      if (createArgs.price <= 0) {
        throw new Error('商品價格必須大於 0');
      }

      if (
        !createArgs.menuItemCategoryUuid ||
        typeof createArgs.menuItemCategoryUuid !== 'string'
      ) {
        throw new Error('商品分類 UUID 是必填項目且必須是字串');
      }

      // 驗證 UUID 格式
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(createArgs.menuItemCategoryUuid)) {
        throw new Error('商品分類 UUID 格式不正確');
      }

      // 驗證商品類型
      const validTypes = ['ITEM', 'COMBO_ITEM'];
      if (createArgs.type && !validTypes.includes(createArgs.type)) {
        throw new Error('商品類型必須是 ITEM 或 COMBO_ITEM');
      }

      // 驗證排序索引
      if (createArgs.sortingIndex !== undefined) {
        if (
          typeof createArgs.sortingIndex !== 'number' ||
          createArgs.sortingIndex < 0
        ) {
          throw new Error('排序索引必須是非負數');
        }
      }

      // 驗證自訂稅務設定
      if (
        createArgs.customizedTaxEnabled &&
        createArgs.customizedTaxRate !== undefined
      ) {
        if (
          typeof createArgs.customizedTaxRate !== 'number' ||
          createArgs.customizedTaxRate < 0 ||
          createArgs.customizedTaxRate > 100
        ) {
          throw new Error('自訂稅率必須是 0-100 之間的數字');
        }
      }

      // 構建 GraphQL mutation payload
      const payload = {
        name: createArgs.name.trim(),
        price: createArgs.price.toString(), // API 需要字串格式的價格
        menuItemCategoryUuid: createArgs.menuItemCategoryUuid,
        type: createArgs.type || 'ITEM',
        enabled: createArgs.enabled !== false,
        ...(createArgs.sortingIndex !== undefined && {
          sortingIndex: createArgs.sortingIndex,
        }),
        ...(createArgs.picture && { picture: createArgs.picture }),
        ...(createArgs.externalId && { externalId: createArgs.externalId }),
        ...(createArgs.customizedTaxEnabled !== undefined && {
          customizedTaxEnabled: createArgs.customizedTaxEnabled,
        }),
        ...(createArgs.customizedTaxType && {
          customizedTaxType: createArgs.customizedTaxType,
        }),
        ...(createArgs.customizedTaxRate !== undefined && {
          customizedTaxRate: createArgs.customizedTaxRate.toString(),
        }),
      };

      // 建立 GraphQL 客戶端
      const client = createGraphQLClient();

      // 發送 GraphQL mutation
      const data = await client.request<MenuItemCreateResponse>(
        MENU_ITEM_CREATE_MUTATION,
        { payload }
      );

      // 檢查回應是否成功
      if (!data.restaurant?.settings?.menu?.createMenuItem?.uuid) {
        throw new Error('API 回應格式不正確或新增失敗');
      }

      // 格式化成功回應
      const formattedResponse = formatCreateSuccessResponse(data, createArgs);

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
        errorMessage = '❌ 權限不足，請檢查 Token 是否有足夠的權限新增商品';
      } else if (
        errorMessage.includes('400') ||
        errorMessage.includes('Bad Request')
      ) {
        errorMessage = '❌ 請求參數錯誤，請檢查商品資訊是否正確';
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
            text: `🚨 新增商品時發生錯誤:\n\n${errorMessage}\n\n💡 建議檢查:\n- 商品名稱是否重複\n- 分類 UUID 是否存在\n- 價格是否為正數\n- 網路連線是否正常\n- Token 是否有效\n\n原始錯誤: ${error}`,
          },
        ],
        isError: true,
      };
    }
  },
};

export default createMenuItem;
