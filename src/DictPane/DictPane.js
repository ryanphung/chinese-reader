import React, { Fragment, useMemo } from 'react'
import './DictPane.scss'
import hanvietify from '../utils/hanviet'

const DictPane = React.memo(function DictPane({ word }) {
  const hanviet = useMemo(() => hanvietify(word?.text), [word?.text])
  return (
    <div className="DictPane">
      <div>
        <span className="DictPane-hanzi">
          {word?.text}
        </span>
        <span className="DictPane-hanviet">
          {hanviet}
        </span>
      </div>
      <div className="DictPane-info">
      {
        word?.matches?.map?.((v, i) =>
          <div key={i} className="DictPane-line">
            <div className="DictPane-pinyin">
              {v.pinyinPretty}
            </div>
            <div className="DictPane-meaning">
              <Meaning meaning={v.english}/>
            </div>
          </div>
        )
      }
      </div>
    </div>
  )
})

function Meaning({ meaning }) {
  const meaningSplit = (meaning || '').split('/')
  return meaningSplit.map((v, i) =>
    <Fragment key={i}>
      {v}
      {meaningSplit[i + 1] && <span className="DictPane-separator"> / </span>}
    </Fragment>
  )
}

export default DictPane
