import { gql } from 'graphql-request';

/**
 * 批次刪除線上餐廳菜單項目的 GraphQL Mutation
 *
 * 此 mutation 用於從線上餐廳平台批次下架菜單項目
 *
 * @param menuItemUuids - 要刪除的菜單項目 UUID 陣列
 * @returns 成功刪除的 UUID 列表
 */
export const ONLINE_RESTAURANT_MENU_ITEM_BATCH_DELETE_MUTATION = gql`
  mutation onlineRestaurantMenuItemBatchDeleteMutation($menuItemUuids: [UUID]) {
    restaurant {
      settings {
        menu {
          integration {
            onlineRestaurant {
              deleteMenu(menuItemUuids: $menuItemUuids) {
                deletedMenuItemUuids
              }
            }
          }
        }
      }
    }
  }
`;
