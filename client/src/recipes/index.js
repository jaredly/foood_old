import React from 'react';
import {
  Link
} from 'react-router-dom'

import {
    gql,
    graphql,
} from 'react-apollo';

import RecipeCard from '../shared/RecipeCard'

const Recipes = ({history, data: {home, loading, error}}) => {
  if (error) return <div>{error} error</div>
  if (loading) return <div>loading</div>
  return <div style={{
    backgroundColor: 'white',
    alignItems: 'center',
    padding: 10,
    overflowX: 'auto',
  }}>
      {home.user.recipes.map(r => (
        <Link
          to={{pathname: "/recipe/" + r.id, state: {modal: true}}}
          style={{
            width: 300,
            margin: 10,
            boxShadow: '0 0 3px #aaa',
            borderRadius: 3,
            cursor: 'pointer',
          }}
          key={r.id}
        >
          <RecipeCard id={r.id} />
        </Link>
      ))}
    </div>
}

export const recipesQuery = gql`
query RecipesQuery {
  home {
    user {
      recipes {
        id
        # ...RecipeCardFragment
      }
    }
  }
}
`

export default graphql(recipesQuery, {
  options: {pollInterval: 60 * 1000}
})(Recipes)
