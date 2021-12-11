import chineseTokenizer from './utils/chinese-tokenizer'
import keywordsText from './data/keywords'
import { extractKeywordFromDictEntry, getHigherFrequencyDictEntry } from './utils/chinese'
import hanvietify from './utils/hanviet'

export async function initTokenizerAsync() {
  const response = await fetch('data/cedict_ts.u8')
  const dict = await response.text()

  return chineseTokenizer.load(
    keywordsText + '\n' +
    dict)
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
