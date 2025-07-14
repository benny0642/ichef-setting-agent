import { gql } from 'graphql-request';

/**
 * 更新商品資訊的 GraphQL Mutation
 */
export const MENU_ITEM_UPDATE_MUTATION = gql`
  mutation menuItemItemEditMutation(
    $uuid: UUID!
    $payload: UpdateMenuItemPayload!
  ) {
    restaurant {
      settings {
        menu {
          updateMenuItem(uuid: $uuid, payload: $payload) {
            uuid
          }
        }
      }
    }
  }
`;
