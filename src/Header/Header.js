import './Header.scss'
import DictPane from '../DictPane/DictPane'

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
            <span className="text-s">Known Words</span> {knownWordsCount} / {wordsCount}
          </div>
          <div>
            <span className="text-s">Ease</span> {Math.round(ease * 100)}%
          </div>
          <div>
            <span className="text-s">Recommended</span> <span style={{cursor: 'pointer'}} onClick={onRecommendedClick}>{Object.keys(recommendedVocabularyDb).length}</span>
          </div>
          <div>
            <span className="text-s">Vocabulary</span> <span className="p1">{Object.keys(vocabularyDb).length}</span>
          </div>
        </div>
        <div className="Header-message">
          {
            ease < .9 ? "You're reading in \"pain\" zone. When you reach 90%, you will be in \"intensive reading\" zone." :
            ease < .98 ? "You're reading in \"intensive reading\" zone. When you reach 98%, you will be in \"extensive reading\" zone." :
            "This book is at the right level for you. You are reading in \"extensive reading\" zone."
          }
        </div>
        <div className="Header-message">
          <button style={{ marginRight: 10 }} onClick={onSettingsClick}>Settings</button>
          <select onChange={handleChapterChange}>
            {
              Array.from(Array(26).keys()).map(i =>
                <option key={String(i)} value={i}>Chapter {i + 1}</option>
              )
            }
          </select>
        </div>
      </div>
    </div>
  )
}

export default Header
