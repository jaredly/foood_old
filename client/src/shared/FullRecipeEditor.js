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
import {recipeCardFragment} from '../shared/RecipeCard'
import {listFragment} from '../shared/List'


const FullRecipeEditor = ({
  id,
  recipe,
  updateRecipeMutation,
  addRecipeToLists,
  onDone,
}) => {
  const saveRecipe = updateRecipeMutation
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
      .then(onDone)
    }}
    onDone={onDone}
  />
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
  graphql(updateRecipeMutation, {name: 'updateRecipeMutation'}),
  graphql(addRecipeToLists, {name: 'addRecipeToLists'}),
)(FullRecipeEditor)