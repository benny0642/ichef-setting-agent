import { gql } from 'graphql-request';

/**
 * 刪除商品的 GraphQL Mutation
 */
export const DELETE_MENU_ITEM_MUTATION = gql`
  mutation menuItemItemDeleteMutation($uuid: UUID!) {
    restaurant {
      settings {
        menu {
          deleteMenuItem(uuid: $uuid) {
            uuid
          }
        }
      }
    }
  }
`;
