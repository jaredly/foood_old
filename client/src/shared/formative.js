
import React, {Component} from 'react'

export default class Form extends Component {
  constructor({initial}) {
    super()
    this.state = {data: initial, errors: []}
    // Hmmm so I could do a "test" render up here & collect fields n stuff
  }

  setValue = (name, value) => {
    this.setState(({data}) => ({data: {
      ...data,
      [name]: value,
    }}))
  }

  setNestedValue = (path, value) => {
    this.setState(({data}) => {
      const last = path.pop()
      const top = {...data}
      const parent = path.reduce((obj, name) => (obj[name] = {...obj[name]}), top)
      parent[last] = value
      return {data: top}
    })
  }

  submit = () => {
    // TODO data validation?
    // wonder if I can get away with not having a schema...
    // hmmm
    this.props.onSubmit(this.state.data)
  }

  functions = {
    text: (name, default='', optional=false) => ({
      value: this.state.data[name] || default,
      onChange: e => this.setValue(name, e.target.value),
      type: 'text',
    }),
    float: (name, default=null, optional=false) => ({
      value: this.state.data[name] || default,
      onChange: e => this.setValue(name, e.target.value),
      type: 'number',
    }),
    bool: (name, default=false) => ({
      checked: this.state.data[name] || default,
      onChange: e => this.setValue(name, e.target.checked),
    }),
    toggle: name => this.setState(({data}) => ({
      data: {...data, [name]: !data[name]}
    })),
    set: this.setValue,
    submitButton: () => ({
      disabled: false, // TODO validation?
      onClick: this.submit,
    }),
    list: ({name, container, item}) => {
      const items = this.state.data[name] || []
      const outerName = name
      return container({
        add: () => null, // TODO
        children: items.concat([null]).map((data, i) => item({
          text: (name, default='', optional=false) => ({
            value: data[name] || default,
            onChange: e => this.setNestedValue([outerName, name], e.target.value),
            type: 'text',
          }),
          float: (name, default=null, optional=false) => ({
            value: data[name] || default,
            onChange: e => this.setNestedValue([outerName, name], e.target.value),
            type: 'number',
          }),
        }, data, i))
      })
    }
  }

  render() {
    return this.props.children(this.functions, this.state.data, this.state.errors)
  }
}
