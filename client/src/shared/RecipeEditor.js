import React from 'react';
import {
  Link
} from 'react-router-dom'

import glamorous, {Div, Button, Input, Textarea} from 'glamorous'
import Checkmark from 'react-icons/lib/io/ios-checkmark-empty'
import Close from 'react-icons/lib/io/ios-close-empty'
import IngredientInput from './IngredientInput'
import GrowingTextarea from './GrowingTextarea'

import AutoSelect from './AutoSelect'
import Form from './formative'
import RecipeImporter from './RecipeImporter'

const {div} = glamorous

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
}

const Row = div({flexDirection: 'row', alignItems: 'center'})

const Label = div({fontSize: 12, marginBottom: 5, marginTop: 15})

const Spring = div({flex: 1})
const Strut = ({size}) => <div style={{flexBasis: size}} />

const SourceInput = glamorous.input({
  marginLeft: 5,
  fontSize: 12,
  border: 'none',
  padding: 4,
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

const Description = glamorous(GrowingTextarea)({
  fontSize: 16,
  fontStyle: 'italic',
  border: '1px solid #ddd',
  padding: 8,
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
  return <Form initial={recipe}>
    {({text, float, bool, list, toggle, set, setMany}, data, isModified) => (
      <Div css={{flex: 1}}>
        <Row css={{
            borderBottom: '1px solid #aaa',
            marginBottom: 8,
        }}>
          <Title {...text('title')} autoFocus placeholder="Title" />
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
          {miscRow(text, float)}
          <Strut size={8} />
          {sourceRow(bool, text, toggle)}
          <Label>Description</Label>
          <Description {...text('description')} />
          <Label>Ingredients</Label>
          {list(ingredientsList)}
          <Label>Instructions</Label>
          {list(instructionsList)}
        </Div>
        <RecipeImporter
          onDone={recipe => {
            setMany(recipe)
          }}
        />
      </Div>
    )}
  </Form>
}

const miscRow = (text, float) => <Row css={{fontSize: 12}}>
  Yield
  <Strut size={8} />
  <Input {...float('yield', '')}
  css={{width: 50}}
  />
  <Strut size={16} />
  Unit
  <Strut size={8} />
  <Input {...text('yieldUnit', '')}
  css={{width: 50}}
  />
  <Strut size={16} />
  Prep time (minutes)
  <Strut size={8} />
  <Input {...float('prepTime', '')}
  css={{width: 50}}
  />
  <Strut size={16} />
  Cook time (minutes)
  <Strut size={8} />
  <Input {...float('cookTime', '')}
  css={{width: 50}}
  />
  <Strut size={16} />
  Total time (minutes)
  <Strut size={8} />
  <Input {...float('totalTime', '')}
  css={{width: 50}}
  />
  <Strut size={16} />
  Oven Temp (˚F)
  <Strut size={8} />
  <Input {...float('ovenTemp', '')}
  css={{width: 50}}
  />
</Row>

const sourceRow = (bool, text, toggle) => <Row css={{fontSize: 10}}>
  <Row
    css={{marginRight: 16}}
    onClick={() => toggle('isPublic', true)}
  >
    <input type="checkbox" {...bool('isPublic', true)} />
    is public
  </Row>
  Source
  <SourceInput {...text('source')} placeholder="(url or text)" />
</Row>

const ingredientsList = {
  name: 'ingredients',
  blank: () => ({amount: 1, ingredient: null, unit: '', comments: ''}),
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
      <AmountInput onFocus={selectAll} {...float('amount', 1)} placeholder="Amount" />
      {/* TODO defaultunit? */}
      <UnitInput onFocus={selectAll} {...text('unit')} placeholder="Unit" />
      <IngredientInput
        {...custom('ingredient')}
      />
      <IngredientCommentsInput 
        onFocus={selectAll}
        {...text('comments')}
        placeholder="Comments"
      />
      {data 
        ? <RowDeleteButton onClick={remove}>
            <Close size={20} />
          </RowDeleteButton>
        : <Strut size={30} />}
    </Row>
  )
}

const selectAll = e => {
  e.target.select()
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
      {
        margin: 0,
        minHeight: 30,
        alignItems: 'flex-start',
      },
      data === null && {
        color: '#888',
        fontStyle: 'italic',
      }
    ]}>
      <Div css={{
        marginRight: 10,
        marginLeft: 5,
        width: 10,
        lineHeight: '28px',
      }}>
        {data ? i + 1 + '.' : ''}
      </Div>
      <InstructionInput
        {...text('text')}
        style={{flex: 1}}
        placeholder="Instruction Text" />
      {data 
        ? <RowDeleteButton onClick={remove}>
            <Close size={20} />
          </RowDeleteButton>
        : <Strut size={30} />}
    </Row>
  )
}

const AmountInput = glamorous.input({
  width: 80,
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

const IngredientCommentsInput = glamorous.input({
  width: 70,
  fontSize: 16,
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

const InstructionInput = glamorous(GrowingTextarea)({
  flex: 1,
  fontStyle: 'inherit',
  border: 'none',
  fontSize: 16,
  lineHeight: '24px',
  padding: 8,
  alignSelf: 'stretch',
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
