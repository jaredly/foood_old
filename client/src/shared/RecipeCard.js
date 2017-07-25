import React from 'react';
import {
  Link
} from 'react-router-dom'

import glamorous, {Div, Button, Input, Textarea} from 'glamorous'
import {
    gql,
    graphql,
} from 'react-apollo';
import Edit from 'react-icons/lib/io/edit';

const TopButton = glamorous.div({
  cursor: 'pointer',
  backgroundColor: 'transparent',
  border: 'none',
  padding: 0,
  // padding: 8,
  ':hover': {
    backgroundColor: '#eee',
  }
})

export const RecipeCardBase = ({onEdit, expanded, recipe}) => {
  const {
    id,
    title,
    description,
    author: {name}, created, updated, tags, source,
    ['yield']: yield_,
    yieldUnit,
    cookTime,
    prepTime,
    totalTime,
    ingredients,
    instructions,
  } = recipe

  return <div style={{
    backgroundColor: 'white',
    // boxShadow: '0 0 3px #aaa',
  }}>
    <div style={{
      padding: 10,
      borderBottom: '1px solid #aaa',
      flexDirection: 'row',
    }}>
      <div style={{
        marginRight: 10,
      }}>
        {title}
      </div>
      <div style={{
        color: '#777',
        fontSize: '80%',
      }}>
        by {name}
      </div>
      <div style={{flex: 1}}/>
      {expanded && 
      <TopButton onClick={onEdit}>
        <Edit size={20}/>
      </TopButton>
      }
    </div>
    <div style={{
      padding: 5,
    }}>
      {ingredients.map(({amount, unit, comments, ingredient: {id, name, plural}}, i) => (
        <div style={{
          display: 'block',
          padding: 5,
        }} key={i}>
          {amount} {unit} {name} {comments}
        </div>
      ))}  
    </div>
    <div style={{
      padding: 10,
      fontStyle: 'italic',
      color: '#777',
      fontSize: '80%',
    }}>
      {description}
    </div>
    {expanded && <ol>
      {instructions.map(({text, ingredientsUsed}, i) => (
        <li key={i}>
          {text}
        </li>
      ))}
    </ol>}
  </div>
}

const RecipeCard = ({onEdit, expanded, data: {recipe, error, loading}}) => {
  if (error) return <div>{error}</div>
  if (loading) return <div>loading</div>
  return <RecipeCardBase onEdit={onEdit} expanded={expanded} recipe={recipe} />
}

// TODO allow you to check of things as you do them
// (doesn't persist across refreshes probably?)
// maybe it would though. but you could "clear out" super easy
// Also it would be browser-local, prolly localStorage

export const recipeCardFragment = gql`
fragment RecipeCardFragment on Recipe {
  id
  title
  description
  author {name}
  created
  updated
  yield
  yieldUnit
  tags {id, name}
  source
  cookTime
  prepTime
  totalTime
  instructions {
    text
    ingredientsUsed { id }
  }
  ingredients {
    amount
    unit
    comments
    ingredient {id, name, plural}
  }
}
`

export const recipeCardQuery = gql`
${recipeCardFragment}
query RecipeCardQuery($id: ID!) {
  recipe(id: $id) {
    ...RecipeCardFragment
  }
}
`

export const RecipeQuery = graphql(recipeCardQuery, {
  options: ({id}) => ({
    // pollInterval: 60 * 1000,
    variables: {id},
  })
})(({data, children}) => children({data}))

export default graphql(recipeCardQuery, {
  options: ({id}) => ({
    // pollInterval: 60 * 1000,
    variables: {id},
  })
})(RecipeCard)

