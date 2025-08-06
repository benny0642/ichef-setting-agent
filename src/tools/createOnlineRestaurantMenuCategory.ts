import { ONLINE_RESTAURANT_MENU_CATEGORY_CREATE_MUTATION } from '../api/gql/createOnlineRestaurantMenuCategoryMutation.js';
import { createGraphQLClient } from '../api/graphqlClient.js';
import { IChefMcpTool, McpToolResponse } from '../types/mcpTypes.js';

interface CreateOnlineRestaurantMenuCategoryArgs {
  name: string;
  menuHoursUuids: string[];
  description?: string;
}

const createOnlineRestaurantMenuCategory: IChefMcpTool = {
  name: 'createOnlineRestaurantMenuCategory',
  description: '建立新的線上餐廳菜單類別',
  category: 'menu',
  version: '1.0.0',
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: '線上餐廳菜單類別名稱',
      },
      menuHoursUuids: {
        type: 'array',
        items: { type: 'string' },
        description: '菜單時段 UUID 陣列 (對應 menuHoursList 中的 uuid 欄位)',
      },
      description: {
        type: 'string',
        description: '線上餐廳菜單類別描述（選填）',
      },
    },
    required: ['name', 'menuHoursUuids'],
  },
  handler: async (args?: Record<string, unknown>): Promise<McpToolResponse> => {
    try {
      const { name, menuHoursUuids, description } = (args as unknown) as CreateOnlineRestaurantMenuCategoryArgs;
      
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        throw new Error('線上餐廳菜單類別名稱不能為空');
      }

      if (!menuHoursUuids || !Array.isArray(menuHoursUuids) || menuHoursUuids.length === 0) {
        throw new Error('菜單時段 UUID 陣列不能為空');
      }

      // Validate that all menuHoursUuids are valid UUIDs
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      const invalidUuids = menuHoursUuids.filter(uuid => typeof uuid !== 'string' || !uuidRegex.test(uuid));
      if (invalidUuids.length > 0) {
        throw new Error(`無效的 UUID 格式: ${invalidUuids.join(', ')}`);
      }

      const client = createGraphQLClient();
      const payload = { 
        name: name.trim(),
        menuHoursUuids: menuHoursUuids,
        ...(description && description.trim().length > 0 && { description: description.trim() })
      };
      
      const data = await client.request(
        ONLINE_RESTAURANT_MENU_CATEGORY_CREATE_MUTATION,
        { payload }
      ) as any;

      const categoryUuid = data?.restaurant?.settings?.menu?.integration?.onlineRestaurant?.createMenuCategory?.uuid;
      
      if (!categoryUuid) {
        throw new Error('建立線上餐廳菜單類別失敗，未收到有效的 UUID');
      }

      return {
        content: [
          {
            type: 'text',
            text: `✅ 線上餐廳菜單類別「${name}」建立成功！\nUUID: ${categoryUuid}`,
          },
        ],
      };
    } catch (error) {
      let errorMessage = 'Unknown error occurred';
      if (error instanceof Error) errorMessage = error.message;
      
      return {
        content: [
          {
            type: 'text',
            text: `🚨 建立線上餐廳菜單類別失敗: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  },
};

export default createOnlineRestaurantMenuCategory;