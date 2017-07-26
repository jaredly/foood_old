import React from 'react';
import {
  Link
} from 'react-router-dom'

import glamorous, {Div, Button, Input, Textarea} from 'glamorous'
import Checkmark from 'react-icons/lib/io/ios-checkmark-empty'
import Close from 'react-icons/lib/io/ios-close-empty'

import {
    gql,
    graphql,
} from 'react-apollo';

import AutoSelect from './AutoSelect'
import Form from './formative'

const {div} = glamorous

const RecipeInput = ({value, onChange, data: {error, loading, ingredients}}) => {
  console.log(error)
  if (error) return <div>Error</div>
  if (loading) return <div>Loading</div>
  return <AutoSelect
    value={value}
    onChange={onChange}
    options={ingredients}
    placeholder='Ingredient'
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

export default graphql(ingredientsQuery, {
  // options: ({id}) => ({
  //   // pollInterval: 60 * 1000,
  //   variables: {id},
  // })
})(RecipeInput)
