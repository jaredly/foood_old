import React from 'react';
import {
  Link
} from 'react-router-dom'

import {
    gql,
    graphql,
} from 'react-apollo';
import Plus from 'react-icons/lib/io/ios-plus-empty'
import glamorous, {Div} from 'glamorous'

import RecipeCard from './RecipeCard'

export const ListView = ({id, list}) => {
  const {updated, author, title, recipes} = list

  return <div style={{
    boxShadow: '0 0 3px #aaa',
    backgroundColor: 'white',
    borderRadius: 3,
    flex: 1,
  }}>
    <div style={{
      flexDirection: 'row',
      alignItems: 'center',
      boxShadow: '0 2px 2px #aaa ',
      zIndex: 1,
    }}>
      <Link to={"/list/" + id }>
        <Div css={{
          marginLeft: 8,
        }}>
          {title} (updated {new Date(updated).toLocaleDateString()})
        </Div>
      </Link>
      <div style={{flex: 1}} />
      <Link to={{
        pathname: "/add",
        search: `?target=${id}`,
        state: {modal: true}
      }}>
      <Div css={{
        padding: 8,
        ':hover': {
          backgroundColor: '#eee',
        }
      }}>
        <Plus/>
        </Div>
      </Link>
    </div>

    <div style={{flex: 1, overflow: 'auto',
    }}>
      {recipes.map(r => (
        <Link
          to={{pathname: "/recipe/" + r.id, state: {modal: true}}}
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

  return <ListView
    list={list}
    id={id}
  />
}

export const listFragment = `
fragment ListFragment on List {
  updated
  author {id, name}
  title
  # TODO paging
  recipes {
    id      
  }
}
`

// TODO do paging
export const listQuery = gql`
${listFragment}
query ListQuery($id: ID!) {
  list(id: $id) {
    ...ListFragment
  }
}
`

export default graphql(listQuery, {
  options: ({id}) => ({variables: {id}})
})(List)
