import { useState, useEffect, useMemo, createRef, useCallback } from 'react'
import './App.css'
import rsh from './data/rsh.json'
import initialContent from './data/content.json'
import Word from './Word/Word'
import Header from './Header/Header'
import ReadingProgressBar from './ReadingProgressBar/ReadingProgressBar'
import { initTokenizerAsync, tokenizeContent } from './AppController'

const MAX_LEVEL = 4
const _toMap = list => list.reduce((s, v) => { s[v.hanzi] = v; return s }, {})
// const _isChineseChar = char => char.match(/[\u3400-\u9FBF]/)

const rsh1 = rsh.filter(v => v.tags.includes('RSH1'))
const rshMap = _toMap(rsh)
const rsh1Map = _toMap(rsh1)

function App() {
  const chapter = 1
  const [content, setContent] = useState(initialContent.data[chapter])
  const [tokenizer, setTokenizer] = useState({ })
  const tokens = useMemo(() =>
    tokenizeContent(tokenizer.tokenize, content),
    [content, tokenizer.tokenize]
  )
  const [vocabularyDb, setPinyinLevelDb] = useState({})
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
    const v = localStorage.getItem("vocabularyDb")
    let o
    try {
      o = JSON.parse(v)
    } catch (e) {
      console.warn(e)
    }
    setPinyinLevelDb(o)
  }, [])

  useEffect(() => {
    const newWords = {}
    tokens.forEach(token => {
      if (token.matches.length)
        if ([...token.text].every(char => rsh1Map[char]))
          newWords[token.text] = MAX_LEVEL
        else
          newWords[token.text] = 0
    })
    setPinyinLevelDb(v => ({
      ...newWords,
      ...v
    }))
  }, [tokens])

  useEffect(() => {
    localStorage.setItem("vocabularyDb", JSON.stringify(vocabularyDb))
  }, [vocabularyDb])

  const { wordsCount, knownWordsCount } = useMemo(() => {
    const wordTokens = tokens.filter(token => token.matches.length)
    const wordTokensMap = wordTokens.reduce((s, v) => { s[v.text] = true; return s }, {})
    const uniqueWorkTokens = Object.keys(wordTokensMap)
    const knownWords = wordTokens.filter(token => vocabularyDb[token.text] === MAX_LEVEL)
    return {
      uniqueCharsCount: uniqueWorkTokens.length,
      wordsCount: wordTokens.length,
      knownWordsCount: knownWords.length
    }
  }, [vocabularyDb, tokens])

  const handleChange = event =>
    setContent(event.target.value)

  const handleWordClick = char => {
    let v = vocabularyDb[char] || 0
    v = (v + 1) % (MAX_LEVEL + 1)
    setPinyinLevelDb({
      ...vocabularyDb,
      [char]: v
    })
  }

  const handleWordHover = token => {
    setSelectedToken(token)
  }

  const handleScroll = () => {
    setScrollTop(mainRef.current.scrollTop)
  }

  return (
    <div className="App">
      <ReadingProgressBar progress={progress}/>
      <Header word={selectedToken} wordsCount={wordsCount} knownWordsCount={knownWordsCount}/>
      <div className="App-main">
        <textarea className="App-input" value={content} onChange={handleChange}>
        </textarea>
        <div className="App-output" ref={mainRef} onScroll={handleScroll}>
          {
            tokens.map((token, i) =>
              <Word
                key={i}
                token={token}
                vocabularyDb={vocabularyDb}
                rshFrame={rshMap[token.text]}
                onClick={handleWordClick}
                onHover={handleWordHover}
              />
            )
          }
        </div>
      </div>
    </div>
  )
}

export default App;
