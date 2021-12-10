import './Header.scss'
import DictPane from '../DictPane/DictPane'
import { extractKeywordFromDictEntry, getHigherFrequencyDictEntry } from '../utils/chinese'

function Header({ word, wordsCount, knownWordsCount, recommendedVocabularyDb, vocabularyDb, onChapterChange, onSettingsClick, onRecommendedClick }) {
  const ease = (knownWordsCount / wordsCount) || 0

  function handleChapterChange(e) {
    onChapterChange(e.target.value)
  }

  return (
    <div className="Header">
      <DictPane word={word}/>
      <div className="Header-info">
        <div className="Header-stats">
          <div>
            <span className="text-s uppercase">Known Words</span>
            <span>{knownWordsCount} / {wordsCount}</span>
          </div>
          <div>
            <span className="text-s uppercase">Ease</span>
            <span>{Math.round(ease * 100)}%</span>
          </div>
          <div>
            <span className="text-s uppercase">Recommended</span>
            <span style={{cursor: 'pointer'}}
              onClick={onRecommendedClick}>
              {Object.keys(recommendedVocabularyDb).length} words
            </span>
          </div>
          <div>
            <span className="text-s uppercase">My Vocabulary</span>
            <span className="p1">{Object.keys(vocabularyDb).length} words</span>
          </div>
        </div>
        {/* <div className="Header-message">
          {
            ease < .9 ? <span>You're reading in <strong>pain</strong> zone. When you reach 90%, you will be in <strong>intensive</strong> zone.</span> :
            ease < .98 ? <span>You're reading in <strong>intensive</strong> zone. When you reach 98%, you will be in <strong>extensive</strong> zone.</span> :
            <span>This book is at the right level for you. You are reading in <strong>extensive</strong> zone.</span>
          }
        </div> */}
      </div>
      <VocabularyPanel vocabularyDb={vocabularyDb}/>
      <div className="Header-message">
        <select onChange={handleChapterChange} style={{ flex: 1, textAlign: 'center' }}>
          {
            Array.from(Array(26).keys()).map(i =>
              <option key={String(i)} value={i}>Chapter {i + 1}</option>
            )
          }
        </select>
        <button style={{ flex: 1, marginLeft: 16 }} onClick={onSettingsClick}>Settings</button>
      </div>
    </div>
  )
}

function VocabularyPanel({vocabularyDb}) {
  const words = Object.entries(vocabularyDb)
  const latestWords = words.slice(words.length - 5).reverse()

  return (
    <section style={{padding: 16}}>
      { latestWords.map((word, i) => <div key={i}>{word[0]}</div>) }
    </section>
  )
}

export default Header
