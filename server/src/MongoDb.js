
import {MongoClient} from 'mongodb'

export default class MongoDb {
  constructor(url, initial) {
    this.url = url
    this.initial = initial
  }

  init() {
    return new Promise((res, rej) => MongoClient.connect(this.url, (err, db) => {
      if (err) {
        console.error('fail', err)
        throw err
      }
      this.db = db
      res(this)
    }))
    .then(() => this.db.collection('users').findOne())
    .then(user => {
      if (user) return console.log('already initialized')
      else return this.initialize()
    })
    .then(() => this)
  }

  initialize() {
    console.log('initializing')
    return Promise.all(Object.keys(this.initial).map(type => (
      this.db.collection(type).bulkWrite(
        Object.keys(this.initial[type])
          .map(id => ({
            insertOne: {document: {...this.initial[type][id], _id: id}}
          }))
      )
    )))
  }

  all(type) {
    return this.db.collection(type).find().toArray()
  }

  get(type, id) {
    id = '' + id
    return this.db.collection(type).findOne({_id: id})
  }

  gets(type, ids) {
    return this.db.collection(type).find({_id: {$in: ids || []}}).toArray()
  }

  find(type, attr, value) {
    return this.db.collection(type).find({[attr]: value}).toArray()
  }

  findByContains(type, attr, list) {
    return this.db.collection(type).find({[attr]: {$in: list || []}})
  }

  findByList(type, attr, value) {
    return this.db.collection(type).find({[attr]: {$elemMatch: value}})
  }

  delete(type, id) {
    return this.db.collection(type).remove({_id: id}, 1)
  }

  set(type, id, value) {
    id = '' + id
    return this.db.collection(type)
      .updateOne({_id: id}, {$set: {...value, _id: id}}, {upsert: true})
      .then(() => value)
  }

  sets(type, values) {
    return this.db.collection(type).bulkWrite(values.map(value => ({
      updateOne: {filter: {_id: value.id}, update: {$set: {...value, _id: value.id}}, upsert: true},
    }))).then(() => values)
  }
}
