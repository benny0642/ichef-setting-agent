import { gql } from 'graphql-request';

export const MENU_ITEM_CATEGORY_CREATE_MUTATION = gql`
  mutation menuItemCategoryCreateMutation($payload: CreateMenuItemCategoryPayload!) {
    restaurant {
      settings {
        menu {
          createMenuItemCategory(payload: $payload) {
            uuid
          }
        }
      }
    }
  }
`;