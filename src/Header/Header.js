import './Header.scss'
import DictPane from '../DictPane/DictPane'

function Header({ word, wordsCount, knownWordsCount, onChapterChange }) {
  const ease = knownWordsCount / wordsCount

  function handleChapterChange(e) {
    onChapterChange(e.target.value)
  }

  return (
    <div className="Header">
      <DictPane word={word}/>
      <div className="Header-info">
        <div className="Header-stats">
          <div>
            Words: {wordsCount}
          </div>
          <div>
            Known: {knownWordsCount}
          </div>
          <div>
            Unknown: {wordsCount - knownWordsCount}
          </div>
          <div>
            Ease: {Math.round(ease * 100)}%
          </div>
        </div>
        <div className="Header-message">
          {
            ease < .9 ? "You're reading in \"pain\" zone. We recommend reading at ease level of at least 90%." :
            ease < .98 ? "You're reading in \"intensive reading\" zone. We recommend reading at ease level of 98%." :
            'This book is at the right level for you.'
          }
        </div>
        <div className="Header-message">
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
