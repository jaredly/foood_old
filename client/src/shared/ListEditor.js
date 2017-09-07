import React from 'react';
import {
  Link
} from 'react-router-dom'

import glamorous, {Div, Button, Input, Textarea} from 'glamorous'
import Checkmark from 'react-icons/lib/io/ios-checkmark-empty'
import Close from 'react-icons/lib/io/ios-close-empty'
import IngredientInput from './IngredientInput'
import GrowingTextarea from './GrowingTextarea'

import RecipeSelector from './RecipeSelector'
import Form from './formative'

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

const Row = div({flexDirection: 'row', alignItems: 'center'})

const Label = div({fontSize: 12, marginBottom: 5, marginTop: 15})

const Spring = div({flex: 1})
const Strut = ({size}) => <div style={{flexBasis: size}} />

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


const validate = ({title}) => {
  if (!title) return 'Title is required'
  // if (!ingredients.length) return 'Must have at least one ingredient'
  // if (!instructions.length) return 'Must have at least one instruction'
}

const ListEditor = ({list, onAction, action, onDone}) => {
  return <Form initial={list}>
    {({text, float, bool, list, toggle, set, setMany}, data, isModified) => (
      <Div css={{flex: 1, backgroundColor: 'white', width: 500, margin: 8, maxWidth: '100%'}}>
        {JSON.stringify(data.error)}
        <Row css={{
            borderBottom: '1px solid #aaa',
            marginBottom: 8,
        }}>
          <Input {...text('title')} autoFocus placeholder="Title" />
          <div style={{flex: 1}} />
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
        <Strut size={16} />
        <Row>
          <Input {...bool('isPrivate')} /> private
        </Row>
        <Strut size={16} />

        <RecipeSelector
          current={data.recipes}
          onSelect={({id, title}) => set('recipes', data.recipes.concat([{id, title}]))}
        />

        <Strut size={16} />
        <Div css={{padding: '10px 20px', flex: 1, overflow: 'auto'}}>
          {/* TODO editors */}
          {(data.recipes || []).map(({id, title}, i) => (
            <Row key={id}>
              <Div css={{
                padding: '8px 16px',
              }}>
              {title}
              </Div>
              <div style={{flex: 1}} />
              <Div
                css={{
                  padding: 8,
                  cursor: 'pointer',
                  ':hover': {
                    backgroundColor: '#eee',
                  }
                }}
                onClick={() => set('recipes', data.recipes.filter(rid => rid.id !== id))}
              >
                <Close />
              </Div>
            </Row>
          ))}
        </Div>
      </Div>
    )}
  </Form>
}

export default ListEditor