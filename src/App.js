import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import './App.css'
import rsh from './data/rsh.json'
import charFreq from './data/char-freq.json'
import savedTokens from './data/tokens'
import initialContent from './data/content.json'
import Word from './Word/Word'
import Header from './Header/Header'
import Settings from './Settings/Settings'
import ReadingProgressBar from './ReadingProgressBar/ReadingProgressBar'
import { initTokenizerAsync, tokenizeContent, retokenizeSentence } from './AppController'
import { upgradeData } from './utils/data'
import _ from 'lodash'

const VERSION = 2
const MAX_LEVEL = 4
const _toMap = list => list.reduce((s, v) => { s[v.hanzi] = v; return s }, {})

const rsh1 = rsh.filter(v => v.tags.includes('RSH1'))
const rshMap = _toMap(rsh)
const rsh1Map = _toMap(rsh1)
const charFreqs = [
  100, 200, 300, 400, 500, 600, 700, 800, 900, 1000,
  1200, 1400, 1600, 1800, 2000, 2200, 2400, 2600, 2800, 3000
]
const charFreqMaps = Object.fromEntries(charFreqs.map(v => [`top${v}`, _toMap(charFreq.slice(0, v))]))
const hskLevels = [1, 2, 3, 4, 5, 6]
const hskMaps = Object.fromEntries(hskLevels.map(v => [`hsk${v}`, _toMap(charFreq.filter(u => u.hskLevel <= v))]))
const CHARS_MAPS = {
  "off": {},
  ...hskMaps,
  ...charFreqMaps,
  "rsh1": rsh1Map,
  "rsh2": rshMap
}

function loadAndParse(key) {
  const v = localStorage.getItem(key)
  let o
  try {
    o = JSON.parse(v)
  } catch (e) {
    console.warn(e)
  }
  return o
}

function App() {
  const [isRecommendationInitialized, setIsRecommendationInitialized] = useState(false)
  const [isVocabularyLoaded, setIsVocabularyLoaded] = useState(false)
  const isInitialized = isRecommendationInitialized && isVocabularyLoaded
  const [isSettingsVisible, setIsSettingsVisible] = useState(false)
  const [settings, setSettings] = useState({})
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false)
  const [content, setContent] = useState()
  const [tokenizer, setTokenizer] = useState({ })
  const [data, setData] = useState({
    isTokensInitialized: false,
    tokens: [],
    chapter: 0
  })
  const flattenedTokens = useMemo(() => _.flatten(data.tokens), [data.tokens])
  const [recommendedVocabularyDb, setRecommendedVocabularyDb] = useState({})
  const [vocabularyDb, setVocabularyDb] = useState({})
  const mainRef = useRef()
  const [scrollTop, setScrollTop] = useState(0)
  const [scrollHeight, setScrollHeight] = useState(0)
  const [clientHeight, setClientHeight] = useState(0)
  const progress = (scrollHeight - clientHeight > 0) ? scrollTop / (scrollHeight - clientHeight) : 0
  const updateScrollHeight = useCallback(() => {
    setScrollHeight(mainRef.current?.scrollHeight)
    setClientHeight(mainRef.current?.clientHeight)
  }, [mainRef])
  const [selectedTokenPosition, setSelectedTokenPosition] = useState()
  const selectedToken = useMemo(
    () => data.tokens?.[selectedTokenPosition?.sid]?.[selectedTokenPosition?.tid],
    [data.tokens, selectedTokenPosition?.sid, selectedTokenPosition?.tid])
  const [hoveredTokenPosition, setHoveredTokenPosition] = useState()
  const hoveredToken = useMemo(
    () => data.tokens?.[hoveredTokenPosition?.sid]?.[hoveredTokenPosition?.tid],
    [data.tokens, hoveredTokenPosition?.sid, hoveredTokenPosition?.tid])

  const [voices, setVoices] = useState([])

  useEffect(() => {
    function populateVoiceList() {
      setVoices(speechSynthesis.getVoices().filter(v => v.lang.includes('zh')))
    }

    populateVoiceList()

    window.speechSynthesis.onvoiceschanged = populateVoiceList

    return () => {
      window.speechSynthesis.onvoiceschanged = undefined
    }
  }, [])

  const voice = useMemo(() =>
    isSettingsLoaded ? voices.find(v => v.voiceURI === settings?.voice) : undefined
  , [voices, isSettingsLoaded, settings.voice])

  // initialize the tokenizer on first load
  useEffect(() => {
    initTokenizerAsync().then(({ tokenize, dictionary }) => setTokenizer({ tokenize, dictionary }))
  }, [])

  // load content when chapter is changed
  // also, load tokens
  // or try to tokenize contents
  useEffect(() => {
    // debugger
    const content = initialContent.data[data.chapter]
    setContent(initialContent.data[data.chapter])

    if (data.isTokensInitialized)
      return

    // debugger

    // first try to load from tokens saved locally
    let tokens = loadAndParse(`tokens-${data.chapter}`)

    if (!tokens?.length) {
      // then try to load from data file
      tokens = savedTokens[data.chapter]
    }

    // finally, try to tokenize
    if (!tokens?.length) {
      if (tokenizer.tokenize && tokenizer.dictionary) {
        tokens = tokenizeContent(tokenizer.tokenize, tokenizer.dictionary, content)
      }
    }

    // debugger
    if (tokens?.length) {
      setData(old => ({
        ...old,
        isTokensInitialized: true,
        tokens
      }))
    }

  }, [data.chapter, data.isTokensInitialized, tokenizer.tokenize, tokenizer.dictionary])

  // update scroll height when these things are updated (which will affect
  // how the content is rendered):
  // - content, vocabulary, or recommendedVocabularyDb
  useEffect(() => {
    updateScrollHeight()
  }, [updateScrollHeight, content, vocabularyDb, recommendedVocabularyDb])

  // on first load, listen to the window resize event to update scroll height
  useEffect(() => {
    window.addEventListener("resize", updateScrollHeight)
    return () => {
      // remove listener when app is unmounted
      window.removeEventListener("resize", updateScrollHeight)
    }
  }, [updateScrollHeight])

  // load settings on first load
  useEffect(() => {
    const data = {
      settings: loadAndParse("settings") || {},
      vocabularyDb: loadAndParse("vocabularyDb") || {},
      version: loadAndParse("version") || 0
    }

    const { settings, vocabularyDb, version } = upgradeData(data)

    setSettings(settings)
    setIsSettingsLoaded(true)
    setVocabularyDb(vocabularyDb)
    setIsVocabularyLoaded(true)
    localStorage.setItem("version", JSON.stringify(version))
  }, [])

  // initializing the recommendation list when
  // we need to (isRecommendationInitialized = false)
  // and vocabulary db is ready (loaded)
  // and tokens changed
  // FIXME: tokens changed or content changed?
  useEffect(() => {
    // debugger
    if (!isRecommendationInitialized && isVocabularyLoaded && data.isTokensInitialized && isSettingsLoaded) {
      if (settings.recommendation) {
        const charsMap = CHARS_MAPS[settings.recommendation]

        const newWords = {}
        flattenedTokens.forEach(token => {
          if (token.isWord)
            if (typeof(vocabularyDb[token.text]) === 'undefined')
              if ([...token.text].every(char => charsMap[char]))
                newWords[token.text] = { level: MAX_LEVEL }
              // else
                // newWords[token.text] = { level: 0 }
        })
        setRecommendedVocabularyDb(newWords)
      }
      setIsRecommendationInitialized(true)
    }
  }, [isRecommendationInitialized, isVocabularyLoaded, data.isTokensInitialized, isSettingsLoaded, flattenedTokens, vocabularyDb, settings.recommendation])

  // useEffect(() => {
  //   setIsRecommendationInitialized(false)
  // }, [settings.recommendation])

  // save tokens into db
  useEffect(() => {
    if (!data.isTokensInitialized)
      return

    localStorage.setItem(`tokens-${data.chapter}`, JSON.stringify(data.tokens))
  }, [data.isTokensInitialized, data.tokens, data.chapter])

  // save vocabulary db to local storage whenever it is changed
  useEffect(() => {
    localStorage.setItem("vocabularyDb", JSON.stringify(vocabularyDb))
  }, [vocabularyDb])

  // save recommended vocabulary db to local storage whenever it is changed
  useEffect(() => {
    localStorage.setItem("recommendedVocabularyDb", JSON.stringify(recommendedVocabularyDb))
  }, [recommendedVocabularyDb])

  // save settings to local storage whenever it is changed
  useEffect(() => {
    localStorage.setItem("settings", JSON.stringify(settings))
  }, [settings])

  useEffect(() => {
    const theme = settings?.theme || 'dark'
    document.body.classList = theme
  }, [settings?.theme])

  const { wordsCount, knownWordsCount, knownWordsCountInclRecommendation } = useMemo(() => {
    const wordTokens = flattenedTokens.filter(token => token.isWord)
    // const wordTokensMap = wordTokens.reduce((s, v) => { s[v.text] = true; return s }, {})
    // const uniqueWorkTokens = Object.keys(wordTokensMap)
    const knownWords = wordTokens.filter(token => vocabularyDb[token.text]?.level >= 3)
    const knownWordsInclRecommendation =
      wordTokens.filter(token => vocabularyDb[token.text]?.level >= 3 || recommendedVocabularyDb[token.text])
    return {
      wordsCount: wordTokens.length,
      knownWordsCount: knownWords.length,
      knownWordsCountInclRecommendation: knownWordsInclRecommendation.length
    }
  }, [vocabularyDb, recommendedVocabularyDb, flattenedTokens])

  const handleChange = event =>
    setContent(event.target.value)

  // const handleWordClick = useCallback((event, text) => {
  //   const text = word.text
  //   const isVocabulary = typeof(vocabularyDb[word]) !== 'undefined'
  //   const isRecommended = typeof(recommendedVocabularyDb[word]) !== 'undefined'
  //   let v = {
  //     addedAt: Date.now(),
  //     chapter
  //   }
  //
  //   if (isRecommended) {
  //     v.level = recommendedVocabularyDb[word].level
  //     v.recommended = true
  //
  //     // remove from recommendation list
  //     setRecommendedVocabularyDb(
  //       Object.fromEntries(Object.entries(recommendedVocabularyDb).filter(([v]) => v !== word))
  //     )
  //   } else if (!isVocabulary) {
  //     v.level = 0
  //   } else {
  //     const step = event.shiftKey ? -1 : 1
  //     v.level = (vocabularyDb[word].level + step + MAX_LEVEL + 1) % (MAX_LEVEL + 1)
  //   }
  //
  //   setVocabularyDb({
  //     ...vocabularyDb,
  //     [word]: v
  //   })
  // }, [vocabularyDb, recommendedVocabularyDb, setRecommendedVocabularyDb, setVocabularyDb, chapter])

  const handleWordHover = useCallback(tokenPosition => {
    if (!selectedToken)
      setHoveredTokenPosition(tokenPosition)
  }, [selectedToken, setHoveredTokenPosition])

  const handleWordActionClick = useCallback((event, tokenPosition) => {
    // debugger
    const token = data.tokens[tokenPosition.sid][tokenPosition.tid]
    const text = token.text
    const isVocabulary = typeof(vocabularyDb[text]) !== 'undefined'
    const isRecommended = typeof(recommendedVocabularyDb[text]) !== 'undefined'
    let v = {
      addedAt: Date.now(),
      chapter: data.chapter
    }

    if (isRecommended) {
      v.level = recommendedVocabularyDb[text].level
      v.recommended = true

      // remove from recommendation list
      setRecommendedVocabularyDb(
        Object.fromEntries(Object.entries(recommendedVocabularyDb).filter(([v]) => v !== text))
      )
    } else if (!isVocabulary) {
      v.level = 0
    } else {
      const step = event.shiftKey ? -1 : 1
      v.level = (vocabularyDb[text].level + step + MAX_LEVEL + 1) % (MAX_LEVEL + 1)
    }

    setVocabularyDb({
      ...vocabularyDb,
      [text]: v
    })
  }, [
    vocabularyDb, recommendedVocabularyDb, setRecommendedVocabularyDb, setVocabularyDb, data.chapter, data.tokens
  ])

  const handleWordClick = useCallback((event, tokenPosition) => {
    if (selectedTokenPosition?.sid === tokenPosition?.sid &&
      selectedTokenPosition?.tid === tokenPosition?.tid)
      setSelectedTokenPosition()
    else
      setSelectedTokenPosition(tokenPosition)
    setHoveredTokenPosition()
  }, [
    selectedTokenPosition, setSelectedTokenPosition, setHoveredTokenPosition
  ])

  const handleSelection = useCallback(({ sid, start, end, text }) => {
    console.log(start, end, text)

    if (start === end)
      return

    const { sentence, newTokenId } = retokenizeSentence(tokenizer.tokenize, tokenizer.dictionary, data.tokens[sid], start, end)

    const newTokens = data.tokens.map((v, i) => i === sid ? sentence : v)

    setData(old => ({
      ...old,
      tokens: newTokens
    }))

    setSelectedTokenPosition({
      sid,
      tid: newTokenId
    })
    setHoveredTokenPosition()

    window.getSelection().removeAllRanges()
  }, [setSelectedTokenPosition, data.tokens, setData, tokenizer.tokenize, tokenizer.dictionary])

  const handleScroll = useCallback(() => {
    setScrollTop(mainRef.current.scrollTop)
  }, [setScrollTop])

  const handleChapterChange = i => {
    setData(old => ({
      ...old,
      isTokensInitialized: false,
      tokens: [],
      chapter: +i
    }))
    setRecommendedVocabularyDb({})
    setIsRecommendationInitialized(false)
  }

  const handleRecommendedClick = () => {
    const res = window.confirm(`Are you sure you want to move ${Object.keys(recommendedVocabularyDb).length} words into your vocabulary? This action is not reversible.`)
    if (res) {
      setRecommendedVocabularyDb({})
      const now = Date.now()
      const newVocabularyDb =
        Object.fromEntries(
          Object.entries(recommendedVocabularyDb)
            .map(([k, v]) => [k, {
              ...v,
              addedAt: now,
              chapter: data.chapter,
              recommended: true
            }])
        )
      setVocabularyDb(({
        ...newVocabularyDb,
        ...vocabularyDb
      }))
    }
  }

  const handleTokenUpdate = useCallback(({
    tokenPosition: updatedTokenPosition,
    token: updatedToken}) => {
    if (!updatedToken.isWord) {
      setSelectedTokenPosition()
      setHoveredTokenPosition()
    }
    setData(old => ({
      ...old,
      tokens: data.tokens.map((sentence, i) =>
        i === updatedTokenPosition.sid ?
        sentence.map((token, j) =>
          j === updatedTokenPosition.tid ?
          updatedToken : token
        ) :
        sentence
      )
    }))
  }, [data.tokens, setData, setSelectedTokenPosition, setHoveredTokenPosition])

  return (
    <div className="App" onScroll={handleScroll} ref={mainRef}>
      <ReadingProgressBar progress={progress}/>
      <Header
        tokenPosition={selectedTokenPosition || hoveredTokenPosition}
        token={selectedToken || hoveredToken}
        isTokenSelected={!!selectedToken}
        wordsCount={wordsCount}
        knownWordsCount={knownWordsCount}
        knownWordsCountInclRecommendation={knownWordsCountInclRecommendation}
        recommendedVocabularyDb={recommendedVocabularyDb}
        vocabularyDb={vocabularyDb}
        onChapterChange={handleChapterChange}
        onSettingsClick={() => setIsSettingsVisible(true)}
        onRecommendedClick={handleRecommendedClick}
        dictionary={tokenizer.dictionary}
        settings={settings}
        onTokenUpdate={handleTokenUpdate}
        voice={voice}
      />
      <Settings
        version={VERSION}
        isVisible={isSettingsVisible}
        settings={settings}
        onSettingsUpdate={setSettings}
        onClose={() => setIsSettingsVisible(false)}
        vocabularyDb={vocabularyDb}
        tokens={data.tokens}
        voices={voices}
      />
      <div className="App-main">
        <textarea className="App-input" value={content} onChange={handleChange}>
        </textarea>
        <AppOutput
          isInitialized={isInitialized}
          tokens={data.tokens}
          selectedTokenPosition={selectedTokenPosition}
          hoveredTokenPosition={hoveredTokenPosition}
          vocabularyDb={vocabularyDb}
          recommendedVocabularyDb={recommendedVocabularyDb}
          handleWordClick={handleWordClick}
          handleWordActionClick={handleWordActionClick}
          handleWordHover={handleWordHover}
          handleSelection={handleSelection}
          settings={settings}
        />
      </div>
    </div>
  )
}

const AppOutput = React.memo(function AppOutput({
  mainRef,
  onScroll,
  isInitialized,
  tokens,
  selectedTokenPosition,
  hoveredTokenPosition,
  vocabularyDb,
  recommendedVocabularyDb,
  handleWordClick,
  handleWordActionClick,
  handleWordHover,
  handleSelection,
  settings
}) {
  const [isMouseDown, setIsMouseDown] = useState(false)
  const [isSelecting, setIsSelecting] = useState(false)

  function calculateOffset(element, relativeOffset, checkTopElementFn) {
    if (checkTopElementFn(element))
      return relativeOffset

    let offset = relativeOffset
    let current = element

    while (current) {
      current = current.previousElementSibling
      if (current && current.tagName === 'SPAN') // only consider "span"
        offset += current.textContent.length
    }

    return calculateOffset(element.parentElement, offset, checkTopElementFn)
  }

  function handleMouseDown() {
    setIsSelecting(false)
    setIsMouseDown(true)
  }

  function handleMouseMove() {
    if (isMouseDown) {
      setIsSelecting(true)
    }
  }

  function handleMouseUp() {
    setIsMouseDown(false)
    setIsSelecting(false)

    if (!handleSelection instanceof Function)
      return

    const selection = window.getSelection()

    if (!selection.toString())
      return

    const $startSentence = selection.anchorNode.parentElement.closest('[sentence]')
    const $endSentence = selection.extentNode.parentElement.closest('[sentence]')
    const startSentenceId = +$startSentence.getAttribute('sentence')
    const endSentenceId = +$endSentence.getAttribute('sentence')
    if (startSentenceId !== endSentenceId) {
      const range = selection.getRangeAt(0)
      range.setEnd($startSentence.parentElement, startSentenceId + 1)
    }

    const startOffset = calculateOffset(
      selection.anchorNode.parentElement,
      selection.anchorOffset,
      element => element.getAttribute('sentence')
    )

    const endOffset = calculateOffset(
      selection.extentNode.parentElement,
      selection.extentOffset,
      element => element.getAttribute('sentence')
    )

    handleSelection({
      sid: startSentenceId,
      start: startOffset < endOffset ? startOffset : endOffset,
      end: startOffset < endOffset ? endOffset : startOffset,
      text: selection.toString()
    })
  }

  return (
    <div className="App-output" ref={mainRef} onScroll={onScroll}>
      <div className="App-paper" onMouseUp={handleMouseUp} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove}>
        {
          isInitialized ?
          tokens.map((sentence, i) =>
            <Sentence
              key={i}
              id={i}
              sentence={sentence}
              selectedTokenPosition={selectedTokenPosition?.sid === i ? selectedTokenPosition : null}
              hoveredTokenPosition={hoveredTokenPosition?.sid === i ? hoveredTokenPosition : null}
              vocabularyDb={vocabularyDb}
              recommendedVocabularyDb={recommendedVocabularyDb}
              onWordClick={handleWordClick}
              onWordActionClick={handleWordActionClick}
              onWordHover={handleWordHover}
              settings={settings}
              hoverDisabled={isSelecting}/>
          ) : null
        }
      </div>
    </div>
  )
})

const Sentence = React.memo(function Sentence({
  id,
  sentence,
  selectedTokenPosition,
  hoveredTokenPosition,
  vocabularyDb,
  recommendedVocabularyDb,
  rshMap,
  onWordClick,
  onWordActionClick,
  onWordHover,
  settings,
  hoverDisabled
}) {
  return (
    <div sentence={id} style={{ display: 'inline' }}>
      {
        sentence.map((token, i) =>
          <Word
            key={i}
            tokenPosition={{
              sid: id,
              tid: i
            }}
            token={token}
            selectedTokenPosition={selectedTokenPosition?.tid === i ? selectedTokenPosition : null}
            hoveredTokenPosition={hoveredTokenPosition?.tid === i ? hoveredTokenPosition : null}
            vocabularyDb={vocabularyDb}
            recommendedVocabularyDb={recommendedVocabularyDb}
            onClick={onWordClick}
            onActionClick={onWordActionClick}
            onHover={onWordHover}
            settings={settings}
            hoverDisabled={hoverDisabled}
          />
        )
      }
    </div>
  )
})

export default App
