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
import {maybeFindIngredient} from './importUtils'
import apolloClient from '../apolloClient'
import {gql} from 'react-apollo';

import {parseIngredient, splitList} from './importUtils'

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


const ingredientsPaster = (data, set) => {
  return (e: ClipboardEvent, i: number) => {
    e.preventDefault()
    e.clipboardData.items[0].getAsString(pastedText => {
      const ingredients = (data && data.ingredients || []).slice(0, i)
      const imported = splitList(pastedText).map(parseIngredient)
        .map(i => ({...i, imported: Date.now()}))
      apolloClient.query({
        query: ingredientsQuery
      }).then(value => {
        console.log(value)
        set('ingredients', ingredients.concat(imported.map(item => maybeFindIngredient(value.data.ingredients, item))))
      })
    })
  }
}

const instructionsPaster = (data, set) => (e: ClipboardEvent, i: number) => {
  const text = e.clipboardData.getData('text/plain')
  const items = splitList(text.trim())
  if (items.length > 0) {
    e.preventDefault()
    const instructions = (data && data.instructions || []).slice(0, i)
    set('instructions', instructions.concat(items.map(text => ({text, ingredientsUsed: []}))))
  } else {
    // let the paste do its thing
  }
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
            const info = {
              ...data,
              ingredients: data.ingredients.map(({ingredient, comments, amount, unit}) => ({
                ingredient, comments, amount, unit
              }))
            }
            if (error) {
              set('error', error)
            } else {
              set('error', null)
              set('loading', true)
              onAction(info)
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
          {list(ingredientsList(ingredientsPaster(data, set)))}
          <Label>Instructions</Label>
          {list(instructionsList(instructionsPaster(data, set)))}
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
  <Input {...float('yield', '')} css={{width: 50}} />
  <Strut size={16} />
  Unit
  <Strut size={8} />
  <Input {...text('yieldUnit', '')} css={{width: 50}} />
  <Strut size={16} />
  Prep time (minutes)
  <Strut size={8} />
  <Input {...float('prepTime', '')} css={{width: 50}} />
  <Strut size={16} />
  Cook time (minutes)
  <Strut size={8} />
  <Input {...float('cookTime', '')} css={{width: 50}} />
  <Strut size={16} />
  Total time (minutes)
  <Strut size={8} />
  <Input {...float('totalTime', '')} css={{width: 50}} />
  <Strut size={16} />
  Oven Temp (˚F)
  <Strut size={8} />
  <Input {...float('ovenTemp', '')} css={{width: 50}} />
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

const ingredientsList = paster => ({
  name: 'ingredients',
  blank: () => ({amount: null, ingredient: null, unit: '', comments: ''}),
  container: ({children, add}) => <Div
    children={children}
    css={{
      margin: 0,
      padding: 0,
      fontSize: 10,
    }}
  />,
  item: ({text, float, custom, remove}, data, i) => (
    <Row key={i + '_' + (data ? data.imported : '')} css={[
      {margin: 0, minHeight: 30},
      data === null && {
        color: '#888',
        fontStyle: 'italic',
      }
    ]}>
      {data 
        ? <RowDeleteButton onClick={remove}>
            <Close size={20} />
          </RowDeleteButton>
        : <Strut size={30} />}
      <Div css={{
        marginRight: 10,
        marginLeft: 5,
        width: 10,
      }}>
        {data ? i + 1 + '.' : 'new'}
      </Div>
      <AmountInput
        onPaste={e => paster(e, i)} onFocus={selectAll} {...float('amount', null)} placeholder="Amount" />
      {/* TODO defaultunit? */}
      <UnitInput onFocus={selectAll} {...text('unit')} placeholder="Unit" />
      <IngredientInput
        {...custom('ingredient')}
        guess={data ? data.guess : null}
        blank={data === null}
      />
      <IngredientCommentsInput 
        onFocus={selectAll}
        {...text('comments')}
        placeholder="Comments"
      />
    </Row>
  )
})

const selectAll = e => {
  e.target.select()
}

const instructionsList = paster => ({
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
      {data 
        ? <RowDeleteButton onClick={remove}>
            <Close size={20} />
          </RowDeleteButton>
        : <Strut size={30} />}
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
        onPaste={e => paster(e, i)}
        style={{flex: 1}}
        placeholder="Instruction Text" />
    </Row>
  )
})

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
  width: 80,
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
