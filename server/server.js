
import express from 'express'
import bodyParser from 'body-parser'
import fetch from 'node-fetch'
import cors from 'cors'

import {
  graphqlExpress,
  graphiqlExpress,
} from 'graphql-server-express'

import { schema } from './src/schema'
import SimpleDb from './src/SimpleDb'
import MongoDb from './src/MongoDb'
// import FongoDb from './src/FongoDb'
import data from './src/fixtures'
import importer from './src/importer'

import { execute, subscribe } from 'graphql'
import { createServer } from 'http'
import { SubscriptionServer } from 'subscriptions-transport-ws'

// import config from './config.json'
const config = {
  // username: process.env.DB_USERNAME,
  // password: process.env.DB_PASSWORD,
  db: process.env.DB_URL,
}

const PORT = 4000;
const server = express();

// const db = new FongoDb(__dirname + '/../db.json', data)
const db = new MongoDb(
  config.db,
  data
)

// server.use('*', cors({ origin: 'http://localhost:3001' }));
server.use(cors())

db.init().then(db => {
  server.use('/graphql', bodyParser.json(), graphqlExpress((req, res) => {
    return {
      schema,
      context: {
        currentUser: 'jared',
        db,
      },
    }
  }));
}, err => {
  console.log('err initialize', err)
})

server.get('/import', (req, res) => {
  console.log(req.param('url'))
  fetch(req.param('url'))
  .then(r => r.text())
  .then(text => {
    const result = importer(text)
    // console.log('result', result)
    res.json(result)
  })
})

server.use('/graphiql', graphiqlExpress({
  endpointURL: '/graphql',
  subscriptionsEndpoint: `ws://localhost:4000/subscriptions`
}));

// We wrap the express server so that we can attach the WebSocket for subscriptions
const ws = createServer(server);

ws.listen(PORT, () => {
  console.log(`GraphQL Server is now running on http://localhost:${PORT}`);

  // Set up the WebSocket for handling GraphQL subscriptions
  new SubscriptionServer({
    execute,
    subscribe,
    schema
  }, {
    server: ws,
    path: '/subscriptions',
  });
});
