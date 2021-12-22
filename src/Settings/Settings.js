import './Settings.scss'
import fileDownload from 'js-file-download'

const RECOMMENDATIONS = [
  { value: 'off', label: 'Off' },
  ...(
    [
      1, 2, 3, 4, 5, 6
    ].map(v => ({ value: `hsk${v}`, label: `HSK Level ${v}` }))
  ),
  ...(
    [
      100, 200, 300, 400, 500, 600, 700, 800, 900, 1000,
      1200, 1400, 1600, 1800, 2000, 2200, 2400, 2600, 2800, 3000
    ].map(v => ({ value: `top${v}`, label: `Most common ${v} characters` }))
  ),
  { value: 'rsh1', label: 'RSH1 (1,500 characters)' },
  { value: 'rsh2', label: 'RSH2 (3,000 characters)' }
]

const SCRIPTS = [
  { value: 'simplified', label: 'Simplified' },
  { value: 'traditional', label: 'Traditional' }
]

const TRANSCRIPT_METHODS = [
  { value: 'pinyin', label: 'Pinyin' },
  { value: 'hanviet', label: 'Hán Việt' }
]

const THEMES = [
  { value: 'sepia', label: 'Sepia' },
  { value: 'dark', label: 'Dark' }
]

const LANGUAGE_NAMES = {
  'zh-CN': 'China',
  'zh-TW': 'Taiwan',
  'zh-HK': 'HK'
}

function Settings({
  version,
  isVisible,
  settings={},
  onSettingsUpdate,
  onClose,
  vocabularyDb,
  tokens,
  voices
}) {
  const {
    transcriptMethod='pinyin',
    script='simplified',
    recommendation='off',
    theme='dark',
    voice='off'
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

  function handleThemeSelectChange(e) {
    onSettingsUpdate({
      ...settings,
      theme: e.target.value
    })
  }

  function handleVoiceSelectChange(e) {
    onSettingsUpdate({
      ...settings,
      voice: e.target.value
    })
  }

  function handleDownloadTokensClick() {
    fileDownload(JSON.stringify(tokens, null, 2), 'tokens.json', 'text/json')
  }

  function handleDownloadVocabularyClick() {
    fileDownload(JSON.stringify(vocabularyDb, null, 2), 'vocabulary-db.json', 'text/json')
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
      <section>
        <span>Theme:</span>
        <select onChange={handleThemeSelectChange} value={theme}>
          {
            THEMES.map((v, i) =>
              <option key={i} value={v.value}>{v.label}</option>
            )
          }
        </select>
      </section>
      <section>
        <span>Voice:</span>
        <select onChange={handleVoiceSelectChange} value={voice}>
          <option value={undefined}>Off</option>
          {
            voices.map((v, i) =>
              <option key={i} value={v.voiceURI}>{LANGUAGE_NAMES[v.lang]}: {v.name}</option>
            )
          }
        </select>
      </section>
      <div style={{display: 'flex', gap: 8, marginTop: 10, justifyContent: 'flex-end'}}>
        <a href="#" onClick={handleDownloadTokensClick}>Download Tokens</a>
        <a href="#" onClick={handleDownloadVocabularyClick}>Download Vocabulary</a>
      </div>
      <div style={{display: 'flex', marginTop: 10, justifyContent: 'flex-end'}}>
        <button onClick={onClose}>Close</button>
      </div>
    </section> : null
  )
}

export default Settings
