import { Tool as McpTool } from '@modelcontextprotocol/sdk/types.js';
import { GraphQLClient, gql } from 'graphql-request';

interface Tool extends McpTool {
  handler: () => Promise<{ content: { type: 'text'; text: string }[] }>;
}

// GraphQL 客戶端設定
const client = new GraphQLClient('YOUR_GRAPHQL_ENDPOINT_HERE', {
  headers: {
    // 如果需要認證，可以在這裡加入 headers
    // 'Authorization': 'Bearer YOUR_TOKEN_HERE',
    'Content-Type': 'application/json',
  },
});

// GraphQL 查詢語句
const GET_ALL_MENU_ITEMS = gql`
  query GetAllMenuItems {
    menuItems {
      id
      name
      description
      price
      category
      available
    }
  }
`;

export const getAllMenuItems: Tool = {
  name: 'getAllMenuItems',
  description: 'Get all menu items from GraphQL API',
  inputSchema: {
    type: 'object',
    properties: {},
  },
  handler: async () => {
    try {
      // 發送 GraphQL 請求
      const data = await client.request(GET_ALL_MENU_ITEMS);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error) {
      // 錯誤處理
      return {
        content: [
          {
            type: 'text',
            text: `Error fetching menu items: ${error.message}`,
          },
        ],
      };
    }
  },
};

export default getAllMenuItems;
