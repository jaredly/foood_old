import React from 'react';
import {
  Link
} from 'react-router-dom'

import glamorous, {Div} from 'glamorous'

import {Form, List, Textarea, Input} from './formulate'

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

rejections = `
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

const RecipeEditor = ({recipe, onAction}) => {
  // text: (name, default='', optional=false) => props
  // float: (name, default=0.0, optional=false) => props
  // bool: (name, default=false, optional=false) => props
  // hmmm can I also include a memo?

  // If onsubmit returns a promise that fails, then that error is displayed
  return <Form initial={recipe} onSubmit={onAction}>
    {({text, float, bool, list, submitButton}, data, errors) => (
      <div>
        <input {...text('title')} placeholder="Title" />
        <input {...text('source')} placeholder="Source" />
        <div>
          <input type="checkbox" {...bool('isPublic', true)} />
          is public
        </div>
        <textarea {...text('source')} name="description" />
        {list({
          name: 'ingredients',
          container: ({children, add}) => <ol children={children} />,
          // I think I'll just always have a "null" item at the end
          // {children}
          // <li>
          //   <button onClick={add}>Add</button>
          // </li>
          // </ol>,
          item: ({text, float}, data, i) => (
            // TODO good tab handling. I'd love to make it so that
            // if you tab from the end of the last one, it will add a new
            // item to the list I think.
            // but if you tab out and its empty, you move onto the next thing.
            <li key={i}>
              <input {...float('amount', 1)} placeholder="Amount" />
              {/* TODO defaultunit? */}
              <input {...text('unit')} placeholder="Unit" />
              <Dropdown
                {...text('ingredient')}
                placeholder="Ingredient"
                options={ingredients}
              />
            </li>
          )
        })}
        {errors.map(error => <div>{error}</div>)}
        {/* disables while loading, incomplete, etc. */}
        <button {...submitButton()}>{action}</button>
      </div>
    )}
  </Form>

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
}
