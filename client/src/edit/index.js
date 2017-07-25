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
import {RecipeQuery, recipeCardFragment} from '../shared/RecipeCard'
import Modal from '../shared/Modal'
import {listFragment} from '../shared/List'

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
    const parent = url.split('/').slice(0, -1).join('/') || '/'
    const goUp = () => history.replace(parent)
    return <Modal onBack={goUp}><RecipeQuery id={id}>
      {({data: {error, loading, recipe}}) => {
        if (error) return <div>Unable to load the recipe</div>
        if (loading) return <div>Loading...</div>
        return <RecipeEditor
          recipe={stripRecipe(recipe)}
          action="Save"
          onAction={({error, loading, ...recipe}, lists) => {
            return saveRecipe({
              variables: {id, recipe},
            })
            .then(({data: {updateRecipe: {id}}}) => {
              if (lists && lists.length) {
                return addRecipeToLists(id, lists)
              }
            })
            .then(goUp)
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
      onAction={({error, loading, ...recipe}, lists) =>
        addRecipe({variables: {
          recipe: {
            ...recipe,
            tags: [],
          }
        }})
        .then(// lists && lists.length
        // TODO support custom list additions
          target
          ? ({data: {addRecipe: {id}}}) => addRecipeToLists({variables: {recipe: id, lists: [target]}})
          : () => {})
        .then(goUp)
      }
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
${recipeCardFragment}
mutation AddRecipeMutation($recipe: RecipeInput!) {
  addRecipe(recipe: $recipe) {
    ...RecipeCardFragment
  }
}
`

export const updateRecipeMutation = gql`
${recipeCardFragment}
mutation UpdateRecipeMutation($id: ID!, $recipe: RecipeInput!) {
  updateRecipe(id: $id, recipe: $recipe) {
    ...RecipeCardFragment
  }
}
`

export const addRecipeToLists = gql`
${listFragment}
mutation addRecipeToLists($recipe: ID!, $lists: [ID!]!) {
  addRecipeToLists(recipe: $recipe, lists: $lists) {
    ...ListFragment
  }
}
`

export default compose(
  graphql(addRecipeMutation, {name: 'addRecipeMutation'}),
  graphql(updateRecipeMutation, {name: 'updateRecipeMutation'}),
  graphql(addRecipeToLists, {name: 'addRecipeToLists'}),
)(Edit)