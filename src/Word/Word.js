import React, { useMemo, useCallback } from 'react'
import './Word.css'
// import pinyinify from 'pinyin'
import * as Icon from 'react-feather'

const Word = React.memo(function Word({ token, selectedTokenPosition, hoveredTokenPosition, vocabularyDb, recommendedVocabularyDb, onClick, onActionClick, onHover, hoverDisabled, settings={} }) {
  const {
    transcriptMethod='pinyin',
    script='simplified'
  } = settings
  const { text, keyword, hanviet, pinyin, isWord } = token
  const isSelected =
    selectedTokenPosition?.sid === token?.sid &&
    selectedTokenPosition?.tid === token?.tid
  const isHovered =
    hoveredTokenPosition?.sid === token?.sid &&
    hoveredTokenPosition?.tid === token?.tid
  const displayedText = script === 'simplified' ? token.simplified : token.traditional
  const isLineBreak = text === '\n'
  const isRecommended = typeof(recommendedVocabularyDb[text]) !== 'undefined'
  const isVocabulary = typeof(vocabularyDb[text]) !== 'undefined'
  const isNew = isWord && !isRecommended && !isVocabulary
  const vocabularyLevel = (vocabularyDb[text] ?? recommendedVocabularyDb[text])?.level ?? (isWord ? 0 : undefined)

  const handleClick = useCallback(function handleClick(e) {
    if (!isWord) return

    if (!onClick instanceof Function) return

    onClick(e, {
      sid: token.sid,
      tid: token.tid
    })
  }, [isWord, onClick, token.sid, token.tid])

  const handleActionClick = useCallback(function handleActionClick(e) {
    debugger
    onActionClick(e, {
      sid: token.sid,
      tid: token.tid
    })
  }, [onActionClick, token.sid, token.tid])

  return (
    isLineBreak ?
    <span className="Word-line-break"/> :
    <span className={[
      "Word",
      isWord ? 'Word-matched' : '',
      typeof(vocabularyLevel) === 'number' ? `Word-level-${vocabularyLevel}` : '',
      isRecommended ? 'Word-recommended' : '',
      isVocabulary ? 'Word-vocabulary' : '',
      isNew ? 'Word-new' : '',
      isSelected ? 'Word-selected' : '',
      isHovered ? 'Word-hovered' : ''
    ].join(' ')}
      onMouseEnter={() => isWord ? onHover(token) : onHover()}
      onMouseLeave={() => onHover()}
    >
      <InnerWord
        vocabularyLevel={vocabularyLevel}
        keyword={keyword}
        hanviet={hanviet}
        pinyin={pinyin}
        text={displayedText}
        transcriptMethod={transcriptMethod}
        script={script}
        onClick={handleClick}
      />
      {
        !hoverDisabled && isWord && (isHovered || isSelected) &&
        <WordActionPopup
          handleActionClick={handleActionClick}
          isVocabulary={isVocabulary}
          isRecommended={isRecommended}
          vocabularyLevel={vocabularyLevel}
        />
      }
    </span>
  )
})

const WordActionPopup = React.memo(function WordActionPopup({
  handleActionClick,
  isVocabulary,
  isRecommended,
  vocabularyLevel
}) {
  return (
    <div className="Word-action-popup" onClick={handleActionClick}>
      {
        !isVocabulary &&
        (
          isRecommended ?
          <div>Add Recommended Word</div> :
          <div>Add New Word</div>
        )
      }
      {
        isVocabulary &&
        (
          (vocabularyLevel < 4) ?
          `Level ${vocabularyLevel}` :
          <Icon.Check size={24}/>
        )
      }
    </div>
  )
})

const InnerWord = React.memo(function InnerWord({
  vocabularyLevel,
  keyword,
  hanviet,
  pinyin,
  transcriptMethod,
  script,
  text,
  onClick
}) {
  const transcript = useMemo(() =>
    transcriptMethod === 'pinyin' ? pinyin : hanviet,
    [transcriptMethod, pinyin, hanviet]
  )

  return (
    vocabularyLevel === 0 ? <WordByText onClick={onClick} text={text} transcript={transcript} meaning={keyword}/> :
    vocabularyLevel === 1 ? <WordByText onClick={onClick} text={text} transcript={transcript} meaning=""/> :
    vocabularyLevel === 2 ? <WordByText onClick={onClick} text={text} transcript="" meaning={keyword}/> :
    vocabularyLevel === 3 ? <WordByText onClick={onClick} text={text} transcript={hanviet} meaning=""/> :
    <WordByText onClick={onClick} text={text} transcript="" meaning=""/>
  )
})

// function WordByTranscript({
//   transcript,
//   text
// }) {
//   const textSplit = [...text]
//   const transcriptSplit = transcript?.split?.(' ') ?? []
//
//   return (
//     <>⟨{
//       transcriptSplit.map((v, i) =>
//         <Fragment key={i}>
//           <span annotation={textSplit?.[i]}>
//             {v}
//           </span>
//           {!!transcriptSplit[i + 1] && ' '}
//         </Fragment>
//       )
//     }⟩</>
//   )
// }

function WordByText({
  text,
  transcript,
  meaning,
  onClick
}) {
  const textSplit = [...text]
  const transcriptSplit = transcript?.split?.(' ') ?? []

  return (
    text === ' ' ? '\u00A0' :
    <span onClick={onClick} annotation2={meaning}>
      {
        textSplit.map((v, i) =>
          <span key={i} annotation={transcriptSplit?.[i] || undefined}>{v}</span>
        )
      }
    </span>
  )
}

export default Word
