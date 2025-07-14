// GraphQL 查詢語句
export const MENU_ITEM_LISTING_QUERY = `
  query menuItemListingQuery {
    restaurant {
      settings {
        menu {
          menuItemCategories {
            ...menuItemCategoryBasicFields
            menuItems {
              ...menuItemitemBasicFields
              __typename
            }
            __typename
          }
          __typename
        }
        __typename
      }
      __typename
    }
  }

  fragment menuItemCategoryBasicFields on MenuItemCategoryType {
    _id: uuid
    uuid
    name
    sortingIndex
    isFromHq
    __typename
  }

  fragment menuItemitemBasicFields on MenuItemType {
    _id: uuid
    uuid
    name
    price
    type
    sortingIndex
    enabled
    isIncomplete
    menuItemCategoryUuid
    isFromHq
    picture
    comboItemCategoryUuidsMappedWithOnlineOrdering {
      ubereats
      __typename
    }
    onlineRestaurantMenuItem {
      uuid
      __typename
    }
    __typename
  }
`;
