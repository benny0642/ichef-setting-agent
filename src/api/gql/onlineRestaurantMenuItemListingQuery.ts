import { gql } from 'graphql-request';

/**
 * 查詢外送平台完整菜單結構的 GraphQL Query
 */
export const ONLINE_RESTAURANT_MENU_ITEM_LISTING_QUERY = gql`
  query onlineRestaurantMenuItemListingQuery {
    restaurant {
      settings {
        menu {
          integration {
            onlineRestaurant {
              categories {
                ...onlineRestaurantMenuItemCategoryListingFragment
                menuItems {
                  ...onlineRestaurantMenuItemItemListingFragment
                }
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
      __typename
    }
  }

  fragment onlineRestaurantMenuItemCategoryListingFragment on OnlineRestaurantMenuCategoryOutput {
    _id: uuid
    uuid
    name
    sortingIndex
    __typename
  }

  fragment onlineRestaurantMenuItemItemListingFragment on OnlineRestaurantMenuItemOutput {
    _id: uuid
    uuid
    ichefUuid
    originalName
    customizedName
    originalPrice
    menuItemType
    pictureFilename
    sortingIndex
    category {
      uuid
      sortingIndex
      __typename
    }
    menuItem {
      isFromHq
      __typename
    }
    __typename
  }
`;
