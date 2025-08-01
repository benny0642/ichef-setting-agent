import { ToolValidationError } from '../types/mcpTypes.js';

/**
 * 驗證規則介面
 */
export interface ValidationRule {
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object';
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  enum?: string[];
  custom?: (value: unknown) => boolean | string;
}

/**
 * 驗證結果
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * 驗證單一欄位
 */
export function validateField(
  value: unknown,
  fieldName: string,
  rules: ValidationRule
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 檢查必填欄位
  if (
    rules.required &&
    (value === undefined || value === null || value === '')
  ) {
    errors.push(`${fieldName} 是必填欄位`);
    return { valid: false, errors, warnings };
  }

  // 如果值為空且非必填，跳過其他驗證
  if (value === undefined || value === null || value === '') {
    return { valid: true, errors, warnings };
  }

  // 類型驗證
  if (rules.type) {
    const actualType = Array.isArray(value) ? 'array' : typeof value;
    if (actualType !== rules.type) {
      errors.push(
        `${fieldName} 必須是 ${rules.type} 類型，但收到 ${actualType}`
      );
    }
  }

  // 字串驗證
  if (typeof value === 'string') {
    if (rules.minLength !== undefined && value.length < rules.minLength) {
      errors.push(`${fieldName} 長度不能少於 ${rules.minLength} 個字符`);
    }
    if (rules.maxLength !== undefined && value.length > rules.maxLength) {
      errors.push(`${fieldName} 長度不能超過 ${rules.maxLength} 個字符`);
    }
    if (rules.pattern && !rules.pattern.test(value)) {
      errors.push(`${fieldName} 格式不正確`);
    }
  }

  // 數字驗證
  if (typeof value === 'number') {
    if (rules.min !== undefined && value < rules.min) {
      errors.push(`${fieldName} 不能小於 ${rules.min}`);
    }
    if (rules.max !== undefined && value > rules.max) {
      errors.push(`${fieldName} 不能大於 ${rules.max}`);
    }
    if (isNaN(value)) {
      errors.push(`${fieldName} 必須是有效的數字`);
    }
  }

  // 枚舉驗證
  if (rules.enum && !rules.enum.includes(String(value))) {
    errors.push(`${fieldName} 必須是以下值之一: ${rules.enum.join(', ')}`);
  }

  // 自定義驗證
  if (rules.custom) {
    const customResult = rules.custom(value);
    if (customResult !== true) {
      errors.push(
        typeof customResult === 'string'
          ? customResult
          : `${fieldName} 自定義驗證失敗`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * 驗證物件
 */
export function validateObject(
  data: Record<string, unknown>,
  schema: Record<string, ValidationRule>
): ValidationResult {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];

  // 驗證每個欄位
  for (const [fieldName, rules] of Object.entries(schema)) {
    const fieldValue = data[fieldName];
    const result = validateField(fieldValue, fieldName, rules);

    allErrors.push(...result.errors);
    allWarnings.push(...result.warnings);
  }

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
  };
}

/**
 * 商品相關驗證器
 */
export const MenuItemValidators = {
  /**
   * 驗證商品名稱
   */
  validateName: (name: unknown): ValidationResult => {
    return validateField(name, 'name', {
      required: true,
      type: 'string',
      minLength: 1,
      maxLength: 100,
      pattern: /^[^<>{}]*$/, // 不允許特殊字符
    });
  },

  /**
   * 驗證商品價格
   */
  validatePrice: (price: unknown): ValidationResult => {
    return validateField(price, 'price', {
      required: true,
      type: 'number',
      min: 0,
      max: 999999,
      custom: value => {
        if (typeof value === 'number') {
          // 檢查是否為整數或最多兩位小數
          return Number.isInteger(value * 100) || '價格最多只能有兩位小數';
        }
        return true;
      },
    });
  },

  /**
   * 驗證分類 UUID
   */
  validateCategoryUuid: (uuid: unknown): ValidationResult => {
    return validateField(uuid, 'categoryUuid', {
      required: true,
      type: 'string',
      pattern:
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    });
  },

  /**
   * 驗證商品類型
   */
  validateType: (type: unknown): ValidationResult => {
    return validateField(type, 'type', {
      required: false,
      type: 'string',
      enum: ['item', 'combo'],
    });
  },

  /**
   * 驗證啟用狀態
   */
  validateEnabled: (enabled: unknown): ValidationResult => {
    return validateField(enabled, 'enabled', {
      required: false,
      type: 'boolean',
    });
  },

  /**
   * 驗證排序索引
   */
  validateSortingIndex: (sortingIndex: unknown): ValidationResult => {
    return validateField(sortingIndex, 'sortingIndex', {
      required: false,
      type: 'number',
      min: 0,
      max: 9999,
      custom: value => {
        if (typeof value === 'number') {
          return Number.isInteger(value) || '排序索引必須是整數';
        }
        return true;
      },
    });
  },

  /**
   * 驗證圖片 URL
   */
  validatePicture: (picture: unknown): ValidationResult => {
    return validateField(picture, 'picture', {
      required: false,
      type: 'string',
      maxLength: 500,
      pattern: /^https?:\/\/.+/,
    });
  },

  /**
   * 驗證完整的新增商品資料
   */
  validateCreateMenuItem: (data: Record<string, unknown>): ValidationResult => {
    const schema = {
      name: {
        required: true,
        type: 'string' as const,
        minLength: 1,
        maxLength: 100,
        pattern: /^[^<>{}]*$/,
      },
      price: {
        required: true,
        type: 'number' as const,
        min: 0,
        max: 999999,
        custom: (value: unknown) => {
          if (typeof value === 'number') {
            return Number.isInteger(value * 100) || '價格最多只能有兩位小數';
          }
          return true;
        },
      },
      categoryUuid: {
        required: true,
        type: 'string' as const,
        pattern:
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      },
      type: {
        required: false,
        type: 'string' as const,
        enum: ['item', 'combo'],
      },
      enabled: {
        required: false,
        type: 'boolean' as const,
      },
      sortingIndex: {
        required: false,
        type: 'number' as const,
        min: 0,
        max: 9999,
        custom: (value: unknown) => {
          if (typeof value === 'number') {
            return Number.isInteger(value) || '排序索引必須是整數';
          }
          return true;
        },
      },
      picture: {
        required: false,
        type: 'string' as const,
        maxLength: 500,
        pattern: /^https?:\/\/.+/,
      },
    };

    return validateObject(data, schema);
  },

  /**
   * 驗證更新商品資料
   */
  validateUpdateMenuItem: (data: Record<string, unknown>): ValidationResult => {
    const schema = {
      uuid: {
        required: true,
        type: 'string' as const,
        pattern:
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      },
      name: {
        required: false,
        type: 'string' as const,
        minLength: 1,
        maxLength: 100,
        pattern: /^[^<>{}]*$/,
      },
      price: {
        required: false,
        type: 'number' as const,
        min: 0,
        max: 999999,
        custom: (value: unknown) => {
          if (typeof value === 'number') {
            return Number.isInteger(value * 100) || '價格最多只能有兩位小數';
          }
          return true;
        },
      },
      categoryUuid: {
        required: false,
        type: 'string' as const,
        pattern:
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      },
      type: {
        required: false,
        type: 'string' as const,
        enum: ['item', 'combo'],
      },
      enabled: {
        required: false,
        type: 'boolean' as const,
      },
      sortingIndex: {
        required: false,
        type: 'number' as const,
        min: 0,
        max: 9999,
        custom: (value: unknown) => {
          if (typeof value === 'number') {
            return Number.isInteger(value) || '排序索引必須是整數';
          }
          return true;
        },
      },
      picture: {
        required: false,
        type: 'string' as const,
        maxLength: 500,
        pattern: /^https?:\/\/.+/,
      },
    };

    return validateObject(data, schema);
  },

  /**
   * 驗證 UUID 格式
   */
  validateUuid: (uuid: unknown): ValidationResult => {
    return validateField(uuid, 'uuid', {
      required: true,
      type: 'string',
      pattern:
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    });
  },

  /**
   * 驗證 UUID 陣列
   */
  validateUuidArray: (uuids: unknown): ValidationResult => {
    return validateField(uuids, 'uuidArray', {
      required: true,
      type: 'array',
      custom: (value: unknown) => {
        if (!Array.isArray(value)) {
          return 'UUID 陣列必須是陣列格式';
        }
        if (value.length === 0) {
          return 'UUID 陣列不能為空';
        }
        if (value.length > 100) {
          return 'UUID 陣列數量不能超過 100 個';
        }
        for (const uuid of value) {
          if (
            typeof uuid !== 'string' ||
            !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
              uuid
            )
          ) {
            return 'UUID 陣列中包含無效的 UUID 格式';
          }
        }
        return true;
      },
    });
  },

  /**
   * 驗證匯入商品參數
   */
  validateImportMenuItemArgs: (
    data: Record<string, unknown>
  ): ValidationResult => {
    const schema = {
      categoryUuid: {
        required: true,
        type: 'string' as const,
        pattern:
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      },
      ichefMenuItemUuids: {
        required: true,
        type: 'array' as const,
        custom: (value: unknown) => {
          if (!Array.isArray(value)) {
            return 'ichefMenuItemUuids 必須是陣列格式';
          }
          if (value.length === 0) {
            return 'ichefMenuItemUuids 不能為空，至少需要一個商品 UUID';
          }
          if (value.length > 50) {
            return 'ichefMenuItemUuids 數量不能超過 50 個';
          }
          for (const uuid of value) {
            if (
              typeof uuid !== 'string' ||
              !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
                uuid
              )
            ) {
              return 'ichefMenuItemUuids 中包含無效的 UUID 格式';
            }
          }
          return true;
        },
      },
    };

    return validateObject(data, schema);
  },

  /**
   * 驗證批次操作資料
   */
  validateBatchOperation: (data: Record<string, unknown>): ValidationResult => {
    const schema = {
      itemUuids: {
        required: true,
        type: 'array' as const,
        custom: (value: unknown) => {
          if (!Array.isArray(value)) {
            return 'itemUuids 必須是陣列';
          }
          if (value.length === 0) {
            return 'itemUuids 不能為空';
          }
          if (value.length > 100) {
            return 'itemUuids 數量不能超過 100 個';
          }
          for (const uuid of value) {
            if (
              typeof uuid !== 'string' ||
              !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
                uuid
              )
            ) {
              return 'itemUuids 中包含無效的 UUID';
            }
          }
          return true;
        },
      },
      operation: {
        required: true,
        type: 'string' as const,
        enum: ['enable', 'disable'],
      },
      reason: {
        required: false,
        type: 'string' as const,
        maxLength: 200,
      },
    };

    return validateObject(data, schema);
  },
};

/**
 * 拋出驗證錯誤的輔助函數
 */
export function throwValidationError(
  result: ValidationResult,
  fieldName?: string
): never {
  const errorMessage = result.errors.join('; ');
  throw new ToolValidationError(errorMessage, fieldName);
}

/**
 * 驗證並拋出錯誤的輔助函數
 */
export function validateAndThrow(
  data: Record<string, unknown>,
  validator: (data: Record<string, unknown>) => ValidationResult
): void {
  const result = validator(data);
  if (!result.valid) {
    throwValidationError(result);
  }
}
