import { dirname } from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))

const TONE_MARKS_TO_NUMBERS = {
  'ā': 1,
  'ō': 1,
  'ē': 1,
  'ī': 1,
  'ū': 1,
  'ǖ': 1,

  'á': 2,
  'ó': 2,
  'é': 2,
  'í': 2,
  'ú': 2,
  'ǘ': 2,

  'ǎ': 3,
  'ǒ': 3,
  'ě': 3,
  'ǐ': 3,
  'ǔ': 3,
  'ǚ': 3,

  'à': 4,
  'ò': 4,
  'è': 4,
  'ì': 4,
  'ù': 4,
  'ǜ': 4
}

const TONE_MARKS_TO_VOWELS = {
  'ā': 'a',
  'ō': 'o',
  'ē': 'e',
  'ī': 'i',
  'ū': 'u',
  'ǖ': 'ü',

  'á': 'a',
  'ó': 'o',
  'é': 'e',
  'í': 'i',
  'ú': 'u',
  'ǘ': 'ü',

  'ǎ': 'a',
  'ǒ': 'o',
  'ě': 'e',
  'ǐ': 'i',
  'ǔ': 'u',
  'ǚ': 'ü',

  'à': 'a',
  'ò': 'o',
  'è': 'e',
  'ì': 'i',
  'ù': 'u',
  'ǜ': 'ü'
}

function pinyinWordToneToNumber(word) {
  let toneNumber = 5
  let result = ''
  for (let char of word) {
    if (TONE_MARKS_TO_NUMBERS[char]) {
      toneNumber = TONE_MARKS_TO_NUMBERS[char]
      result += TONE_MARKS_TO_VOWELS[char]
    } else {
      result += char
    }
  }
  return result + toneNumber
}


function pinyinTextToneToNumber(text) {
  const words = text.split(' ')
  return words.map(pinyinWordToneToNumber).join(' ')
}

function tokenFileToMap(filename, tokensMap={}) {
  const text = fs.readFileSync(filename, 'utf8')

  const tokens = JSON.parse(text)

  tokens.forEach(sentence => {
    sentence.forEach(token => {
      if (!tokensMap[token.text])
        tokensMap[token.text] = token
    })
  })

  return tokensMap
}

function enrichVocabulary() {
  try {
    let tokensMap = {}

    for (let i = 0; i <= 7; i++)
      tokensMap = tokenFileToMap(__dirname + `/../../src/data/tokens/tokens-${i}.json`, tokensMap)

    console.log('Parse complete. Example:')
    console.log(tokensMap['故事'])

    const dictionarEntries =
      Object.entries(tokensMap)
        .filter(([key, word]) => word.keyword)
        .map(([key, word]) =>
          [
            word.traditional,
            word.simplified,
            `[${pinyinTextToneToNumber(word.pinyin)}]`,
            `/${word.keyword}/`
          ].join(' ')
    )

    console.log('Parse complete. Example:')
    console.log(dictionarEntries[dictionarEntries.length - 1])

    // write file
    fs.writeFileSync(__dirname + '/../saved/keywords.txt', dictionarEntries.join('\n'), 'utf8')
    console.log('Written to file')
  } catch (err) {
    console.error(err)
  }
}

enrichVocabulary()

// console.log(pinyinTextToneToNumber('Nín hǎo Wǒ shì zhōng guó rén'))
