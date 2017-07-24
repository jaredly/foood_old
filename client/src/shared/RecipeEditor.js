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

const Row = div({flexDirection: 'row'})

const RecipeEditor = ({recipe, onAction, action}) => {
  // text: (name, default='', optional=false) => props
  // float: (name, default=0.0, optional=false) => props
  // bool: (name, default=false, optional=false) => props
  // hmmm can I also include a memo?

  // If onsubmit returns a promise that fails, then that error is displayed
  return <Form initial={recipe} onSubmit={onAction}>
    {({text, float, bool, list, submitButton, toggle}, data, errors) => (
      <div>
        <input {...text('title')} placeholder="Title" />
        <input {...text('source')} placeholder="Source" />
        <Row onClick={() => toggle('isPublic')}>
          <input type="checkbox" {...bool('isPublic', true)} />
          is public
        </Row>
        Description
        <textarea {...text('description')} />
        {list({
          name: 'ingredients',
          container: ({children, add}) => <glamorous.Ol
            children={children}
            css={{
              margin: 0,
              padding: 0,
            }}
          />,
          // I think I'll just always have a "null" item at the end
          // {children}
          // <li>
          //   <button onClick={add}>Add</button>
          // </li>
          // </ol>,
          item: ({text, float, custom, remove}, data, i) => (
            // TODO good tab handling. I'd love to make it so that
            // if you tab from the end of the last one, it will add a new
            // item to the list I think.
            // but if you tab out and its empty, you move onto the next thing.
            <glamorous.Li key={i} css={[
              {padding: 10, margin: 0},
              data === null && {
                backgroundColor: '#eee',
                fontStyle: 'italic',
              }
            ]}>
              <Input {...float('amount', 1)} placeholder="Amount" css={{
                width: 30,
                backgroundColor: 'transparent',
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
              {data && <button onClick={remove}>&times;</button>}
            </glamorous.Li>
          )
        })}
        {errors.map(error => <div>{error}</div>)}
        {/* disables while loading, incomplete, etc. */}
        <button {...submitButton()}>{action}</button>
      </div>
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