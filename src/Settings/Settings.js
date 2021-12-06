import './Settings.scss'

const TRANSCRIPT_METHODS = [
  { value: 'pinyin', label: 'Pinyin' },
  { value: 'hanviet', label: 'Hán Việt' }
]

function Settings({
  isVisible,
  settings={},
  onSettingsUpdate,
  onClose
}) {
  const { transcriptMethod='pinyin' } = settings

  function handleTranscriptMethodSelectChange(e) {
    onSettingsUpdate({
      ...settings,
      transcriptMethod: e.target.value
    })
  }

  return (
    isVisible ?
    <section className="Settings">
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
      <button style={{marginTop: 20}} onClick={onClose}>Close</button>
    </section> : null
  )
}

export default Settings
