import React from 'react'
import ReactDOM from 'react-dom'
import {compose} from 'react-apollo'

import AddIngredient from './AddIngredient'

import {gql, graphql} from 'react-apollo';

import * as PropTypes from 'prop-types'
import AutoSelect from './AutoSelect'
import Form from './formative'

const ListInput = ({onSelect, exclude, guess, data: {error, loading, home}}) => {
  if (error) return <div>Error</div>
  if (loading) return <div>Loading</div>
  return <AutoSelect
    onChange={onSelect}
    initialText={guess}
    getName={option => option.title}
    options={home.user.lists.filter(l => !exclude.includes(l.id))}
    placeholder='Add to List'
  />
}

export const listsQuery = gql`
# Maybe paging
query ListsQuery {
  home {
    user {
      lists {
        id
        title
        recipeCount
        updated
      }
    }
  }
}
`

export default compose(
  graphql(listsQuery)
)(ListInput)

