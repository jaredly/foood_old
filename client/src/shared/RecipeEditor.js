import React from 'react';
import {
  Link
} from 'react-router-dom'

import glamorous, {Div, Button, Input, Textarea} from 'glamorous'
import Checkmark from 'react-icons/lib/io/ios-checkmark-empty'
import Close from 'react-icons/lib/io/ios-close-empty'
import RecipeInput from './RecipeInput'

import AutoSelect from './AutoSelect'
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
  return <AutoSelect
    value={value}
    onChange={onChange}
    options={options}
    placeholder={placeholder}
  />

  // return <select style={{flex: 1}} value={value || ''} onChange={e => {
  //   onChange(e.target.value)    
  // }}>
  //   <glamorous.Option disabled css={{fontStyle: 'italic', color: '#aaa'}} value="">{placeholder}</glamorous.Option>
  //   {options.map(({id, name, plural}) => <option key={id} value={id}>{plural || name}</option>)}
  // </select>
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
  flexShrink: 0,
})

const Title = glamorous.input({
  fontSize: 20,
  fontWeight: 'bold',
  border: 'none',
  flex: 1,
  padding: '8px 16px',
  backgroundColor: 'transparent',
})

const validate = ({title, ingredients, instructions}) => {
  if (!title) return 'Title is required'
  // if (!ingredients.length) return 'Must have at least one ingredient'
  // if (!instructions.length) return 'Must have at least one instruction'
}

const RecipeEditor = ({recipe, onAction, action, onDone}) => {
  return <Form initial={recipe} onSubmit={onAction}>
    {({text, float, bool, list, toggle, set}, data, isModified) => (
      <Div css={{flex: 1}}>
        <Row css={{
            borderBottom: '1px solid #aaa',
            marginBottom: 5,
        }}>
          <Title {...text('title')} placeholder="Title" />
          <TopButton onClick={() => {
            if (!isModified) return onDone()
            const error = validate(data)
            if (error) {
              set('error', error)
            } else {
              set('error', null)
              set('loading', true)
              onAction(data)
              .then(
                () => set('loading', false),
                err => (set('loading', false), set('error', err + ''))
              )
            }
          }}>
            <Checkmark color="green" size={46} />
          </TopButton>
          <TopButton onClick={onDone}>
            <Close size={46} color="gray" />
          </TopButton>
        </Row>
        <Div css={{padding: '10px 20px', flex: 1, overflow: 'auto'}}>
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
  blank: () => ({amount: 1, ingredient: null, unit: ''}),
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
        {data ? i + 1 + '.' : 'new'}
      </Div>
      <AmountInput {...float('amount', 1)} placeholder="Amount" />
      {/* TODO defaultunit? */}
      <UnitInput {...text('unit')} placeholder="Unit" />
      <RecipeInput
        {...custom('ingredient')}
      />
      {/* <Dropdown
        {...custom('ingredient')}
        placeholder="Ingredient"
        options={ingredients}
      /> */}
      <IngredientCommentsInput {...text('comments')} placeholder="Comments" />
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
  blank: () => ({text: '', ingredientsUsed: []}),
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
      <InstructionInput {...text('text')} placeholder="Instruction Text" />
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
  width: 40,
  fontSize: 14,
  backgroundColor: 'transparent',
  color: 'currentColor',
  textAlign: 'right',
  fontStyle: 'inherit',
  border: 'none',
  padding: 8,
  ':hover': {
    outline: '1px solid #aaa',
    zIndex: 2,
  }
})

const IngredientCommentsInput = glamorous.input({
  width: 70,
  fontSize: 10,
  backgroundColor: 'transparent',
  color: 'currentColor',
  padding: '8px',
  fontStyle: 'inherit',
  border: 'none',
  flex: 1,
  ':hover': {
    outline: '1px solid #aaa',
    zIndex: 2,
  }
})

const InstructionInput = glamorous.input({
  flex: 1,
  fontStyle: 'inherit',
  border: 'none',
  padding: 5,
  alignSelf: 'stretch',
  ':hover': {
    outline: '1px solid #aaa',
    zIndex: 2,
  }
})

const UnitInput = glamorous.input({
  width: 50,
  backgroundColor: 'transparent',
  fontStyle: 'inherit',
  border: 'none',
  padding: 8,
  ':hover': {
    outline: '1px solid #aaa',
    zIndex: 2,
  }
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
    zIndex: 2,
  }
})

export default RecipeEditor
