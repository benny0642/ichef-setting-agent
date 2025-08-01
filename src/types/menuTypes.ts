/**
 * iChef API 回應的類型定義
 */

// 基本類型定義
export type UUID = string;

// 商品類型枚舉
export enum MenuItemTypeEnum {
  ITEM = 'ITEM',
  COMBO_ITEM = 'COMBO_ITEM',
}

// 自訂稅務類型枚舉
export enum CustomizedTaxType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED',
}

// 套餐商品排序類型枚舉
export enum ComboMenuItemSortingType {
  MANUAL = 'MANUAL',
  ALPHABETICAL = 'ALPHABETICAL',
}

// 商品註記相關類型
export interface SubTagInItemPayload {
  enabled: boolean;
  subTagUuid: UUID;
}

export interface ItemTagRelationshipPayload {
  followingSeparatorCount?: number;
  menuItemTagUuid?: UUID;
  subTagList?: SubTagInItemPayload[];
  tagGroupUuid?: UUID;
}

export interface SubTagInItemEnabledInformation {
  subTagInItemEnabled?: boolean;
  __typename?: string;
}

export interface SubTagInItemType {
  computedEnabled?: boolean;
  enabledInformation?: SubTagInItemEnabledInformation;
  menuItemTagName?: string;
  menuItemTagUuid?: string;
  subTagUuid?: string;
  __typename?: string;
}

export interface MenuItemTagInItemType {
  __typename: 'MenuItemTagInItemType';
  menuItemTagUuid?: string;
}

export interface TagGroupInItemType {
  __typename: 'TagGroupInItemType';
  tagGroupUuid?: string;
  subTagInItems?: SubTagInItemType[];
}

export interface ItemTagRelationshipType {
  customSortingIndex?: number;
  defaultSortingIndex?: number;
  followingSeparatorCount?: number;
  menuItemTagUuid?: string;
  menuItemUuid?: string;
  tagLikeObject?: MenuItemTagInItemType | TagGroupInItemType;
  __typename?: string;
}

// 線上餐廳商品介面
export interface OnlineRestaurantMenuItem {
  uuid: UUID;
  visible?: boolean;
  __typename?: string;
}

// 原始圖片介面
export interface OriginalPicture {
  uuid: UUID;
  pictureFilename: string;
  __typename?: string;
}

// 套餐商品介面
export interface ComboMenuItem {
  uuid: UUID;
  name: string;
  price: number;
  menuItemUuid: UUID;
  onlineRestaurantMenuItem?: OnlineRestaurantMenuItem;
  instoreOrderingMenuItem?: OnlineRestaurantMenuItem;
  ubereatsV2MenuItem?: OnlineRestaurantMenuItem;
  __typename?: string;
}

// 套餐商品分類類型
export interface ComboItemCategoryType {
  _id: UUID;
  uuid: UUID;
  name: string;
  comboMenuItems: ComboMenuItem[];
  comboMenuItemUuidsMappedWithOnlineOrdering: {
    ubereats: string;
  };
  comboMenuItemSortingType: ComboMenuItemSortingType;
  allowRepeatableSelection?: boolean;
  minimumSelection?: number;
  maximumSelection?: number;
  __typename?: string;
}

// 商品分類類型
export interface MenuItemCategoryType {
  _id: UUID;
  uuid: UUID;
  name: string;
  sortingIndex: number;
  isFromHq: boolean;
  menuItems: MenuItemType[];
  __typename?: string;
}

// 商品類型
export interface MenuItemType {
  _id: UUID;
  uuid: UUID;
  name: string;
  price: number;
  type: MenuItemTypeEnum;
  sortingIndex: number;
  enabled: boolean;
  isIncomplete: boolean;
  menuItemCategoryUuid: UUID;
  isFromHq: boolean;
  picture?: string;
  croppedInfo?: string;
  originalPicture?: OriginalPicture;
  externalId?: string;
  comboItemCategories?: ComboItemCategoryType[];
  customizedTaxEnabled?: boolean;
  customizedTaxType?: CustomizedTaxType;
  customizedTaxRate?: number;
  comboItemCategoryUuidsMappedWithOnlineOrdering: {
    ubereats: string;
  };
  onlineRestaurantMenuItem?: OnlineRestaurantMenuItem;
  grabfoodMenuItem?: OnlineRestaurantMenuItem;
  ubereatsMenuItem?: OnlineRestaurantMenuItem;
  ubereatsV2MenuItem?: OnlineRestaurantMenuItem;
  foodpandaMenuItem?: OnlineRestaurantMenuItem;
  itemTagRelationshipList?: ItemTagRelationshipType[];
  __typename?: string;
}

// 商品列表查詢回應
export interface MenuItemListingResponse {
  restaurant: {
    settings: {
      menu: {
        menuItemCategories: MenuItemCategoryType[];
        __typename?: string;
      };
      __typename?: string;
    };
    __typename?: string;
  };
}

// 單一商品查詢回應
export interface MenuItemQueryResponse {
  restaurant: {
    settings: {
      menu: {
        menuItem: MenuItemType;
        __typename?: string;
      };
      __typename?: string;
    };
    __typename?: string;
  };
}

// 商品新增回應
export interface MenuItemCreateResponse {
  restaurant: {
    settings: {
      menu: {
        createMenuItem: {
          uuid: UUID;
          __typename?: string;
        };
        __typename?: string;
      };
      __typename?: string;
    };
    __typename?: string;
  };
}

// 商品更新回應
export interface MenuItemUpdateResponse {
  restaurant: {
    settings: {
      menu: {
        updateMenuItem: {
          uuid: UUID;
          __typename?: string;
        };
        __typename?: string;
      };
      __typename?: string;
    };
    __typename?: string;
  };
}

// 商品刪除回應
export interface MenuItemDeleteResponse {
  restaurant: {
    settings: {
      menu: {
        deleteMenuItem: {
          uuid: UUID;
          __typename?: string;
        };
        __typename?: string;
      };
      __typename?: string;
    };
    __typename?: string;
  };
}

// 新增商品 Payload
export interface CreateMenuItemPayload {
  name: string;
  price: number;
  type: MenuItemTypeEnum;
  menuItemCategoryUuid: UUID;
  enabled?: boolean;
  sortingIndex?: number;
  picture?: string;
  externalId?: string;
  customizedTaxEnabled?: boolean;
  customizedTaxType?: CustomizedTaxType;
  customizedTaxRate?: number;
  itemTagRelationshipList?: ItemTagRelationshipPayload[];
}

// 套餐商品輸入介面
export interface ComboMenuItemInput {
  uuid?: UUID; // 用於更新現有子商品
  menuItemUuid: UUID; // 關聯的單品商品 UUID
  price?: string; // 加價金額（字串格式）
}

// 套餐分類輸入介面
export interface ComboItemCategoryInput {
  uuid?: UUID; // 用於更新現有分類
  name: string;
  allowRepeatableSelection: boolean;
  minimumSelection: number;
  maximumSelection: number;
  comboMenuItemSortingType?: ComboMenuItemSortingType;
  comboMenuItems?: ComboMenuItemInput[];
}

// 更新商品 Payload
export interface UpdateMenuItemPayload {
  name?: string;
  price?: number;
  type?: MenuItemTypeEnum;
  menuItemCategoryUuid?: UUID;
  enabled?: boolean;
  sortingIndex?: number;
  picture?: string;
  externalId?: string;
  customizedTaxEnabled?: boolean;
  customizedTaxType?: CustomizedTaxType;
  customizedTaxRate?: number;
  itemTagRelationshipList?: ItemTagRelationshipPayload[];
  comboItemCategories?: ComboItemCategoryInput[];
}

// 認證 Token
export interface AuthToken {
  token: string;
  expiresAt?: Date;
  refreshToken?: string;
  tokenType: 'Bearer' | 'token';
}

// 認證驗證結果
export interface AuthValidationResult {
  isValid: boolean;
  isExpired: boolean;
  expiresIn?: number;
  error?: string;
}

// 認證錯誤
export interface AuthError {
  code: 'INVALID_TOKEN' | 'EXPIRED_TOKEN' | 'MISSING_TOKEN' | 'UNAUTHORIZED';
  message: string;
  details?: unknown;
}

// 批次操作結果
export interface BatchOperationResult {
  success: boolean;
  processedCount: number;
  failedCount: number;
  errors: Array<{
    uuid: UUID;
    error: string;
  }>;
}

// 商品驗證結果
export interface MenuItemValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// 商品操作上下文
export interface MenuItemOperationContext {
  operationType: 'create' | 'update' | 'delete' | 'query';
  menuItemUuid?: UUID;
  categoryUuid?: UUID;
  payload?: CreateMenuItemPayload | UpdateMenuItemPayload;
}

// 停售商品相關類型
export interface UpdateSoldOutItemInput {
  uuid: UUID;
  isSoldOut: boolean;
}

export interface SoldOutMenuItem {
  uuid: UUID;
  isSoldOut: boolean;
  __typename?: string;
}

export interface UpdateSoldOutMenuItemResponse {
  restaurant: {
    settings: {
      menu: {
        updateSoldOutItems: {
          updatedSoldOutMenuItems: SoldOutMenuItem[];
          __typename?: string;
        };
        __typename?: string;
      };
      __typename?: string;
    };
    __typename?: string;
  };
}

// 商品註記查詢相關類型
export interface MenuItemTagType {
  uuid: UUID;
  name: string;
  type: string;
  enabled: boolean;
  price: number;
  sortingIndex: number;
  __typename?: string;
}

export interface TagGroupType {
  uuid: UUID;
  name: string;
  enabled: boolean;
  sortingIndex: number;
  subTags: MenuItemTagType[];
  __typename?: string;
}

// 註記查詢回應類型
export interface MenuItemTagListingResponse {
  restaurant: {
    settings: {
      menu: {
        menuItemTags: MenuItemTagType[];
        tagGroups: TagGroupType[];
        __typename?: string;
      };
      __typename?: string;
    };
    __typename?: string;
  };
}
