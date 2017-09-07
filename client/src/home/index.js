import React from 'react';
// import {css, StyleSheet} from 'aphrodite'
import {
  Link
} from 'react-router-dom'

import {
    gql,
    graphql,
} from 'react-apollo';

import {Div} from 'glamorous'
import List from '../shared/List'

const Home = ({history, data: {home, loading, error}}) => {
  if (error) return <div>{JSON.stringify(error, null, 2)} error</div>
  if (loading) return <div>loading</div>
  return <Div css={{
    flexDirection: 'row',
    alignItems: 'stretch',
    '@media(min-width: 501px)': {
      flex: 1,
      overflowX: 'auto',
    },
    '@media(max-width: 500px)': {
      flexDirection: 'column',
    }
  }}>
      {home.homepageLists.map(l => (
        <div key={l.id} style={{
          padding: 20, 
          width: 500,
          maxWidth: '100%',
        }}>
        <List 
          id={l.id}  
          onEditRecipe={id => history.push(`/recipe/${id}/edit`)}
        />
        </div>
      ))}
    </Div>
}

// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: 'white',
//   }
// })

export const homeQuery = gql`
query HomeQuery {
  home {
    homepageLists {
      id      
    }
  }
}
`

export default graphql(homeQuery, {
  options: {pollInterval: 60 * 1000}
})(Home)