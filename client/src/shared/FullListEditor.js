

import React from 'react';
import {
  Link
} from 'react-router-dom'

import {
    gql,
    graphql,
    compose,
} from 'react-apollo';

import ListEditor from './ListEditor'
import {recipeCardFragment} from '../shared/RecipeCard'
import {listFragment, listQuery} from '../shared/List'

const stripList = ({title, recipes}) => ({title, recipes})

const FullListEditor = ({
  id,
  list,
  updateListMutation,
  onDone,
}) => {
  return <ListEditor
    list={stripList(list)}
    // recipe={stripRecipe(recipe)}
    action="Save"
    onAction={({error, loading, ...list}) => {
      console.log(id, list)
      return updateListMutation({
        variables: {id, list: {
          ...list,
          recipes: list.recipes.map(r => r.id),
        }},
        refetchQueries: [{
          query: listQuery,
          variables: {id},
        }]
      })
      .then(onDone)
    }}
    onDone={onDone}
  />
}

// const stripRecipe = ({title, tags, source, description, 'yield': yield_, yieldUnit, cookTime, prepTime, totalTime, ovenTemp, instructions, ingredients}) => ({
//   title,
//   tags: tags.map(tag => tag.id),
//   source,
//   description,
//   'yield': yield_,
//   yieldUnit,
//   cookTime,
//   prepTime,
//   totalTime,
//   ovenTemp,
//   ingredients: ingredients.map(({id, ingredient, amount, unit, comments}) => ({
//     id,
//     ingredient: ingredient.id, amount, unit, comments,
//   })),
//   instructions: instructions.map(({id, text, ingredientsUsed}) => ({
//     id,
//     text,
//     ingredientsUsed: ingredientsUsed || [],
//   })),
// })

export const updateListMutation = gql`
${listFragment}
mutation UpdateListMutation($id: ID!, $list: ListInput!) {
  updateList(id: $id, list: $list) {
    ...ListFragment
  }
}
`

export default compose(
  graphql(updateListMutation, {name: 'updateListMutation'}),
)(FullListEditor)
