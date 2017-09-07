
import cheerio from 'cheerio'
import {unwhite, parseIngredient, getTime} from './importUtils'

const zz = `
// these are the things from the recipe html metadata thing
"aggregateRating"
"ratingValue"
"ratingCount"
"bestRating"
"worstRating"
"image"

//
"nutrition"
  "calories"
  "carbohydrateContent"
  "cholesterolContent"
  "fiberContent"
  "proteinContent"
  "saturatedFatContent"
  "servingSize"
  "sodiumContent"
`

export default text => {
  const $ = cheerio.load(text)
  const title = unwhite($('[itemprop=name]').text())
  const description = unwhite($('[itemprop=description]').text())
  let ingredients = $('[itemprop=ingredients]')
    .map((i, elem) => $(elem).text())
    .get()
    .map(unwhite)
    .map(parseIngredient)
  if (!ingredients.length) {
    ingredients = $('[itemprop=recipeIngredient]')
      .map((i, elem) => $(elem).text())
      .get()
      .map(unwhite)
      .map(parseIngredient)
  } 
  // console.log(ingredients)

  const allRecipeInstructions = $('[itemprop=recipeInstructions]')
    .map((i, elem) => {
      const dt = $(elem).find('dt').get()
      // console.log('instructions: dt', dt.length)
      if (dt.length) return dt.map(el => $(el).text())
      const li = $(elem).find('li').get()
      // console.log('instructions: li', li.length)
      if (li.length) return li.map(el => $(el).text())
      return [$(elem).text()]
    })
    .get()

  const instructions = [].concat(...allRecipeInstructions).map(unwhite)
  // TODO nutrition
  const totalTime = getTime($('[itemprop=totalTime]'))
  const prepTime = getTime($('[itemprop=prepTime]'))
  const cookTime = getTime($('[itemprop=cookTime]'))
  const yieldUnit = $('[itemprop=recipeyield]').text()

  return {
    title,
    description,
    ingredients,
    instructions,
    yieldUnit,
    totalTime,
    prepTime,
    cookTime,
  }
}
