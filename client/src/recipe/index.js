import React from 'react';
import {
  Link
} from 'react-router-dom'

import {
    gql,
    graphql,
} from 'react-apollo';
import Modal from '../shared/Modal'

import Recipe from '../shared/Recipe'

const RecipePage = ({match: {params: {id}, url}, history, parent}) => {
  return <Recipe id={id} />
}

export default RecipePage

