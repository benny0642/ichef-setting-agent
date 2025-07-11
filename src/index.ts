import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import server from './server.js';

// 註冊 getAllMenuItems 工具
server.registerTool(
  'getAllMenuItems',
  {
    title: 'Get All Menu Items',
    description: 'Get all menu items',
    inputSchema: {},
  },
  async () => {
    return {
      content: [
        {
          type: 'text',
          text: 'hello world',
        },
      ],
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Ichef Setting MCP Server running on stdio');
}

main().catch(error => {
  console.error('Fatal error in main():', error);
  process.exit(1);
});
