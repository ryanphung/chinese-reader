import { UPGRADERS, upgradeData } from '../data'

describe('version 2 upgrader', () => {
  test('it should work', () => {
    const vocabularyDb = {"山":0,"水":1,"空气":2,"树林":4,"深":4}
    const settings = {"transcriptMethod":"pinyin","script":"simplified"}
    const upgrader = UPGRADERS.find(v => v.version === 2)

    const res = upgrader.fn({ vocabularyDb, settings })

    expect(res.vocabularyDb).toStrictEqual({"山": {"level": 0}, "树林": {"level": 4}, "水": {"level": 1}, "深": {"level": 4}, "空气": {"level": 2}});
    expect(res.settings).toStrictEqual(settings);
  });
});
