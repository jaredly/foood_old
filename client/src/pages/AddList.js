import React from 'react';
import {
  Link
} from 'react-router-dom'

import {
    gql,
    graphql,
    compose,
} from 'react-apollo';

import ListEditor from '../shared/ListEditor'
import {listFragment} from '../shared/List'
import {listsQuery} from '../pages/Lists'

const AddList = ({
  match: {params: {id}},
  noBorder,
  history,
  location: {search},
  addListMutation,
}) => {
  const body = <ListEditor
    list={{
      title: '',
      recipes: [],
      // editors: [],
    }}
    action="Create"
    onAction={({error, loading, ...list}) =>
      addListMutation({
        variables: {list},
        refetchQueries: [{
          query: listsQuery,
        }]
      })
        .then(history.push('/lists/'))
    }
    onDone={() => history.push('/lists/')}
  />

  if (noBorder) return body

  return <div style={{
    backgroundColor: 'white',
    boxShadow: '0 0 5px #aaa',
    margin: 16,
    border: 4,
  }}>
    {body}
  </div>
}

export const addListMutation = gql`
${listFragment}
mutation AddListMutation($list: ListInput!) {
  addList(list: $list) {
    ...ListFragment
  }
}
`

export default compose(
  graphql(addListMutation, {name: 'addListMutation'}),
)(AddList)
