import {
  makeExecutableSchema,
  addMockFunctionsToSchema,
} from 'graphql-tools';

import { resolvers } from './resolvers';

const typeDefs = `
type User {
  id: ID!
  email: String!
  name: String!
  joined: Float!

  # forward connections
  recipes(start: Int, max: Int): [Recipe!]!
  made(since: Int, max: Int): [Made!]!
  lists: [List!]!
}

type UserHome {
  id: ID!
  user: User!
  following: [User]!
  homepageLists: [List!]!
  # Dunno if there's anything else here
  # This is stuff visible only to the user
}

type Made {
  id: ID!
  author: User!
  recipe: Recipe!
  notes: String
  addedIngredients: [RecipeIngredient!]!
  removedIngredients: [RecipeIngredient!]!
  images: [String!]
  date: Float

  totalTime: Int
  cookTime: Int
  prepTime: Int
}

type List {
  id: ID!
  created: Float!
  updated: Float!
  author: User!
  isPrivate: Boolean
  editors: [User!]!
  title: String!
  recipes(start: Int, max: Int): [Recipe!]!
}

type Comment {
  id: ID!
  author: User!
  text: String!
  replyTo: Comment
  created: Float!
}

# TODO keep track of unusual tools needed
# or maybe just all tools needed?
type Recipe {
  id: ID!
  title: String!
  author: User!
  created: Float!
  updated: Float!
  isPrivate: Boolean
  imageUrl: String
  tags: [Tag!]! # TODO might be good to have user access controls w/ tags? dunno
  source: String # Might be a URL, might not
  instructions: [Instruction!]!
  # instructionGroups
  ingredients: [RecipeIngredient!]!
  # ingredientGroups maybe
  description: String
  cookTime: Int
  prepTime: Int
  totalTime: Int
  ovenTemp: Int
  yield: Float
  yieldUnit: String
  comments(start: Int, max: Int): [Comment]
  lists: [List!]!
}

type Instruction {
  # id: ID!
  # author: User!
  text: String!
  ingredientsUsed: [RecipeIngredient!]
}

type RecipeIngredient {
  id: ID!
  # author: User!
  ingredient: Ingredient!
  amount: Float!
  unit: String
  comments: String
}

# NOTE tags cannot be edited, just created or destroyed
type Tag {
  id: ID!
  author: User!
  name: String!
  created: Float!
}

# NOTE Ingredient names are also immutable
type Ingredient {
  id: ID!
  author: User!
  name: String!
  plural: String
  defaultUnit: String
  created: Float!

  calories: Float # per 100g
  density: Float # g/cm^3
  diets: [String!]

  # I as moderator can go back and make the aisles and stuff
  aisle: String
}



input InstructionInput {
  id: ID
  text: String
  ingredientsUsed: [String!]!
}

input RecipeIngredientInput {
  id: ID
  ingredient: String! # id
  amount: Float!
  unit: String
  comments: String
}

input RecipeInput {
  title: String!
  tags: [String!]!
  source: String
  instructions: [InstructionInput!]!
  ingredients: [RecipeIngredientInput!]!
  # ingredientGroups maybe
  description: String!
  cookTime: Int
  prepTime: Int
  totalTime: Int
  ovenTemp: Int
}

# NOTE Ingredient names are also immutable
input IngredientInput {
  name: String!
  plural: String
  defaultUnit: String
  aisle: String # TODO figure out how I want aisles. probably by id. dunno
}






type Channel {
  id: ID!
  name: String
  messages: [Message]!
  magic: Int
}

input MessageInput {
  channelId: ID!
  text: String
}

type Message {
  id: ID!
  text: String
}

# type LoginPayload {
  # authId: String
  # userId: String
# }

# This type specifies the entry points into our API
type Query {
  # Actually maybe login isn't handled by graphql. right
  # login(username: String!, password: String!): LoginPayload!

  # all other requests should be authenticated probably
  home: UserHome!

  user(id: ID!): User!
  recipe(id: ID!): Recipe!
  list(id: ID!): List!

  ingredients: [Ingredient!]!

  channels: [Channel]
  channel(id: ID!): Channel
}

# The mutation root type, used to define all mutations
type Mutation {
  addRecipe(recipe: RecipeInput!): Recipe!
  updateRecipe(id: ID!, recipe: RecipeInput!): Recipe!

  addList(title: String!, isPrivate: Boolean, recipes: [ID!]!, editors: [ID!]!): List!
  addTag(title: String!): Tag!
  addIngredient(ingredient: IngredientInput!): Ingredient!

  addRecipeToLists(recipe: ID!, lists: [ID!]!): [List!]!

  addChannel(name: String!): Channel
  addMessage(message: MessageInput!): Message
}

# The subscription root type, specifying what we can subscribe to
type Subscription {
  messageAdded(channelId: ID!): Message
}
`;

const schema = makeExecutableSchema({ typeDefs, resolvers });
export { schema };
