import React, { useMemo, useCallback } from 'react'
import './Word.css'
// import pinyinify from 'pinyin'
// import * as Icon from 'react-feather'

const Word = React.memo(function Word({ tokenPosition, token, /*selection, */hoveredTokenPosition, vocabularyDb, recommendedVocabularyDb, onClick, onActionClick, onHover, hoverDisabled, settings={} }) {
  const {
    transcriptMethod='pinyin',
    script='simplified'
  } = settings
  const { text, keyword, hanviet, pinyin, isWord } = token
  // const isSelected =
  //   selection?.sid === tokenPosition.sid &&
  //   selection?.tid === tokenPosition.tid
  const isHovered =
    hoveredTokenPosition?.sid === tokenPosition.sid &&
    hoveredTokenPosition?.tid === tokenPosition.tid
  const displayedText = script === 'simplified' ? token.simplified : token.traditional
  const isLineBreak = text === '\n'
  const isRecommended = typeof(recommendedVocabularyDb[text]) !== 'undefined'
  const isVocabulary = typeof(vocabularyDb[text]) !== 'undefined'
  const isNew = isWord && !isRecommended && !isVocabulary
  const vocabularyLevel = (vocabularyDb[text] ?? recommendedVocabularyDb[text])?.level ?? (isWord ? 0 : undefined)

  const handleMouseUp = useCallback(function handleMouseUp(e) {
    if (!isWord) return

    if (!onClick instanceof Function) return

    if (window.getSelection().toString()) return

    onClick(e, {
      sid: tokenPosition.sid,
      tid: tokenPosition.tid
    })
  }, [isWord, onClick, tokenPosition.sid, tokenPosition.tid])

  // const handleActionClick = useCallback(function handleActionClick(e) {
  //   onActionClick(e, {
  //     sid: tokenPosition.sid,
  //     tid: tokenPosition.tid
  //   })
  // }, [onActionClick, tokenPosition.sid, tokenPosition.tid])

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
      // isSelected ? 'Word-selected' : '',
      isHovered ? 'Word-hovered' : ''
    ].join(' ')}
      onMouseEnter={() => isWord ? onHover(tokenPosition) : onHover()}
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
        onMouseUp={handleMouseUp}
      />
      {/*
        !hoverDisabled && isWord && (isHovered || isSelected) &&
        <WordActionPopup
          handleActionClick={handleActionClick}
          isVocabulary={isVocabulary}
          isRecommended={isRecommended}
          vocabularyLevel={vocabularyLevel}
        />
      */}
    </span>
  )
})

// const WordActionPopup = React.memo(function WordActionPopup({
//   handleActionClick,
//   isVocabulary,
//   isRecommended,
//   vocabularyLevel
// }) {
//   return (
//     <div className="Word-action-popup" onClick={handleActionClick}>
//       {
//         !isVocabulary &&
//         (
//           isRecommended ?
//           <div>Add Recommended Word</div> :
//           <div>Add New Word</div>
//         )
//       }
//       {
//         isVocabulary &&
//         (
//           (vocabularyLevel < 4) ?
//           `Level ${vocabularyLevel}` :
//           <Icon.Check size={24}/>
//         )
//       }
//     </div>
//   )
// })

const InnerWord = React.memo(function InnerWord({
  vocabularyLevel,
  keyword,
  hanviet,
  pinyin,
  transcriptMethod,
  script,
  text,
  onMouseUp
}) {
  const transcript = useMemo(() =>
    transcriptMethod === 'pinyin' ? pinyin : hanviet,
    [transcriptMethod, pinyin, hanviet]
  )

  return (
    vocabularyLevel === 0 ? <WordByText onMouseUp={onMouseUp} text={text} transcript={transcript} meaning={keyword}/> :
    // vocabularyLevel === 0 ? <WordByText onMouseUp={onMouseUp} text={text + '‹' + keyword + '›'} transcript={transcript} meaning=""/> :
    vocabularyLevel === 1 ? <WordByText onMouseUp={onMouseUp} text={text} transcript={hanviet} meaning={keyword}/> :
    vocabularyLevel === 2 ? <WordByText onMouseUp={onMouseUp} text={text} transcript="" meaning={keyword}/> :
    vocabularyLevel === 3 ? <WordByText onMouseUp={onMouseUp} text={text} transcript={transcript} meaning=""/> :
    <WordByText onMouseUp={onMouseUp} text={text} transcript="" meaning=""/>
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
  onMouseUp
}) {
  const textSplit = [...text]
  const transcriptSplit = transcript?.split?.(' ') ?? []

  return (
    text === ' ' ? '\u00A0' :
    <span onMouseUp={onMouseUp} annotation2={meaning}>
      {
        textSplit.map((v, i) =>
          <span key={i} annotation={transcriptSplit?.[i] || undefined}>{v}</span>
        )
      }
    </span>
  )
}

export default Word
