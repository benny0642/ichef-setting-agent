import { GraphQLClient } from 'graphql-request';

// GraphQL 客戶端設定
export const createGraphQLClient = () => {
  const endpoint = 'http://localhost:8026/api/graphql/';
  const token = '0d74c19882535498d2d19e58433c1527944e2535';

  if (!endpoint) {
    throw new Error('GRAPHQL_ENDPOINT environment variable is not set');
  }

  if (!token) {
    throw new Error('GRAPHQL_TOKEN environment variable is not set');
  }

  return new GraphQLClient(endpoint, {
    headers: {
      Authorization: `token ${token}`,
      'Content-Type': 'application/json',
    },
  });
};
