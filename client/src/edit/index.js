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
          recipe={stripRecipe(recipe)}
          action="Save"
          onAction={(recipe, lists) => {
            saveRecipe({variables: {id, recipe}})
            .then(res => console.log('res', res))
            // .then(({id}) => addRecipeToLists(id, lists))
          }}
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

const stripRecipe = ({title, tags, source, description, cookTime, prepTime, totalTime, ovemTemp, instructions, ingredients}) => ({
  title,
  tags: tags.map(tag => tag.id),
  source,
  description,
  cookTime,
  prepTime,
  totalTime,
  ingredients: ingredients.map(({id, ingredient, amount, unit, comments}) => ({
    id,
    ingredient: ingredient.id, amount, unit, comments,
  })),
  instructions: instructions.map(({id, text, ingredientsUsed}) => ({
    id,
    text,
    ingredientsUsed: ingredientsUsed || [],
  })),
})

export const addRecipeMutation = gql`
mutation AddRecipeMutation($recipe: RecipeInput!) {
  addRecipe(recipe: $recipe) { id }
}
`

export const updateRecipeMutation = gql`
mutation UpdateRecipeMutation($id: ID!, $recipe: RecipeInput!) {
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