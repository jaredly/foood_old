import React from 'react';
import {
  Link
} from 'react-router-dom'

import glamorous, {Div, Input, Textarea} from 'glamorous'

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
  return <select value={value ? value.id : null} onChange={e => {
    let found = null;
    options.some(option => option.id === e.target.value ? (found = option) : false)
    if (found) onChange(found)
  }}>
    <glamorous.Option css={{fontStyle: 'italic', color: '#aaa'}} value="">{placeholder}</glamorous.Option>
    {options.map(({id, name}) => <option key={id} value={id}>{name}</option>)}
  </select>
}

const Row = div({flexDirection: 'row', alignItems: 'center'})

const Label = div({fontSize: 12, marginBottom: 5, marginTop: 15})

const Spring = div({flex: 1})

const RecipeEditor = ({recipe, onAction, action}) => {
  // text: (name, default='', optional=false) => props
  // float: (name, default=0.0, optional=false) => props
  // bool: (name, default=false, optional=false) => props
  // hmmm can I also include a memo?

  // If onsubmit returns a promise that fails, then that error is displayed
  return <Form initial={recipe} onSubmit={onAction}>
    {({text, float, bool, list, submitButton, toggle}, data, errors) => (
      <Div css={{padding: 10}}>
        <Div >
          <Input {...text('title')} placeholder="Title" css={{
            fontSize: 20,
            fontWeight: 'bold',
            border: 'none',
            borderBottom: '1px solid #aaa',
            marginBottom: 5,
          }} />
          <Row css={{fontSize: 10}}>
            <Row css={{fontSize: 10, marginRight: 20}} onClick={() => toggle('isPublic')}>
              <input type="checkbox" {...bool('isPublic', true)} />
              is public
            </Row>
            Source
            <Input css={{
              marginLeft: 5,
              fontSize: 12,
              border: 'none',
              flex: 1,
            }} {...text('source')} placeholder="(url or text)" />
          </Row>
        </Div>
        <Div >
          <Label>Description</Label>
          <Textarea css={{
            fontSize: 10,
            fontStyle: 'italic',
            border: '1px solid #ddd',
            padding: 10,
          }} {...text('description')} />
          <Label>Ingredients</Label>
          {list({
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
              // TODO good tab handling. I'd love to make it so that
              // if you tab from the end of the last one, it will add a new
              // item to the list I think.
              // but if you tab out and its empty, you move onto the next thing.
              <Row key={i} css={[
                {padding: '5px 10px', margin: 0, lineHeight: 0},
                data === null && {
                   // backgroundColor: '#fafafa', 
                  color: '#888',
                  fontStyle: 'italic',
                }
              ]}>
                <Div css={{
                  marginRight: 5,
                  width: 10,
                }}>
                  {data ? i + 1 + '.' : ''}
                </Div>
                <Input {...float('amount', 1)} placeholder="Amount" css={{
                  width: 30,
                  backgroundColor: 'transparent',
                  color: 'currentColor',
                  textAlign: 'right',
                  fontStyle: 'inherit',
                  border: 'none',
                }} />
                {/* TODO defaultunit? */}
                <Input {...text('unit')} placeholder="Unit" css={{
                  width: 50,
                  backgroundColor: 'transparent',
                  fontStyle: 'inherit',
                  border: 'none',
                }} />
                <Dropdown
                  {...custom('ingredient')}
                  placeholder="Ingredient"
                  options={ingredients}
                />
                <Spring/>
                {data && <button onClick={remove}>&times;</button>}
              </Row>
            )
          })}
          {errors.map(error => <div>{error}</div>)}
          {/* disables while loading, incomplete, etc. */}
          <button {...submitButton()}>{action}</button>
        </Div>
      </Div>
    )}
  </Form>
}

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