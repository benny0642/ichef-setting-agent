import { gql } from 'graphql-request';

/**
 * 查詢套餐依賴關係檢查的 GraphQL Query
 * 用於檢查指定商品是否被套餐使用
 */
export const COMBO_DEPENDENCY_CHECK_QUERY = gql`
  query comboDependencyCheckQuery {
    restaurant {
      settings {
        menu {
          menuItemCategories {
            menuItems {
              uuid
              name
              type
              enabled
              comboItemCategories {
                uuid
                name
                minimumSelection
                maximumSelection
                allowRepeatableSelection
                comboMenuItems {
                  uuid
                  menuItemUuid
                  name
                }
              }
            }
          }
        }
      }
    }
  }
`;