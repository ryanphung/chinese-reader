import { useMemo } from 'react'
import './Character.css'
import pinyinify from 'pinyin'
import hanvietify from '../utils/hanviet'

function Character({ char, rshFrame, pinyinLevelDb, onClick }) {
  const isLineBreak = char === '\n'
  const keyword = rshFrame?.keyword
  const hanviet = hanvietify(char)
  // const pinyins = (rshFrame?.pinyin || '').replace('{', '').replace('}', '').replace(/<.*?>/gi, '').split(',')

  const pinyin = useMemo(() => {
    if (char.match(/[\u3400-\u9FBF]/)) {
      const pinyins = pinyinify(char)
      return pinyins?.[0]?.[0]
    }
  }, [char])

  const pinyinLevel = pinyinLevelDb[char]
  const showPinyin = true//pinyinLevel !== 4
  const showHanviet = showPinyin
  const showKeyword = showPinyin

  return (
    isLineBreak ?
    <div className="Character-line-break"/> :
    <div className="Character" onClick={() => onClick(char)}>
      {
        <div className="Character-keyword">
          {showKeyword ? keyword : '\u00A0'}
        </div>
      }
      {
        <div className="Character-hanviet">
          {showHanviet ? hanviet : '\u00A0'}
        </div>
      }
      {
        <div className={`Character-pinyin Character-pinyin-level-${pinyinLevel}`}>
          {showPinyin ? pinyin : '\u00A0'}
        </div>
      }
      <div  className="Character-char">
        {char}
      </div>
    </div>
  )
}

export default Character
