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

  // 強制要求 GRAPHQL_TOKEN，不允許空值
  if (!process.env.GRAPHQL_TOKEN) {
    errors.push(
      'GRAPHQL_TOKEN is required and must be provided via environment variable or MCP parameters'
    );
  } else {
    // 驗證 token 格式（基本檢查）
    const token = process.env.GRAPHQL_TOKEN.trim();
    if (token.length === 0) {
      errors.push('GRAPHQL_TOKEN cannot be empty');
    } else if (token.length < 10) {
      warnings.push('GRAPHQL_TOKEN appears to be too short, please verify');
    }
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
 * 驗證認證 token 的有效性
 */
export function validateAuthToken(token?: string): {
  isValid: boolean;
  error?: string;
} {
  if (!token) {
    return {
      isValid: false,
      error: 'Authentication token is required',
    };
  }

  const trimmedToken = token.trim();

  if (trimmedToken.length === 0) {
    return {
      isValid: false,
      error: 'Authentication token cannot be empty',
    };
  }

  if (trimmedToken.length < 10) {
    return {
      isValid: false,
      error: 'Authentication token appears to be invalid (too short)',
    };
  }

  // 檢查是否包含不安全的字符
  if (
    trimmedToken.includes(' ') ||
    trimmedToken.includes('\n') ||
    trimmedToken.includes('\t')
  ) {
    return {
      isValid: false,
      error: 'Authentication token contains invalid characters',
    };
  }

  return {
    isValid: true,
  };
}

/**
 * 安全地取得認證 token
 */
export function getAuthToken(): string {
  const token = process.env.GRAPHQL_TOKEN;
  const validation = validateAuthToken(token);

  if (!validation.isValid) {
    throw new Error(`Authentication error: ${validation.error}`);
  }

  return token!.trim();
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

# 認證 Token (必填) - 請從 iChef 系統取得有效的 API Token
# 注意：此 Token 應該保密，不要提交到版本控制系統
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

# 安全提醒：
# 1. GRAPHQL_TOKEN 是必填項目，系統啟動時會驗證
# 2. Token 應該從安全的來源取得，不要在程式碼中硬編碼
# 3. 在生產環境中，建議使用環境變數管理工具或密鑰管理系統
`;
}
