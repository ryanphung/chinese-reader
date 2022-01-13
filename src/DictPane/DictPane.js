import React, { Fragment, useMemo, useEffect } from 'react'
import './DictPane.scss'
import * as Icon from 'react-feather'


const DictPane = React.memo(function DictPane({
  selection,
  selectedToken,
  hoveredTokenPosition,
  hoveredToken,
  dictionary, settings={},
  onTokenUpdate, onTokenAdd,
  voice
}) {
  const token = selectedToken || hoveredToken
  const tokenPosition = selection || hoveredTokenPosition
  const isTokenSelected = !!selectedToken

  const { pinyin, hanviet, keyword } = token || {}
  const text = token?.text || selection?.text
  const isWordToken = !!token?.isWord
  const showDelete = isWordToken && isTokenSelected
  const showGoogleTranslate = !!text && !isWordToken
  const showUsePhrase = !!text && !isWordToken
  const showButtons = showDelete || showGoogleTranslate || showUsePhrase

  useEffect(() => {
    if (voice && text) {
      var msg = new SpeechSynthesisUtterance()
      msg.text = text
      msg.lang = 'zh'
      msg.voice = voice
      if (window.speechSynthesis.speaking)
        window.speechSynthesis.cancel()
      window.speechSynthesis.speak(msg)
    }
  }, [text, voice, tokenPosition?.sid, tokenPosition?.tid])

  function handleAddTokenClick() {
    onTokenAdd({ selection })
  }

  function handleDeleteTokenClick() {
    const t = window.confirm('Are you sure you want to delete this token?')
    if (t)
      onTokenUpdate({
        tokenPosition,
        token: {
          ...token,
          keyword: undefined,
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
  const dictionaryWords = useMemo(() => {
    if (!dictionary) return
    if (!text) return
    let termsMap = new Set()
    let results = []
    // FIXME: naive algorithm to get all dict entries
    for (let i = 0; i < text.length; i++) {
      for (let j = text.length; j >= i + 1; j--) {
        const t = text.slice(i, j)
        termsMap.add(t)
      }
    }

    for (let t of Array.from(termsMap)) {
      const entries = dictionary.get(t)
      if (entries.length) {
        results.push({
          text: t,
          entries
        })
      }
    }
    return results
  }, [dictionary, text])

  let displayedText = (script === 'simplified' ? dictionaryWords?.[0]?.entries?.[0]?.simplified : dictionaryWords?.[0]?.entries?.[0]?.traditional) ?? text
  if (displayedText?.length < text?.length) displayedText = text

  return (
    <div className="DictPane">
      <div>
        <span className="DictPane-hanzi">
          {displayedText}
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
        {
          showButtons &&
          <div class="DictPane-info" style={{marginTop: 4, flexDirection: "row", gap: 4}}>
            {
              showGoogleTranslate &&
              <a href={`https://translate.google.com/?sl=zh-CN&tl=en&text=${text}&op=translate`} target="_blank">
                <button style={{fontSize: '.25rem'}}>
                  <Icon.ExternalLink size={16} style={{position: 'relative', top: 2}}/> Google Translate
                </button>
              </a>
            }
            {
              showUsePhrase &&
              <button style={{fontSize: '.25rem'}} onClick={handleAddTokenClick}>
                <Icon.Check size={16} style={{position: 'relative', top: 2}}/> Use Phrase
              </button>
            }
            {
              showDelete &&
              <button style={{fontSize: '.25rem'}} onClick={handleDeleteTokenClick}>
                <Icon.Trash2 size={16} style={{position: 'relative', top: 2}}/> Delete Phrase
              </button>
            }
          </div>
        }
      </div>
      {
        !!dictionaryWords?.length &&
        <>
          <div className="DictPane-info DictPane-border-top DictPane-border-bottom">
            <span><Icon.BookOpen size={16} style={{position: 'relative', top: 3, marginRight: 4}}/><strong>DICTIONARY</strong></span>
            {
              dictionaryWords?.map?.((dictionaryWord, i) =>
                <DictionaryWord key={i} dictionaryWord={dictionaryWord} handlePinyinClick={handlePinyinClick} handleKeywordClick={handleKeywordClick} script={script}/>
              )
            }
          </div>
        </>
      }
    </div>
  )
})

function DictionaryWord({ dictionaryWord, handlePinyinClick, handleKeywordClick, script }) {
  const displayedText = (script === 'simplified' ? dictionaryWord?.entries?.[0]?.simplified : dictionaryWord?.entries?.[0]?.traditional) ?? dictionaryWord.text
  return (
    <>
      {
        dictionaryWord?.entries?.map?.((v, i) =>
          <div key={i} className="DictPane-line">
            <span className="DictPane-hanzi">
              {displayedText}
            </span>
            <div className="DictPane-pinyin DictPane-clickable DictPane-hoverable-underline" onClick={event => handlePinyinClick(event, v.pinyinPretty)}>
              {v.pinyinPretty}
            </div>
            <div className="DictPane-meaning">
              <Meaning meaning={v.english} onMeaningClick={handleKeywordClick}/>
            </div>
          </div>
        )
      }
    </>
  )
}

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
