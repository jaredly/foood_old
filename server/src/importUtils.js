

// so many lines


/// yeah

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
  'packet': ['packets', 'packet', 'pkts', 'pkt'],
  'pinch': ['pinch', 'Pinch'],
  'jar': ['jar'],
  'clove': ['cloves', 'clove'],
  'bag': ['bag'],
}

export const weightUnits = ['ounce', 'pound', 'gram', 'kilogram']
export const bagUnits = ['can', 'package', 'bag', 'packet', 'jar']

const smallNames = {
  cup: 'c',
  tablespoon: 'T',
  teaspoon: 't',
  ounce: 'oz',
  pound: 'lb',
  gram: 'g',
  kilogram: 'kg',
  quart: 'qt',
  can: 'can',
  package: 'pkg',
  packet: 'pkt',
  bag: 'bag',
  jar: 'jar',
}

export const smallUnit = unit => {
  for (let key in units) {
    for (let name of units[key]) {
      if (unit === name) {
        return smallNames[key]
      }
    }
  }
  for (let weight of weightUnits) {
    for (let bag of bagUnits) {
      if (unit === weight + ' ' + bag) {
        return smallNames[weight] + ' ' + smallNames[bag]
      }
    }
  }
  return unit
}

const parseBag = (unit, text) => {
  for (let bag of bagUnits) {
    for (let u of units[bag]) {
      if (text.indexOf(u + ' ') === 0) {
        return [unit + ' ' + bag, text.slice(u.length).trim()]
      }
    }
  }
  return [unit, text]
}

export const parseUnit = (amount, text) => {
  text = text.trim()
  for (let unit in units) {
    for (let n of units[unit]) {
      if (text.indexOf(n + ' ') === 0 || text.indexOf(n + '.') === 0) {
        text = text.slice(n.length + 1).trim()
        if (weightUnits.indexOf(unit) !== -1) {
          const result = parseBag(unit, text)
          unit = result[0]
          text = result[1]
        }
        if (text.indexOf('of ') === 0) {
          text = text.slice('of '.length)
        }
        return {
          amount,
          unit,
          ingredient: null,
          comments: text,
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

const whichFraction = fract => {
  // if (fract === 1/3 || fract === 0.33 || fract === 0.333) return '⅓'
  // if (fract === 2/3 || fract === 0.66 || fract === 0.666) return '⅔'
  const fracs = {
    0.125: '⅛',
    0.333: '⅓',
    0.375: '⅜',
    0.625: '⅝',
    0.666: '⅔',
    0.875: '⅞',
    0.25: '¼',
    0.5: '½',
    0.75: '¾'
  }
  for (let num in fracs) {
    num = +num
    if (fract > num - 0.01 && fract < num + 0.01) {
      return fracs[num]
    }
  }
}

export const fractionify = number => {
  number = Math.round(number * 100) / 100
  const whole = Math.floor(number);
  const fract = number - whole;
  if (!fract) return number + ''
  const fstr = whichFraction(fract)
  if (!whole && fstr) return fstr
  if (!fstr) return number + ''
  return whole + ' ' + fstr
}

const numbers = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']

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
  if (text.match(/^¾/)) {
    return parseUnit(
      .75,
      text.slice(1),
    )
  }

  for (let i=0; i<numbers.length; i++) {
    if (text.match(new RegExp('^' + numbers[i] + '\\b', 'i'))) {
      return parseUnit(
        i + 1,
        text.slice(numbers[i].length)
      )
    }
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
  const singleMatch = text.match(/^(\d+(\.\d+)?)/)
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

const splitNumbers = lines => {
  const delimeters = ['.', ')']
  let count = 0
  lines.forEach(line => line[0] >= '0' && line[0] <= '9' && delimeters.includes(line[1]) ? (count++) : 0)
  if (count > 0) {
    console.log(count)
    const result = []
    lines.forEach(line => {
      if (line[0] >= '0' && line[0] <= '9' && delimeters.includes(line[1])) {
        result.push(line.slice(2).trim())
      } else if (!result.length) {
        result.push(line.trim())
      } else {
        result[result.length - 1] = result[result.length - 1] + ' ' + line
      }
    })
    return result
  }
  return null
}

const findInitialChar = lines => {
  const chars = ['•', '•', '*', '+', '•', '‣', '∙', '⋅', '◦', '⦾', '⦿']
  for (let char of chars) {
    let count = 0
    lines.forEach(line => line[0] === char ? (count++) : 0)
    if (count > 1) return char
  }
}

const splitLines = (lines, initialChar) => {
  const result = []
  lines.forEach(line => {
    if (line[0] === initialChar) {
      result.push(line.slice(1).trim())
    } else if (!result.length) {
      result.push(line.trim())
    } else {
      result[result.length - 1] = result[result.length - 1] + ' ' + line
    }
  })
  return result
}

export const splitList = text => {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  const initialChar = findInitialChar(lines)
  if (initialChar) return splitLines(lines, initialChar)
  const numbered = splitNumbers(lines)
  if (numbered) return numbered
  return lines
}

export const findIngredient = (allIngredients, text) => {
  const names = [].concat(...allIngredients.map(i => i.plural
    ? [[i.plural, i.id], [i.name, i.id]]
    : [[i.name, i.id]]))
  // TODO include alternative names
  names.sort((a, b) => b[0].length - a[0].length)
  const haystack = text.toLowerCase()
  for (let [name, id] of names) {
    const rx = new RegExp('\\b' + name + '\\b', 'i')
    const match = haystack.match(rx)
    if (match && match.index === 0) {
    // if (haystack.indexOf(name.toLowerCase()) === 0) {
      let rest = text.slice(name.length)
      if (rest[0] === ',') rest = rest.slice(1).trim()
      return [id, rest]
    }
  }
  for (let [name, id] of names) {
    const rx = new RegExp('\\b' + name + '\\b', 'i')
    const match = haystack.match(rx)
    if (match) {
    // if (haystack.indexOf(name.toLowerCase()) != -1) {
      return [id, text]
    }
  }
  return [null, text]
}

const modifiers = [
  'frozen', 'thawed',
  'peeled', 'chopped',
  'boiled', 'drained',
  'rinsed', 'washed',
  'crushed',
  'whipped', 
  'medium', 
  'medium-sized', 'medium sized', 'large', 'small',
]

const guessIngredient = text => {
  if (!text) return ['', text]
  let i = text.indexOf(',')
  let j = text.indexOf('*')
  if (i === -1 || (j !== -1 && j < i)) i = j
  j = text.indexOf('(')
  if (i === -1 || (j !== -1 && j < i)) i = j
  let guess
  let rest
  if (i !== -1) {
    guess = text.slice(0, i).trim()
    rest = text.slice(i).trim()
    if (rest[0] === ',') rest = rest.slice(1)
    return [guess, rest]
  } else {
    guess = text
    rest = ''
  }
  for (let mod of modifiers) {
    if (guess.indexOf(mod + ' ') === 0) {
      guess = guess.slice(mod.length + 1)
      rest = rest ? mod + ', ' + rest : mod
    }
  }
  return [guess, rest]
}

export const maybeFindIngredient = (allIngredients, ingredient) => {
  const [id, comments] = findIngredient(allIngredients, ingredient.comments)
  if (!id) {
    const [guess, comments] = guessIngredient(ingredient.comments)
    return Object.assign({}, ingredient, {guess, comments})
  }
  return Object.assign({}, ingredient, {ingredient: id, comments})
}
