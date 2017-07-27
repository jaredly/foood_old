import React from 'react'
import {
  Link
} from 'react-router-dom'

import glamorous, {Div, Button, Input, Textarea} from 'glamorous'
import Portal from './Portal'
import ensureInView from './ensureInView'

const isAncestor = (parent, node) => {
  while (node && node !== document.body) {
    if (node === parent) return true
    node = node.parentNode
  }
}

const onEnter = fn => e => e.key === 'Enter' || e.key === ' ' ? fn(e) : null

const Container = glamorous.div({
  position: 'relative',
  cursor: 'pointer',
  backgroundColor: 'white',
})

const Current = glamorous.div({
  fontSize: 16,
  padding: '8px 16px',
  width: 200,
  ':hover': {
    backgroundColor: '#eee',
  }
})

const Menu = glamorous.div({
  backgroundColor: 'white',
  boxShadow: '0 0 5px #aaa',
  cursor: 'pointer',
  borderRadius: 4,
  maxHeight: 300,
  overflow: 'auto',
})

export default class AutoSelect extends React.Component {
  constructor(props) {
    super()

    const i = this.currentIndex(props)
    const name = i === null ? '' : props.options[i].name
    this.state = {
      open: false,
      text: name,
      selectedIndex: 0,
      filtered: props.options,
    }
  }

  currentIndex({value, options}) {
    // const {value, options} = this.props
    for (let i = 0; i < options.length; i++) {
      if (options[i].id === value) {
        return i
      }
    }
    return null
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.props.value) {
      const i = this.currentIndex(nextProps)
      const name = i === null ? null : nextProps.options[i].name
      if (name) {
        this.setState({text: name})
      }
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.open && !prevState.open) {
      window.addEventListener('mousedown', this.onMouseDown, true)
    } else if (!this.state.open && prevState.open) {
      window.removeEventListener('mousedown', this.onMouseDown, true)
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.open && !this.state.open) {
      // this.input.blur()
    }
  }

  onMouseDown = e => {
    if (isAncestor(this.node, e.target)) {
      return
    }
    if (isAncestor(this.menu, e.target)) {
      return
    }
    e.preventDefault()
    e.stopPropagation()
    this.setState({open: false})
  }

  onKeyDown = e => {
    const {selectedIndex, filtered} = this.state
    switch (e.key) {
      case 'Enter':
        e.preventDefault()
        this.setState({open: false}) // maybe don't blur on close? idk
        this.props.onChange(filtered[selectedIndex].id)
        return
      case 'ArrowUp':
        e.preventDefault()
        return this.setState({
          selectedIndex: selectedIndex > 0
            ? selectedIndex - 1
            : filtered.length - 1
        })
      case 'ArrowDown':
        e.preventDefault()
        return this.setState({
          selectedIndex: selectedIndex < filtered.length - 1
            ? selectedIndex + 1
            : 0
        })
    }
  }

  setText(text) {
    const {options} = this.props

    const filtered = text ? options.filter(option => {
      return option.name.toLowerCase().indexOf(text.toLowerCase()) !== -1 ||
        (option.plural &&
          option.plural.toLowerCase().indexOf(text.toLowerCase()) !== -1)
    }) : options
    this.setState({
      filtered,
      open: true,
      text,
    })
  }

  renderMenu() {
    const {open, text, filtered} = this.state
    const {value, options, placeholder, addText, onAdd} = this.props

    return <Portal style={{
        position: 'absolute',
        top: '100%',
        marginTop: 5,
        left: 0,
    }}>
      <Menu
        innerRef={menu => this.menu = menu}
      >
        {renderOptions(
          filtered,
          this.state.selectedIndex,
          value,
          () => this.setState({open: false}),
          this.props.onChange,
        )}
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
      </Menu>
    </Portal>
  }

  render() {
    const {open, text} = this.state
    const {value, options, placeholder, addText, onAdd} = this.props
    // const i = this.currentIndex()
    // const name = i === null ? null : options[i].name
    return <Container innerRef={node => this.node = node}>
      <Input
        value={text}
        style={{
          padding: 8,
          fontSize: 16,
          border: 'none',
        }}
        onChange={e => this.setText(e.target.value)}
        onKeyDown={this.onKeyDown}
        innerRef={input => this.input = input}
        placeholder={placeholder}
        onFocus={() => {
          this.input.select()
          this.setState({open: true})
        }}
        onBlur={() => this.setState({open: false})}
      />
      {open && this.renderMenu()}
    </Container>
  }
}

class MaybeScrollIntoView extends React.Component {
  componentDidUpdate(prevProps) {
    if (!prevProps.active && this.props.active) {
      ensureInView(this.node, true, 50)
    }
  }

  render() {
    return this.props.children(node => this.node = node)
  }
}

const renderOptions = (options, selectedIndex, value, onClose, onChange) => {
  return options.map((option, i) => (
    <MaybeScrollIntoView
      active={i === selectedIndex}
      key={option.id}
    >
    {ref => 
      <Option
        innerRef={ref}
        onMouseDown={
          option.id === value
            ? onClose
            : () => {
              onClose()
              onChange(option.id)
            }
        }
        css={selectedIndex === i && {backgroundColor: '#eee'}}
        tabIndex={0}
      >
        {option.name}
      </Option>
    }
    </MaybeScrollIntoView>
  ))
}

const Option = glamorous.div({
  whiteSpace: 'nowrap',
  fontSize: 16,
  padding: '8px 16px',
  ':hover': {
    backgroundColor: '#eee',
  }
})