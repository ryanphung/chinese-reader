import './Header.scss'

function Header({ charsCount, knownCharsCount }) {
  const ease = knownCharsCount / charsCount
  return <div className="Header">
    <div className="Header-stats">
      <div>
        Characters: {charsCount}
      </div>
      <div>
        Known: {knownCharsCount}
      </div>
      <div>
        Unknown: {charsCount - knownCharsCount}
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
  </div>
}

export default Header
