
const data = {
  users: {
    jared: {
      id: 'jared',
      email: 'jared@jaredforsyth.com',
      name: 'Jared',
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
      homepageLists: ['3', '4'],
    }
  },

  lists: {
    3: {
      id: '3',
      title: 'Want to make',
      created: Date.now(),
      updated: Date.now(),
      authorId: 'jared',
      public: true,
      editors: ['selina'],
      recipes: ['1', '2'],
    },

    4: {
      id: '4',
      title: 'Great freezer meals',
      created: Date.now(),
      updated: Date.now(),
      authorId: 'jared',
      public: true,
      editors: ['selina'],
      recipes: ['1'],
    }
  },

  recipes: {
    1: {
      id: '1',
      authorId: 'jared',
      title: 'Pad thai',
      created: Date.now() - 1000,
      updated: Date.now(),
      tags: ['2','3','4'],
      source: "google.com",
      instructions: [
        {id: '2', text: 'Boil the water', ingredientsUsed: []},
        {id: '3', text: 'Add eggs', ingredientsUsed: []},
        {id: '4', text: 'Eat them', ingredientsUsed: []},
      ],
      ingredients: [
        {id: '2', ingredient: '2', amount: 2, comments: 'beaten'},
        {id: '3', ingredient: '3', amount: 1.5, unit: 'cups'},
        {id: '4', ingredient: '4', amount: 2, unit: 'cups'},
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
      tags: ['2'],
      source: "google.com/things",
      instructions: [
        {text: 'Heat up a pan', ingredientsUsed: []},
        {text: 'put some olive oil in it', ingredientsUsed: []},
        {text: 'Eat them', ingredientsUsed: []},
      ],
      ingredients: [
        {id: '0', ingredient: '2', amount: 2},
        {id: '1', ingredient: '3', amount: 1, unit: 'T'},
      ],
      description: 'From Selina\'s childhood',
      prepTime: 5,
      cookTime: 20,
      yield: 5,
      yieldUnit: 'meals',
    }
  },

  ingredients: {
    2: {id: '2', authorId: 'jared', name: 'egg', created: Date.now(), aisle: 'dairy', defaultUnit: null},
    3: {id: '3', authorId: 'jared', name: 'milk', created: Date.now(), aisle: 'dairy', defaultUnit: 'cups'},
    4: {id: '4', authorId: 'jared', name: 'whole wheat flour', created: Date.now(), aisle: null, defaultUnit: 'cups'},
    5: {id: '5', authorId: 'jared', name: 'olive oil', created: Date.now(), aisle: null, defaultUnit: 'T'},
  },

  tags: {
    2: {id: '2', authorId: 'jared', name: 'Asian', created: Date.now()},
    3: {id: '3', authorId: 'jared', name: 'Freezer', created: Date.now()},
    4: {id: '4', authorId: 'jared', name: 'Awesome', created: Date.now()},
  },
};

export default data