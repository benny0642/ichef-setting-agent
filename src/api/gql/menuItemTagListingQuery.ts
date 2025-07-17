import { gql } from 'graphql-request';

/**
 * 查詢所有商品註記和註記群組的 GraphQL Query
 */
export const MENU_ITEM_TAG_LISTING_QUERY = gql`
  query menuItemTagListingQuery {
    restaurant {
      settings {
        menu {
          menuItemTags {
            ...menuItemTagBasicFields
            __typename
          }
          tagGroups {
            ...tagGroupBasicFields
            __typename
          }
          __typename
        }
        __typename
      }
      __typename
    }
  }

  fragment menuItemTagBasicFields on MenuItemTagType {
    uuid
    name
    type
    enabled
    price
    sortingIndex
    __typename
  }

  fragment tagGroupBasicFields on TagGroupType {
    uuid
    name
    enabled
    sortingIndex
    subTags {
      subTagUuid
      menuItemTagUuid
      computedEnabled
      enabledInformation {
        menuItemTagEnabled
        tagGroupEnabled
        subTagEnabled
      }
      __typename
    }
    __typename
  }
`;
