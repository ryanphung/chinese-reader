import React, { Fragment, useMemo } from 'react'
import './Word.css'
// import pinyinify from 'pinyin'

function Word({ token, selectedTokenPosition, rshFrame, vocabularyDb, recommendedVocabularyDb, onClick, onHover, settings={} }) {
  const {
    transcriptMethod='pinyin',
    script='simplified'
  } = settings
  const { text, keyword, hanviet, pinyin, isWord } = token
  const isSelected =
    selectedTokenPosition?.sentenceId === token?.sentenceId &&
    selectedTokenPosition?.tokenId === token?.tokenId
  const displayedText = script === 'simplified' ? token.simplified : token.traditional
  const isLineBreak = text === '\n'
  const isVocabulary = typeof(vocabularyDb[text]) !== 'undefined'
  const vocabularyLevel = (vocabularyDb[text] ?? recommendedVocabularyDb[text])?.level ?? (isWord ? 0 : undefined)

  function handleClick(e) {
    if (!isWord) return

    if (!onClick instanceof Function) return

    onClick(e, {
      sentenceId: token.sentenceId,
      tokenId: token.tokenId
    })
  }

  return (
    isLineBreak ?
    <span className="Word-line-break"/> :
    <span className={[
      "Word",
      isWord ? 'Word-matched' : '',
      typeof(vocabularyLevel) === 'number' ? `Word-level-${vocabularyLevel}` : '',
      isVocabulary ? 'Word-vocabulary' : '',
      isSelected ? 'Word-selected' : ''
    ].join(' ')}
      onClick={handleClick}
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
      />
    </span>
  )
}

const InnerWord = React.memo(function InnerWord({
  vocabularyLevel,
  keyword,
  hanviet,
  pinyin,
  transcriptMethod,
  script,
  text
}) {
  const transcript = useMemo(() =>
    transcriptMethod === 'pinyin' ? pinyin : hanviet,
    [transcriptMethod, pinyin, hanviet]
  )

  return (
    vocabularyLevel === 0 ? <WordByText text={text} transcript={transcript} meaning={keyword}/> :
    vocabularyLevel === 1 ? <WordByText text={text} transcript={transcript} meaning=""/> :
    vocabularyLevel === 2 ? <WordByText text={text} transcript="" meaning={keyword}/> :
    vocabularyLevel === 3 ? <WordByText text={text} transcript={hanviet} meaning=""/> :
    <WordByText text={text} transcript="" meaning=""/>
  )
})

function WordByTranscript({
  transcript,
  text
}) {
  const textSplit = [...text]
  const transcriptSplit = transcript?.split?.(' ') ?? []

  return (
    <>⟨{
      transcriptSplit.map((v, i) =>
        <Fragment key={i}>
          <span annotation={textSplit?.[i]}>
            {v}
          </span>
          {!!transcriptSplit[i + 1] && ' '}
        </Fragment>
      )
    }⟩</>
  )
}

function WordByText({
  text,
  transcript,
  meaning
}) {
  const textSplit = [...text]
  const transcriptSplit = transcript?.split?.(' ') ?? []

  return (
    text === ' ' ? '\u00A0' :
    <span annotation2={meaning}>
      {
        textSplit.map((v, i) =>
          <span key={i} annotation={transcriptSplit?.[i]}>{v}</span>
        )
      }
    </span>
  )
}

export default Word
