import { gql } from 'graphql-request';

export const ONLINE_RESTAURANT_INFORMATION_EDIT_MUTATION = gql`
  mutation onlineRestaurantInformationEditMutation($payload: UpdateOnlineRestaurantInformationInputObject!) {
    restaurant {
      settings {
        onlineOrderingIntegration {
          onlineRestaurant {
            updateOnlineRestaurantInformation(payload: $payload) {
              name
            }
          }
        }
      }
    }
  }
`; 