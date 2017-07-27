import React from 'react';
import {
  Link
} from 'react-router-dom'

import {
    gql,
    graphql,
} from 'react-apollo';

import List from '../shared/List'

const Lists = ({history, data: {home, loading, error}}) => {
  if (error) return <div>{error} error</div>
  if (loading) return <div>loading</div>
  return <div style={{
    // backgroundColor: 'white',
    alignItems: 'center',
    padding: 10,
    overflowX: 'auto',
  }}>
      {home.user.lists.map(l => (
        <div
          style={{
            width: 500,
            margin: 10,
            // cursor: 'pointer',
          }}
          key={l.id}
        >
          <List id={l.id} />
        </div>
      ))}
    </div>
}

export const listsQuery = gql`
query ListsQuery {
  home {
    user {
      lists {
        id
      }
    }
  }
}
`

export default graphql(listsQuery, {
  options: {pollInterval: 60 * 1000}
})(Lists)

