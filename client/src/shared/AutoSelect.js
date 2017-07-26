import React from 'react'
import ReactDOM from 'react-dom'
import {
  Link
} from 'react-router-dom'

import glamorous, {Div, Button, Input, Textarea} from 'glamorous'

const isAncestor = (parent, node) => {
  while (node && node !== document.body) {
    if (node === parent) return true
    node = node.parentNode
  }
}

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
    const {value, options, placeholder} = this.props
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
            <Div
              key={option.id}
              css={{
                whiteSpace: 'nowrap',
                fontSize: 16,
                padding: '8px 16px',
                ':hover': {
                  backgroundColor: '#eee',
                }
              }}
              onMouseDown={
                option.id === value
                  ? () => this.setState({open: false})
                  : () => {
                    this.setState({open: false})
                    this.props.onChange(option.id)
                  }
              }
            >
              {option.name}
            </Div>
          ))}
        </Div>
      </Portal>
      }
    </Div>
  }
}

class Portal extends React.Component {
  componentDidMount() {
    this.node = document.createElement('div')
    document.body.appendChild(this.node)
    ReactDOM.render(this.props.children, this.node)
    this.node.style.position = 'absolute'
    const box = this.blank.getBoundingClientRect()
    this.node.style.top = box.top + 'px'
    this.node.style.left = box.left + 'px'
    this.node.style.zIndex = 1000
  }

  componentWillUnmount() {
    this.node.parentNode.removeChild(this.node)
  }

  render() {
    return <div style={this.props.style} ref={blank => this.blank = blank} />
  }
}