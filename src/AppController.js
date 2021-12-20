import { load } from './utils/chinese-tokenizer'
import keywordsText from './data/keywords'
import { extractKeywordFromDictEntry, getHigherFrequencyDictEntry } from './utils/chinese'
import hanvietify from './utils/hanviet'

export async function initTokenizerAsync() {
  const response = await fetch('data/cedict_ts.u8')
  const dict = await response.text()

  return load(
    keywordsText + '\n' +
    dict)
}

export function getPinyin(dictionary, word) {
  // FIXME: can be more efficient
  let result = []
  for (let char of word) {
    const entries = getDictionaryEntries(dictionary, char)
    const pinyin = entries.matches?.[0]?.pinyinPretty
    if (pinyin)
      result.push(pinyin)
  }
  return result.join(' ')
}

export function enrichToken(dictionary, token) {
  const dictEntry = getHigherFrequencyDictEntry(token)
  const keyword = extractKeywordFromDictEntry(dictEntry)
  const hanviet = hanvietify(token.text)
  const pinyin = token.matches?.[0]?.pinyinPretty ?? getPinyin(dictionary, token.text)
  const isWord = !!token.matches.length

  return {
    text: token.text,
    simplified: token.simplified,
    traditional: token.traditional,
    keyword,
    hanviet,
    pinyin,
    isWord
  }
}

export function enrichTokens(dictionary, tokens) {
  return tokens.map(token => enrichToken(dictionary, token))
}

export function splitSentences(tokens) {
  let results = []
  let sentence = []

  for (let token of tokens) {
    sentence.push({
      sentenceId: results.length,
      tokenId: sentence.length,
      ...token
    })

    if (token.text === '。' || token.text === '\n') {
      results.push(sentence)
      sentence = []
    }
  }

  results.push(sentence)

  return results
}

export function tokenizeContent(tokenize, dictionary, content) {
  if (!tokenize instanceof Function)
    return []

  return splitSentences(enrichTokens(dictionary, tokenize(content)))
}

export function getDictionaryEntries(dictionary, word) {
  let simplifiedEntries = dictionary.get(word, false)
  let traditionalEntries = dictionary.get(word, true)

  let entries =
      simplifiedEntries.length === 0 ? traditionalEntries : simplifiedEntries

  return {
      text: word,
      traditional: entries[0] ? entries[0].traditional : word,
      simplified: entries[0] ? entries[0].simplified : word,

      matches: entries.map(({pinyin, pinyinPretty, english}) => ({
          pinyin,
          pinyinPretty,
          english
      }))
  }
}

function getSentenceText(sentence) {
  return sentence.reduce((s, token) => s + token.text, '')
}

function findTokenIndex(sentence, offset) {
  let tokenOffset = 0
  for (let i in sentence) {
    tokenOffset += sentence[i].text.length
    if (tokenOffset > offset)
      return +i
  }
}

/**
 * Force tokenizing a sentence with a selected text
 **/
export function retokenizeSentence(tokenize, dictionary, sentence, start, end) {
  if (!tokenize instanceof Function)
    return []

  // for example sentence (grouped by tokens) is:
  // [012, 345, 678, 9]
  // and the selection is from 5 to 6
  // we will want to split it into a few parts:
  // - tokensBefore: [012]
  // - tokensSelected: [345678]
  // - tokensAfter: [9]
  const startTokenIndex = findTokenIndex(sentence, start)
  const endTokenIndex = findTokenIndex(sentence, end - 1) + 1

  const tokensBefore = sentence.slice(0, startTokenIndex)
  const tokensSelected = sentence.slice(startTokenIndex, endTokenIndex)
  const tokensAfter = sentence.slice(endTokenIndex)

  const beforeTokensText = getSentenceText(tokensBefore)
  const selectedTokensText = getSentenceText(tokensSelected)

  const beforeText = selectedTokensText.slice(0, start - beforeTokensText.length)
  const selectedText = selectedTokensText.slice(start - beforeTokensText.length, end - beforeTokensText.length)
  const afterText = selectedTokensText.slice(end - beforeTokensText.length)

  const tokensFromBeforeText = enrichTokens(dictionary, tokenize(beforeText))
  let tokenFromSelectedText = enrichToken(dictionary, getDictionaryEntries(dictionary, selectedText))
  if (!tokenFromSelectedText.isWord) {
    tokenFromSelectedText.isWord = true
    tokenFromSelectedText.keyword = 'unknown'
  }
  const tokensFromAfterText = enrichTokens(dictionary, tokenize(afterText))

  return {
    sentence: [
      ...tokensBefore,
      ...tokensFromBeforeText,
      ...[tokenFromSelectedText],
      ...tokensFromAfterText,
      ...tokensAfter
    ],
    newTokenId: tokensBefore.length + tokensFromBeforeText.length
  }
}

export function tokenizeContentBasic(content) {
  return [...content]
}
