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

class Recipe extends Component {
  state = {editing: false}

  done = () => this.setState({editing: false})

  render() {
    const {id} = this.props
    return <RecipeQuery id={id}>
      {({data: {error, loading, recipe}}) => {
        console.log('render')
        if (error) return <div>Unable to load the recipe</div>
        if (loading) return <div>Loading...</div>
        if (this.state.editing) {
          return <FullRecipeEditor id={id} recipe={recipe} onDone={this.done} />
        } else {
          return <RecipeCardBase
            recipe={recipe}
            onEdit={() => this.setState({editing: true})}
            expanded
          />
        }
      }}
    </RecipeQuery>
  }
}

export default Recipe
