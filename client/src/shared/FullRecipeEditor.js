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
import {listFragment, listQuery} from '../shared/List'
import {recipesQuery} from '../recipes'

const FullRecipeEditor = ({
  id,
  recipe,
  updateRecipeMutation,
  addRecipeToLists,
  deleteRecipe,
  onDelete,
  onDone,
}) => {
  const saveRecipe = updateRecipeMutation
  return <RecipeEditor
    recipe={stripRecipe(recipe)}
    action="Save"
    onDelete={() => deleteRecipe({
      variables: {id},
      update: (store, {data: {deleteRecipe: lists}}) => {
        console.log('the update folks', lists)
        lists.forEach(lid => {
          try {
            const data = store.readQuery({query: listQuery, variables: {id: lid}})
            console.log('here it is', data.list.recipes)
            data.list.recipes = data.list.recipes.filter(r => r.id != id)
            console.log('here it is', data.list.recipes)
            store.writeQuery({query: listQuery, variables: {id: lid}, data})
          } catch (e) {
            console.log('cannot read query ya know', e)
          }
        })
        try {
          const data = store.readQuery({query: recipesQuery})
          console.log(data.home.user.recipes)
          data.home.user.recipes = data.home.user.recipes.filter(r => r.id !== id)
          console.log(data.home.user.recipes)
          store.writeQuery({query: recipesQuery, data})
        } catch (e) {
          console.log('fail wat', e)
        }
      },
    }).then(({data: {deleteRecipe: lists}}) => {
      console.log('deleted!')
      onDelete()
    })}
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

const stripRecipe = ({title, tags, source, description, 'yield': yield_, yieldUnit, cookTime, prepTime, totalTime, ovenTemp, instructions, ingredients}) => ({
  title,
  tags: tags.map(tag => tag.id),
  source,
  description,
  'yield': yield_,
  yieldUnit,
  cookTime,
  prepTime,
  totalTime,
  ovenTemp,
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

export const deleteRecipeMutation = gql`
mutation DeleteRecipeMutation($id: ID!) {
  deleteRecipe(id: $id)
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
  graphql(deleteRecipeMutation, {name: 'deleteRecipe'}),
)(FullRecipeEditor)