import { useState, useEffect, useMemo, createRef, useCallback } from 'react'
import './App.css'
import rsh from './data/rsh.json'
import initialContent from './data/content.json'
import Word from './Word/Word'
import Header from './Header/Header'
import Settings from './Settings/Settings'
import ReadingProgressBar from './ReadingProgressBar/ReadingProgressBar'
import { initTokenizerAsync, tokenizeContent } from './AppController'
import { upgradeData } from './utils/data'

const VERSION = 2
const MAX_LEVEL = 4
const _toMap = list => list.reduce((s, v) => { s[v.hanzi] = v; return s }, {})

const rsh1 = rsh.filter(v => v.tags.includes('RSH1'))
const rshMap = _toMap(rsh)
const rsh1Map = _toMap(rsh1)

function App() {
  const [isRecommendationInitialized, setIsRecommendationInitialized] = useState(false)
  const [isVocabularyLoaded, setIsVocabularyLoaded] = useState(false)
  const [isTokensInitialized, setIsTokensInitialized] = useState(false)
  const isInitialized = isRecommendationInitialized && isVocabularyLoaded
  const [isSettingsVisible, setIsSettingsVisible] = useState(false)
  const [settings, setSettings] = useState({})
  const [chapter, setChapter] = useState(0)
  const [content, setContent] = useState()
  const [tokenizer, setTokenizer] = useState({ })
  const [tokens, setTokens] = useState([])
  const [recommendedVocabularyDb, setRecommendedVocabularyDb] = useState({})
  const [vocabularyDb, setVocabularyDb] = useState({})
  const mainRef = createRef()
  const [scrollTop, setScrollTop] = useState(0)
  const [scrollHeight, setScrollHeight] = useState(0)
  const [clientHeight, setClientHeight] = useState(0)
  const progress = (scrollHeight - clientHeight > 0) ? scrollTop / (scrollHeight - clientHeight) : 0
  const updateScrollHeight = useCallback(() => {
    setScrollHeight(mainRef.current?.scrollHeight)
    setClientHeight(mainRef.current?.clientHeight)
  }, [mainRef])
  const [selectedToken, setSelectedToken] = useState()

  // initialize the tokenizer on first load
  useEffect(() => {
    initTokenizerAsync().then(tokenize => setTokenizer({ tokenize }))
  }, [])

  // load content when chapter is changed
  useEffect(() => {
    setContent(initialContent.data[chapter])
  }, [chapter])

  // reset recommended vocabulary when content is updated
  useEffect(() => {
    setRecommendedVocabularyDb({})
    setIsTokensInitialized(false)
    setIsRecommendationInitialized(false)
  }, [content])

  // tokenize content into tokens when content is updated and tokenizer is ready
  useEffect(() => {
    if (tokenizer.tokenize) {
      const tokens = tokenizeContent(tokenizer.tokenize, content)
      setTokens(tokens)
      setIsTokensInitialized(true)
    }
  }, [content, tokenizer.tokenize])

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

    const data = {
      settings: loadAndParse("settings") || {},
      vocabularyDb: loadAndParse("vocabularyDb") || {},
      version: loadAndParse("version") || 0
    }

    const { settings, vocabularyDb, version } = upgradeData(data)

    setSettings(settings)
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
    if (!isRecommendationInitialized && isVocabularyLoaded && isTokensInitialized) {
      const newWords = {}
      tokens.forEach(token => {
        if (token.matches.length)
          if (typeof(vocabularyDb[token.text]) === 'undefined' || !vocabularyDb[token.text].recommended)
            if ([...token.text].every(char => rsh1Map[char]))
              newWords[token.text] = { level: MAX_LEVEL }
            // else
              // newWords[token.text] = { level: 0 }
      })
      setRecommendedVocabularyDb(v => ({
        ...newWords,
        ...v
      }))
      setIsRecommendationInitialized(true)
    }
  }, [isRecommendationInitialized, isVocabularyLoaded, isTokensInitialized, tokens, vocabularyDb])

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

  const { wordsCount, knownWordsCount } = useMemo(() => {
    const wordTokens = tokens.filter(token => token.matches.length)
    // const wordTokensMap = wordTokens.reduce((s, v) => { s[v.text] = true; return s }, {})
    // const uniqueWorkTokens = Object.keys(wordTokensMap)
    const knownWords = wordTokens.filter(token => vocabularyDb[token.text] >= 3)
    return {
      wordsCount: wordTokens.length,
      knownWordsCount: knownWords.length
    }
  }, [vocabularyDb, tokens])

  const handleChange = event =>
    setContent(event.target.value)

  const handleWordClick = word => {
    const isVocabulary = typeof(vocabularyDb[word]) !== 'undefined'
    const isRecommended = typeof(recommendedVocabularyDb[word]) !== 'undefined'
    let v = {
      addedAt: Date.now(),
      chapter
    }

    if (isRecommended) {
      v.level = recommendedVocabularyDb[word].level
      v.recommended = true

      // remove from recommendation list
      setRecommendedVocabularyDb(
        Object.fromEntries(Object.entries(recommendedVocabularyDb).filter(([v]) => v !== word))
      )
    } else if (!isVocabulary) {
      v.level = 0
    } else {
      v.level = (vocabularyDb[word].level + 1) % (MAX_LEVEL + 1)
    }

    setVocabularyDb({
      ...vocabularyDb,
      [word]: v
    })
  }

  const handleWordHover = token => {
    setSelectedToken(token)
  }

  const handleScroll = () => {
    setScrollTop(mainRef.current.scrollTop)
  }

  const handleChapterChange = i => {
    setChapter(i)
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
              chapter,
              recommended: true
            }])
        )
      setVocabularyDb(({
        ...newVocabularyDb,
        ...vocabularyDb
      }))
    }
  }

  return (
    <div className="App">
      <ReadingProgressBar progress={progress}/>
      <Header
        version={VERSION}
        word={selectedToken}
        wordsCount={wordsCount}
        knownWordsCount={knownWordsCount}
        recommendedVocabularyDb={recommendedVocabularyDb}
        vocabularyDb={vocabularyDb}
        onChapterChange={handleChapterChange}
        onSettingsClick={() => setIsSettingsVisible(true)}
        onRecommendedClick={handleRecommendedClick}
      />
      <Settings
        isVisible={isSettingsVisible}
        settings={settings}
        onSettingsUpdate={setSettings}
        onClose={() => setIsSettingsVisible(false)}
      />
      <div className="App-main">
        <textarea className="App-input" value={content} onChange={handleChange}>
        </textarea>
        <div className="App-output" ref={mainRef} onScroll={handleScroll}>
          {
            isInitialized ?
            tokens.map((token, i) =>
              <Word
                key={i}
                token={token}
                vocabularyDb={vocabularyDb}
                recommendedVocabularyDb={recommendedVocabularyDb}
                rshFrame={rshMap[token.text]}
                onClick={handleWordClick}
                onHover={handleWordHover}
                settings={settings}
              />
            ) : null
          }
        </div>
      </div>
    </div>
  )
}

export default App;
