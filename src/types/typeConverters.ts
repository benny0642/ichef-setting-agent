/**
 * 類型轉換工具函數
 */

import {
  BatchOperationResult,
  CreateMenuItemPayload,
  CustomizedTaxType,
  MenuItemCategoryType,
  MenuItemListingResponse,
  MenuItemType,
  MenuItemTypeEnum,
  UpdateMenuItemPayload,
  UUID,
} from './menuTypes.js';

/**
 * 將 API 回應轉換為格式化的商品資料
 */
export function convertMenuItemToDisplayFormat(item: MenuItemType): {
  uuid: UUID;
  name: string;
  price: string;
  type: string;
  status: string;
  category: UUID;
  isFromHq: boolean;
  hasImage: boolean;
  sortingIndex: number;
} {
  return {
    uuid: item.uuid,
    name: item.name,
    price: `$${item.price.toFixed(2)}`,
    type: item.type === MenuItemTypeEnum.ITEM ? '單品' : '套餐',
    status: item.enabled ? '啟用' : '停用',
    category: item.menuItemCategoryUuid,
    isFromHq: item.isFromHq,
    hasImage: Boolean(item.picture),
    sortingIndex: item.sortingIndex,
  };
}

/**
 * 將商品分類轉換為格式化的顯示格式
 */
export function convertMenuCategoryToDisplayFormat(
  category: MenuItemCategoryType
): {
  uuid: UUID;
  name: string;
  itemCount: number;
  sortingIndex: number;
  isFromHq: boolean;
  items: ReturnType<typeof convertMenuItemToDisplayFormat>[];
} {
  return {
    uuid: category.uuid,
    name: category.name,
    itemCount: category.menuItems.length,
    sortingIndex: category.sortingIndex,
    isFromHq: category.isFromHq,
    items: category.menuItems.map(convertMenuItemToDisplayFormat),
  };
}

/**
 * 將商品列表回應轉換為格式化的顯示格式
 */
export function convertMenuListingToDisplayFormat(
  response: MenuItemListingResponse
): {
  totalCategories: number;
  totalItems: number;
  categories: ReturnType<typeof convertMenuCategoryToDisplayFormat>[];
} {
  const categories = response.restaurant.settings.menu.menuItemCategories;
  const totalItems = categories.reduce(
    (sum, category) => sum + category.menuItems.length,
    0
  );

  return {
    totalCategories: categories.length,
    totalItems,
    categories: categories.map(convertMenuCategoryToDisplayFormat),
  };
}

/**
 * 將用戶輸入轉換為新增商品的 Payload
 */
export function convertToCreateMenuItemPayload(input: {
  name: string;
  price: number;
  type: 'item' | 'combo';
  categoryUuid: UUID;
  enabled?: boolean;
  sortingIndex?: number;
  picture?: string;
  externalId?: string;
  customizedTaxEnabled?: boolean;
  customizedTaxType?: 'PERCENTAGE' | 'FIXED';
  customizedTaxRate?: number;
}): CreateMenuItemPayload {
  return {
    name: input.name.trim(),
    price: input.price,
    type: input.type as MenuItemTypeEnum,
    menuItemCategoryUuid: input.categoryUuid,
    enabled: input.enabled ?? true,
    sortingIndex: input.sortingIndex,
    picture: input.picture,
    externalId: input.externalId,
    customizedTaxEnabled: input.customizedTaxEnabled ?? false,
    customizedTaxType: input.customizedTaxType as CustomizedTaxType,
    customizedTaxRate: input.customizedTaxRate,
  };
}

/**
 * 將用戶輸入轉換為更新商品的 Payload
 */
export function convertToUpdateMenuItemPayload(input: {
  name?: string;
  price?: number;
  type?: 'item' | 'combo';
  categoryUuid?: UUID;
  enabled?: boolean;
  sortingIndex?: number;
  picture?: string;
  externalId?: string;
  customizedTaxEnabled?: boolean;
  customizedTaxType?: 'PERCENTAGE' | 'FIXED';
  customizedTaxRate?: number;
}): UpdateMenuItemPayload {
  const payload: UpdateMenuItemPayload = {};

  if (input.name !== undefined) {
    payload.name = input.name.trim();
  }
  if (input.price !== undefined) {
    payload.price = input.price;
  }
  if (input.type !== undefined) {
    payload.type = input.type as MenuItemTypeEnum;
  }
  if (input.categoryUuid !== undefined) {
    payload.menuItemCategoryUuid = input.categoryUuid;
  }
  if (input.enabled !== undefined) {
    payload.enabled = input.enabled;
  }
  if (input.sortingIndex !== undefined) {
    payload.sortingIndex = input.sortingIndex;
  }
  if (input.picture !== undefined) {
    payload.picture = input.picture;
  }
  if (input.externalId !== undefined) {
    payload.externalId = input.externalId;
  }
  if (input.customizedTaxEnabled !== undefined) {
    payload.customizedTaxEnabled = input.customizedTaxEnabled;
  }
  if (input.customizedTaxType !== undefined) {
    payload.customizedTaxType = input.customizedTaxType as CustomizedTaxType;
  }
  if (input.customizedTaxRate !== undefined) {
    payload.customizedTaxRate = input.customizedTaxRate;
  }

  return payload;
}

/**
 * 將批次操作結果轉換為格式化的顯示格式
 */
export function convertBatchOperationToDisplayFormat(
  result: BatchOperationResult,
  operationType: 'update' | 'delete'
): string {
  const operationName = operationType === 'update' ? '更新' : '刪除';

  let message = `📊 批次${operationName}結果\n\n`;
  message += `✅ 成功處理: ${result.processedCount} 個商品\n`;

  if (result.failedCount > 0) {
    message += `❌ 失敗: ${result.failedCount} 個商品\n\n`;
    message += `失敗詳情:\n`;
    result.errors.forEach((error, index) => {
      message += `${index + 1}. 商品 ${error.uuid}: ${error.error}\n`;
    });
  }

  return message;
}

/**
 * 將商品資料轉換為簡化的摘要格式
 */
export function convertMenuItemToSummary(item: MenuItemType): string {
  const status = item.enabled ? '✅' : '❌';
  const type = item.type === MenuItemTypeEnum.ITEM ? '單品' : '套餐';
  const hqMark = item.isFromHq ? '🏢' : '🏪';
  const incompleteMark = item.isIncomplete ? '⚠️' : '';

  return (
    `${status} **${item.name}** (${type}) ${hqMark}${incompleteMark}\n` +
    `   💰 $${item.price} | 🔢 ${item.uuid} | 📍 排序: ${item.sortingIndex}`
  );
}

/**
 * 將商品分類轉換為簡化的摘要格式
 */
export function convertMenuCategoryToSummary(
  category: MenuItemCategoryType
): string {
  const hqMark = category.isFromHq ? '🏢' : '🏪';

  let summary = `## ${category.name} ${hqMark}\n`;
  summary += `📋 分類 ID: ${category.uuid}\n`;
  summary += `📊 排序: ${category.sortingIndex} | 商品數量: ${category.menuItems.length}\n\n`;

  if (category.menuItems.length > 0) {
    summary += `### 商品列表:\n`;
    category.menuItems.forEach((item, index) => {
      summary += `${index + 1}. ${convertMenuItemToSummary(item)}\n`;
    });
  }

  return summary;
}

/**
 * 將完整的商品列表轉換為摘要格式
 */
export function convertMenuListingToSummary(
  response: MenuItemListingResponse
): string {
  const categories = response.restaurant.settings.menu.menuItemCategories;
  const totalItems = categories.reduce(
    (sum, category) => sum + category.menuItems.length,
    0
  );
  const enabledItems = categories.reduce(
    (sum, category) =>
      sum + category.menuItems.filter(item => item.enabled).length,
    0
  );

  let summary = `# 📋 餐廳菜單摘要\n\n`;
  summary += `📊 **統計資訊**\n`;
  summary += `- 總分類數: ${categories.length}\n`;
  summary += `- 總商品數: ${totalItems}\n`;
  summary += `- 啟用商品: ${enabledItems}\n`;
  summary += `- 停用商品: ${totalItems - enabledItems}\n\n`;

  summary += `---\n\n`;

  categories.forEach((category, index) => {
    summary += convertMenuCategoryToSummary(category);
    if (index < categories.length - 1) {
      summary += `\n---\n\n`;
    }
  });

  return summary;
}

/**
 * 將錯誤資訊轉換為用戶友好的格式
 */
export function convertErrorToUserFriendlyMessage(error: unknown): string {
  if (error instanceof Error) {
    if (
      error.message.includes('GRAPHQL_TOKEN') ||
      error.message.includes('Authentication')
    ) {
      return '🔐 認證失敗，請檢查您的 API Token 是否正確設定';
    }

    if (error.message.includes('GRAPHQL_ENDPOINT')) {
      return '🌐 API 端點設定錯誤，請檢查您的伺服器設定';
    }

    if (error.message.includes('fetch') || error.message.includes('network')) {
      return '📡 網路連線錯誤，請檢查您的網路連線或 API 伺服器狀態';
    }

    if (
      error.message.includes('400') ||
      error.message.includes('Bad Request')
    ) {
      return '📝 請求格式錯誤，請檢查您的輸入資料';
    }

    if (
      error.message.includes('401') ||
      error.message.includes('Unauthorized')
    ) {
      return '🚫 認證失敗，請檢查您的 API Token 是否有效';
    }

    if (error.message.includes('403') || error.message.includes('Forbidden')) {
      return '⛔ 權限不足，請檢查您的 API Token 是否有足夠的權限';
    }

    if (error.message.includes('404') || error.message.includes('Not Found')) {
      return '🔍 找不到指定的資源，請檢查 UUID 是否正確';
    }

    if (
      error.message.includes('500') ||
      error.message.includes('Internal Server Error')
    ) {
      return '🛠️ 伺服器內部錯誤，請稍後再試或聯絡技術支援';
    }

    return `❌ 操作失敗: ${error.message}`;
  }

  return '❌ 發生未知錯誤，請稍後再試';
}
