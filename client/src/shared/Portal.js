import React from 'react'
import ReactDOM from 'react-dom'

export default class Portal extends React.Component {
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