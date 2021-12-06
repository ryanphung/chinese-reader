export function isLowerFrequencyWord(text) {
  return text.match(/^variant of.*|old variant of.*|surname.*|used in.*/)
}

export function getHigherFrequencyDictEntry(token) {
  const matches = token?.matches || []
  let t

  for (let i = 0; i < matches.length; i++) {
    t = matches[i].english
    if (!isLowerFrequencyWord(t))
      break;
  }

  return t
}

export function extractKeywordFromDictEntry(dictEntry) {
  let t = dictEntry
  if (!t) return t

  // FIXME: get the most popular entry instead of the first entry

  // if there is some texts in () or [], remove them
  t = t.replace(/\s*\(.*\)\s*|\s*\[.*\]\s*/g, '')

  // first split by the separators ' (''/' ';' ',' and take the first entry only
  t = t?.split?.(/ \(|[/;,]/)?.[0] || ''

  t = t.trim()

  // if the text is in a parentheses, remove the parentheses
  t = t.replace(/^\((.*?)\)$/, '$1')

  // remove some common marker texts
  t = t.replace(/lit\. |fig\. |surname /g, '')

  // remove all Chinese texts
  t = t.replace(/\p{Script=Han}+/ug, '')

  return t
}
