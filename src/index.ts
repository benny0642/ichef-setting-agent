#!/usr/bin/env node

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { initializeServer, logger } from './server.js';

async function main() {
  try {
    logger.info('Starting iChef Setting MCP Server...');

    // 初始化伺服器
    const server = await initializeServer();

    // 建立 stdio 傳輸層
    const transport = new StdioServerTransport();

    // 連接伺服器到傳輸層
    await server.connect(transport);

    logger.info('iChef Setting MCP Server is running on stdio');

    // 處理程序終止信號
    process.on('SIGINT', async () => {
      logger.info('Received SIGINT, shutting down gracefully...');
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      logger.info('Received SIGTERM, shutting down gracefully...');
      process.exit(0);
    });
  } catch (error) {
    logger.error('Fatal error in main():', error);
    process.exit(1);
  }
}

// 處理未捕獲的異常
process.on('uncaughtException', error => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

main().catch(error => {
  logger.error('Fatal error in main():', error);
  process.exit(1);
});
