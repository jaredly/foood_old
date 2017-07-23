import React from 'react';
import {
  Link
} from 'react-router-dom'

import {
    gql,
    graphql,
} from 'react-apollo';
import glamorous, {Div} from 'glamorous'

import RecipeCard from '../shared/RecipeCard'

const {div} = glamorous

const Backdrop = div({
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
})

const Inner = div({
  width: 500,
  height: 600,
  boxShadow: '0 3px 10px #000',
  backgroundColor: 'white',
  borderRadius: 3,
})

const Recipe = ({match: {params: {id}, url}, history}) => {
  const parent = url.split('/').slice(0, -2).join('/') || '/'
  return <Backdrop onMouseDown={() => history.push(parent)}>
    <Inner>
      <RecipeCard id={id} expanded />
      TODO comments
    </Inner>
  </Backdrop>
}

export default Recipe

