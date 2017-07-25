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
import {listFragment, listQuery} from '../shared/List'

const parseSearch = search => search
  ? search.slice(1).split('&').map(m => m.split('=').map(decodeURIComponent))
    .reduce((obj, [key, val]) => (obj[key] = val, obj), {})
  : {}

const AddRecipe = ({
  match: {params: {id}, url},
  history,
  location: {search},
  addRecipeMutation,
  addRecipeToLists,
}) => {
  const target = parseSearch(search).target
  return <RecipeEditor
    recipe={null}
    lists={target ? [+target] : []}
    action="Create"
    onAction={({error, loading, ...recipe}, lists) =>
      addRecipeMutation({variables: {
        recipe: {
          instructions: [],
          ingredients: [],
          description: '',
          ...recipe,
          tags: [],
        }
      }})
      // TODO it would be nice to add & add to lists in one fell swoop
      // but this works for now
      .then(// lists && lists.length
      // TODO support custom list additions
        target
        ? ({data}) => (console.log('res', data), addRecipeToLists({
          variables: {
            recipe: data.addRecipe.id,
            lists: [target],
          },
          // TODO might be nice to use an `update` function, b/c I know how this ends
          refetchQueries: [target].map(lid => ({
            query: listQuery,
            variables: {id: lid},
          }))
        }))
        : () => {})
        .then(data => console.log('lists', data))
      .then(history.goBack)
    }
    onDone={history.goBack}
  />
}

export const addRecipeMutation = gql`
${recipeCardFragment}
mutation AddRecipeMutation($recipe: RecipeInput!) {
  addRecipe(recipe: $recipe) {
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
  graphql(addRecipeToLists, {name: 'addRecipeToLists'}),
)(AddRecipe)
