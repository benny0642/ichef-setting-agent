import { logger } from '../server.js';
import { ToolExecutionError, ToolValidationError } from '../types/mcpTypes.js';

/**
 * 錯誤類型枚舉
 */
export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION',
  VALIDATION = 'VALIDATION',
  GRAPHQL = 'GRAPHQL',
  TOOL_EXECUTION = 'TOOL_EXECUTION',
  CONFIGURATION = 'CONFIGURATION',
  UNKNOWN = 'UNKNOWN',
}

/**
 * 錯誤處理結果
 */
export interface ErrorHandlingResult {
  type: ErrorType;
  message: string;
  userMessage: string;
  suggestions: string[];
  shouldRetry: boolean;
  retryAfter?: number;
}

/**
 * 分析錯誤類型和原因
 */
export function analyzeError(error: unknown): ErrorHandlingResult {
  const errorMessage = error instanceof Error ? error.message : String(error);

  // 網路連線錯誤
  if (
    errorMessage.includes('fetch') ||
    errorMessage.includes('ECONNREFUSED') ||
    errorMessage.includes('timeout')
  ) {
    return {
      type: ErrorType.NETWORK,
      message: errorMessage,
      userMessage: '❌ 網路連線錯誤，請確認 API 端點是否正確',
      suggestions: [
        '檢查 GRAPHQL_ENDPOINT 環境變數',
        '確認網路連線狀態',
        '驗證 API 服務是否正常運行',
        '檢查防火牆設定',
      ],
      shouldRetry: true,
      retryAfter: 5000,
    };
  }

  // 認證錯誤
  if (
    errorMessage.includes('401') ||
    errorMessage.includes('Unauthorized') ||
    errorMessage.includes('GRAPHQL_TOKEN')
  ) {
    return {
      type: ErrorType.AUTHENTICATION,
      message: errorMessage,
      userMessage: '❌ 認證失敗，請檢查 Token 是否正確',
      suggestions: [
        '檢查 GRAPHQL_TOKEN 環境變數',
        '確認 Token 是否過期',
        '驗證 Token 權限',
        '聯繫管理員重新取得 Token',
      ],
      shouldRetry: false,
    };
  }

  // GraphQL 錯誤
  if (
    errorMessage.includes('400') ||
    errorMessage.includes('Bad Request') ||
    errorMessage.includes('GraphQL')
  ) {
    return {
      type: ErrorType.GRAPHQL,
      message: errorMessage,
      userMessage: '❌ GraphQL 查詢錯誤',
      suggestions: [
        '檢查 GraphQL 查詢語法',
        '確認欄位名稱正確',
        '驗證參數類型',
        '查看 API 文件',
      ],
      shouldRetry: false,
    };
  }

  // 驗證錯誤
  if (error instanceof ToolValidationError) {
    return {
      type: ErrorType.VALIDATION,
      message: errorMessage,
      userMessage: `❌ 資料驗證錯誤: ${errorMessage}`,
      suggestions: [
        '檢查必填欄位',
        '確認資料格式',
        '驗證數值範圍',
        '查看工具參數說明',
      ],
      shouldRetry: false,
    };
  }

  // 工具執行錯誤
  if (error instanceof ToolExecutionError) {
    return {
      type: ErrorType.TOOL_EXECUTION,
      message: errorMessage,
      userMessage: `❌ 工具執行錯誤: ${errorMessage}`,
      suggestions: ['檢查工具參數', '確認系統狀態', '查看詳細日誌', '重試操作'],
      shouldRetry: true,
      retryAfter: 3000,
    };
  }

  // 配置錯誤
  if (
    errorMessage.includes('GRAPHQL_ENDPOINT') ||
    errorMessage.includes('config')
  ) {
    return {
      type: ErrorType.CONFIGURATION,
      message: errorMessage,
      userMessage: '❌ 配置錯誤，請檢查環境變數設定',
      suggestions: [
        '檢查 .env 檔案',
        '確認所有必要的環境變數',
        '驗證配置格式',
        '重新啟動服務',
      ],
      shouldRetry: false,
    };
  }

  // 未知錯誤
  return {
    type: ErrorType.UNKNOWN,
    message: errorMessage,
    userMessage: `❌ 發生未知錯誤: ${errorMessage}`,
    suggestions: ['查看詳細日誌', '檢查系統狀態', '重試操作', '聯繫技術支援'],
    shouldRetry: true,
    retryAfter: 1000,
  };
}

/**
 * 格式化錯誤訊息給用戶
 */
export function formatErrorForUser(error: unknown): string {
  const analysis = analyzeError(error);

  let message = `${analysis.userMessage}\n\n`;

  if (analysis.suggestions.length > 0) {
    message += '💡 建議解決方案:\n';
    analysis.suggestions.forEach((suggestion, index) => {
      message += `${index + 1}. ${suggestion}\n`;
    });
  }

  if (analysis.shouldRetry) {
    message += `\n🔄 此錯誤可能是暫時性的，建議重試操作`;
    if (analysis.retryAfter) {
      message += `（建議等待 ${analysis.retryAfter / 1000} 秒後重試）`;
    }
  }

  return message;
}

/**
 * 記錄錯誤到日誌
 */
export function logError(
  error: unknown,
  context?: Record<string, unknown>
): void {
  const analysis = analyzeError(error);

  logger.error('Error occurred', {
    type: analysis.type,
    message: analysis.message,
    shouldRetry: analysis.shouldRetry,
    retryAfter: analysis.retryAfter,
    context,
  });
}

/**
 * 處理並格式化錯誤的統一函數
 */
export function handleError(
  error: unknown,
  context?: Record<string, unknown>
): {
  userMessage: string;
  shouldRetry: boolean;
  retryAfter?: number;
} {
  // 記錄錯誤
  logError(error, context);

  // 分析錯誤
  const analysis = analyzeError(error);

  return {
    userMessage: formatErrorForUser(error),
    shouldRetry: analysis.shouldRetry,
    retryAfter: analysis.retryAfter,
  };
}

/**
 * 重試機制包裝器
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const analysis = analyzeError(error);

      // 如果不應該重試，直接拋出錯誤
      if (!analysis.shouldRetry) {
        throw error;
      }

      // 如果是最後一次嘗試，拋出錯誤
      if (attempt === maxAttempts) {
        throw error;
      }

      // 等待後重試
      const retryDelay = analysis.retryAfter || delay;
      logger.warn(
        `Operation failed, retrying in ${retryDelay}ms (attempt ${attempt}/${maxAttempts})`,
        {
          error: analysis.message,
          type: analysis.type,
        }
      );

      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }

  throw lastError;
}
