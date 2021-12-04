import './ReadingProgressBar.scss'

function ReadingProgressBar({ progress }) {
  return <div className="ReadingProgressBar" style={{width: `${progress * 100}%`}}></div>
}

export default ReadingProgressBar
