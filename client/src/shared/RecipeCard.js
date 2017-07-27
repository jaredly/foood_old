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
  padding: 11,
  // padding: 8,
  ':hover': {
    backgroundColor: '#eee',
  }
})

const Title = glamorous.div({
  fontSize: 20,
  fontWeight: 'bold',
  margin: '8px 0',
})

const SubTitle = glamorous.div({
  fontSize: 18,
})

const Section = glamorous.div({
  padding: 16,
})

export const RecipeCardBase = ({onEdit, expanded, recipe}) => {
  const {
    id,
    title,
    description,
    author: {name},
    created,
    updated,
    tags,
    source,
    ['yield']: yield_,
    yieldUnit,
    cookTime,
    prepTime,
    totalTime,
    ingredients,
    instructions,
  } = recipe

  return <div style={{flex: 1}}>
    <div style={{
      borderBottom: '1px solid #aaa',
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
    }}>
      <div style={{flexBasis: 16}} />
      <Title>{title}</Title>
      <div style={{flexBasis: 8}} />
      <div style={{
        color: '#777',
        fontSize: '80%',
        margin: '8px 0',
        marginLeft: 16,
      }}>
        by {name}
      </div>
      <div style={{flex: 1}}/>
      {expanded && 
      <TopButton onClick={onEdit}>
        <Edit size={24}/>
      </TopButton>}
    </div>

    <div style={{
      flex: 1,
      overflow: 'auto',
    }}>
    <Section style={{
      fontStyle: 'italic',
      color: '#777',
      fontSize: '80%',
    }}>
      {description}
    </Section>
    <Section>
      <SubTitle>Ingredients</SubTitle>
      <div style={{
        margin: '16px 0px',
        display: 'grid',
        gridTemplateColumns: 'max-content max-content max-content',
        gridGap: '8px 8px',
        backgroundColor: '#fff',
        color: '#444',
      }}>
      {ingredients.map(({amount, unit, comments, ingredient: {id, name, plural}}, i) => (
          [<div style={{textAlign: 'right'}} key={id + 'a'}>
            {amount}
          </div>,
          <div key={id + 'c'}>
            {unit}
          </div>,
          <div key={id + 'b'} style={{marginLeft: 8, flexDirection: 'row'}}>
            {name}
            <div style={{fontStyle: 'italic', marginLeft: 16}}>
              {comments}
            </div>
          </div>]
      ))}
      </div>
    </Section>
    {expanded && <Section>
      <SubTitle>Instructions</SubTitle>
        <ol style={{margin: 16, paddingLeft: 8}}>
        {instructions.map(({text, ingredientsUsed}, i) => (
          <li key={i} style={{
            padding: '4px 8px',
            fontSize: 16,
            lineHeight: '24px',
          }}>
            {text}
          </li>
        ))}
      </ol>
    </Section>}
    </div>
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

