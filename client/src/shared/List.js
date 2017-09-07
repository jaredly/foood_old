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

import RecipeCardSmall from './RecipeCardSmall'

export const ListView = ({id, list, onEdit}) => {
  const {updated, author, title, recipes} = list

  let titleNode = <Div css={{
    fontSize: 24,
    textAlign: 'center',
    margin: 8,
  }}>
    {title}
  </Div>

  if (id) {
    titleNode = <Link to={"/list/" + id }>
      {titleNode}
    </Link>
  }

  return <div style={{
    // boxShadow: '0 0 3px #aaa',
    // backgroundColor: 'white',
    // borderRadius: 3,
    flex: 1,
  }}>
    {titleNode}
    <div style={{
      flexDirection: 'row',
      alignItems: 'center',
      margin: 8,
      zIndex: 1,
    }}>
      (updated {new Date(updated).toLocaleDateString()})
      <div style={{flex: 1}} />
      {id && <Link to={`/list/${id}/shop`} style={{padding: 8}}>Shop</Link>}
      {onEdit && <Div
        css={{
          cursor: 'pointer',
          padding: 8,
        }}
        onClick={onEdit}
      >Edit</Div>}
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
          Add
        </Div>
      </Link>
    </div>

    <div style={{
      flex: 1,
      overflow: 'auto',
    }}>
      {!recipes.length && <div style={{padding: 16}}>No recipes in this list</div>}
      {recipes.map(r => (
        <Link
          to={{pathname: "/recipe/" + r.id, state: {modal: true}}}
          style={{
            margin: 10,
            cursor: 'pointer',
            boxShadow: '0 0 3px #aaa',
            backgroundColor: 'white',
            // borderRadius: 3,
          }}
          key={r.id}
        >
          <RecipeCardSmall
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
    title
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
