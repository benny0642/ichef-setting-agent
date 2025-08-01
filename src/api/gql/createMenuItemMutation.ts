import { gql } from 'graphql-request';

export const MENU_ITEM_CREATE_MUTATION = gql`
  mutation menuItemItemCreateMutation($payload: CreateMenuItemPayload!) {
    restaurant {
      settings {
        menu {
          createMenuItem(payload: $payload) {
            uuid
            name
            type
            comboItemCategories {
              ...comboItemCategoryFields
            }
          }
        }
      }
    }
  }

  fragment comboItemCategoryFields on ComboItemCategoryType {
    _id: uuid
    uuid
    name
    comboMenuItems {
      uuid
      name
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
    allowRepeatableSelection
    minimumSelection
    maximumSelection
  }
`;
