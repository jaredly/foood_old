import React from 'react'
import {
  Link
} from 'react-router-dom'

import glamorous, {Div, Button, Input, Textarea} from 'glamorous'
import Portal from './Portal'

const isAncestor = (parent, node) => {
  while (node && node !== document.body) {
    if (node === parent) return true
    node = node.parentNode
  }
}

const onEnter = fn => e => e.key === 'Enter' || e.key === ' ' ? fn(e) : null

export default class AutoSelect extends React.Component {
  state = {open: false}

  currentIndex() {
    const {value, options} = this.props
    for (let i = 0; i < options.length; i++) {
      if (options[i].id === value) {
        return i
      }
    }
    return null
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.open && !prevState.open) {
      window.addEventListener('mousedown', this.onMouseDown, true)
    } else if (!this.state.open && prevState.open) {
      window.removeEventListener('mousedown', this.onMouseDown, true)
    }
  }

  onMouseDown = e => {
    if (isAncestor(this.node, e.target)) {
      return
    }
    if (isAncestor(this.menu, e.target)) {
      return
    }
    console.log('not things', e.target, this.menu)
    e.preventDefault()
    e.stopPropagation()
    this.setState({open: false})
  }

  render() {
    const {open} = this.state
    const {value, options, placeholder, addText, onAdd} = this.props
    const i = this.currentIndex()
    const name = i === null ? placeholder : options[i].name
    return <Div
      css={{
        position: 'relative',
        cursor: 'pointer',
        backgroundColor: 'white',
        // color: 'black',
        // fontStyle: 'normal',
      }}
      ref={node => this.node = node}
    >
      <Div
        onMouseDown={() => this.setState({open: !open})}
        onKeyDown={onEnter(() => this.setState({open: !open}))}
        tabIndex={0}
        css={{
          fontSize: 16,
          padding: '8px 16px',
          width: 200,
          ':hover': {
            backgroundColor: '#eee',
          }
        }}
      >
        {name}
      </Div>
      {this.state.open && 
      <Portal style={{
          position: 'absolute',
          top: '100%',
          marginTop: 5,
          left: 0,
      }}>
        <Div
          innerRef={menu => this.menu = menu}
          css={{
            backgroundColor: 'white',
            boxShadow: '0 0 5px #aaa',
            cursor: 'pointer',
            borderRadius: 4,
          }}
        >
          {options.map(option => (
            <Option
              key={option.id}
              onMouseDown={
                option.id === value
                  ? () => this.setState({open: false})
                  : () => {
                    this.setState({open: false})
                    this.props.onChange(option.id)
                  }
              }
              tabIndex={0}
            >
              {option.name}
            </Option>
          ))}
          {addText && <Option
            onMouseDown={e => {
              this.setState({open: false})
              this.props.onAdd(e)
            }}
            css={{
              fontStyle: 'italic',
              color: '#777',
            }}
          >
            {addText}            
          </Option>}
        </Div>
      </Portal>
      }
    </Div>
  }
}

const Option = glamorous.div({
  whiteSpace: 'nowrap',
  fontSize: 16,
  padding: '8px 16px',
  ':hover': {
    backgroundColor: '#eee',
  }
})