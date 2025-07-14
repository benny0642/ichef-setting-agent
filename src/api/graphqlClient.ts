import { GraphQLClient } from 'graphql-request';
import { getApiConfig } from '../config/apiConfig.js';

// GraphQL 客戶端設定
export const createGraphQLClient = () => {
  const config = getApiConfig();
  const { graphqlEndpoint, graphqlToken } = config;

  if (!graphqlEndpoint) {
    throw new Error('GRAPHQL_ENDPOINT environment variable is not set');
  }

  if (!graphqlToken) {
    throw new Error('GRAPHQL_TOKEN environment variable is not set');
  }

  return new GraphQLClient(graphqlEndpoint, {
    headers: {
      Authorization: `token ${graphqlToken}`,
      'Content-Type': 'application/json',
    },
  });
};
