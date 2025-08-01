/**
 * GraphQL 查詢和 Mutation 統一匯出
 */

// 查詢 (Queries)
export { COMBO_DEPENDENCY_CHECK_QUERY } from './comboDependencyCheckQuery.js';
export { MENU_ITEM_LISTING_QUERY } from './menuItemListingQuery.js';
export { MENU_ITEM_QUERY } from './menuItemQuery.js';
export { MENU_ITEM_TAG_LISTING_QUERY } from './menuItemTagListingQuery.js';
export { ONLINE_RESTAURANT_MENU_ITEM_LISTING_QUERY } from './onlineRestaurantMenuItemListingQuery.js';

// 變更 (Mutations)
export { MENU_ITEM_CREATE_MUTATION } from './createMenuItemMutation.js';
export { MENU_ITEM_CATEGORY_CREATE_MUTATION } from './createMenuItemCategoryMutation.js';
export { DELETE_MENU_ITEM_MUTATION } from './deleteMenuItemMutation.js';
export { ONLINE_RESTAURANT_MENU_ITEM_BATCH_DELETE_MUTATION } from './onlineRestaurantMenuItemBatchDeleteMutation.js';
export { ONLINE_RESTAURANT_MENU_ITEM_IMPORT_MUTATION } from './onlineRestaurantMenuItemImportMutation.js';
export { MENU_ITEM_UPDATE_MUTATION } from './updateMenuItemMutation.js';

// 匯入所有定義用於物件分類
import { COMBO_DEPENDENCY_CHECK_QUERY } from './comboDependencyCheckQuery.js';
import { MENU_ITEM_CREATE_MUTATION } from './createMenuItemMutation.js';
import { MENU_ITEM_CATEGORY_CREATE_MUTATION } from './createMenuItemCategoryMutation.js';
import { DELETE_MENU_ITEM_MUTATION } from './deleteMenuItemMutation.js';
import { MENU_ITEM_LISTING_QUERY } from './menuItemListingQuery.js';
import { MENU_ITEM_QUERY } from './menuItemQuery.js';
import { MENU_ITEM_TAG_LISTING_QUERY } from './menuItemTagListingQuery.js';
import { ONLINE_RESTAURANT_MENU_ITEM_BATCH_DELETE_MUTATION } from './onlineRestaurantMenuItemBatchDeleteMutation.js';
import { ONLINE_RESTAURANT_MENU_ITEM_IMPORT_MUTATION } from './onlineRestaurantMenuItemImportMutation.js';
import { ONLINE_RESTAURANT_MENU_ITEM_LISTING_QUERY } from './onlineRestaurantMenuItemListingQuery.js';
import { MENU_ITEM_UPDATE_MUTATION } from './updateMenuItemMutation.js';

/**
 * GraphQL 操作類型分類
 */
export const GraphQLOperations = {
  // 查詢操作
  queries: {
    MENU_ITEM_LISTING_QUERY,
    MENU_ITEM_QUERY,
    MENU_ITEM_TAG_LISTING_QUERY,
    ONLINE_RESTAURANT_MENU_ITEM_LISTING_QUERY,
    COMBO_DEPENDENCY_CHECK_QUERY,
  },

  // 變更操作
  mutations: {
    // 商品 CRUD
    MENU_ITEM_CREATE_MUTATION,
    MENU_ITEM_UPDATE_MUTATION,
    DELETE_MENU_ITEM_MUTATION,
    // 分類 CRUD
    MENU_ITEM_CATEGORY_CREATE_MUTATION,
    ONLINE_RESTAURANT_MENU_ITEM_BATCH_DELETE_MUTATION,
    // 商品匯入
    ONLINE_RESTAURANT_MENU_ITEM_IMPORT_MUTATION,
  },
} as const;

/**
 * 操作類型枚舉
 */
export enum GraphQLOperationType {
  QUERY = 'query',
  MUTATION = 'mutation',
  SUBSCRIPTION = 'subscription',
}

/**
 * 商品操作類型
 */
export enum MenuItemOperationType {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  BATCH_UPDATE = 'batch_update',
  BATCH_DELETE = 'batch_delete',
}
