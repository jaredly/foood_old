// @flow
import { PubSub } from 'graphql-subscriptions';
import { withFilter } from 'graphql-subscriptions';

const data = {
  users: {
    jared: {
      id: 'jared',
      email: 'jared@jared.jared',
      name: 'JAred F',
      joined: Date.now(),
    },
    selina: {
      id: 'selina',
      email: 'selina@selina.selina',
      name: 'Selina F',
      joined: Date.now(),
    },
  },
  userData: {
    jared: {
      id: 'jared',
      following: ['selina'],
      homepageLists: [3, 4],
    }
  },
  lists: {
    3: {
      id: 3,
      title: 'Want to make',
      created: Date.now(),
      updated: Date.now(),
      author: 'jared',
      public: true,
      editors: ['selina'],
      recipes: [1, 2],
    },
    4: {
      id: 4,
      title: 'Great freezer meals',
      created: Date.now(),
      updated: Date.now(),
      author: 'jared',
      public: true,
      editors: ['selina'],
      recipes: [1],
    }
  },

  recipes: {
    1: {
      authorId: 'jared',
      id: '1',
      title: 'Pad thai',
      created: Date.now() - 1000,
      updated: Date.now(),
      tags: [2,3,4],
      source: "google.com",
      instructions: [
        {id: 2, text: 'Boil the water', ingredientsUsed: []},
        {id: 3, text: 'Add eggs', ingredientsUsed: []},
        {id: 4, text: 'Eat them', ingredientsUsed: []},
      ],
      ingredients: [
        {id: 2, ingredient: 2, amount: 2, comments: 'beaten'},
        {id: 3, ingredient: 3, amount: 1.5, unit: 'cups'},
        {id: 4, ingredient: 4, amount: 2, unit: 'cups'},
      ],
      description: 'This is the best',
      prepTime: 5,
      cookTime: 20,
      yield: 5,
      yieldUnit: 'meals',
    },
    2: {
      authorId: 'selina',
      id: '2',
      title: 'Eggs benedict',
      created: Date.now() - 1000,
      updated: Date.now(),
      tags: [2],
      source: "google.com/things",
      instructions: [
        {text: 'Heat up a pan', ingredientsUsed: []},
        {text: 'put some olive oil in it', ingredientsUsed: []},
        {text: 'Eat them', ingredientsUsed: []},
      ],
      ingredients: [
        {id: 0, ingredient: 2, amount: 2},
        {id: 1, ingredient: 3, amount: 1, unit: 'T'},
      ],
      description: 'From Selina\'s childhood',
      prepTime: 5,
      cookTime: 20,
      yield: 5,
      yieldUnit: 'meals',
    }
  },

  ingredients: {
    2: {id: 2, authorId: 'jared', name: 'egg', created: Date.now(), aisle: 'dairy', defaultUnit: null},
    3: {id: 3, authorId: 'jared', name: 'milk', created: Date.now(), aisle: 'dairy', defaultUnit: 'cups'},
    4: {id: 4, authorId: 'jared', name: 'whole wheat flour', created: Date.now(), aisle: null, defaultUnit: 'cups'},
    5: {id: 5, authorId: 'jared', name: 'olive oil', created: Date.now(), aisle: null, defaultUnit: 'T'},
  },
  tags: {
    2: {id: 2, authorId: 'jared', name: 'Asian', created: Date.now()},
    3: {id: 3, authorId: 'jared', name: 'Freezer', created: Date.now()},
    4: {id: 4, authorId: 'jared', name: 'Awesome', created: Date.now()},
  },
};

const channels = [];
let nextId = 3;
let nextMessageId = 5;

const pubsub = new PubSub();

const getByParam = (type, param) => (_, params) => data[type][params[param]]
const getByAttr = (type, attr) => obj => data[type][obj[attr]]
const getsByParam = (type, param) => (_, params) => Object.values(data[type]).filter(obj => obj[param] === params[param])
const getsBackByAttr = (type, attr, objAttr) => parent => Object.values(data[type]).filter(obj => obj[objAttr] === parent[attr])
const getsBackByFn = (type, attr, fn) => parent => Object.values(data[type]).filter(obj => fn(obj, parent[attr]))
const getsByAttr = (type, attr) => obj => {
  if (!obj[attr]) throw new Error('Obj not have ' + attr)
  if (!Array.isArray(obj[attr])) throw new Error('Obj attr not array ' + attr + ' ' + JSON.stringify(obj[attr]))
  return obj[attr].map(id => data[type][id])
}

const uuid = () => Math.random().toString(16).slice(2)

const addIds = item => item.id ? item : ({...item, id: uuid()})

export const resolvers = {
  Query: {
    channels: () => {
      return channels;
    },
    channel: (root, { id }) => {
      return channels.find(channel => channel.id === id);
    },
    list: getByParam('lists', 'id'),
    recipe: getByParam('recipes', 'id'),
    home: () => ({id: 'hello'}),
    user: getByParam('users', 'id'),
  },

  RecipeIngredient: {
    ingredient: getByAttr('ingredients', 'ingredient'),
  },
  User: {
    recipes: getsBackByAttr('recipes', 'id', 'authorId'),
  },
  List: {
    author: getByAttr('users', 'author'),
    recipes: getsByAttr('recipes', 'recipes'),
  },
  Recipe: {
    author: getByAttr('users', 'authorId'),
    tags: getsByAttr('tags', 'tags'),
    lists: getsBackByFn('list', 'id', (obj, id) => obj.recipes.includes(id)),
  },
  UserHome: {
    user: (_, __, context) => data.users[context.currentUser],
    homepageLists: (_, __, context) => data.userData[context.currentUser].homepageLists.map(id => data.lists[id]),
    following: (_, __, context) => data.userData[context.currentUser].following.map(id => data.users[id]),
  },

  Mutation: {
    addRecipe: (_, {recipe}, {currentUser}) => {
      const id = uuid()
      data.recipes[id] = {
        ...recipe,
        id,
        authorId: currentUser,
        created: Date.now(),
        updated: Date.now(),
        instructions: recipe.instructions.map(addIds),
        ingredients: recipe.ingredients.map(addIds),
      }
      return data.recipes[id]
    },

    updateRecipe: (_, {id, recipe}, {currentUser}) => {
      // TODO check auth
      data.recipes[id] = {
        id,
        ...data.recipes[id],
        ...recipe,
        updated: Date.now(),
        instructions: recipe.instructions.map(addIds),
        ingredients: recipe.ingredients.map(addIds),
      }
      // console.log('recipe updated')
      // console.log(JSON.stringify(data.recipes[id], null, 2))
      return data.recipes[id]
    },

    addRecipeToLists: (_, {recipe: id, lists}, {currentUser}) => {
      console.log('adding', id, lists)
      // TODO check auth
      return lists.map(lid => 
        data.lists[lid].recipes.includes(id)
          ? data.lists[lid]
            : (data.lists[lid] = {
              ...data.lists[lid],
              recipes: data.lists[lid].recipes.concat([id])
            })
      )
    },

    // TODO more atomic recipe editing. like modifying individual stuffs

    addList: (_, {title, isPrivate, recipes, editors}, {currentUser}) => {
      const id = uuid()
      data.lists[id] = {
        id,
        title,
        isPrivate,
        recipes,
        editors,
        author: currentUser,
        created: Date.now(),
        updated: Date.now(),
      }
      return data.lists[id]
    },

    addTag: (_, {title}, {currentUser}) => {
      const id = uuid()
      data.tags[id] = {
        id,
        author: currentUser,
        title,
        created: Date.now(),
      }
      return data.tags[id]
    },

    addIngredient: (_, {name, plural, defaultUnit, aisle}, {currentUser}) => {
      const id = uuid()
      data.ingredients[id] = {
        id,
        name,
        plural,
        defaultUnit,
        aisle,
        author: currentUser,
        created: Date.now(),
      }
      return data.ingredients[id]
    },

    addChannel: (root, args) => {
      const newChannel = { id: String(nextId++), messages: [], name: args.name };
      channels.push(newChannel);
      return newChannel;
    },
    addMessage: (root, { message }) => {
      const channel = channels.find(channel => channel.id === message.channelId);
      if(!channel)
        throw new Error("Channel does not exist");

      const newMessage = { id: String(nextMessageId++), text: message.text };
      channel.messages.push(newMessage);

      pubsub.publish('messageAdded', { messageAdded: newMessage, channelId: message.channelId });

      return newMessage;
    },
  },
  Subscription: {
    messageAdded: {
      subscribe: withFilter(() => pubsub.asyncIterator('messageAdded'), (payload, variables) => {
        // The `messageAdded` channel includes events for all channels, so we filter to only
        // pass through events for the channel specified in the query
        return payload.channelId === variables.channelId;
      }),
    }
  },
};
