import { GraphQLClient } from 'graphql-request';
import { getApiConfig, getAuthToken } from '../config/apiConfig.js';

// GraphQL 客戶端實例快取
let graphqlClientInstance: GraphQLClient | null = null;

/**
 * 建立 GraphQL 客戶端配置
 */
export const createGraphQLClient = () => {
  const config = getApiConfig();
  const { graphqlEndpoint, timeout } = config;

  if (!graphqlEndpoint) {
    throw new Error('GRAPHQL_ENDPOINT environment variable is not set');
  }

  // 安全地取得認證 token
  const authToken = getAuthToken();

  // 建立客戶端配置
  const clientConfig = {
    headers: {
      Authorization: `token ${authToken}`,
      'Content-Type': 'application/json',
      'User-Agent': 'iChef-Setting-Agent/1.0.1',
    },
    timeout,
  };

  return new GraphQLClient(graphqlEndpoint, clientConfig);
};

/**
 * 取得 GraphQL 客戶端實例（單例模式）
 */
export const getGraphQLClient = (): GraphQLClient => {
  if (!graphqlClientInstance) {
    graphqlClientInstance = createGraphQLClient();
  }
  return graphqlClientInstance;
};

/**
 * 重置 GraphQL 客戶端實例
 */
export const resetGraphQLClient = (): void => {
  graphqlClientInstance = null;
};

/**
 * 執行 GraphQL 查詢，包含重試機制
 */
export const executeGraphQLQuery = async <T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> => {
  const client = getGraphQLClient();
  const config = getApiConfig();
  let lastError: Error;

  for (let attempt = 1; attempt <= config.retryAttempts; attempt++) {
    try {
      const result = await client.request<T>(query, variables);
      return result;
    } catch (error) {
      lastError = error as Error;

      // 如果是最後一次嘗試，直接拋出錯誤
      if (attempt === config.retryAttempts) {
        throw lastError;
      }

      // 等待後重試
      await new Promise(resolve => setTimeout(resolve, config.retryDelay));
    }
  }

  throw lastError!;
};

/**
 * 執行 GraphQL Mutation，包含重試機制
 */
export const executeGraphQLMutation = async <T>(
  mutation: string,
  variables?: Record<string, unknown>
): Promise<T> => {
  return executeGraphQLQuery<T>(mutation, variables);
};

/**
 * 測試 GraphQL 連接
 */
export const testGraphQLConnection = async (): Promise<{
  success: boolean;
  message: string;
  responseTime?: number;
}> => {
  const startTime = Date.now();

  try {
    const client = getGraphQLClient();

    // 使用簡單的查詢測試連接
    const testQuery = `
      query TestConnection {
        __typename
      }
    `;

    await client.request(testQuery);
    const responseTime = Date.now() - startTime;

    return {
      success: true,
      message: 'GraphQL connection successful',
      responseTime,
    };
  } catch (error) {
    return {
      success: false,
      message: `GraphQL connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
};
