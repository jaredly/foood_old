
export const getTime = elem => {
  // console.log('got time', elem)
  if (!elem) return null
  const dt = elem.attr('content') || elem.attr('datetime')
  // console.log('dt', dt)
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

export const unwhite = text => {
  return text.replace(/\s+/g, ' ').trim()
}

export const units = {
  'cup': ['cups', 'cup', 'Cups'],
  'tablespoon': ['tablespoons', 'tablespoon', 'Tablespoons', 'Tablespoon', 'Tbs', 'tbs', 'T'],
  'teaspoon': ['t', 'tsp', 'Tsp', 'teaspoons', 'teaspoon', 'Teaspoons', 'Teaspoon'],
  'ounce': ['oz', 'ounces', 'ounce'],
  'pound': ['lbs', 'lb', 'pounds', 'pound'],
  'gram': ['g', 'grams', 'G', 'Grams', 'gram', 'Gram'],
  'kilogram': ['kg', 'Kg', 'Kilograms', 'Kilogram', 'kilograms', 'kilogram'],
  'quart': ['quarts', 'Quarts', 'quart', 'Quart', 'qts', 'qt'],
  'can': ['cans', 'can', 'Cans', 'Can'],
  'package': ['packages', 'package', 'Packages', 'Package', 'pkg', 'Pkg'],
}

export const parseUnit = (amount, text) => {
  text = text.trim()
  for (let unit in units) {
    for (let n of units[unit]) {
      if (text.indexOf(n + ' ') === 0) {
        return {
          amount,
          unit,
          ingredient: null,
          comments: text.slice(n.length).trim(),
        }
      }
    }
  }

  return {
    amount,
    unit: null,
    ingredient: null,
    comments: text.trim(),
  }
}

export const parseIngredient = text => {
  if (text.match(/^½/)) {
    return parseUnit(
      .5,
      text.slice(1),
    )
  }
  if (text.match(/^⅛/)) {
    return parseUnit(
      .125,
      text.slice(1),
    )
  }
  if (text.match(/^¼/)) {
    return parseUnit(
      .25,
      text.slice(1),
    )
  }

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
    ingredient: null,
    comments: text.trim(),
  }
}
