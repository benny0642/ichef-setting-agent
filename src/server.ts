import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import getAllMenuItems from './tools/getAllMenuItems.js';

const server = new Server(
  {
    name: 'ichef-setting-agent',
    version: '1.0.1',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// 註冊工具列表處理器
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: getAllMenuItems.name,
        description: getAllMenuItems.description,
        inputSchema: getAllMenuItems.inputSchema,
      },
    ],
  };
});

// 註冊工具呼叫處理器
server.setRequestHandler(CallToolRequestSchema, async request => {
  const { name } = request.params;

  if (name === getAllMenuItems.name) {
    return await getAllMenuItems.handler();
  }

  throw new Error(`Unknown tool: ${name}`);
});

export default server;
