// @flow
// import { PubSub } from 'graphql-subscriptions';
// import { withFilter } from 'graphql-subscriptions';

const getByParam = (type, param) => (_, params, {db}) => db.get(type, params[param])
const getByAttr = (type, attr) => (obj, _, {db}) => db.get(type, obj[attr])
const getsByAttr = (type, attr) => (obj, _, {db}) => db.gets(type, obj[attr])
const getsByParam = (type, param) => (_, params, {db}) => db.find(type, param, params[param])
const getsBackByAttr = (type, attr, objAttr) => (parent, _, {db}) => db.find(type, objAttr, parent[attr])
const getsByContains = (type, attr, parentAttr) => (parent, _, {db}) => db.findByContains(type, attr, parent[parentAttr])

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
      return db.get('recipes', id).then(old => db.set('recipes', id, {
        id,
        ...old,
        ...recipe,
        updated: Date.now(),
        instructions: recipe.instructions.map(addIds),
        ingredients: recipe.ingredients.map(addIds),
      }))
    },

    addRecipeToLists: async (_, {recipe: id, lists}, {currentUser, db}) => {
      console.log('adding', id, lists)
      const nodes = (await db.gets('lists', lists))
      .filter(list => !list.recipes.includes(id))
      .map(list => ({...list, recipes: list.recipes.concat([id])}))

      return db.sets('lists', nodes)
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
      return db.get('lists', id).then(old => db.set('lists', id, {
        id,
        ...old,
        ...list,
        updated: Date.now(),
      }))
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
