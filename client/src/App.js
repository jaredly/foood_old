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
import Recipes from './recipes'
import Modal from './shared/Modal'
import AddRecipe from './shared/AddRecipe'
import Lists from './pages/Lists'

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
      list: (_, args) => {
        return toIdValue(dataIdFromObject({ __typename: 'List', id: args['id'] }))
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

const Header = () => (
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
)

class Body extends Component {
  constructor(props) {
    super()
    this.lastLocation = props.location
  }

  componentWillUpdate(nextProps) {
    const {location} = this.props
    if (
      nextProps.history.action !== 'POP'
      && (!location.state || !location.state.modal)
    ) {
      this.lastLocation = location
    }
  }

  render() {
    const {location} = this.props
    const isModal = !!(
      location.state &&
      location.state.modal &&
      this.lastLocation !== location // not initial render
    )

    return <div>
      <Switch location={isModal ? this.lastLocation : location}>
        <Route exact path="/" component={Home} />
        <Route exact path="/recipes/" component={Recipes} />
        <Route path="/recipe/:id" component={Recipe} />
        <Route path="/add" component={AddRecipe} />
        <Route path="/lists/" component={Lists} />
        <Route component={NotFound} />
      </Switch>
      {isModal &&
      <Switch>
        <Route path="/add"
          render={props => <Modal onBack={props.history.goBack}>
            <AddRecipe noBorder {...props} />
          </Modal>} />
        <Route path="/recipe/:id" render={props => <Modal onBack={props.history.goBack}>
            <Recipe noBorder {...props} />
        </Modal>} />
      </Switch>
      }
    </div>
  }
}

class App extends Component {
  // TODO handle auth
  // TODO I want the home page to look gated, but allow people to
  // share recipes by ID
  render() {
    return (
      <ApolloProvider client={client}>
        <BrowserRouter>
          <div className="App">
            <Header />
            <Route component={Body} />
          </div>
        </BrowserRouter>
      </ApolloProvider>
    );
  }
}

export default App;
