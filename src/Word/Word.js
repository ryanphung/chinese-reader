import React, { Fragment, useMemo } from 'react'
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

  const pinyin = useMemo(() => {
    if (token.matches.length) {
      return token.matches[0].pinyinPretty
    }
  }, [token.matches])

  const isVocabulary = typeof(vocabularyDb[text]) !== 'undefined'
  const vocabularyLevel = (vocabularyDb[text] ?? recommendedVocabularyDb[text])?.level ?? (matched ? 0 : undefined)

  return (
    isLineBreak ?
    <span className="Word-line-break"/> :
    <span className={[
      "Word",
      matched ? 'Word-matched' : '',
      typeof(vocabularyLevel) === 'number' ? `Word-level-${vocabularyLevel}` : '',
      isVocabulary ? 'Word-vocabulary' : ''
    ].join(' ')}
      onClick={e => matched && onClick(e, text)}
      onMouseEnter={() => matched ? onHover(token) : onHover()}
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
    vocabularyLevel === 0 ? <>⟨<span annotation={text}>{keyword}</span>⟩</> :
    vocabularyLevel === 1 ? <WordByTranscript transcript={hanviet} text={text}/> :
    vocabularyLevel === 2 ? <WordByTranscript transcript={pinyin} text={text}/> :
    <WordByText text={text} transcript={transcript}/>
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
  transcript
}) {
  const textSplit = [...text]
  const transcriptSplit = transcript?.split?.(' ') ?? []

  return (
    text === ' ' ? '\u00A0' :
    textSplit.map((v, i) =>
      <span key={i} annotation={transcriptSplit?.[i]}>{v}</span>
    )
  )
}

export default Word
