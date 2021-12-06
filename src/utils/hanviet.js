import phienam from '../data/phienam.json'

const hanvietify = word => [...(word || '')].map(char => phienam[char]).filter(v => v).join(' ')

export default hanvietify
