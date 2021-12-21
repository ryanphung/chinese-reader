import { dirname } from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))

function enrichVocabulary() {
  try {
    // read file
    const text = fs.readFileSync(__dirname + '/../../src/data/tokens.json', 'utf8')

    const tokens = JSON.parse(text)

    const tokensMap = {}

    tokens.forEach(chapter => {
      chapter.forEach(sentence => {
        sentence.forEach(token => {
          if (!tokensMap[token.text])
            tokensMap[token.text] = token
        })
      })
    })

    console.log('Parse complete. Example:')
    console.log(tokens[0][1][0])

    const text2 = fs.readFileSync(__dirname + '/../saved/vocabulary-db.json', 'utf8')

    const vocabularyDb = JSON.parse(text2)

    console.log('Parse complete. Example:')
    console.log(vocabularyDb['故事'])

    const enrichedVocabularyDb = {}

    Object.keys(vocabularyDb).forEach(word => {
      const token = tokensMap[word] || {}
      enrichedVocabularyDb[word] = {
        ...vocabularyDb[word],
        simplified: token.simplified,
        traditional: token.traditional,
        keyword: token.keyword,
        hanviet: token.hanviet,
        pinyin: token.pinyin
      }
    })

    console.log('Parse complete. Example:')
    console.log(enrichedVocabularyDb['故事'])

    // write file
    fs.writeFileSync(__dirname + '/../saved/enriched-vocabulary-db.json', JSON.stringify(enrichedVocabularyDb, null, 2), 'utf8')
    console.log('Written to file')
  } catch (err) {
    console.error(err)
  }
}

enrichVocabulary()
