/**
 * GraphQL 查詢驗證和工具函數
 */

import { GraphQLOperationType, MenuItemOperationType } from './index.js';

/**
 * GraphQL 查詢結果驗證
 */
export interface GraphQLValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * 驗證 GraphQL 查詢結果
 */
export function validateGraphQLResponse(
  response: unknown,
  operationType: GraphQLOperationType
): GraphQLValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!response) {
    errors.push('GraphQL response is null or undefined');
    return { isValid: false, errors, warnings };
  }

  if (typeof response !== 'object') {
    errors.push('GraphQL response is not an object');
    return { isValid: false, errors, warnings };
  }

  const responseObj = response as Record<string, unknown>;

  // 檢查是否有 GraphQL 錯誤
  if (responseObj.errors) {
    errors.push('GraphQL response contains errors');
  }

  // 檢查餐廳資料結構
  if (operationType === GraphQLOperationType.QUERY) {
    if (!responseObj.restaurant) {
      errors.push('Missing restaurant data in response');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * 提取 GraphQL 錯誤訊息
 */
export function extractGraphQLErrors(response: unknown): string[] {
  if (!response || typeof response !== 'object') {
    return [];
  }

  const responseObj = response as Record<string, unknown>;
  const errors = responseObj.errors as Array<{ message: string }> | undefined;

  return errors ? errors.map(error => error.message) : [];
}

/**
 * 格式化 GraphQL 變數
 */
export function formatGraphQLVariables(
  variables: Record<string, unknown>
): Record<string, unknown> {
  const formatted: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(variables)) {
    if (value !== undefined && value !== null) {
      formatted[key] = value;
    }
  }

  return formatted;
}

/**
 * 建立 GraphQL 查詢上下文
 */
export interface GraphQLQueryContext {
  operationType: GraphQLOperationType;
  operationName: string;
  variables?: Record<string, unknown>;
  menuItemOperationType?: MenuItemOperationType;
}

/**
 * 建立查詢上下文
 */
export function createQueryContext(
  operationType: GraphQLOperationType,
  operationName: string,
  variables?: Record<string, unknown>,
  menuItemOperationType?: MenuItemOperationType
): GraphQLQueryContext {
  return {
    operationType,
    operationName,
    variables: variables ? formatGraphQLVariables(variables) : undefined,
    menuItemOperationType,
  };
}

/**
 * GraphQL 查詢計時器
 */
export class GraphQLTimer {
  private startTime: number;
  private endTime?: number;

  constructor() {
    this.startTime = Date.now();
  }

  stop(): number {
    this.endTime = Date.now();
    return this.endTime - this.startTime;
  }

  getElapsedTime(): number {
    const endTime = this.endTime || Date.now();
    return endTime - this.startTime;
  }
}

/**
 * 建立 GraphQL 查詢日誌
 */
export interface GraphQLQueryLog {
  context: GraphQLQueryContext;
  success: boolean;
  executionTime: number;
  error?: string;
  timestamp: Date;
}

export function createQueryLog(
  context: GraphQLQueryContext,
  success: boolean,
  executionTime: number,
  error?: string
): GraphQLQueryLog {
  return {
    context,
    success,
    executionTime,
    error,
    timestamp: new Date(),
  };
}
