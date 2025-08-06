import { gql } from 'graphql-request';

export const ONLINE_RESTAURANT_MENU_CATEGORY_CREATE_MUTATION = gql`
  mutation onlineRestaurantMenuItemCategoryCreateMutation(
    $payload: CreateOnlineRestaurantMenuCategoryPayload!
  ) {
    restaurant {
      settings {
        menu {
          integration {
            onlineRestaurant {
              createMenuCategory(payload: $payload) {
                uuid
              }
            }
          }
        }
      }
    }
  }
`;