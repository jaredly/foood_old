import React from 'react'
import ReactDOM from 'react-dom'
import {
  Link
} from 'react-router-dom'
import {ApolloProvider} from 'react-apollo'

import glamorous, {Div, Button, Input, Textarea} from 'glamorous'
import Checkmark from 'react-icons/lib/io/ios-checkmark-empty'
import Close from 'react-icons/lib/io/ios-close-empty'

import AddIngredient from './AddIngredient'

import {
    gql,
    graphql,
} from 'react-apollo';

import * as PropTypes from 'prop-types'
import AutoSelect from './AutoSelect'
import Form from './formative'

const {div} = glamorous

class ApolloClient extends React.Component {
  static contextTypes = {
    client: PropTypes.object,
    store: PropTypes.object,
  }

  render() {
    return this.props.children(this.context.client, this.context.store)
  }
}

const IngredientInput = ({value, onChange, data: {error, loading, ingredients}, blank}) => {
  if (error) return <div>Error</div>
  if (loading) return <div>Loading</div>
  return <ApolloClient>
    {(client, store) => <AutoSelect
      value={value}
      onChange={onChange}
      getName={option => option.name}
      options={ingredients}
      highlightEmpty={!blank}
      onAdd={(e, initialText) => {
        let pos
        if (e.clientX || e.clientY) {
          pos = {x: e.clientX, y: e.clientY}
        } else {
          const box = e.target.getBoundingClientRect()
          pos = {x: box.left, y: box.top}
        }
        addIngredient(initialText, client, store, pos.x, pos.y, id => {
          onChange(id)
        })
      }}
      addText='New ingredient'
      placeholder='Add Ingredient'
    />}
  </ApolloClient>
}

const isAncestor = (parent, node) => {
  while (node && node !== document.body) {
    if (node === parent) return true
    node = node.parentNode
  }
}


const addIngredient = (initialText, client, store, x, y, onDone) => {
  const node = document.createElement('div')

  const listen = e => {
    if (isAncestor(node, e.target)) {
      return
    }
    e.stopPropagation()
    e.preventDefault()
    cleanup()
  }

  const cleanup = () => {
    ReactDOM.unmountComponentAtNode(node)
    node.parentNode.removeChild(node)
    window.removeEventListener('mousedown', listen, true)
  }

  document.body.appendChild(node)
  window.addEventListener('mousedown', listen, true)

  ReactDOM.render(<ApolloProvider client={client} store={store}>
    <div
      style={{
        boxShadow: '0 0 5px #aaa',
        borderRadius: 4,
        backgroundColor: 'white',
        position: 'absolute',
        zIndex: 1000,
        top: y,
        left: x,
      }}
    >
      <AddIngredient
        onDone={onDone}
        onClose={cleanup}
        ingredient={{
          name: initialText
        }}
      />
    </div>
  </ApolloProvider>, node)
}

export const ingredientsQuery = gql`
# Maybe paging
query IngredientsQuery {
  ingredients {
    id
    name
    plural
  }
}
`

export default graphql(ingredientsQuery, {
  // options: ({id}) => ({
  //   // pollInterval: 60 * 1000,
  //   variables: {id},
  // })
})(IngredientInput)
