import { logger } from '../server.js';
import {
  IChefMcpTool,
  ToolExecutionError,
  ToolExecutionResult,
  ToolRegistration,
  ToolValidationError,
} from '../types/mcpTypes.js';

export class ToolManager {
  private tools: Map<string, ToolRegistration> = new Map();

  /**
   * 註冊工具
   */
  registerTool(tool: IChefMcpTool): void {
    try {
      // 驗證工具基本結構
      this.validateTool(tool);

      const registration: ToolRegistration = {
        tool,
        registered: new Date(),
        enabled: true,
      };

      this.tools.set(tool.name, registration);
      logger.info(`Tool registered: ${tool.name}`, {
        category: tool.category,
        version: tool.version,
      });
    } catch (error) {
      logger.error(`Failed to register tool: ${tool.name}`, error);
      throw error;
    }
  }

  /**
   * 取得所有已註冊的工具
   */
  getAllTools(): IChefMcpTool[] {
    return Array.from(this.tools.values())
      .filter(registration => registration.enabled)
      .map(registration => registration.tool);
  }

  /**
   * 根據名稱取得工具
   */
  getTool(name: string): IChefMcpTool | undefined {
    const registration = this.tools.get(name);
    return registration?.enabled ? registration.tool : undefined;
  }

  /**
   * 執行工具
   */
  async executeTool(
    name: string,
    args?: Record<string, unknown>
  ): Promise<ToolExecutionResult> {
    const startTime = new Date();

    try {
      const tool = this.getTool(name);

      if (!tool) {
        throw new ToolExecutionError(
          `Tool not found: ${name}`,
          undefined,
          name
        );
      }

      logger.info(`Executing tool: ${name}`, { args });

      // 驗證輸入參數
      this.validateToolArgs(tool, args);

      // 執行工具
      const result = await tool.handler(args);

      logger.info(`Tool executed successfully: ${name}`, {
        duration: Date.now() - startTime.getTime(),
      });

      return {
        success: true,
        data: result,
        timestamp: startTime,
      };
    } catch (error) {
      logger.error(`Tool execution failed: ${name}`, {
        error: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime.getTime(),
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: startTime,
      };
    }
  }

  /**
   * 啟用/停用工具
   */
  toggleTool(name: string, enabled: boolean): void {
    const registration = this.tools.get(name);
    if (registration) {
      registration.enabled = enabled;
      logger.info(`Tool ${enabled ? 'enabled' : 'disabled'}: ${name}`);
    } else {
      throw new Error(`Tool not found: ${name}`);
    }
  }

  /**
   * 取得工具統計資訊
   */
  getToolStats(): {
    total: number;
    enabled: number;
    disabled: number;
    byCategory: Record<string, number>;
  } {
    const stats = {
      total: this.tools.size,
      enabled: 0,
      disabled: 0,
      byCategory: {} as Record<string, number>,
    };

    for (const registration of this.tools.values()) {
      if (registration.enabled) {
        stats.enabled++;
      } else {
        stats.disabled++;
      }

      const category = registration.tool.category || 'unknown';
      stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
    }

    return stats;
  }

  /**
   * 驗證工具結構
   */
  private validateTool(tool: IChefMcpTool): void {
    if (!tool.name || typeof tool.name !== 'string') {
      throw new ToolValidationError(
        'Tool name is required and must be a string'
      );
    }

    if (!tool.description || typeof tool.description !== 'string') {
      throw new ToolValidationError(
        'Tool description is required and must be a string'
      );
    }

    if (!tool.handler || typeof tool.handler !== 'function') {
      throw new ToolValidationError(
        'Tool handler is required and must be a function'
      );
    }

    if (!tool.inputSchema || typeof tool.inputSchema !== 'object') {
      throw new ToolValidationError(
        'Tool inputSchema is required and must be an object'
      );
    }
  }

  /**
   * 驗證工具參數
   */
  private validateToolArgs(
    tool: IChefMcpTool,
    args?: Record<string, unknown>
  ): void {
    const schema = tool.inputSchema;

    // 檢查必填欄位
    if (schema.required && Array.isArray(schema.required)) {
      for (const requiredField of schema.required) {
        if (!args || !(requiredField in args)) {
          throw new ToolValidationError(
            `Missing required field: ${requiredField}`,
            requiredField
          );
        }
      }
    }

    // 這裡可以加入更詳細的參數驗證邏輯
    // 例如：類型檢查、格式驗證等
  }
}

// 單例模式的工具管理器
export const toolManager = new ToolManager();
