import { MENU_ITEM_CATEGORY_CREATE_MUTATION } from '../api/gql/createMenuItemCategoryMutation.js';
import { createGraphQLClient } from '../api/graphqlClient.js';
import { IChefMcpTool, McpToolResponse } from '../types/mcpTypes.js';

interface CreateMenuItemCategoryArgs {
  name: string;
}

const createMenuItemCategory: IChefMcpTool = {
  name: 'createMenuItemCategory',
  description: '建立新的菜單項目分類',
  category: 'menu',
  version: '1.0.0',
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: '分類名稱',
      },
    },
    required: ['name'],
  },
  handler: async (args?: Record<string, unknown>): Promise<McpToolResponse> => {
    try {
      const { name } = (args as unknown) as CreateMenuItemCategoryArgs;
      
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        throw new Error('分類名稱不能為空');
      }

      const client = createGraphQLClient();
      const payload = { name: name.trim() };
      
      const data = await client.request(
        MENU_ITEM_CATEGORY_CREATE_MUTATION,
        { payload }
      ) as any;

      const categoryUuid = data?.restaurant?.settings?.menu?.createMenuItemCategory?.uuid;
      
      if (!categoryUuid) {
        throw new Error('建立分類失敗，未收到有效的 UUID');
      }

      return {
        content: [
          {
            type: 'text',
            text: `✅ 菜單分類「${name}」建立成功！\nUUID: ${categoryUuid}`,
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
            text: `🚨 建立菜單分類失敗: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  },
};

export default createMenuItemCategory;