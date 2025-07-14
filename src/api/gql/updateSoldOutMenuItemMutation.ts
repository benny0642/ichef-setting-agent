import { gql } from 'graphql-request';

export const UPDATE_SOLD_OUT_MENU_ITEM_MUTATION = gql`
  mutation updateSoldOutMenuItems(
    $soldOutMenuItems: [UpdateSoldOutItemInputObjectType]
  ) {
    restaurant {
      settings {
        menu {
          updateSoldOutItems(soldOutMenuItems: $soldOutMenuItems) {
            updatedSoldOutMenuItems {
              uuid
              isSoldOut
              __typename
            }
            __typename
          }
          __typename
        }
        __typename
      }
      __typename
    }
  }
`;
