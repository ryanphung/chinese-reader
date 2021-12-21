import React, { Fragment, useMemo } from 'react'
import './DictPane.scss'
import * as Icon from 'react-feather'

const DictPane = React.memo(function DictPane({
  tokenPosition,
  token={}, dictionary, settings={},
  onTokenUpdate
}) {
  const { text, pinyin, hanviet, keyword } = token

  function handleDeleteTokenClick() {
    const t = window.confirm('Are you sure you want to delete this token?')
    if (t)
      onTokenUpdate({
        tokenPosition,
        token: {
          ...token,
          isWord: false
        }
      })
  }

  function handlePinyinClick(event, newPinyin) {
    const t = prompt('Update pinyin', newPinyin ?? pinyin)
    if (t)
      onTokenUpdate({
        tokenPosition,
        token: {
          ...token,
          pinyin: t
        }
      })
  }

  function handleHanvietClick() {
    const t = prompt('Update hanviet', hanviet)
    if (t)
      onTokenUpdate({
        tokenPosition,
        token: {
          ...token,
          hanviet: t
        }
      })
  }

  function handleKeywordClick(event, newKeyword) {
    const t = prompt('Enter a new keyword', newKeyword ?? keyword)
    if (t)
      onTokenUpdate({
        tokenPosition,
        token: {
          ...token,
          keyword: t
        }
      })
  }

  const {
    script='simplified'
  } = settings
  const entries = useMemo(() => dictionary && text ? dictionary.get(text) : null, [dictionary, text])
  const displayedText = (script === 'simplified' ? entries?.[0]?.simplified : entries?.[0]?.traditional) ?? text
  return (
    <div className="DictPane">
      <div>
        <span className="DictPane-hanzi DictPane-hoverable">
          <Icon.Trash2 size={16} className="DictPane-delete-icon DictPane-hoverable-icon DictPane-clickable" onClick={handleDeleteTokenClick}/>
          {displayedText}
          <br/>
        </span>
        {
          !!hanviet &&
          <>
            <span className="DictPane-hanviet DictPane-clickable DictPane-hoverable" onClick={handleHanvietClick}>
              {hanviet}
              <Icon.Edit2 size={16} className="DictPane-edit-icon DictPane-hoverable-icon"/>
            </span>
          </>
        }
        {
          !!pinyin &&
          <>
            <span className="DictPane-pinyin DictPane-clickable DictPane-hoverable" onClick={handlePinyinClick}>
              {pinyin}
              <Icon.Edit2 size={16} className="DictPane-edit-icon DictPane-hoverable-icon"/>
            </span>
          </>
        }
        {
          !!keyword &&
          <>
            <span className="DictPane-meaning DictPane-clickable DictPane-hoverable" onClick={handleKeywordClick}>
              {keyword}
              <Icon.Edit2 size={16} className="DictPane-edit-icon DictPane-hoverable-icon"/>
            </span>
          </>
        }
      </div>
      {
        !!entries?.length &&
        <div className="DictPane-info">
          <span><Icon.BookOpen size={16} style={{position: 'relative', top: 3, marginRight: 4}}/><strong>DICTIONARY</strong></span>
          {
            entries?.map?.((v, i) =>
              <div key={i} className="DictPane-line">
                <div className="DictPane-pinyin DictPane-clickable DictPane-hoverable-underline" onClick={event => handlePinyinClick(event, v.pinyinPretty)}>
                  {v.pinyinPretty}
                </div>
                <div className="DictPane-meaning">
                  <Meaning meaning={v.english} onMeaningClick={handleKeywordClick}/>
                </div>
              </div>
            )
          }
        </div>
      }
    </div>
  )
})

function Meaning({ meaning, onMeaningClick }) {
  const meaningSplit = (meaning || '').split('/')
  return meaningSplit.map((v, i) =>
    <Fragment key={i}>
      <span className="DictPane-clickable DictPane-hoverable-underline" onClick={event => onMeaningClick(event, v)}>
        {v}
      </span>
      {meaningSplit[i + 1] && <span className="DictPane-separator"> / </span>}
    </Fragment>
  )
}

export default DictPane
