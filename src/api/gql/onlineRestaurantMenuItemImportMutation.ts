import { gql } from 'graphql-request';

/**
 * 匯入商品到線上餐廳的 GraphQL Mutation
 */
export const ONLINE_RESTAURANT_MENU_ITEM_IMPORT_MUTATION = gql`
  mutation onlineRestaurantMenuItemImportMutation(
    $categoryUuid: UUID!
    $ichefMenuItemUuids: [UUID]!
  ) {
    restaurant {
      settings {
        menu {
          integration {
            onlineRestaurant {
              importMenuItemToCategory(
                uuid: $categoryUuid
                ichefMenuItemUuids: $ichefMenuItemUuids
              ) {
                uuid
                name
                menuItems {
                  uuid
                  ichefUuid
                  originalName
                }
              }
            }
          }
        }
      }
    }
  }
`;
