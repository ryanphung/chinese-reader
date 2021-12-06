import { useMemo } from 'react'
import './Word.css'
// import pinyinify from 'pinyin'
import hanvietify from '../utils/hanviet'
import { extractKeywordFromDictEntry, getHigherFrequencyDictEntry } from '../utils/chinese'

function Word({ token, rshFrame, vocabularyDb, onClick, onHover }) {
  const char = token.text
  const matched = !!token.matches.length
  const isLineBreak = char === '\n'
  const dictEntry = useMemo(() => getHigherFrequencyDictEntry(token), [token])
  const keyword = useMemo(() => extractKeywordFromDictEntry(dictEntry), [dictEntry])
  const hanviet = hanvietify(char)
  // const pinyins = (rshFrame?.pinyin || '').replace('{', '').replace('}', '').replace(/<.*?>/gi, '').split(',')

  const pinyin = useMemo(() => {
    if (token.matches.length) {
      return token.matches[0].pinyinPretty
      // return token.matches[0].pinyinPretty
      // const pinyins = pinyinify(char)
      // return pinyins?.[0]?.join()
    }
  }, [token.matches])

  const vocabularyLevel = vocabularyDb[char]
  const showPinyin = true//vocabularyLevel !== 4
  // const showHanviet = showPinyin
  // const showKeyword = showPinyin

  return (
    isLineBreak ?
    <div className="Word-line-break"/> :
    <div className={[
      "Word",
      matched ? 'Word-matched' : '',
      typeof(vocabularyLevel) === 'number' ? `Word-level-${vocabularyLevel}` : ''
    ].join(' ')}
      onClick={() => matched && onClick(char)}
      onMouseEnter={() => matched ? onHover(token) : onHover()}
      onMouseLeave={() => onHover()}
    >
      {/* {
        <div className="Word-keyword">
          {showKeyword ? keyword : '\u00A0'}
        </div>
      }
      {
        <div className="Word-hanviet">
          {showHanviet ? pinyin : '\u00A0'}
        </div>
      } */}
      <div className="Word-pinyin">
        {
          showPinyin && pinyin ?
          pinyin.split(' ').map((v, i) => <span key={i}>{v}</span>)
          : '\u00A0'
        }
      </div>
      <div className="Word-char">
        {
          vocabularyLevel === 0 ? '\u00A0' + keyword + '\u00A0' :
          vocabularyLevel === 1 ? '\u00A0' + hanviet + '\u00A0':
          vocabularyLevel === 2 ? '\u00A0' + pinyin + '\u00A0':
          char === ' ' ? '\u00A0' : char
        }
      </div>
    </div>
  )
}

export default Word
