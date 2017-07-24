import React from 'react';
import {
  Link
} from 'react-router-dom'

import glamorous, {Div, Button, Input, Textarea} from 'glamorous'
import Checkmark from 'react-icons/lib/io/ios-checkmark-empty'
import Close from 'react-icons/lib/io/ios-close-empty'

import Form from './formative'

const {div} = glamorous

const ingredients = [{
  id: '2',
  name: 'egg',
  plural: 'eggs',
}, {
  id: '3',
  name: 'milk',
}, {
  id: '4',
  name: 'whole wheat flour',
}, {
  id: '5',
  name: 'olive oil',
}];

// Soooo the main reason for making this state-holding component is that
// making component state is annoying.
// So I can just do `...text('title')` and it will give me
//  value & onChange for frees
// buuut what else do I want?
// should it do validation? prolly not
// should it do submission? maybe not
// should it do error reporting? I guess not
// although maybe?

// also for lists, it's nice to be able to have it add things to the list
// w/ a good null state

const Dropdown = ({value, onChange, placeholder, options}) => {
  return <select style={{flex: 1}} value={value} onChange={e => {
    onChange(e.target.value)    
  }}>
    <glamorous.Option css={{fontStyle: 'italic', color: '#aaa'}} value="">{placeholder}</glamorous.Option>
    {options.map(({id, name}) => <option key={id} value={id}>{name}</option>)}
  </select>
}

const Row = div({flexDirection: 'row', alignItems: 'center'})

const Label = div({fontSize: 12, marginBottom: 5, marginTop: 15})

const Spring = div({flex: 1})
const Strut = ({size}) => <div style={{flexBasis: size}} />

const SourceInput = glamorous.input({
  marginLeft: 5,
  fontSize: 12,
  border: 'none',
  padding: 5,
  borderBottom: '1px solid #aaa',
  flex: 1,
})

const TopButton = glamorous.button({
  cursor: 'pointer',
  backgroundColor: 'transparent',
  border: 'none',
  padding: 0,
  // padding: 8,
  ':hover': {
    backgroundColor: '#eee',
  }
})

const Description = glamorous.textarea({
  fontSize: 10,
  fontStyle: 'italic',
  border: '1px solid #ddd',
  padding: 10,
})

const Title = glamorous.input({
  fontSize: 20,
  fontWeight: 'bold',
  border: 'none',
  flex: 1,
  padding: 10,
  backgroundColor: 'transparent',
})

const validate = ({title, ingredients, instructions}) => {
  if (!title) return 'Title is required'
  if (!ingredients.length) return 'Must have at least one ingredient'
  if (!instructions.length) return 'Must have at least one instruction'
}

const RecipeEditor = ({recipe, onAction, action}) => {
  return <Form initial={recipe} onSubmit={onAction}>
    {({text, float, bool, list, toggle, set}, data) => (
      <Div>
        <Row css={{
            borderBottom: '1px solid #aaa',
            marginBottom: 5,
        }}>
          <Title {...text('title')} placeholder="Title" />
          <TopButton onClick={() => {
            const error = validate(data)
            if (error) {
              set('error', error)
            } else {
              set('error', null)
              onAction(data)
            }
          }}>
            <Checkmark color="green" size={50} />
          </TopButton>
          <TopButton>
            <Close size={50} color="gray" />
          </TopButton>
        </Row>
        <Div css={{padding: 10}}>
          {data.error}
          <Row css={{fontSize: 10}}>
            <Row
              css={{fontSize: 10, marginRight: 20}}
              onClick={() => toggle('isPublic', true)}
            >
              <input type="checkbox" {...bool('isPublic', true)} />
              is public
            </Row>
            Source
            <SourceInput {...text('source')} placeholder="(url or text)" />
          </Row>
          <Label>Description</Label>
          <Description {...text('description')} />
          <Label>Ingredients</Label>
          {list(ingredientsList)}
          <Label>Instructions</Label>
          {list(instructionsList)}
        </Div>
      </Div>
    )}
  </Form>
}

const ingredientsList = {
  name: 'ingredients',
  container: ({children, add}) => <Div
    children={children}
    css={{
      margin: 0,
      padding: 0,
      fontSize: 10,
    }}
  />,
  item: ({text, float, custom, remove}, data, i) => (
    <Row key={i} css={[
      {margin: 0, minHeight: 30},
      data === null && {
        color: '#888',
        fontStyle: 'italic',
      }
    ]}>
      <Div css={{
        marginRight: 10,
        marginLeft: 5,
        width: 10,
      }}>
        {data ? i + 1 + '.' : ''}
      </Div>
      <AmountInput {...float('amount', 1)} placeholder="Amount" />
      {/* TODO defaultunit? */}
      <UnitInput {...text('unit')} placeholder="Unit" />
      <Dropdown
        {...custom('ingredient')}
        placeholder="Ingredient"
        options={ingredients}
      />
      <Strut size={12} />
      {data 
        ? <RowDeleteButton onClick={remove}>
            <Close size={20} />
          </RowDeleteButton>
        : <Strut size={30} />}
    </Row>
  )
}

const instructionsList = {
  name: 'instructions',
  container: ({children, add}) => <Div
    children={children}
    css={{
      margin: 0,
      padding: 0,
      fontSize: 10,
    }}
  />,
  item: ({text, float, custom, remove}, data, i) => (
    <Row key={i} css={[
      {margin: 0, minHeight: 30},
      data === null && {
        color: '#888',
        fontStyle: 'italic',
      }
    ]}>
      <Div css={{
        marginRight: 10,
        marginLeft: 5,
        width: 10,
      }}>
        {data ? i + 1 + '.' : ''}
      </Div>
      <InstructionInput {...text('text')} placeholder="Text" />
      <Strut size={12} />
      {data 
        ? <RowDeleteButton onClick={remove}>
            <Close size={20} />
          </RowDeleteButton>
        : <Strut size={30} />}
    </Row>
  )
}

const AmountInput = glamorous.input({
  width: 30,
  fontSize: 14,
  backgroundColor: 'transparent',
  color: 'currentColor',
  textAlign: 'right',
  fontStyle: 'inherit',
  border: 'none',
})

const InstructionInput = glamorous.input({
  flex: 1,
  fontStyle: 'inherit',
  border: 'none',
  padding: 5,
  alignSelf: 'stretch',
})

const UnitInput = glamorous.input({
  width: 50,
  backgroundColor: 'transparent',
  fontStyle: 'inherit',
  border: 'none',
})

const RowDeleteButton = glamorous.button({
  // width: 30,
  backgroundColor: 'transparent',
  border: 'none',
  padding: 5,
  // fontSize: 12,
  fontWeight: 'bold',
  cursor: 'pointer',
  // borderRadius: 5,
  ':hover': {
    backgroundColor: '#eee',
  }
})

export default RecipeEditor

  // return <Form>
  //   <Input name="title" placeholder="Title" />
  //   <Input name="source" placeholder="Source" />
  //   <Textarea name="description" />
  //   <List name="ingredients">
  //     {({items, }) => (
  //       <ol>
  //         {items.map(item => (
  //           <li>
  //             <Input type="float" name="amount" />
  //             <Input type="unit" />
  //             TODO autocomplete for ingredient
  //           </li>
  //         ))}
  //       </ol>
  //     )}
  //   </List>
  // </Form>

const rejections = `
        <ol>
        {list('ingredients')(
          ({text, float}) => (
            <li>
              <input {...float('amount', 1)} placeholder="Amount" />
              {/* TODO defaultunit? */}
              <input {...text('unit')} placeholder="Unit" />
              <input {...text()}
            </li>
          )
        )}
        </ol>
        <List name="ingredients">
          {({items, }) => (
            <ol>
              {items.map(item => (
                <li>
                  <Input type="float" name="amount" />
                  <Input type="unit" />
                  TODO autocomplete for ingredient
                </li>
              ))}
            </ol>
          )}
        </List>
`