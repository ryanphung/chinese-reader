import './Settings.scss'

const RECOMMENDATIONS = [
  ...(
    [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000]
      .map(v => ({ value: `top${v}`, label: `Most common ${v} characters` }))
  ),
  { value: 'rsh1', label: 'RSH1 (1,500 characters)' },
  { value: 'off', label: 'Off' }
]

const SCRIPTS = [
  { value: 'simplified', label: 'Simplified' },
  { value: 'traditional', label: 'Traditional' }
]

const TRANSCRIPT_METHODS = [
  { value: 'pinyin', label: 'Pinyin' },
  { value: 'hanviet', label: 'Hán Việt' }
]

function Settings({
  version,
  isVisible,
  settings={},
  onSettingsUpdate,
  onClose
}) {
  const {
    transcriptMethod='pinyin',
    script='simplified',
    recommendation=false
  } = settings

  function handleTranscriptMethodSelectChange(e) {
    onSettingsUpdate({
      ...settings,
      transcriptMethod: e.target.value
    })
  }

  function handleScriptSelectChange(e) {
    onSettingsUpdate({
      ...settings,
      script: e.target.value
    })
  }

  function handleRecommendationSelectChange(e) {
    onSettingsUpdate({
      ...settings,
      recommendation: e.target.value
    })
  }

  return (
    isVisible ?
    <section className="Settings">
      <section>
        <span className="text-s">Version</span> 0.0.{version}
      </section>
      <section>
        <span>Recommendation based on:</span>
        <select onChange={handleRecommendationSelectChange} value={recommendation}>
          {
            RECOMMENDATIONS.map((v, i) =>
              <option key={i} value={v.value}>{v.label}</option>
            )
          }
        </select>
      </section>
      <section>
        <span>Transcript Method:</span>
        <select onChange={handleTranscriptMethodSelectChange} value={transcriptMethod}>
          {
            TRANSCRIPT_METHODS.map((v, i) =>
              <option key={i} value={v.value}>{v.label}</option>
            )
          }
        </select>
      </section>
      <section>
        <span>Script:</span>
        <select onChange={handleScriptSelectChange} value={script}>
          {
            SCRIPTS.map((v, i) =>
              <option key={i} value={v.value}>{v.label}</option>
            )
          }
        </select>
      </section>
      <button style={{marginTop: 10}} onClick={onClose}>Close</button>
    </section> : null
  )
}

export default Settings
