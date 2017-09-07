// @flow
import React from 'react';
import {
  Link
} from 'react-router-dom'

import glamorous, {Div, Button, Input, Textarea} from 'glamorous'
import {
    gql,
    graphql,
    compose,
} from 'react-apollo';
import Edit from 'react-icons/lib/io/edit';
import Close from 'react-icons/lib/io/close';
import {smallUnit, fractionify} from './importUtils'
import lively from './lively'
import ListInput from './ListInput'

const RecipeListEditor = ({
  data: {error, loading, recipe},
  removeMutation,
  addMutation,
}) => {
  if (loading) return <div>Loading</div>
  if (error) return <div>{JSON.stringify(error)}</div>
  return <div>
    {recipe.lists.map(({id, title}) => (
      <div style={{flexDirection: 'row', padding: 8, alignItems: 'center'}}>
        <button
        style={{
          border: 'none',
          backgroundColor: 'transparent',
          cursor: 'pointer',
          padding: 8,
          margin: 0,
        }}
          onClick={() => {
            removeMutation({
              variables: {id, recipe: recipe.id},
              update: (store, {data: {removeRecipeFromList}}) => {
                const data = store.readQuery({query: listQuery, variables: {id: recipe.id}})
                data.recipe.lists = data.recipe.lists.filter(l => l.id !== id)
                store.writeQuery({query: listQuery, variables: {id: recipe.id}, data})
                // TODO remove from the list query
              }
            })
          }}
        >
          <Close/>          
        </button>
        <div>{title}</div>
        <div style={{flex: 1}}/>
      </div>
    ))}
    <ListInput exclude={recipe.lists.map(l => l.id)} onSelect={({id, title}) => {
      console.log('slect', id, title)
      addMutation({
        variables: {id, recipe: recipe.id},
        update: (store, {data: {addRecipeToList}}) => {
          const data = store.readQuery({query: listQuery, variables: {id: recipe.id}})
          const list = store.readFragment({
            fragment: gql`
              fragment MyFragment on List {
                id
                title
              }`,
            id: `List:${id}`,
          })
          data.recipe.lists.push(list)
          store.writeQuery({query: listQuery, variables:{id: recipe.id}, data})
        }
      })
    }}/>
  </div>
}

export const listQuery = gql`
query RecipeListEditorQuery($id: ID!) {
  recipe(id: $id) {
    id
    lists {
      id
      title
    }
  }
}
`

export const removeMutation = gql`
mutation RemoveRecipeFromList($id: ID!, $recipe: ID!) {
  removeRecipeFromList(id: $id, recipe: $recipe)
}
`

export const addMutation = gql`
mutation AddRecipeToList($id: ID!, $recipe: ID!) {
  addRecipeToList(id: $id, recipe: $recipe)
}
`

export default compose(
  graphql(listQuery, {options: ({id}) => ({variables: {id}})}),
  graphql(removeMutation, {name: 'removeMutation'}),
  graphql(addMutation, {name: 'addMutation'}),
)(RecipeListEditor)