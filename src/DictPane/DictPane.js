import React, { Fragment, useMemo } from 'react'
import './DictPane.scss'
import hanvietify from '../utils/hanviet'

const DictPane = React.memo(function DictPane({
  token={}, dictionary, settings={},
  onTokenUpdate
}) {
  const { text, pinyin, keyword } = token

  function handlePinyinClick() {
    const t = prompt('Update pinyin', pinyin)
    if (t)
      onTokenUpdate({
        ...token,
        pinyin: t
      })
  }

  function handleKeywordClick() {
    const t = prompt('Enter a new keyword', keyword)
    if (t)
      onTokenUpdate({
        ...token,
        keyword: t
      })
  }

  const {
    script='simplified'
  } = settings
  const hanviet = useMemo(() => hanvietify(text), [text])
  const entries = useMemo(() => dictionary && text ? dictionary.get(text) : null, [dictionary, text])
  const displayedText = (script === 'simplified' ? entries?.[0]?.simplified : entries?.[0]?.traditional) ?? text
  return (
    <div className="DictPane">
      <div>
        <span className="DictPane-hanzi">
          {displayedText}
        </span>
        <span className="DictPane-pinyin DictPane-clickable" onClick={handlePinyinClick}>
          {pinyin}
        </span>
        <span className="DictPane-hanviet DictPane-clickable">
          {hanviet}
        </span>
        <span className="DictPane-meaning DictPane-clickable" onClick={handleKeywordClick}>
          {keyword}
        </span>
      </div>
      {
        !!entries?.length &&
        <div className="DictPane-info">
          <strong>Dictionary:</strong>
          {
            entries?.map?.((v, i) =>
              <div key={i} className="DictPane-line">
                <div className="DictPane-pinyin">
                  {v.pinyinPretty}
                </div>
                <div className="DictPane-meaning">
                  <Meaning meaning={v.english}/>
                </div>
              </div>
            )
          }
        </div>
      }
    </div>
  )
})

function Meaning({ meaning }) {
  const meaningSplit = (meaning || '').split('/')
  return meaningSplit.map((v, i) =>
    <Fragment key={i}>
      {v}
      {meaningSplit[i + 1] && <span className="DictPane-separator"> / </span>}
    </Fragment>
  )
}

export default DictPane
