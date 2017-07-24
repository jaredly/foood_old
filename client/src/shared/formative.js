
import React, {Component} from 'react'

export default class Form extends Component {
  constructor({initial}) {
    super()
    this.state = {data: initial || {}, errors: []}
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

  setListValue = (outer, i, name, value) => {
    this.setState(({data}) => {
      const list = data[outer] ? data[outer].slice() : []
      while (list.length <= i) list.push(null)
      list[i] = {...list[i], [name]: value}
      return {data: {...data, [outer]: list}}
    })
  }

  removeListItem = (outer, i) => {
    this.setState(({data}) => {
      const list = data[outer] ? data[outer].slice() : []
      list.splice(i, 1)
      return {data: {...data, [outer]: list}}
    })
  }

  submit = () => {
    // TODO data validation?
    // wonder if I can get away with not having a schema...
    // hmmm
    this.props.onSubmit(this.state.data)
  }

  functions = {
    text: (name, default_='', optional=false) => ({
      value: this.state.data[name] || default_,
      onChange: e => this.setValue(name, e.target.value),
      // onChangeText: value => this.setValue(name, value),
      type: 'text',
    }),
    float: (name, default_=null, optional=false) => ({
      value: this.state.data[name] == null ? default_ : this.state.data[name],
      onChange: e => this.setValue(name, e.target.value),
      type: 'number',
    }),
    custom: (name, default_=null, optional=false) => ({
      value: this.state.data[name] == null ? default_ : this.state.data[name],
      onChange: value => this.setValue(name, value),
    }),
    bool: (name, default_=false) => ({
      checked: this.state.data[name] == null ? default_ : this.state.data[name],
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
          text: (name, default_='', optional=false) => ({
            value: data && data[name] || default_,
            onChange: e => this.setListValue(outerName, i, name, e.target.value),
            // onChangeText: value => this.setListValue(outerName, i, name, value),
            type: 'text',
          }),
          custom: (name, default_=null, optional=false) => ({
            value: (!data || data[name] == null) ? default_ : data[name],
            onChange: value => this.setListValue(outerName, i, name, value),
          }),
          float: (name, default_=null, optional=false) => ({
            value: (!data || data[name] == null) ? default_ : data[name],
            onChange: e => this.setListValue(outerName, i, name, e.target.value),
            type: 'number',
          }),
          remove: () => this.removeListItem(outerName, i),
        }, data, i))
      })
    }
  }

  render() {
    return this.props.children(this.functions, this.state.data, this.state.errors)
  }
}
