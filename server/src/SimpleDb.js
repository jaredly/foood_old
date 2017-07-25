
export default class SimpleDb {
  constructor(path, initial) {
    this.path = path
    try {
      this.data = JSON.parse(fs.readFileSync(path, 'utf8'))
    } catch (e) {
      console.log('No database found, starting from scratch')
      this.data = initial
    }
  }

  get(type, id) {
    return this.data[type][id]
  }

  gets(type, ids) {
    return ids.map(id => this.get(type, id))
  }

  find(type, attr, value) {
    console.log('find', type, attr, value)
    return Object.values(this.data[type]).filter(obj => obj[attr] === value)
  }

  findByContains(type, attr, list) {
    return Object.values(this.data[type]).filter(obj => list.includes(obj[attr]))
  }

  set(type, id, value) {
    this.data[type][id] = value
    return this.data[type][id]
  }

  sets(type, values) {
    return values.map(value => this.set(type, value.id, value))
  }
}
