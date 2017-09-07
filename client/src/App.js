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
import ListPage from './pages/List'
import ShopPage from './pages/Shop'
import AddListPage from './pages/AddList'

import NotFound from './components/NotFound';

import {ApolloProvider} from 'react-apollo';
import client from './apolloClient'


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
  '@media(max-width: 500px)': {
    fontSize: 14,
  }
})

const Header = () => (
  <NavBar>
    <Link to="/" style={{whiteSpace: 'nowrap'}}>
      Home
    </Link>
    <div style={{flexBasis: 20}} />
    <Link to="/recipes/" style={{whiteSpace: 'nowrap'}}>
      My Recipes
    </Link>
    <div style={{flexBasis: 20}} />
    <Link to="/lists/" style={{whiteSpace: 'nowrap'}}>
      My Lists
    </Link>
    <div style={{flex: 1}} />
    {/* <glamorous.Input
      placeholder="Search"
    /> */}
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

    return <div style={{flex: 1, overflow: 'auto'}}>
      <Switch location={isModal ? this.lastLocation : location}>
        <Route exact path="/" component={Home} />
        <Route exact path="/recipes/" component={Recipes} />
        <Route path="/recipe/:id" component={Recipe} />
        <Route path="/add" component={AddRecipe} />
        <Route path="/lists/" component={Lists} />
        <Route path="/list/new" component={AddListPage} />
        <Route path="/list/:id/shop" component={ShopPage} />
        <Route path="/list/:id" component={ListPage} />
        <Route component={NotFound} />
      </Switch>
      {isModal &&
      <Switch>
        <Route path="/add"
          render={props => <Modal onBack={props.history.goBack}>
            <AddRecipe noBorder {...props} />
          </Modal>} />
        <Route path="/recipe/:id" render={props => <Modal onBack={props.history.goBack}>
            <Recipe noBorder {...props} onDelete={props.history.goBack}/>
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
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}>
            <Header />
            <Route component={Body} />
          </div>
        </BrowserRouter>
      </ApolloProvider>
    );
  }
}

export default App;
