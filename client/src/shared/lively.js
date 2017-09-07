import React from 'react'

const lively = (initialState, render) => class Wrapper extends React.Component {
  constructor(props) {
    super()
    if (typeof initialState === 'function') {
      this.state = initialState(props)
    } else {
      this.state = initialState
    }
  }
  update = fn => payload => {
    if (typeof fn !== 'function') {
      return this.setState(fn)
    }
    if (typeof payload.persist === 'function' && payload.target && payload.currentTarget) {
      payload.persist()
    }
    this.setState(state => fn(payload, state))
  }
  render() {
    return render({...this.props, ...this.state, update: this.update})
  }
}
export default lively