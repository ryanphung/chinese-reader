import { useState, useEffect, useMemo, createRef, useCallback } from 'react'
import './App.css'
import rsh from './data/rsh.json'
import initialContent from './data/content.json'
import Character from './Character/Character'
import Header from './Header/Header'
import ReadingProgressBar from './ReadingProgressBar/ReadingProgressBar'
import pinyinify from 'pinyin'

const MAX_LEVEL = 4
const _toMap = list => list.reduce((s, v) => { s[v.hanzi] = v; return s }, {})
const _isChineseChar = char => char.match(/[\u3400-\u9FBF]/)

const rsh1 = rsh.filter(v => v.tags.includes('RSH1'))
const rshMap = _toMap(rsh)
const rsh1Map = _toMap(rsh1)

function App() {
  const [content, setContent] = useState(initialContent.data)
  const splitContent = useMemo(() => [...content], [content])
  const [pinyinLevelDb, setPinyinLevelDb] = useState({})
  const mainRef = createRef()
  const [scrollTop, setScrollTop] = useState(0)
  const [scrollHeight, setScrollHeight] = useState(0)
  const [clientHeight, setClientHeight] = useState(0)
  const progress = (scrollHeight - clientHeight > 0) ? scrollTop / (scrollHeight - clientHeight) : 0
  const updateScrollHeight = useCallback(() => {
    setScrollHeight(mainRef.current?.scrollHeight)
    setClientHeight(mainRef.current?.clientHeight)
  }, [mainRef])

  useEffect(() => {
    // console.log(pinyinify(content))
    console.log(pinyinify("好好休息吧"))
  }, [content])

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
    const v = localStorage.getItem("pinyinLevelDb")
    let o
    try {
      o = JSON.parse(v)
    } catch (e) {
      console.warn(e)
    }
    setPinyinLevelDb(o)
  }, [])

  useEffect(() => {
    const newPinyins = {}
    splitContent.forEach(char => {
      if (_isChineseChar(char)) {
        if (rsh1Map[char])
          newPinyins[char] = MAX_LEVEL
        else
          newPinyins[char] = 0
      }
    })
    setPinyinLevelDb(v => ({
      ...newPinyins,
      ...v
    }))
  }, [splitContent])

  useEffect(() => {
    localStorage.setItem("pinyinLevelDb", JSON.stringify(pinyinLevelDb))
  }, [pinyinLevelDb])

  const { charsCount, knownCharsCount } = useMemo(() => {
    const chars = splitContent.filter(_isChineseChar)
    const charsMap = chars.reduce((s, v) => { s[v] = true; return s }, {})
    const uniqueChars = Object.keys(charsMap)
    const knownChars = chars.filter(c => pinyinLevelDb[c] === MAX_LEVEL)
    return {
      uniqueCharsCount: uniqueChars.length,
      charsCount: chars.length,
      knownCharsCount: knownChars.length
    }
  }, [pinyinLevelDb, splitContent])

  const handleChange = event =>
    setContent(event.target.value)

  const handleCharacterClick = char => {
    let v = pinyinLevelDb[char] || 0
    v = (v + 1) % (MAX_LEVEL + 1)
    setPinyinLevelDb({
      ...pinyinLevelDb,
      [char]: v
    })
  }

  const handleScroll = () => {
    setScrollTop(mainRef.current.scrollTop)
  }

  return (
    <div className="App">
      <ReadingProgressBar progress={progress}/>
      <Header charsCount={charsCount} knownCharsCount={knownCharsCount}/>
      <div className="App-main">
        <textarea className="App-input" value={content} onChange={handleChange}>
        </textarea>
        <div className="App-output" ref={mainRef} onScroll={handleScroll}>
          {
            splitContent.map((char, i) =>
              <Character
                key={i}
                char={char}
                pinyinLevelDb={pinyinLevelDb}
                rshFrame={rshMap[char]}
                onClick={handleCharacterClick}/>
            )
          }
        </div>
      </div>
    </div>
  )
}

export default App;
