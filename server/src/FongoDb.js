
import fs from 'fs'

export default class FongoDb {
  constructor(path, initial) {
    this.path = path
    this.data = initial
  }

  init() {
    try {
      this.data = JSON.parse(fs.readFileSync(this.path))
    } catch (e) {
    }
    return Promise.resolve(this)
  }

  initialize() {
    return Promise.resolve()
  }

  all(type) {
    return Promise.resolve(Object.values(this.data[type]))
  }

  get(type, id) {
    id = '' + id
    return Promise.resolve(this.data[type][id])
  }

  gets(type, ids) {
    return Promise.resolve(ids.map(id => this.data[type][id]))
  }

  find(type, attr, value) {
    return Promise.resolve(Object.values(this.data[type]).filter(o => o[attr] === value))
  }

  findByContains(type, attr, list) {
    return Promise.resolve(Object.values(this.data[type]).filter(o => list.includes(o[attr])))
  }

  findByList(type, attr, value) {
    return Promise.resolve(Object.values(this.data[type]).filter(o => o[attr].indexOf(value) !== -1))
  }

  set(type, id, value) {
    this.data[type][id] = value
    fs.writeFileSync(this.path, JSON.stringify(this.data))
    return Promise.resolve(value)
  }

  sets(type, values) {
    values.forEach(value => this.data[type][value.id] = value)
    fs.writeFileSync(this.path, JSON.stringify(this.data))
    return Promise.resolve(values)
  }

  delete(type, id) {
    delete this.data[type][id]
    return Promise.resolve()
  }
}

