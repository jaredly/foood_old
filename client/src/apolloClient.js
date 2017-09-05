
import {
  ApolloClient,
  ApolloProvider,
  createNetworkInterface,
  toIdValue,
} from 'react-apollo';
import {API} from './config'

// import { SubscriptionClient, addGraphQLSubscriptions } from 'subscriptions-transport-ws';

const networkInterface = createNetworkInterface({
  uri: API + '/graphql'
});

// networkInterface.use([{
//   applyMiddleware(req, next) {
//     setTimeout(next, 500);
//   },
// }]);

// const wsClient = new SubscriptionClient(`ws://localhost:4000/subscriptions`, {
//   reconnect: true
// });

// const networkInterfaceWithSubscriptions = addGraphQLSubscriptions(
//   networkInterface,
//   wsClient
// );

function dataIdFromObject (result) {
  if (result.__typename) {
    if (result.id !== undefined) {
      return `${result.__typename}:${result.id}`;
    }
  }
  return null;
}

const client = new ApolloClient({
  networkInterface, // : networkInterfaceWithSubscriptions,
  customResolvers: {
    Query: {
      channel: (_, args) => {
        return toIdValue(dataIdFromObject({ __typename: 'Channel', id: args['id'] }))
      },
      recipe: (_, args) => {
        return toIdValue(dataIdFromObject({ __typename: 'Recipe', id: args['id'] }))
      },
      list: (_, args) => {
        return toIdValue(dataIdFromObject({ __typename: 'List', id: args['id'] }))
      },
    },
  },
  dataIdFromObject,
});

export default client