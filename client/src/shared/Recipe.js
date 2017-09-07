import React, {Component} from 'react';
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
import FullRecipeEditor from './FullRecipeEditor'
import {RecipeCardBase} from './RecipeCard'

import lively from './lively'

const Recipe = lively({editing: false}, ({id, noBorder, onBack, onDelete, update, editing}) => {
  const body = <RecipeQuery id={id}>
    {({data: {error, loading, recipe}}) => {
      if (error) return <div>Unable to load the recipe</div>
      if (loading) return <div>Loading...</div>
      if (editing) {
        return <FullRecipeEditor id={id} recipe={recipe} onDelete={onDelete} onDone={update({editing: false})} />
      } else {
        return <RecipeCardBase
          recipe={recipe}
          onClose={onBack}
          onEdit={update({editing: true})}
          expanded
        />
      }
    }}
  </RecipeQuery>

  if (noBorder) return body
  return <div style={{
    margin: 20,
    backgroundColor: 'white',
    boxShadow: '0 0 5px #aaa',
    borderRadius: 4,
  }}>{body}</div>
})

export default Recipe
