
console.log(process.env.NODE_ENV, 'nde env')
export const API = process.env.NODE_ENV !== 'development'
  ? 'https://foood.glitch.me'
  : 'http://localhost:4000'
