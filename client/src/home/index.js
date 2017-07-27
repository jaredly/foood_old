import React from 'react';
// import {css, StyleSheet} from 'aphrodite'
import {
  Link
} from 'react-router-dom'

import {
    gql,
    graphql,
} from 'react-apollo';

import List from '../shared/List'

const Home = ({history, data: {home, loading, error}}) => {
  if (error) return <div>{JSON.stringify(error, null, 2)} error</div>
  if (loading) return <div>loading</div>
  return <div style={{
    flexDirection: 'row',
    alignItems: 'stretch',
    overflowX: 'auto',
    flex: 1,
  }}>
      {home.homepageLists.map(l => (
        <div key={l.id} style={{
          padding: 20, 
          width: 400,
        }}>
        <List 
          id={l.id}  
          onEditRecipe={id => history.push(`/recipe/${id}/edit`)}
        />
        </div>
      ))}
    </div>
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