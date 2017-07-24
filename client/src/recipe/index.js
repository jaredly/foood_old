import React from 'react';
import {
  Link
} from 'react-router-dom'

import {
    gql,
    graphql,
} from 'react-apollo';
import Modal from '../shared/Modal'

import RecipeCard from '../shared/RecipeCard'

const Recipe = ({match: {params: {id}, url}, history}) => {
  const parent = url.split('/').slice(0, -2).join('/') || '/'
  return <Modal onBack={() => history.replace(parent)}>
    <RecipeCard id={id} expanded />
    TODO comments
  </Modal>
}

export default Recipe

