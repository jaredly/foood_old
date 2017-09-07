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
import Close from 'react-icons/lib/io/close';
import {smallUnit, fractionify} from './importUtils'


const TopButton = glamorous.div({
  cursor: 'pointer',
  backgroundColor: 'transparent',
  border: 'none',
  padding: 7,
  ':hover': {
    backgroundColor: '#eee',
  }
})

const Title = glamorous.div({
  fontSize: 20,
  flex: 1,
  // alignSelf: 'center',
  whiteSpace: 'normal',
  fontWeight: 'bold',
  maxWidth: '100%',
  margin: 8,
})

const SubTitle = glamorous.div({
  fontSize: 16,
  alignItems: 'center',
  flexDirection: 'row',
  fontWeight: 'bold',
})

const Section = glamorous.div({
  padding: '0 16px',
})

const linkRegex = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/gi;

const maybePrefix = text => text.match(/^http/) ? text : 'http://' + text

const linkify = source => {
  if (!source) return null
  const match = source.match(linkRegex)
  if (!match) return source
  const index = source.indexOf(match[0])
  return [
    source.slice(0, index),
    <a key="aa" style={{color: 'blue'}} target="_blank" href={maybePrefix(match[0])}>source</a>,
    source.slice(index + match[0].length),
  ]
}

const Header = glamorous.div({
  borderBottom: '1px solid #aaa',
  flexDirection: 'row',
  alignItems: 'center',
})

const Author = glamorous.div({
  color: '#777',
  fontSize: '80%',
  margin: '8px 0',
  marginLeft: 16,
})

const Ingredients = glamorous.div({
  display: 'grid',
  // gridTemplateColumns: '20px max-content max-content 1fr',
  gridGap: '0px 0px',
  backgroundColor: '#fff',
  color: '#444',
})

const maybePositiveInt = t => {
  const m = parseFloat(t)
  if (isNaN(m)) return 0
  if (m <= 0) return 0
  return m
}

export const RecipeCardBase = ({recipe}) => {
  const {
    id, title, description, author: {name}, created, updated, tags, source,
    'yield': yield_, yieldUnit, cookTime, prepTime, totalTime,
    ingredients,
    instructions,
    ovenTemp,
  } = recipe

  return <div style={{flex: 1}}>
    <Header>
      <Title>{title}</Title>
    </Header>

    <div style={{
      flex: 1,
      overflow: 'auto',
    }}>
      <Strut size={16} />
      {description && <Section style={{
        fontStyle: 'italic',
        color: '#777',
        fontSize: '80%',
      }}>
        {description}
      </Section>}
      <Strut size={16} />
      {miscRow({source, ovenTemp, cookTime, prepTime, totalTime, yieldUnit, 'yield': yield_})}
      <Section>
        <SubTitle>
          Ingredients
        </SubTitle>
        <Strut size={16} />
        <Ingredients css={{gridTemplateColumns: 'max-content max-content 1fr'}}>
        {ingredients.map(({amount, unit, comments, ingredient: {id, name, plural}}, i) => {
            const style = {
              cursor: 'normal',
              padding: 4,
              backgroundColor: 'white'
            }
            return [<div style={{
              textAlign: 'right', fontWeight: 'normal',
              ...style,
            }} key={id + 'a'}>
              {fractionify(amount).slice(0, 5)}
            </div>,
            <div key={id + 'c'} style={{color: '#555', ...style}}>
              {smallUnit(unit)}
            </div>,
            <div key={id + 'b'} style={{...style, paddingLeft: 8, flexDirection: 'row'}}>
              {name}
              <div style={{fontStyle: 'italic', marginLeft: 16, flex: 1}}>
                {comments}
              </div>
            </div>]
        })}
        </Ingredients>
      </Section>
      <Strut size={24} />
    </div>
  </div>
}


const interspersed = (list, maker) => {
  const res = []
  list.forEach((item, i) => {
    if (i !== 0) {
      res.push(maker(i))
    }
    res.push(item)
  })
  return res
}

const Row = glamorous.div({flexDirection: 'row'})
const Strut = ({size}) => <div style={{flexBasis: size}} />

const miscRow = ({source, 'yield': yield_, yieldUnit, ovenTemp, cookTime, prepTime, totalTime}) => {
  const items = []
  if (source) items.push(<Row key='s'>{linkify(source)}</Row>)
  if (yield_) items.push(<span key='y'>Makes {yield_} {yieldUnit}</span>)
  if (ovenTemp) items.push(<span key='o'>Oven temp: {ovenTemp}˚F</span>)
  // TODO format time nice
  if (prepTime) items.push(<span key='p'>Prep time: {prepTime}m</span>)
  if (cookTime) items.push(<span key='c'>Cook time: {cookTime}m</span>)
  if (totalTime) items.push(<span key='t'>Total time: {totalTime}m</span>)
  if (!items.length) return
  return <Row
    css={{
      padding: '8px 16px',
      fontSize: 14,
      flexWrap: 'wrap',
      marginBottom: 16,
    }}
  >
    {interspersed(items, i => <Strut size={16} key={i} />)}
  </Row>
}

const RecipeCard = ({onEdit, onClose, expanded, data: {recipe, error, loading}}) => {
  if (error) return <div>{error}</div>
  if (loading) return <div style={{padding: 40}}>loading</div>
  return <RecipeCardBase onEdit={onEdit} onClose={onClose} expanded={expanded} recipe={recipe} />
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
  ovenTemp
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


