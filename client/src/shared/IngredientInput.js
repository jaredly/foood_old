import React from 'react'
import ReactDOM from 'react-dom'
import {
  Link
} from 'react-router-dom'
import {ApolloProvider, compose} from 'react-apollo'

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

const IngredientInput = ({value, onChange, addIngredient, data: {error, loading, ingredients}, blank}) => {
  if (error) return <div>Error</div>
  if (loading) return <div>Loading</div>
  return <ApolloClient>
    {(client, store) => <AutoSelect
      value={value}
      onChange={onChange}
      getName={option => option.name}
      options={ingredients}
      highlightEmpty={!blank}
      onAdd={text => {
        return addIngredient({
          variables: {ingredient: {
            name: text,
            plural: null,
            defaultUnit: null,
          }},
          refetchQueries: [{
            query: ingredientsQuery,
          }]
        })
        .then(({data: {addIngredient: {id, name}}}) => onChange(id))
      }}
      addText='New'
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


// const addIngredient = (initialText, client, store, x, y, onDone) => {
//   const node = document.createElement('div')

//   const listen = e => {
//     if (isAncestor(node, e.target)) {
//       return
//     }
//     e.stopPropagation()
//     e.preventDefault()
//     cleanup()
//   }

//   const cleanup = () => {
//     ReactDOM.unmountComponentAtNode(node)
//     node.parentNode.removeChild(node)
//     window.removeEventListener('mousedown', listen, true)
//   }

//   document.body.appendChild(node)
//   window.addEventListener('mousedown', listen, true)

//   ReactDOM.render(<ApolloProvider client={client} store={store}>
//     <div
//       style={{
//         boxShadow: '0 0 5px #aaa',
//         borderRadius: 4,
//         backgroundColor: 'white',
//         position: 'absolute',
//         zIndex: 1000,
//         top: y,
//         left: x,
//       }}
//     >
//       <AddIngredient
//         onDone={onDone}
//         onClose={cleanup}
//         ingredient={{
//           name: initialText
//         }}
//       />
//     </div>
//   </ApolloProvider>, node)
// }

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

export const addIngredient = gql`
mutation AddIngredientMutation($ingredient: IngredientInput!) {
  addIngredient(ingredient: $ingredient) {
    id
    name
    plural
    defaultUnit    
  }
}
`

export default compose(
  graphql(addIngredient, {name: 'addIngredient'}),
  graphql(ingredientsQuery)
)(IngredientInput)
