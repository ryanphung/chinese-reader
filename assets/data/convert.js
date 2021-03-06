import { dirname } from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import Papa from 'papaparse'

const __dirname = dirname(fileURLToPath(import.meta.url))

function convertRsh() {
  try {
    // read file
    const tsv = fs.readFileSync(__dirname + '/rsh.tsv', 'utf8')

    // parse
    const headers = [
      'hanzi', 'traditional', 'keyword', 'pinyin',
      'wordHanzi', 'wordPinyin', 'wordMeaning', 'wordHanviet',
      // 'story', 'myStory', 'traditionalStory',
      'wordsHanzi', 'wordsPinyin', 'wordsHanviet',
      'etymology', /*'vietnameseStory', */'heisigNumber', 'heisigSequence',
      'componentsSearch', 'strokeCount', 'tags'
    ]
    const data = Papa.parse(headers.join('\t') + '\n' + tsv, { header: true })

    console.log('Parse complete. Example:')
    console.log(data.data[10])

    // write file
    fs.writeFileSync(__dirname + '/../../src/data/rsh.json', JSON.stringify(data.data, null, 2), 'utf8')
    console.log('Written to file')
  } catch (err) {
    console.error(err)
  }
}

function convertContent() {
  try {
    // read file
    const txt = fs.readFileSync(__dirname + '/content.txt', 'utf8')

    let chapters = txt.split(/Chapter [0-9]*/).map((v, i) => 'Chapter ' + i + v)

    chapters = chapters.slice(1)

    // write file
    fs.writeFileSync(__dirname + '/../../src/data/content.json', JSON.stringify({
      data: chapters
    }, null, 2), 'utf8')
    console.log('Written to file')
  } catch (err) {
    console.error(err)
  }
}

function convertPhienAm() {
  try {
    // read file
    const txt = fs.readFileSync(__dirname + '/phienam.txt', 'utf8')
    const lines = txt.split('\n')
    const data = lines.map(line => line.split('=')).map(([char, hanviet]) => ({ char, hanviet }))
    const dataMap = data.reduce((s, v) => { s[v.char] = v.hanviet; return s; }, {});
    console.log('Parse complete. Example:')
    console.log(dataMap['第'])

    // write file
    fs.writeFileSync(__dirname + '/../../src/data/phienam.json', JSON.stringify(dataMap, null, 2), 'utf8')
    console.log('Written to file')
  } catch (err) {
    console.error(err)
  }
}

function convertCharFreq() {
  try {
    // read file
    const tsv = fs.readFileSync(__dirname + '/char-freq.tsv', 'utf8')

    const data = Papa.parse(tsv, { header: true })

    console.log('Parse complete. Example:')
    console.log(data.data[10])

    // write file
    fs.writeFileSync(__dirname + '/../../src/data/char-freq.json', JSON.stringify(data.data, null, 2), 'utf8')
    console.log('Written to file')
  } catch (err) {
    console.error(err)
  }
}

function main() {
  convertRsh()
  convertContent()
  convertPhienAm()
  convertCharFreq()
}

main()
