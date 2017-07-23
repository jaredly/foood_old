import React from 'react';
import {
  Link
} from 'react-router-dom'

import {
    gql,
    graphql,
} from 'react-apollo';

import RecipeCard from './RecipeCard'

const List = ({id, data: {list, loading, error}}) => {
  if (error) return <div style={{
    whiteSpace: 'pre',
    fontFamily: 'monospace',
  }}>
    {id}
    {JSON.stringify(error, null, 2)}
    error
  </div>
  if (loading) return <div>loading</div>
  const {updated, author, title, recipes} = list
  return <div style={{
    boxShadow: '0 0 3px #aaa',
            borderRadius: 3,
  }}>
    <div style={{padding: 10, borderBottom: '1px solid #aaa'}}>
      {title} (updated {new Date(updated).toLocaleDateString()})
    </div>
    <div>
      {recipes.map(r => (
        <Link
          to={"/recipe/" + r.id}
          style={{
            margin: 10,
            cursor: 'pointer',
            boxShadow: '0 0 3px #aaa',
            borderRadius: 3,
          }}
          key={r.id}
        >
        <RecipeCard
          id={r.id}
        />
        </Link>
      ))}
    </div>
  </div>
}

// TODO do paging
export const listQuery = gql`
query ListQuery($id: ID!) {
  list(id: $id) {
    updated
    author {id, name}
    title
    # TODO paging
    recipes {
      id      
    }
  }
}
`

export default graphql(listQuery, {
  options: ({id}) => ({variables: {id}})
})(List)

