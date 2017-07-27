
import cheerio from 'cheerio'

const zz = `
//
"aggregateRating"
"ratingValue"
"ratingCount"
"bestRating"
"worstRating"
"image"

//
"name"
"description"
"ingredients"
"ingredients"
"recipeInstructions"
"recipeInstructions"
"recipeInstructions"
"totalTime"
"prepTime"
"recipeYield"

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

const getTime = elem => {
  // console.log('got time', elem)
  if (!elem) return null
  const dt = elem.attr('content')
  console.log('dt', dt)
  if (dt) {
    const match = dt.trim().match(/^PT((\d+)H)?((\d+)M)?$/)
    if (match) {
      console.log(match)
      console.log(match[2], match[4])
      return +(match[2] || 0) * 60 + +(match[4] || 0)
    }
  }
  let n = parseInt(elem.text())
  if (isNaN(n)) {
    return null
  }
  return n
}

const unwhite = text => {
  return text.replace(/\s+/g, ' ').trim()
}

export default text => {
  const $ = cheerio.load(text)
  const name = unwhite($('[itemprop=name]').text())
  const description = unwhite($('[itemprop=description]').text())
  const ingredients = $('[itemprop=ingredients]')
    .map((i, elem) => $(elem).text())
    .get()
    .map(unwhite)
  const allRecipeInstructions = $('[itemprop=recipeInstructions]')
    .map((i, elem) => {
      const dt = $(elem).children('dt').get()
      if (dt.length) return dt.map(el => $(el).text())
      const li = $(elem).children('li').get()
      if (li.length) return li.map(el => $(li).text())
      return [$(elem).text()]
    })
    .get()
  const recipeInstructions = [].concat(...allRecipeInstructions).map(unwhite)
  // TODO nutrition
  const totalTime = getTime($('[itemprop=totalTime]'))
  const prepTime = getTime($('[itemprop=prepTime]'))
  const cookTime = getTime($('[itemprop=cookTime]'))
  return {
    name,
    description,
    ingredients,
    recipeInstructions,
    totalTime,
    prepTime,
    cookTime,
  }
}
