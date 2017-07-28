import React from 'react';
import {
  Link
} from 'react-router-dom'

import {
    gql,
    graphql,
} from 'react-apollo';

import {ListView, listFragment} from '../shared/List'

class ListPage extends React.Component {
  constructor() {
    super()

    this.state = {
      editing: false,
    }
  }

  render() {
    const {id, history, data: {list, loading, error}} = this.props
    if (error) return <div>{JSON.stringify(error, null, 2)} error</div>
    if (loading) return <div>loading</div>
    // const {updated, author: {id, name}, title, recipes} = list;

    return <div style={{
      alignItems: 'center',
      padding: 10,
      overflowX: 'auto',
    }}>
      <ListView id={id} list={list} />
    </div>
  }
}

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
