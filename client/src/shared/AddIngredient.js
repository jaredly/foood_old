import React from 'react';
import {
  Link
} from 'react-router-dom'

import {
    gql,
    graphql,
    compose,
} from 'react-apollo';
import glamorous, {Div, Button, Textarea} from 'glamorous'
import Form from './formative'
import Checkmark from 'react-icons/lib/io/ios-checkmark-empty'
import Close from 'react-icons/lib/io/ios-close-empty'

import {ingredientsQuery} from './RecipeInput'
import Modal from '../shared/Modal'
import {listFragment, listQuery} from '../shared/List'

// Hmm what if diff ppl have diff aisles that things are in?
// would be fine to have a 'default' one, and then other ppl can
// have a 'custom aisles' thing
const aisles = [
  'dairy',
  'meat',
  'produce',
  'bulk',
  'cheese',
  'cans',
  // TODO maybe aisles should be objects? or I just keep an index of the
  // aisles I've seen
]

const diets = [
  'vegetarian',
  'vegan',
  'paleo',
  'gluten free',
]

const Input = glamorous.input({
  padding: 8,
  margin: 8,
})

const TopButton = glamorous.button({
  cursor: 'pointer',
  backgroundColor: 'transparent',
  border: 'none',
  padding: 0,
  // padding: 8,
  ':hover': {
    backgroundColor: '#eee',
  }
})

const validate = data => {
  if (!data.name) return 'Name is required'
}

const AddIngredient = ({ingredient, addIngredient, onDone, onClose}) => {
  return <Form initial={ingredient}>
  {({text, float, set}, data, isModified) => (
    <Div css={{
      padding: 10,
    }}>
      <Div css={{
        textAlign: 'center',
        padding: 8,
        fontWeight: 'bold',
      }}>
        Add Ingredient
      </Div>
      <Input {...text('name')} autoselect placeholder='Name' />
      <Input {...text('plural')} placeholder='Plural (optional)' />
      <Input {...text('defaultUnit')} placeholder='Default unit' />
      <Div css={{flexDirection: 'row'}}>
        <TopButton onClick={() => {
          if (!isModified) return onClose()
          const {error, loading, ...ingredient} = data

          const newError = validate(ingredient)
          if (newError) {
            set('error', newError)
          } else {
            set('error', null)
            set('loading', true)
            addIngredient({
              variables: {ingredient},
              refetchQueries: [{
                query: ingredientsQuery,
              }]
            })
            .then(
              ({data: {addIngredient: {id}}}) => (
                set('loading', false),
                onDone(id),
                onClose()
              ),
              err => (set('loading', false), set('error', err + ''))
            )
          }
        }}>
          <Checkmark color="green" size={46} />
        </TopButton>
        <TopButton onClick={onClose}>
          <Close size={46} color="gray" />
        </TopButton>
      </Div>
    </Div>
  )}
  </Form>
}

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
)(AddIngredient)
