import chineseTokenizer from 'chinese-tokenizer' // https://github.com/yishn/chinese-tokenizer
import customDictText from './data/customDict'

const customDict = customDictText.split('\n')

export async function initTokenizerAsync() {
  const response = await fetch('data/cedict_ts.u8')
  const dict = await response.text()

  const tokenize = chineseTokenizer.load(
    customDict.join('\n') + '\n'
    + dict)
  return tokenize
}

export function tokenizeContent(tokenize, content) {
  if (tokenize instanceof Function)
    return tokenize(content)
  else
    return []
}

export function tokenizeContentBasic(content) {
  return [...content]
}
