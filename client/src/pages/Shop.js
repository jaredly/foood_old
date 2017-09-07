import React from 'react';
import {
  Link
} from 'react-router-dom'

import {
    gql,
    graphql,
} from 'react-apollo';

import {ListView, listFragment} from '../shared/List'
import FullListEditor from '../shared/FullListEditor'
import lively from '../shared/lively'
import glamorous, {Div} from 'glamorous'
import {smallUnit, fractionify} from '../shared/importUtils'

const Container = glamorous.div({
  alignItems: 'stretch',
  alignSelf: 'center',
  padding: 10,
  width: 600,
  maxWidth: '100%',
  overflowX: 'auto',
})

const ShopPage = lively({editing: false, quantities: {}, customAmounts: {}, gotten: {}}, ({
  editing, quantities, gotten, update, match: {params: {id}}, history, data: {list, loading, error}
}) => {
  if (error) return <div>{JSON.stringify(error, null, 2)} error</div>
  if (loading) return <div>loading</div>
  const {title, recipes} = list
  const ingredients = {}
  const ingredientMap = {}
  recipes.forEach(recipe => {
    recipe.ingredients.forEach(({amount, unit, ingredient}) => {
      ingredientMap[ingredient.id] = ingredient
      unit = unit || ''
      const num = (quantities[recipe.id] || 1) * amount
      if (ingredients[ingredient.id] && ingredients[ingredient.id][unit]) {
        ingredients[ingredient.id][unit] += num
      } else {
        ingredients[ingredient.id] = {
          ...ingredient[ingredient.id],
          [unit]: num,
        }
      }
    })
  })

  return <Container>
    <div style={{fontSize: 24, textAlign: 'center', margin: 8,}}>
      <Link style={{textDecoration: 'underline'}} to={`/list/${id}`}>{title}</Link> shopping list
    </div>
    {/* <div>
      Edit recipe quantities
    </div> */}
    <div style={{margin: '8px 0', textDecorationLineThrough: true}}>
      {Object.keys(ingredients).map(id => (
        <Div 
        onClick={update(() => ({gotten: {...gotten, [id]: !gotten[id]}}))}
        css={{
          flexDirection: 'row',
          cursor: 'pointer',
          padding: '8px 12px',
          fontSize: 24,
          borderRadius: 2,
          margin: '4px 0',
          backgroundColor: gotten[id] ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.4)',
          color: gotten[id] ? '#aaa' : '',
            textDecorationLine: gotten[id] ? 'line-through' : '',
          ':hover': {
            backgroundColor: gotten[id] ? '' : 'rgba(255,255,255, 0.7)',
          }
        }}>
          <div style={{
          }}>
            {ingredientMap[id].name}
          </div>
          <div style={{flexBasis: 24}}/>
          {Object.keys(ingredients[id]).map(unit => (
            <div style={{flexDirection: 'row'}}>
              <div style={{display: 'inline'}}>
              {fractionify(ingredients[id][unit])} {smallUnit(unit)}
              </div>
            </div>
          ))}
        </Div>
      ))}
    </div>
  </Container>
})

export const shopQuery = gql`
query ShopQuery($id: ID!) {
  list(id: $id) {
    updated
    author {id, name}
    title
    # TODO paging
    recipes {
      id
      title
      ingredients {
        amount
        unit
        comments
        ingredient {id, name, plural}
      }
    }
  }
}
`

export default graphql(shopQuery, {
  options: ({match: {params: {id}}}) => ({
    // pollInterval: 60 * 1000,
    variables: {id},
  }),
})(ShopPage)

