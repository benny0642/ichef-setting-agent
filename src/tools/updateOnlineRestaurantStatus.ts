import { ONLINE_RESTAURANT_INFORMATION_EDIT_MUTATION } from '../api/gql/onlineRestaurantInformationEditMutation.js';
import { createGraphQLClient } from '../api/graphqlClient.js';
import { IChefMcpTool, McpToolResponse } from '../types/mcpTypes.js';

interface UpdateOnlineRestaurantStatusArgs {
  operationType: 'ONLY_BROWSE' | 'TAKEOUT';
}

const formatResponse = (operationType: 'ONLY_BROWSE' | 'TAKEOUT') => {
  if (operationType === 'TAKEOUT') {
    return '✅ 外帶外送已上線（可訂購）';
  } else {
    return '⛔ 外帶外送已下線（僅瀏覽）';
  }
};

const updateOnlineRestaurantStatus: IChefMcpTool = {
  name: 'updateOnlineRestaurantStatus',
  description:
    '切換外帶外送的上下線狀態（operationType: ONLY_BROWSE=下線, TAKEOUT=上線）',
  category: 'menu',
  version: '1.0.0',
  inputSchema: {
    type: 'object',
    properties: {
      operationType: {
        type: 'string',
        enum: ['ONLY_BROWSE', 'TAKEOUT'],
        description: 'ONLY_BROWSE=下線, TAKEOUT=上線',
      },
    },
    required: ['operationType'],
  },
  handler: async (args?: Record<string, unknown>): Promise<McpToolResponse> => {
    try {
      const { operationType } =
        args as unknown as UpdateOnlineRestaurantStatusArgs;
      if (
        !operationType ||
        (operationType !== 'ONLY_BROWSE' && operationType !== 'TAKEOUT')
      ) {
        throw new Error('operationType 必須是 ONLY_BROWSE 或 TAKEOUT');
      }
      const client = createGraphQLClient();
      const payload = { operationType };
      await client.request(ONLINE_RESTAURANT_INFORMATION_EDIT_MUTATION, {
        payload,
      });
      return {
        content: [
          {
            type: 'text',
            text: formatResponse(operationType),
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
            text: `🚨 外帶外送上下線切換失敗: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  },
};

export default updateOnlineRestaurantStatus;
