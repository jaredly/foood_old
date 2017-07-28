import React from 'react';
import {
  Link
} from 'react-router-dom'

import glamorous, {Div, Button, Input, Textarea} from 'glamorous'


import * as PropTypes from 'prop-types'
import AutoSelect from './AutoSelect'
import Form from './formative'

import {
    gql,
    graphql,
    compose,
} from 'react-apollo';

const findById = (items, id) => {
  for (let item of items) {
    if (item.id === id) return item
  }
}

const RecipeSelector = ({value, current, onSelect, data: {error, loading, recipes}}) => {
  if (error) return <div>Error</div>
  if (loading) return <div>Loading</div>
  const currentIds = {}
  current.forEach(r => currentIds[r.id] = true)
  return <AutoSelect
    value={value}
    onChange={id => {
      const recipe = findById(recipes, id)
      if (recipe) {
        onSelect(recipe)
      }
    }}
    getName={option => option.title}
    options={recipes.filter(r => !currentIds[r.id])}
    placeholder='Add recipe'
  />
}

export const recipesQuery = gql`
# Maybe paging
query RecipesQuery {
  # TODO add search thing
  recipes {
    id
    title
  }
}
`

export default graphql(recipesQuery, {
  // options: ({id}) => ({
  //   // pollInterval: 60 * 1000,
  //   variables: {id},
  // })
})(RecipeSelector)
