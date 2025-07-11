// GraphQL 回應的類型定義
export interface MenuItemCategoryType {
  _id: string;
  uuid: string;
  name: string;
  sortingIndex: number;
  isFromHq: boolean;
  menuItems: MenuItemType[];
  __typename: string;
}

export interface MenuItemType {
  _id: string;
  uuid: string;
  name: string;
  price: number;
  type: string;
  sortingIndex: number;
  enabled: boolean;
  isIncomplete: boolean;
  menuItemCategoryUuid: string;
  isFromHq: boolean;
  picture?: string;
  comboItemCategoryUuidsMappedWithOnlineOrdering: {
    ubereats: string;
    __typename: string;
  };
  onlineRestaurantMenuItem: {
    uuid: string;
    __typename: string;
  };
  __typename: string;
}

export interface MenuItemListingResponse {
  restaurant: {
    settings: {
      menu: {
        menuItemCategories: MenuItemCategoryType[];
        __typename: string;
      };
      __typename: string;
    };
    __typename: string;
  };
}
