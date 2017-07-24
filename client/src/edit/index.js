import React from 'react';
import {
  Link
} from 'react-router-dom'

import {
    gql,
    graphql,
    compose,
} from 'react-apollo';

import RecipeEditor from '../shared/RecipeEditor'
import {RecipeQuery} from '../shared/RecipeCard'
import Modal from '../shared/Modal'

const parseSearch = search => search
  ? search.slice(1).split('&').map(m => m.split('=').map(decodeURIComponent))
    .reduce((obj, [key, val]) => (obj[key] = val, obj), {})
  : {}

const Edit = ({
  match: {params: {id}, url}, history,
  location: {search},
  addRecipeMutation,
  updateRecipeMutation,
  addRecipeToLists,
}) => {
  const addRecipe = addRecipeMutation
  const saveRecipe = updateRecipeMutation
  if (id) { // editing
    const parent = url.split('/').slice(0, -2).join('/') || '/'
    const goUp = () => history.replace(parent)
    return <Modal onBack={goUp}><RecipeQuery id={id}>
      {({data: {error, loading, recipe}}) => {
        if (error) return <div>Unable to load the recipe</div>
        if (loading) return <div>Loading...</div>
        return <RecipeEditor
          recipe={recipe}
          action="Save"
          onAction={(data, lists) => saveRecipe(id, data).then(({id}) => addRecipeToLists(id, lists))}
          onDone={goUp}
        />
      }}
    </RecipeQuery></Modal>
  } else { // adding
    const parent = url.split('/').slice(0, -1).join('/') || '/'
    const goUp = () => history.replace(parent)
    const target = parseSearch(search).target
    return <Modal onBack={goUp}><RecipeEditor
      recipe={null}
      lists={target ? [+target] : []}
      action="Create"
      onAction={(data, lists) => addRecipe(data).then(({id}) => addRecipeToLists(id, lists))}
      onDone={goUp}
    /></Modal>
  }
}

const inputTypes = `
input InstructionInput {
  text: String
  ingredientsUsed: [String!]!
}

input RecipeIngredientInput {
  ingredient: String! # id
  amount: Float!
  unit: String
  comments: String
}

input RecipeInput {
  title: String!
  tags: [String!]!
  source: String
  notes: String
  instructions: [InstructionInput!]!
  ingredients: [RecipeIngredientInput!]!
  # ingredientGroups maybe
  description: String!
  cookTime: Int
  prepTime: Int
  totalTime: Int
  ovenTemp: Int
}
`

export const addRecipeMutation = gql`
${inputTypes}
mutation AddRecipeMutation($recipe: RecipeInput) {
  addRecipe(recipe: $recipe) { id }
}
`

export const updateRecipeMutation = gql`
${inputTypes}
mutation UpdateRecipeMutation($id: ID!, $recipe: RecipeInput) {
  updateRecipe(id: $id, recipe: $recipe) { id }
}
`

export const addRecipeToLists = gql`
mutation addRecipeToLists($id: ID!, $lists: [ID!]!) {
  addRecipeToLists(id: $id, lists: $lists)
}
`

export default compose(
  graphql(addRecipeMutation, {name: 'addRecipeMutation'}),
  graphql(updateRecipeMutation, {name: 'updateRecipeMutation'}),
  graphql(addRecipeToLists, {name: 'addRecipeToLists'}),
)(Edit)