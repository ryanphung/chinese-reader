import chineseTokenizer from 'chinese-tokenizer' // https://github.com/yishn/chinese-tokenizer

const customDict = [
  '沈佳仪 沈佳仪 [shen3 jia1 yi2] /Shen Jia Yi (name)/',
  '赖导 赖导 [lai4 dao3] /Lai Dao (name)/',
  '柯景腾 柯景腾 [ke4 jing3 teng2] /Ke Jing Teng (name)/',
  '曹国胜 曹国胜 [cao2 guo2 sheng4] /Cao Guo Sheng (name)/',
  '谢明和 谢明和 [xie4 ming2 he2] /Xia Ming He (name)/',
  '廖英宏 廖英宏 [liao4 ying1 hong2] /Liao Ying Hong (name)/',
  '胡家玮 胡家玮 [hu2 jia1 wei3] /Hu Jia Wei (name)/',
  '郑孟修 郑孟修 [zheng4 meng4 xiu1] /Zheng Meng Xiu (name)/',
  '杨泽于 杨泽于 [yang2 ze2 yu2] /Yang Ze Yu (name)/'
]

export async function initTokenizerAsync() {
  const response = await fetch('data/cedict_ts.u8')
  const dict = await response.text()

  const tokenize = chineseTokenizer.load(
    customDict.join('\n') + '\n'
    + dict)
  return tokenize
}

export function tokenizeContent(tokenize, content) {
  if (tokenize instanceof Function)
    return tokenize(content)
  else
    return []
}

export function tokenizeContentBasic(content) {
  return [...content]
}
