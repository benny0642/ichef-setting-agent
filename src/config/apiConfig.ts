/**
 * API 配置和環境變數管理
 */

export interface ApiConfig {
  graphqlEndpoint: string;
  graphqlToken?: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

export interface ServerConfig {
  name: string;
  version: string;
  logLevel: string;
  environment: 'development' | 'production' | 'test';
}

// 預設配置
const DEFAULT_CONFIG: ApiConfig = {
  graphqlEndpoint: 'http://localhost:8026/api/graphql/',
  timeout: 30000, // 30 秒
  retryAttempts: 3,
  retryDelay: 1000, // 1 秒
};

const DEFAULT_SERVER_CONFIG: ServerConfig = {
  name: 'ichef-setting-agent',
  version: '1.0.1',
  logLevel: 'info',
  environment: 'development',
};

/**
 * 取得 API 配置
 */
export function getApiConfig(): ApiConfig {
  return {
    graphqlEndpoint:
      process.env.GRAPHQL_ENDPOINT || DEFAULT_CONFIG.graphqlEndpoint,
    graphqlToken: process.env.GRAPHQL_TOKEN,
    timeout: parseInt(
      process.env.API_TIMEOUT || String(DEFAULT_CONFIG.timeout)
    ),
    retryAttempts: parseInt(
      process.env.API_RETRY_ATTEMPTS || String(DEFAULT_CONFIG.retryAttempts)
    ),
    retryDelay: parseInt(
      process.env.API_RETRY_DELAY || String(DEFAULT_CONFIG.retryDelay)
    ),
  };
}

/**
 * 取得伺服器配置
 */
export function getServerConfig(): ServerConfig {
  return {
    name: process.env.SERVER_NAME || DEFAULT_SERVER_CONFIG.name,
    version: process.env.SERVER_VERSION || DEFAULT_SERVER_CONFIG.version,
    logLevel: process.env.LOG_LEVEL || DEFAULT_SERVER_CONFIG.logLevel,
    environment:
      (process.env.NODE_ENV as ServerConfig['environment']) ||
      DEFAULT_SERVER_CONFIG.environment,
  };
}

/**
 * 驗證必要的環境變數
 */
export function validateConfig(): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 檢查必要的環境變數
  if (!process.env.GRAPHQL_ENDPOINT) {
    warnings.push(
      'GRAPHQL_ENDPOINT not set, using default: http://localhost:8026/api/graphql/'
    );
  }

  if (!process.env.GRAPHQL_TOKEN) {
    warnings.push(
      'GRAPHQL_TOKEN not set, API requests may require authentication'
    );
  }

  // 檢查數值型環境變數
  if (process.env.API_TIMEOUT && isNaN(parseInt(process.env.API_TIMEOUT))) {
    errors.push('API_TIMEOUT must be a valid number');
  }

  if (
    process.env.API_RETRY_ATTEMPTS &&
    isNaN(parseInt(process.env.API_RETRY_ATTEMPTS))
  ) {
    errors.push('API_RETRY_ATTEMPTS must be a valid number');
  }

  if (
    process.env.API_RETRY_DELAY &&
    isNaN(parseInt(process.env.API_RETRY_DELAY))
  ) {
    errors.push('API_RETRY_DELAY must be a valid number');
  }

  // 檢查環境類型
  if (
    process.env.NODE_ENV &&
    !['development', 'production', 'test'].includes(process.env.NODE_ENV)
  ) {
    errors.push('NODE_ENV must be one of: development, production, test');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * 取得完整的配置資訊
 */
export function getFullConfig() {
  return {
    api: getApiConfig(),
    server: getServerConfig(),
    validation: validateConfig(),
  };
}

/**
 * 建立環境變數範例檔案內容
 */
export function getEnvExample(): string {
  return `# iChef Setting Agent 環境變數配置

# GraphQL API 設定
GRAPHQL_ENDPOINT=http://localhost:8026/api/graphql/
GRAPHQL_TOKEN=your-api-token-here

# API 連接設定
API_TIMEOUT=30000
API_RETRY_ATTEMPTS=3
API_RETRY_DELAY=1000

# 伺服器設定
SERVER_NAME=ichef-setting-agent
SERVER_VERSION=1.0.1
LOG_LEVEL=info
NODE_ENV=development
`;
}
