import { useState, useEffect, useMemo, createRef, useCallback } from 'react'
import './App.css'
import rsh from './data/rsh.json'
import initialContent from './data/content.json'
import Word from './Word/Word'
import Header from './Header/Header'
import Settings from './Settings/Settings'
import ReadingProgressBar from './ReadingProgressBar/ReadingProgressBar'
import { initTokenizerAsync, tokenizeContent } from './AppController'

const MAX_LEVEL = 4
const _toMap = list => list.reduce((s, v) => { s[v.hanzi] = v; return s }, {})

const rsh1 = rsh.filter(v => v.tags.includes('RSH1'))
const rshMap = _toMap(rsh)
const rsh1Map = _toMap(rsh1)

function App() {
  const [isRecommendationInitialized, setIsRecommendationInitialized] = useState(false)
  const isInitialized = isRecommendationInitialized
  const [isSettingsVisible, setIsSettingsVisible] = useState(false)
  const [settings, setSettings] = useState({})
  const [chapter, setChapter] = useState(0)
  const [content, setContent] = useState()
  const [tokenizer, setTokenizer] = useState({ })
  const tokens = useMemo(() =>
    tokenizeContent(tokenizer.tokenize, content),
    [content, tokenizer.tokenize]
  )
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

  useEffect(() => {
    setContent(initialContent.data[chapter])
    // reset recommended vocabulary when changing chapter
    setRecommendedVocabularyDb({})
    setIsRecommendationInitialized(false)
  }, [chapter])

  useEffect(() => {
    initTokenizerAsync().then(tokenize => setTokenizer({ tokenize }))
  }, [])

  useEffect(() => {
    updateScrollHeight()
  }, [content, updateScrollHeight])

  useEffect(() => {
    window.addEventListener("resize", updateScrollHeight)
    return () => {
      window.removeEventListener("resize", updateScrollHeight)
    }
  }, [updateScrollHeight])

  useEffect(() => {
    const v = localStorage.getItem("settings")
    let o
    try {
      o = JSON.parse(v)
    } catch (e) {
      console.warn(e)
    }
    setSettings(o || {})
  }, [])

  useEffect(() => {
    const v = localStorage.getItem("vocabularyDb")
    let o
    try {
      o = JSON.parse(v)
    } catch (e) {
      console.warn(e)
    }
    setVocabularyDb(o || {})
  }, [])

  useEffect(() => {
    const newWords = {}
    tokens.forEach(token => {
      if (token.matches.length)
        if (typeof(vocabularyDb[token.text]) === 'undefined')
          if ([...token.text].every(char => rsh1Map[char]))
            newWords[token.text] = MAX_LEVEL
          // else
          //   newWords[token.text] = 0
    })
    setRecommendedVocabularyDb(v => ({
      ...newWords,
      ...v
    }))
    setIsRecommendationInitialized(true)
  }, [tokens])

  useEffect(() => {
    localStorage.setItem("vocabularyDb", JSON.stringify(vocabularyDb))
  }, [vocabularyDb])

  useEffect(() => {
    localStorage.setItem("recommendedVocabularyDb", JSON.stringify(recommendedVocabularyDb))
  }, [recommendedVocabularyDb])

  useEffect(() => {
    localStorage.setItem("settings", JSON.stringify(settings))
  }, [settings])

  const { wordsCount, knownWordsCount } = useMemo(() => {
    const wordTokens = tokens.filter(token => token.matches.length)
    // const wordTokensMap = wordTokens.reduce((s, v) => { s[v.text] = true; return s }, {})
    // const uniqueWorkTokens = Object.keys(wordTokensMap)
    const knownWords = wordTokens.filter(token => vocabularyDb[token.text] === MAX_LEVEL)
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
    let v

    if (isRecommended) {
      v = recommendedVocabularyDb[word]

      // remove from recommendation list
      setRecommendedVocabularyDb(
        Object.fromEntries(Object.entries(recommendedVocabularyDb).filter(([v]) => v !== word))
      )
    } else if (!isVocabulary) {
      v = 0
    } else {
      v = (vocabularyDb[word] + 1) % (MAX_LEVEL + 1)
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
      setVocabularyDb(({
        ...recommendedVocabularyDb,
        ...vocabularyDb
      }))
    }
  }

  return (
    <div className="App">
      <ReadingProgressBar progress={progress}/>
      <Header
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
