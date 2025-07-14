import { gql } from 'graphql-request';

/**
 * 查詢單一商品詳細資訊的 GraphQL Query
 */
export const MENU_ITEM_QUERY = gql`
  query menuItemItemRecordQuery($uuid: UUID!) {
    restaurant {
      settings {
        menu {
          menuItem(uuid: $uuid) {
            ...menuItemDetailBasicFields
            picture
            croppedInfo
            originalPicture {
              uuid
              pictureFilename
            }
            sortingIndex
            externalId
            comboItemCategories {
              ...comboItemCategoryFields
              allowRepeatableSelection
              minimumSelection
              maximumSelection
            }
            customizedTaxEnabled
            customizedTaxType
            customizedTaxRate
            menuItemTagSortingType

            # online-platform menu releation
            onlineRestaurantMenuItem {
              uuid
            }
            grabfoodMenuItem {
              uuid
            }
            ubereatsMenuItem {
              uuid
            }
            ubereatsV2MenuItem {
              uuid
            }
            foodpandaMenuItem {
              uuid
            }

            itemTagRelationshipList {
              followingSeparatorCount
              tagLikeObject {
                ... on MenuItemTagInItemType {
                  __typename # for union type handling condition
                  menuItemTagUuid
                }
                ... on TagGroupInItemType {
                  __typename # for union type handling condition
                  tagGroupUuid
                  subTagInItems {
                    subTagUuid
                    enabledInformation {
                      subTagInItemEnabled
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  fragment menuItemDetailBasicFields on MenuItemType {
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
    }
    onlineRestaurantMenuItem {
      uuid
    }
  }
  fragment comboItemCategoryFields on ComboItemCategoryType {
    _id: uuid
    uuid
    name
    comboMenuItems {
      uuid
      price
      menuItemUuid
      onlineRestaurantMenuItem {
        uuid
        visible
      }
      instoreOrderingMenuItem {
        uuid
        visible
      }
      ubereatsV2MenuItem {
        uuid
        visible
      }
    }
    comboMenuItemUuidsMappedWithOnlineOrdering {
      ubereats
    }
    comboMenuItemSortingType
  }
`;
