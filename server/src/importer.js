
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

const units = {
  'cup': ['C', 'c', 'cup', 'cups'],
  'tablespoon': ['T', 'Tbs', 'tbs', 'tablespoon', 'tablespoons', 'Tablespoon', 'Tablespoons'],
  'teaspoon': ['t', 'tsp', 'Tsp', 'teaspoon', 'teaspoons', 'Teaspoon', 'Teaspoons'],
  'ounce': ['oz', 'ounce', 'ounces'],
  'gram': ['g', 'gram', 'G', 'Gram', 'grams', 'Grams'],
  'kilogram': ['kg', 'Kg', 'Kilogram', 'Kilograms', 'kilogram', 'kilograms'],
  'quart': ['quart', 'Quart', 'quarts', 'qts', 'qt'],
  'can': ['can', 'cans', 'Can', 'Cans'],
  'package': ['package', 'Package', 'pkg', 'Pkg'],
}

const parseUnit = (amount, text) => {
  text = text.trim()
  for (let unit in units) {
    for (let n in units[unit]) {
      if (text.indexOf(unit) === 0) {
        return {
          amount,
          unit,
          rest: text.slice(unit.length).trim(),
        }
      }
    }
  }

  return {
    amount,
    unit: null,
    rest: text.trim(),
  }
}

const parseIngredient = text => {
  const numberMatch = text.match(/^(\d+)\s+(\d)\/(\d)/)
  if (numberMatch) {
    return parseUnit(
      +numberMatch[1] + (+numberMatch[2] / +numberMatch[3]),
      text.slice(numberMatch[0].length)
    )
  }
  const fractionMatch = text.match(/^(\d+)\/(\d+)/)
  if (fractionMatch) {
    return parseUnit(
      +fractionMatch[1] / +fractionMatch[2],
      text.slice(fractionMatch[0].length)
    )
  }
  const singleMatch = text.match(/^(\d+)/)
  if (singleMatch) {
    return parseUnit(
      +singleMatch[1],
      text.slice(singleMatch[0].length)
    )
  }
  return {
    amount: null,
    unit: null,
    rest: text.trim(),
  }
}

export default text => {
  const $ = cheerio.load(text)
  const title = unwhite($('[itemprop=name]').text())
  const description = unwhite($('[itemprop=description]').text())
  const ingredients = $('[itemprop=ingredients]')
    .map((i, elem) => $(elem).text())
    .get()
    .map(unwhite)
    .map(parseIngredient)

  const allRecipeInstructions = $('[itemprop=recipeInstructions]')
    .map((i, elem) => {
      const dt = $(elem).children('dt').get()
      if (dt.length) return dt.map(el => $(el).text())
      const li = $(elem).children('li').get()
      if (li.length) return li.map(el => $(li).text())
      return [$(elem).text()]
    })
    .get()

  const instructions = [].concat(...allRecipeInstructions).map(unwhite)
  // TODO nutrition
  const totalTime = getTime($('[itemprop=totalTime]'))
  const prepTime = getTime($('[itemprop=prepTime]'))
  const cookTime = getTime($('[itemprop=cookTime]'))

  return {
    title,
    description,
    ingredients,
    instructions,
    totalTime,
    prepTime,
    cookTime,
  }
}
