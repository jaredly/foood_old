// @flow
// import { PubSub } from 'graphql-subscriptions';
// import { withFilter } from 'graphql-subscriptions';

// const channels = [];
// let nextId = 3;
// let nextMessageId = 5;
// const pubsub = new PubSub();

// import data from './fixtures'

const getByParam = (type, param) => (_, params, {db}) => db.get(type, params[param])
const getByAttr = (type, attr) => (obj, _, {db}) => db.get(type, obj[attr])
const getsByAttr = (type, attr) => (obj, _, {db}) => db.gets(type, obj[attr])
const getsByParam = (type, param) => (_, params, {db}) => db.find(type, param, params[param])
const getsBackByAttr = (type, attr, objAttr) => (parent, _, {db}) => db.find(type, objAttr, parent[attr])
const getsByContains = (type, attr, parentAttr) => (parent, _, {db}) => db.findByContains(type, attr, parent[parentAttr])

// const getByParam = (type, param) => (_, params) => data[type][params[param]]
// const getByAttr = (type, attr) => obj => data[type][obj[attr]]
// const getsByParam = (type, param) => (_, params) => Object.values(data[type]).filter(obj => obj[param] === params[param])
// const getsBackByAttr = (type, attr, objAttr) => parent => Object.values(data[type]).filter(obj => obj[objAttr] === parent[attr])
// const getsBackByFn = (type, attr, fn) => parent => Object.values(data[type]).filter(obj => fn(obj, parent[attr]))
// const getsByAttr = (type, attr) => obj => {
//   if (!obj[attr]) throw new Error('Obj not have ' + attr)
//   if (!Array.isArray(obj[attr])) throw new Error('Obj attr not array ' + attr + ' ' + JSON.stringify(obj[attr]))
//   return obj[attr].map(id => data[type][id])
// }

const uuid = () => Math.random().toString(16).slice(2)

const addIds = item => item.id ? item : ({...item, id: uuid()})

export const resolvers = {
  Query: {
    list: getByParam('lists', 'id'),
    recipe: getByParam('recipes', 'id'),
    home: () => ({id: 'hello'}),
    user: getByParam('users', 'id'),
    ingredients: (_, __, {db}) => db.all('ingredients'), // TODO sort by popularity maybe?
    recipes: (_, __, {db}) => db.all('recipes'),
  },

  RecipeIngredient: {
    ingredient: getByAttr('ingredients', 'ingredient'),
  },
  User: {
    recipes: getsBackByAttr('recipes', 'id', 'authorId'),
    lists: getsBackByAttr('lists', 'id', 'authorId'),
  },
  List: {
    author: getByAttr('users', 'authorId'),
    recipes: getsByAttr('recipes', 'recipes'),
  },
  Recipe: {
    author: getByAttr('users', 'authorId'),
    tags: getsByAttr('tags', 'tags'),
    lists: getsByContains('list', 'id', 'recipes'),
  },
  UserHome: {
    user: (_, __, {currentUser, db}) => db.get('users', currentUser),
    homepageLists: async (_, __, {currentUser, db}) => db.gets('lists', (await db.get('userData', currentUser)).homepageLists),
    // data.userData[context.currentUser].homepageLists.map(id => data.lists[id]),
    following: async (_, __, {currentUser, db}) => db.gets('users', (await db.get('userData', currentUser)).following),
    // data.userData[context.currentUser].following.map(id => data.users[id]),
  },

  Mutation: {
    addRecipe: (_, {recipe}, {currentUser, db}) => {
      const id = uuid()
      return db.set('recipes', id, {
        ...recipe,
        id,
        authorId: currentUser,
        created: Date.now(),
        updated: Date.now(),
        instructions: recipe.instructions.map(addIds),
        ingredients: recipe.ingredients.map(addIds),
      })
    },

    updateRecipe: (_, {id, recipe}, {currentUser, db}) => {
      // TODO check auth
      return db.set('recipes', id, {
        id,
        ...db.get('recipes', id),
        ...recipe,
        updated: Date.now(),
        instructions: recipe.instructions.map(addIds),
        ingredients: recipe.ingredients.map(addIds),
      })
    },

    addRecipeToLists: async (_, {recipe: id, lists}, {currentUser, db}) => {
      console.log('adding', id, lists)
      const nodes = (await db.gets('lists', lists))
      .filter(list => !list.recipes.includes(id))
      .map(list => ({...list, recipes: list.recipes.concat([id])}))

      return db.sets('lists', nodes)

      // // TODO check auth
      // return lists.map(lid => 
      //   data.lists[lid].recipes.includes(id)
      //     ? data.lists[lid]
      //       : (data.lists[lid] = {
      //         ...data.lists[lid],
      //         recipes: data.lists[lid].recipes.concat([id])
      //       })
      // )
    },

    // TODO more atomic recipe editing. like modifying individual stuffs

    addList: (_, {list: {title, isPrivate, recipes}}, {currentUser, db}) => {
      const id = uuid()
      const res = db.set('lists', id, {
        id,
        title,
        isPrivate,
        recipes,
        editors: [], // TODO
        authorId: currentUser,
        created: Date.now(),
        updated: Date.now(),
      })
      console.log('res', res)
      return res
    },

    updateList: (_, {id, list}, {currentUser, db}) => {
      return db.set('lists', id, {
        id,
        ...db.get('lists', id),
        ...list,
        updated: Date.now(),
      })
    },

    addTag: (_, {title}, {currentUser, db}) => {
      const id = uuid()
      return db.set('tags', id, {
        id,
        author: currentUser,
        title,
        created: Date.now(),
      })
    },

    addIngredient: (_, {ingredient: {name, plural, defaultUnit, aisle}}, {currentUser, db}) => {
      const id = uuid()
      return db.set('ingredients', id, {
        id,
        name,
        plural,
        defaultUnit,
        aisle,
        author: currentUser,
        created: Date.now(),
      })
    },

    // addChannel: (root, args) => {
    //   const newChannel = { id: String(nextId++), messages: [], name: args.name };
    //   channels.push(newChannel);
    //   return newChannel;
    // },
    // addMessage: (root, { message }) => {
    //   const channel = channels.find(channel => channel.id === message.channelId);
    //   if(!channel)
    //     throw new Error("Channel does not exist");

    //   const newMessage = { id: String(nextMessageId++), text: message.text };
    //   channel.messages.push(newMessage);

    //   pubsub.publish('messageAdded', { messageAdded: newMessage, channelId: message.channelId });

    //   return newMessage;
    // },

  },
  // Subscription: {
  //   messageAdded: {
  //     subscribe: withFilter(() => pubsub.asyncIterator('messageAdded'), (payload, variables) => {
  //       // The `messageAdded` channel includes events for all channels, so we filter to only
  //       // pass through events for the channel specified in the query
  //       return payload.channelId === variables.channelId;
  //     }),
  //   }
  // },
};
