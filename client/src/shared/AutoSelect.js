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
  props: {
    options: Array<any>,
    value: any,
    onAdd: ?() => void,
    onChange: () => void,
    getName: () => string,
  }

  constructor(props) {
    super()

    const i = this.currentIndex(props)
    const name = i === null ? '' : props.getName(props.options[i])
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
    let text = this.state.text
    if (nextProps.value !== this.props.value) {
      const i = this.currentIndex(nextProps)
      const name = i === null ? null : nextProps.getName(nextProps.options[i])
      text = name
      if (name) {
        this.setState({text: name})
      }
    }
    if (nextProps.options !== this.props.options) {
      const filtered = this.search(text, nextProps.options)
      this.setState({filtered})
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
    const max = filtered.length // not -1 b/c of the "add new" at the end
    switch (e.key) {
      case 'Enter':
        e.preventDefault()
        this.setState({open: false}) // maybe don't blur on close? idk
        if (selectedIndex === filtered.length) {
          this.props.onAdd(e, this.state.text)
        } else {
          this.props.onChange(filtered[selectedIndex].id)
        }
        return
      case 'Escape':
        e.preventDefault()
        this.setState({open: false})
        return
      case 'ArrowUp':
        e.preventDefault()
        return this.setState({
          selectedIndex: selectedIndex > 0
            ? selectedIndex - 1
            : max
        })
      case 'ArrowDown':
        e.preventDefault()
        return this.setState({
          selectedIndex: selectedIndex < max
            ? selectedIndex + 1
            : 0
        })
    }
  }

  search(text, options) {
    const {getName} = this.props
    return text ? options.filter(option => {
      return getName(option).toLowerCase().indexOf(text.toLowerCase()) !== -1 ||
        (option.plural &&
          option.plural.toLowerCase().indexOf(text.toLowerCase()) !== -1)
    }) : options
  }

  setText(text) {
    const {options, getName} = this.props
    this.props.onChange(null)

    const filtered = this.search(text, options)

    this.setState({
      filtered,
      open: true,
      text,
    })
  }

  onSelect = id => {
    this.setState({open: false})
    this.props.onChange(id)
  }

  renderMenu() {
    const {open, text, filtered} = this.state
    const {getName, value, options, placeholder, addText, onAdd} = this.props

    return <Portal style={{
        position: 'absolute',
        top: '100%',
        marginTop: 5,
        left: 0,
    }}>
      <Menu
        innerRef={menu => this.menu = menu}
      >
        {filtered.map((option, i) => (
          renderOption(
            option.id,
            getName(option),
            i == this.state.selectedIndex,
            () => this.onSelect(option.id),
          )
        ))}
        {addText && renderOption(
          '$add$',
          addText,
          this.state.selectedIndex === filtered.length,
          onAdd,
          {
            fontStyle: 'italic',
            color: '#555',
          }
        )}
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
        css={{
          padding: 8,
          fontSize: 16,
          border: 'none',
          ':hover': {
            outline: '1px solid #aaa',
            zIndex: 1,
          }
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

const renderOption = (id, name, isSelected, onSelect, css) => {
    return <MaybeScrollIntoView
      active={isSelected}
      key={id}
    >
    {ref => 
      <Option
        innerRef={ref}
        onMouseDown={e => onSelect(e)}
        css={[isSelected && {backgroundColor: '#eee'}, css]}
        tabIndex={0}
      >
        {name}
      </Option>
    }
    </MaybeScrollIntoView>
}

const Option = glamorous.div({
  whiteSpace: 'nowrap',
  fontSize: 16,
  padding: '8px 16px',
  ':hover': {
    backgroundColor: '#eee',
  }
})