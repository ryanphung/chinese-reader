export const UPGRADERS = [
  {
    version: 2,
    fn: ({ vocabularyDb, ...data }) => ({
      ...data,
      vocabularyDb: Object.fromEntries(Object.entries(vocabularyDb).map(([k, v]) => [k, { level: v }]))
    })
  }
].sort((a, b) => a.version - b.version) // always sort it by version, ascending

/**
 * This method automatically upgrade data to the latest schema, given its version
 * It relies on the array of upgrader functions
 * @param data: { version, ...rest }
 * @param version is a number (1, 2, 3, ... )
 * @return upgraded data
 **/
export function upgradeData(data) {
  const version = data.version || 0 // if no version, default to 0
  let result = data
  for (let i in UPGRADERS) {
    const upgrader = UPGRADERS[i]
    if (upgrader.version > version)
      result = {
        ...upgrader.fn(result),
        version: upgrader.version
      }
  }

  return result
}
