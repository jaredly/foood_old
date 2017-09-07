import React from 'react'
import ReactDOM from 'react-dom'
import {
  Link
} from 'react-router-dom'
import {compose} from 'react-apollo'

import {
    gql,
    graphql,
} from 'react-apollo';

import * as PropTypes from 'prop-types'
import AutoSelect from './AutoSelect'
import Form from './formative'

const IngredientInput = ({value, onChange, guess, addIngredient, data: {error, loading, ingredients}, blank}) => {
  if (error) return <div>Error</div>
  if (loading) return <div>Loading</div>
  return <AutoSelect
    value={value}
    onChange={item => onChange(item.id)}
    initialText={guess}
    getName={option => option.name}
    options={ingredients}
    highlightEmpty={!blank}
    onAdd={text => {
      return addIngredient({
        variables: {ingredient: {
          name: text,
          plural: null,
          defaultUnit: null,
        }},
        refetchQueries: [{
          query: ingredientsQuery,
        }]
      })
      .then(({data: {addIngredient: {id, name}}}) => onChange(id))
    }}
    addText='New Ingredient'
    placeholder='Add Ingredient'
  />
}

export const ingredientsQuery = gql`
# Maybe paging
query IngredientsQuery {
  ingredients {
    id
    name
    plural
  }
}
`

export const addIngredient = gql`
mutation AddIngredientMutation($ingredient: IngredientInput!) {
  addIngredient(ingredient: $ingredient) {
    id
    name
    plural
    defaultUnit    
  }
}
`

export default compose(
  graphql(addIngredient, {name: 'addIngredient'}),
  graphql(ingredientsQuery)
)(IngredientInput)
