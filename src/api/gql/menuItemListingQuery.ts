import { gql } from 'graphql-request';

/**
 * 查詢所有商品列表的 GraphQL Query
 */
export const MENU_ITEM_LISTING_QUERY = gql`
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
