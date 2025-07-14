import { Tool as McpTool } from '@modelcontextprotocol/sdk/types.js';

// MCP 工具的統一介面
export interface McpToolHandler {
  (args?: Record<string, unknown>): Promise<McpToolResponse>;
}

// MCP 工具回應的統一格式
export interface McpToolResponse {
  content: McpToolContent[];
  isError?: boolean;
}

// MCP 工具內容類型
export interface McpToolContent {
  type: 'text' | 'image' | 'resource';
  text?: string;
  data?: string;
  url?: string;
  mimeType?: string;
}

// 擴展的 MCP 工具介面
export interface IChefMcpTool extends McpTool {
  handler: McpToolHandler;
  category?: 'menu' | 'item' | 'batch' | 'system';
  version?: string;
}

// 工具執行結果
export interface ToolExecutionResult {
  success: boolean;
  data?: unknown;
  error?: string;
  timestamp: Date;
}

// 工具註冊資訊
export interface ToolRegistration {
  tool: IChefMcpTool;
  registered: Date;
  enabled: boolean;
}

// 批次操作的共用介面
export interface BatchOperationArgs {
  itemUuids: string[];
  operation: 'enable' | 'disable';
  reason?: string;
}

// 商品操作的共用參數
export interface MenuItemOperationArgs {
  name?: string;
  price?: number;
  categoryUuid?: string;
  type?: 'item' | 'combo';
  enabled?: boolean;
  picture?: string;
  sortingIndex?: number;
}

// 新增商品的參數
export interface CreateMenuItemArgs extends MenuItemOperationArgs {
  name: string;
  price: number;
  categoryUuid: string;
  type?: 'item' | 'combo';
}

// 更新商品的參數
export interface UpdateMenuItemArgs extends MenuItemOperationArgs {
  uuid: string;
}

// 工具驗證錯誤
export class ToolValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public value?: unknown
  ) {
    super(message);
    this.name = 'ToolValidationError';
  }
}

// 工具執行錯誤
export class ToolExecutionError extends Error {
  constructor(
    message: string,
    public originalError?: Error,
    public toolName?: string
  ) {
    super(message);
    this.name = 'ToolExecutionError';
  }
}
