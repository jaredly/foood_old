import React from 'react';
import {
  Link
} from 'react-router-dom'

import {
    gql,
    graphql,
} from 'react-apollo';

import {ListView, listFragment} from '../shared/List'
import FullListEditor from '../shared/FullListEditor'
import lively from '../shared/lively'
import glamorous from 'glamorous'

const Container = glamorous.div({
  alignItems: 'stretch',
  alignSelf: 'center',
  padding: 10,
  width: 600,
  overflowX: 'auto',
})

const ListPage = lively({editing: false}, ({
  editing, update, match: {params: {id}}, history, data: {list, loading, error}
}) => {
  if (error) return <div>{JSON.stringify(error, null, 2)} error</div>
  if (loading) return <div>loading</div>

  if (editing) {
    return <div style={{
      alignItems: 'center',
      padding: 10,
      overflowX: 'auto',
    }}>
      <FullListEditor
        id={id}
        list={list}
        onDone={update({editing: false})}
      /> 
    </div>
  }

  return <Container>
    <ListView
      id={id}
      list={list}
      onEdit={update({editing: true})}
    />
  </Container>
})

export const listsQuery = gql`
${listFragment}
query ListPageQuery($id: ID!) {
  list(id: $id) {
    ...ListFragment
  }
}
`

export default graphql(listsQuery, {
  options: ({match: {params: {id}}}) => ({
    // pollInterval: 60 * 1000,
    variables: {id},
  }),
})(ListPage)
