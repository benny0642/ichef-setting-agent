/**
 * 類型驗證工具函數
 */

import {
  ComboMenuItemSortingType,
  CreateMenuItemPayload,
  CustomizedTaxType,
  MenuItemListingResponse,
  MenuItemTypeEnum,
  MenuItemValidationResult,
  OnlineRestaurantMenuCategory,
  OnlineRestaurantMenuItem,
  OnlineRestaurantMenuItemAssociation,
  UpdateMenuItemPayload,
  UUID,
} from './menuTypes.js';

/**
 * 驗證 UUID 格式
 */
export function isValidUUID(uuid: unknown): uuid is UUID {
  return typeof uuid === 'string' && uuid.length > 0;
}

/**
 * 驗證商品類型枚舉
 */
export function isValidMenuItemType(type: unknown): type is MenuItemTypeEnum {
  return (
    typeof type === 'string' &&
    Object.values(MenuItemTypeEnum).includes(type as MenuItemTypeEnum)
  );
}

/**
 * 驗證稅務類型枚舉
 */
export function isValidCustomizedTaxType(
  type: unknown
): type is CustomizedTaxType {
  return (
    typeof type === 'string' &&
    Object.values(CustomizedTaxType).includes(type as CustomizedTaxType)
  );
}

/**
 * 驗證商品基本資訊
 */
export function validateMenuItemType(item: unknown): MenuItemValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!item || typeof item !== 'object') {
    errors.push('商品資料必須是物件');
    return { isValid: false, errors, warnings };
  }

  const menuItem = item as Record<string, unknown>;

  // 必填欄位驗證
  if (!isValidUUID(menuItem.uuid)) {
    errors.push('商品 UUID 格式無效');
  }

  if (!menuItem.name || typeof menuItem.name !== 'string') {
    errors.push('商品名稱是必填欄位且必須是字串');
  }

  if (typeof menuItem.price !== 'number' || menuItem.price < 0) {
    errors.push('商品價格必須是非負數');
  }

  if (!isValidMenuItemType(menuItem.type)) {
    errors.push('商品類型必須是有效的枚舉值');
  }

  if (!isValidUUID(menuItem.menuItemCategoryUuid)) {
    errors.push('商品分類 UUID 格式無效');
  }

  if (typeof menuItem.enabled !== 'boolean') {
    errors.push('商品啟用狀態必須是布林值');
  }

  if (typeof menuItem.isIncomplete !== 'boolean') {
    errors.push('商品完整性狀態必須是布林值');
  }

  if (typeof menuItem.isFromHq !== 'boolean') {
    errors.push('總部商品標記必須是布林值');
  }

  // 可選欄位驗證
  if (
    menuItem.sortingIndex !== undefined &&
    typeof menuItem.sortingIndex !== 'number'
  ) {
    errors.push('排序索引必須是數字');
  }

  if (menuItem.picture !== undefined && typeof menuItem.picture !== 'string') {
    errors.push('商品圖片必須是字串');
  }

  if (
    menuItem.customizedTaxEnabled !== undefined &&
    typeof menuItem.customizedTaxEnabled !== 'boolean'
  ) {
    errors.push('自訂稅務啟用狀態必須是布林值');
  }

  if (
    menuItem.customizedTaxType !== undefined &&
    !isValidCustomizedTaxType(menuItem.customizedTaxType)
  ) {
    errors.push('自訂稅務類型必須是有效的枚舉值');
  }

  if (
    menuItem.customizedTaxRate !== undefined &&
    typeof menuItem.customizedTaxRate !== 'number'
  ) {
    errors.push('自訂稅率必須是數字');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * 驗證商品分類資訊
 */
export function validateMenuItemCategoryType(
  category: unknown
): MenuItemValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!category || typeof category !== 'object') {
    errors.push('商品分類資料必須是物件');
    return { isValid: false, errors, warnings };
  }

  const menuCategory = category as Record<string, unknown>;

  // 必填欄位驗證
  if (!isValidUUID(menuCategory.uuid)) {
    errors.push('分類 UUID 格式無效');
  }

  if (!menuCategory.name || typeof menuCategory.name !== 'string') {
    errors.push('分類名稱是必填欄位且必須是字串');
  }

  if (typeof menuCategory.sortingIndex !== 'number') {
    errors.push('排序索引必須是數字');
  }

  if (typeof menuCategory.isFromHq !== 'boolean') {
    errors.push('總部分類標記必須是布林值');
  }

  // 驗證商品列表
  if (menuCategory.menuItems && Array.isArray(menuCategory.menuItems)) {
    menuCategory.menuItems.forEach((item, index) => {
      const itemValidation = validateMenuItemType(item);
      if (!itemValidation.isValid) {
        errors.push(
          `分類中第 ${index + 1} 個商品驗證失敗: ${itemValidation.errors.join(', ')}`
        );
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * 驗證商品列表查詢回應
 */
export function validateMenuItemListingResponse(
  response: unknown
): MenuItemValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!response || typeof response !== 'object') {
    errors.push('回應資料必須是物件');
    return { isValid: false, errors, warnings };
  }

  const responseObj = response as Record<string, unknown>;

  // 驗證回應結構
  if (!responseObj.restaurant || typeof responseObj.restaurant !== 'object') {
    errors.push('回應缺少 restaurant 欄位');
    return { isValid: false, errors, warnings };
  }

  const restaurant = responseObj.restaurant as Record<string, unknown>;
  if (!restaurant.settings || typeof restaurant.settings !== 'object') {
    errors.push('回應缺少 restaurant.settings 欄位');
    return { isValid: false, errors, warnings };
  }

  const settings = restaurant.settings as Record<string, unknown>;
  if (!settings.menu || typeof settings.menu !== 'object') {
    errors.push('回應缺少 restaurant.settings.menu 欄位');
    return { isValid: false, errors, warnings };
  }

  const menu = settings.menu as Record<string, unknown>;
  if (!Array.isArray(menu.menuItemCategories)) {
    errors.push('menuItemCategories 必須是陣列');
    return { isValid: false, errors, warnings };
  }

  // 驗證每個分類
  menu.menuItemCategories.forEach((category, index) => {
    const categoryValidation = validateMenuItemCategoryType(category);
    if (!categoryValidation.isValid) {
      errors.push(
        `第 ${index + 1} 個分類驗證失敗: ${categoryValidation.errors.join(', ')}`
      );
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * 驗證新增商品的 Payload
 */
export function validateCreateMenuItemPayload(
  payload: unknown
): MenuItemValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!payload || typeof payload !== 'object') {
    errors.push('Payload 必須是物件');
    return { isValid: false, errors, warnings };
  }

  const createPayload = payload as Record<string, unknown>;

  // 必填欄位驗證
  if (!createPayload.name || typeof createPayload.name !== 'string') {
    errors.push('商品名稱是必填欄位且必須是字串');
  }

  if (typeof createPayload.price !== 'number' || createPayload.price < 0) {
    errors.push('商品價格必須是非負數');
  }

  if (!isValidMenuItemType(createPayload.type)) {
    errors.push('商品類型必須是有效的枚舉值');
  }

  if (!isValidUUID(createPayload.menuItemCategoryUuid)) {
    errors.push('商品分類 UUID 格式無效');
  }

  // 可選欄位驗證
  if (
    createPayload.enabled !== undefined &&
    typeof createPayload.enabled !== 'boolean'
  ) {
    errors.push('商品啟用狀態必須是布林值');
  }

  if (
    createPayload.sortingIndex !== undefined &&
    typeof createPayload.sortingIndex !== 'number'
  ) {
    errors.push('排序索引必須是數字');
  }

  if (
    createPayload.picture !== undefined &&
    typeof createPayload.picture !== 'string'
  ) {
    errors.push('商品圖片必須是字串');
  }

  if (
    createPayload.customizedTaxEnabled !== undefined &&
    typeof createPayload.customizedTaxEnabled !== 'boolean'
  ) {
    errors.push('自訂稅務啟用狀態必須是布林值');
  }

  if (
    createPayload.customizedTaxType !== undefined &&
    !isValidCustomizedTaxType(createPayload.customizedTaxType)
  ) {
    errors.push('自訂稅務類型必須是有效的枚舉值');
  }

  if (
    createPayload.customizedTaxRate !== undefined &&
    typeof createPayload.customizedTaxRate !== 'number'
  ) {
    errors.push('自訂稅率必須是數字');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * 驗證套餐商品輸入
 */
export function validateComboMenuItemInput(
  comboMenuItem: unknown
): MenuItemValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!comboMenuItem || typeof comboMenuItem !== 'object') {
    errors.push('套餐商品資料必須是物件');
    return { isValid: false, errors, warnings };
  }

  const item = comboMenuItem as Record<string, unknown>;

  // 驗證 menuItemUuid（必填）
  if (!item.menuItemUuid || !isValidUUID(item.menuItemUuid)) {
    errors.push('套餐商品的 menuItemUuid 必須是有效的 UUID');
  }

  // 驗證 uuid（選填，更新時使用）
  if (item.uuid !== undefined && !isValidUUID(item.uuid)) {
    errors.push('套餐商品的 uuid 必須是有效的 UUID');
  }

  // 驗證 price（選填）
  if (item.price !== undefined) {
    if (typeof item.price !== 'string') {
      errors.push('套餐商品的加價必須是字串格式');
    } else {
      const priceNum = parseFloat(item.price);
      if (isNaN(priceNum) || priceNum < 0) {
        errors.push('套餐商品的加價必須是非負數');
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * 驗證套餐分類輸入
 */
export function validateComboItemCategoryInput(
  category: unknown
): MenuItemValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!category || typeof category !== 'object') {
    errors.push('套餐分類資料必須是物件');
    return { isValid: false, errors, warnings };
  }

  const cat = category as Record<string, unknown>;

  // 驗證 name（必填）
  if (!cat.name || typeof cat.name !== 'string') {
    errors.push('套餐分類名稱必須是非空字串');
  } else if (cat.name.trim().length === 0) {
    errors.push('套餐分類名稱不能為空');
  } else if (cat.name.length > 255) {
    errors.push('套餐分類名稱不能超過 255 個字元');
  }

  // 驗證 uuid（選填，更新時使用）
  if (cat.uuid !== undefined && !isValidUUID(cat.uuid)) {
    errors.push('套餐分類的 uuid 必須是有效的 UUID');
  }

  // 驗證 allowRepeatableSelection（必填）
  if (typeof cat.allowRepeatableSelection !== 'boolean') {
    errors.push('allowRepeatableSelection 必須是布林值');
  }

  // 驗證 minimumSelection（必填）
  if (typeof cat.minimumSelection !== 'number' || cat.minimumSelection < 0) {
    errors.push('minimumSelection 必須是非負整數');
  }

  // 驗證 maximumSelection（必填）
  if (typeof cat.maximumSelection !== 'number' || cat.maximumSelection < 0) {
    errors.push('maximumSelection 必須是非負整數');
  }

  // 驗證選擇範圍邏輯
  if (
    typeof cat.minimumSelection === 'number' &&
    typeof cat.maximumSelection === 'number' &&
    cat.minimumSelection > cat.maximumSelection
  ) {
    errors.push('minimumSelection 不能大於 maximumSelection');
  }

  // 驗證 comboMenuItemSortingType（選填）
  if (
    cat.comboMenuItemSortingType !== undefined &&
    typeof cat.comboMenuItemSortingType === 'string' &&
    !Object.values(ComboMenuItemSortingType).includes(
      cat.comboMenuItemSortingType as ComboMenuItemSortingType
    )
  ) {
    errors.push('comboMenuItemSortingType 必須是有效的排序類型');
  }

  // 驗證 comboMenuItems（選填陣列）
  if (cat.comboMenuItems !== undefined) {
    if (!Array.isArray(cat.comboMenuItems)) {
      errors.push('comboMenuItems 必須是陣列');
    } else {
      cat.comboMenuItems.forEach((item, index) => {
        const itemValidation = validateComboMenuItemInput(item);
        if (!itemValidation.isValid) {
          errors.push(
            ...itemValidation.errors.map(
              error => `第 ${index + 1} 個套餐商品: ${error}`
            )
          );
        }
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * 驗證更新商品的 Payload
 */
export function validateUpdateMenuItemPayload(
  payload: unknown
): MenuItemValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!payload || typeof payload !== 'object') {
    errors.push('Payload 必須是物件');
    return { isValid: false, errors, warnings };
  }

  const updatePayload = payload as Record<string, unknown>;

  // 檢查至少有一個欄位要更新
  const hasUpdateField = Object.keys(updatePayload).some(
    key => updatePayload[key] !== undefined
  );
  if (!hasUpdateField) {
    warnings.push('更新 Payload 沒有包含任何要更新的欄位');
  }

  // 可選欄位驗證（更新時所有欄位都是可選的）
  if (
    updatePayload.name !== undefined &&
    typeof updatePayload.name !== 'string'
  ) {
    errors.push('商品名稱必須是字串');
  }

  if (
    updatePayload.price !== undefined &&
    (typeof updatePayload.price !== 'number' || updatePayload.price < 0)
  ) {
    errors.push('商品價格必須是非負數');
  }

  if (
    updatePayload.type !== undefined &&
    !isValidMenuItemType(updatePayload.type)
  ) {
    errors.push('商品類型必須是有效的枚舉值');
  }

  if (
    updatePayload.menuItemCategoryUuid !== undefined &&
    !isValidUUID(updatePayload.menuItemCategoryUuid)
  ) {
    errors.push('商品分類 UUID 格式無效');
  }

  if (
    updatePayload.enabled !== undefined &&
    typeof updatePayload.enabled !== 'boolean'
  ) {
    errors.push('商品啟用狀態必須是布林值');
  }

  if (
    updatePayload.sortingIndex !== undefined &&
    typeof updatePayload.sortingIndex !== 'number'
  ) {
    errors.push('排序索引必須是數字');
  }

  if (
    updatePayload.picture !== undefined &&
    typeof updatePayload.picture !== 'string'
  ) {
    errors.push('商品圖片必須是字串');
  }

  if (
    updatePayload.customizedTaxEnabled !== undefined &&
    typeof updatePayload.customizedTaxEnabled !== 'boolean'
  ) {
    errors.push('自訂稅務啟用狀態必須是布林值');
  }

  if (
    updatePayload.customizedTaxType !== undefined &&
    !isValidCustomizedTaxType(updatePayload.customizedTaxType)
  ) {
    errors.push('自訂稅務類型必須是有效的枚舉值');
  }

  if (
    updatePayload.customizedTaxRate !== undefined &&
    typeof updatePayload.customizedTaxRate !== 'number'
  ) {
    errors.push('自訂稅率必須是數字');
  }

  // 驗證 comboItemCategories（選填陣列）
  if (updatePayload.comboItemCategories !== undefined) {
    if (!Array.isArray(updatePayload.comboItemCategories)) {
      errors.push('comboItemCategories 必須是陣列');
    } else {
      updatePayload.comboItemCategories.forEach((category, index) => {
        const categoryValidation = validateComboItemCategoryInput(category);
        if (!categoryValidation.isValid) {
          errors.push(
            ...categoryValidation.errors.map(
              error => `第 ${index + 1} 個套餐分類: ${error}`
            )
          );
        }
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * 類型守衛函數
 */
export function isMenuItemListingResponse(
  response: unknown
): response is MenuItemListingResponse {
  const validation = validateMenuItemListingResponse(response);
  return validation.isValid;
}

export function isCreateMenuItemPayload(
  payload: unknown
): payload is CreateMenuItemPayload {
  const validation = validateCreateMenuItemPayload(payload);
  return validation.isValid;
}

export function isUpdateMenuItemPayload(
  payload: unknown
): payload is UpdateMenuItemPayload {
  const validation = validateUpdateMenuItemPayload(payload);
  return validation.isValid;
}

/**
 * 驗證線上餐廳菜單項目
 */
export function validateOnlineRestaurantMenuItem(
  item: unknown
): MenuItemValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!item || typeof item !== 'object') {
    errors.push('線上餐廳菜單項目資料必須是物件');
    return { isValid: false, errors, warnings };
  }

  const menuItem = item as Record<string, unknown>;

  // 必填欄位驗證
  if (!isValidUUID(menuItem.uuid)) {
    errors.push('線上餐廳菜單項目 UUID 格式無效');
  }

  if (!isValidUUID(menuItem.ichefUuid)) {
    errors.push('iChef UUID 格式無效');
  }

  if (!menuItem.originalName || typeof menuItem.originalName !== 'string') {
    errors.push('原始名稱是必填欄位且必須是字串');
  }

  if (
    typeof menuItem.originalPrice !== 'number' ||
    menuItem.originalPrice < 0
  ) {
    errors.push('原始價格必須是非負數');
  }

  if (!menuItem.menuItemType || typeof menuItem.menuItemType !== 'string') {
    errors.push('菜單項目類型是必填欄位且必須是字串');
  }

  if (typeof menuItem.sortingIndex !== 'number') {
    errors.push('排序索引必須是數字');
  }

  // 可選欄位驗證
  if (
    menuItem.customizedName !== undefined &&
    typeof menuItem.customizedName !== 'string'
  ) {
    errors.push('自訂名稱必須是字串');
  }

  if (
    menuItem.pictureFilename !== undefined &&
    typeof menuItem.pictureFilename !== 'string'
  ) {
    errors.push('圖片檔名必須是字串');
  }

  // 驗證巢狀物件
  if (menuItem.category && typeof menuItem.category === 'object') {
    const category = menuItem.category as Record<string, unknown>;
    if (!isValidUUID(category.uuid)) {
      errors.push('分類 UUID 格式無效');
    }
    if (typeof category.sortingIndex !== 'number') {
      errors.push('分類排序索引必須是數字');
    }
  } else {
    errors.push('分類資訊是必填欄位且必須是物件');
  }

  if (menuItem.menuItem && typeof menuItem.menuItem === 'object') {
    const menuItemInfo = menuItem.menuItem as Record<string, unknown>;
    if (typeof menuItemInfo.isFromHq !== 'boolean') {
      errors.push('總部商品標記必須是布林值');
    }
  } else {
    errors.push('菜單項目資訊是必填欄位且必須是物件');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * 驗證線上餐廳菜單分類
 */
export function validateOnlineRestaurantMenuCategory(
  category: unknown
): MenuItemValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!category || typeof category !== 'object') {
    errors.push('線上餐廳菜單分類資料必須是物件');
    return { isValid: false, errors, warnings };
  }

  const menuCategory = category as Record<string, unknown>;

  // 必填欄位驗證
  if (!isValidUUID(menuCategory.uuid)) {
    errors.push('分類 UUID 格式無效');
  }

  if (!menuCategory.name || typeof menuCategory.name !== 'string') {
    errors.push('分類名稱是必填欄位且必須是字串');
  }

  if (typeof menuCategory.sortingIndex !== 'number') {
    errors.push('排序索引必須是數字');
  }

  // 驗證菜單項目列表
  if (menuCategory.menuItems && Array.isArray(menuCategory.menuItems)) {
    menuCategory.menuItems.forEach((item, index) => {
      const itemValidation = validateOnlineRestaurantMenuItem(item);
      if (!itemValidation.isValid) {
        errors.push(
          `分類中第 ${index + 1} 個菜單項目驗證失敗: ${itemValidation.errors.join(', ')}`
        );
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * 類型守衛函數
 */
export function isOnlineRestaurantMenuItem(
  item: unknown
): item is OnlineRestaurantMenuItem {
  const validation = validateOnlineRestaurantMenuItem(item);
  return validation.isValid;
}

export function isOnlineRestaurantMenuCategory(
  category: unknown
): category is OnlineRestaurantMenuCategory {
  const validation = validateOnlineRestaurantMenuCategory(category);
  return validation.isValid;
}
