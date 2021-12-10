import chineseTokenizer from 'chinese-tokenizer' // https://github.com/yishn/chinese-tokenizer
import customDictText from './data/customDict'
import { extractKeywordFromDictEntry, getHigherFrequencyDictEntry } from './utils/chinese'
import hanvietify from './utils/hanviet'

const customDict = customDictText.split('\n')

export async function initTokenizerAsync() {
  const response = await fetch('data/cedict_ts.u8')
  const dict = await response.text()

  const tokenize = chineseTokenizer.load(
    customDict.join('\n') + '\n'
    + dict)
  return tokenize
}

export function enrichToken(tokens) {
  return tokens.map(token => {
    const dictEntry = getHigherFrequencyDictEntry(token)
    const keyword = extractKeywordFromDictEntry(dictEntry)
    const hanviet = hanvietify(token.text)
    return {
      ...token,
      keyword,
      hanviet
    }
  })
}

export function tokenizeContent(tokenize, content) {
  if (tokenize instanceof Function)
    return enrichToken(tokenize(content))
  else
    return []
}

export function tokenizeContentBasic(content) {
  return [...content]
}
