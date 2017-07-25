import React, { Component } from 'react';
import {
  BrowserRouter,
  Link,
  Route,
  Switch,
} from 'react-router-dom';
import glamorous from 'glamorous'

import './App.css';
import Home from './home';
import Recipe from './recipe';
import Edit from './edit'
import Recipes from './recipes'

import ChannelsListWithData from './components/ChannelsListWithData';
import NotFound from './components/NotFound';
import ChannelDetails from './components/ChannelDetails';

import {
  ApolloClient,
  ApolloProvider,
  createNetworkInterface,
  toIdValue,
} from 'react-apollo';

import { SubscriptionClient, addGraphQLSubscriptions } from 'subscriptions-transport-ws';

const networkInterface = createNetworkInterface({ uri: 'http://localhost:4000/graphql' });
// networkInterface.use([{
//   applyMiddleware(req, next) {
//     setTimeout(next, 500);
//   },
// }]);

const wsClient = new SubscriptionClient(`ws://localhost:4000/subscriptions`, {
  reconnect: true
});

const networkInterfaceWithSubscriptions = addGraphQLSubscriptions(
  networkInterface,
  wsClient
);

function dataIdFromObject (result) {
  if (result.__typename) {
    if (result.id !== undefined) {
      return `${result.__typename}:${result.id}`;
    }
  }
  return null;
}

const client = new ApolloClient({
  networkInterface: networkInterfaceWithSubscriptions,
  customResolvers: {
    Query: {
      channel: (_, args) => {
        return toIdValue(dataIdFromObject({ __typename: 'Channel', id: args['id'] }))
      },
      recipe: (_, args) => {
        return toIdValue(dataIdFromObject({ __typename: 'Recipe', id: args['id'] }))
      },
    },
  },
  dataIdFromObject,
});

const NavBar = glamorous.div({
  padding: '10px 30px',
  fontSize: 10,
  color: 'white',
  backgroundColor: '#333',
  textAlign: 'left',
  flexDirection: 'row',
  fontWeight: 200,
  fontSize: 20,
  lineHeight: '30px',
  alignItems: 'center',
})

class App extends Component {
  // TODO handle auth
  // TODO I want the home page to look gated, but allow people to
  // share recipes by ID
  render() {
    return (
      <ApolloProvider client={client}>
        <BrowserRouter>
          <div className="App">
            <NavBar>
              <Link to="/">
                Home
              </Link>
              <div style={{flexBasis: 20}} />
              <Link to="/recipes/">
                My Recipes
              </Link>
              <div style={{flexBasis: 20}} />
              <Link to="/lists/">
                My Lists
              </Link>
              <div style={{flex: 1}} />
              <input
                placeholder="Search"
              />
            </NavBar>
            <Switch>
              <Route path="/list/:id">
                <div>
                 {/* <Route path="/" component={List} />  */}
                  <Route path="/recipe/:id">
                    <Switch>
                      <Route path="/" exact component={Recipe}/>
                      <Route path="/edit" component={Edit}/>
                    </Switch>
                  </Route>
                  <Route path="/add" component={Edit}/>
                </div>
              </Route>
              <Route path="/recipes/">
                <div>
                  <Route path="/recipes/" component={Recipes} />
                  <Route path="/recipes/:id">
                    <Switch>
                      <Route path="/recipes/:id" exact render={props => <Recipe {...props} parent="/recipes" />}/>
                      <Route path="/recipes/:id/edit" component={Edit}/>
                    </Switch>
                  </Route>
                  <Route path="/recipes/add" component={Edit}/>
                </div>
              </Route>
              <Route path="/">
                <div>
                  <Route path="/" component={Home} />
                  {/* <Route path="/recipe/:id" component={Recipe}/>
                  <Route path="/edit/:id" component={Edit}/>
                  <Route path="/add" component={Edit}/> */}
                  <Route path="/recipe/:id">
                    <Switch>
                      <Route path="/recipe/:id" exact component={Recipe}/>
                      <Route path="/recipe/:id/edit" component={Edit}/>
                    </Switch>
                  </Route>
                  <Route path="/add" component={Edit}/>
                </div>
              </Route>
            </Switch>
          </div>
        </BrowserRouter>
      </ApolloProvider>
    );
  }
}

export default App;
