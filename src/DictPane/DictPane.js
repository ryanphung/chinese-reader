import { useMemo } from 'react'
import './DictPane.scss'
import hanvietify from '../utils/hanviet'

function DictPane({ word }) {
  const hanviet = useMemo(() => hanvietify(word?.text), [word?.text])
  return (
    <div className="DictPane">
      <div className="DictPane-hanzi">
        {word?.text}
      </div>
      <div className="DictPane-hanviet">
        {hanviet}
      </div>
      <div className="DictPane-info">
      {
        word?.matches?.map?.((v, i) =>
          <div key={i} className="DictPane-line">
            <div className="DictPane-pinyin">
              {v.pinyinPretty}
            </div>
            <div className="DictPane-meaning">
              {v.english}
            </div>
          </div>
        )
      }
      </div>
    </div>
  )
}

export default DictPane
