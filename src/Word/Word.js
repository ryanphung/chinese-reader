import { useMemo } from 'react'
import './Word.css'
// import pinyinify from 'pinyin'
import hanvietify from '../utils/hanviet'
import { extractKeywordFromDictEntry, getHigherFrequencyDictEntry } from '../utils/chinese'

function Word({ token, rshFrame, vocabularyDb, recommendedVocabularyDb, onClick, onHover, settings={} }) {
  const {
    transcriptMethod='pinyin',
    script='simplified'
  } = settings
  const text = token.text
  const displayedText = script === 'simplified' ? token.simplified : token.traditional
  const matched = !!token.matches.length
  const isLineBreak = text === '\n'
  const dictEntry = useMemo(() => getHigherFrequencyDictEntry(token), [token])
  const keyword = useMemo(() => extractKeywordFromDictEntry(dictEntry), [dictEntry])
  const hanviet = hanvietify(text)
  // const pinyins = (rshFrame?.pinyin || '').replace('{', '').replace('}', '').replace(/<.*?>/gi, '').split(',')

  const pinyin = useMemo(() => {
    if (token.matches.length) {
      return token.matches[0].pinyinPretty
      // return token.matches[0].pinyinPretty
      // const pinyins = pinyinify(text)
      // return pinyins?.[0]?.join()
    }
  }, [token.matches])

  const isVocabulary = typeof(vocabularyDb[text]) !== 'undefined'
  const vocabularyLevel = (vocabularyDb[text] ?? recommendedVocabularyDb[text])?.level ?? (matched ? 0 : undefined)
  const showPinyin = true//vocabularyLevel !== 4
  // const showHanviet = showPinyin
  // const showKeyword = showPinyin

  const transcript = transcriptMethod === 'pinyin' ? pinyin : hanviet

  return (
    isLineBreak ?
    <div className="Word-line-break"/> :
    <div className={[
      "Word",
      matched ? 'Word-matched' : '',
      typeof(vocabularyLevel) === 'number' ? `Word-level-${vocabularyLevel}` : '',
      isVocabulary ? 'Word-vocabulary' : ''
    ].join(' ')}
      onClick={() => matched && onClick(text)}
      onMouseEnter={() => matched ? onHover(token) : onHover()}
      onMouseLeave={() => onHover()}
    >
      {/* {
        <div className="Word-keyword">
          {showKeyword ? keyword : '\u00A0'}
        </div>
      }*/}
      <div className="Word-pinyin">
        {
          vocabularyLevel === 2 ? [...displayedText].map((v, i) => <span key={i}>{v}</span>) :
          transcript ? transcript.split(' ').map((v, i) => <span key={i}>{v}</span>) : '\u00A0'
        }
      </div>
      <div className="Word-char">
        {
          vocabularyLevel === 0 ? '\u00A0' + keyword + '\u00A0' :
          vocabularyLevel === 1 ? '\u00A0' + hanviet + '\u00A0':
          vocabularyLevel === 2 ? '\u00A0' + pinyin + '\u00A0':
          text === ' ' ? '\u00A0' : displayedText
        }
      </div>
    </div>
  )
}

export default Word
