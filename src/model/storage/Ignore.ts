/**
 * Abstraction layer for browser storage API to handle persisting sites where
 * the extension should not offer to save login information.
 * - get/set functions handle all storage interaction.
 * - actions object provides the public interface for the model.
 * */

const userStorage = browser.storage.sync

/**
 * Get ignored sites from user storage.
 * @returns List of ignored sites.
 * */
async function get (): Promise<Ignore> {
  const { ignore } = await userStorage.get('ignore')
  return ignore === undefined ? [] : ignore
}

/**
 * Commit new ignore list to user storage.
 * @param ignore - New ignore list.
 * */
async function set (ignore: Ignore): Promise<void> {
  return await userStorage.set({ ignore })
}

/// /////////////////////////////////////////////////////////
// Actions

/**
 * Add new host to ignore.
 * @param host - New ignore entry.
 * @returns New ignore.
 * */
async function add (host: string): Promise<Ignore> {
  const ignore = await get()
  if (ignore.includes(host)) {
    return ignore
  }
  const newIgnore = [...ignore]
  newIgnore.push(host)
  return await set(newIgnore).then(get)
}

/**
 * Remove host from ignore.
 * @param host - Host to remove.
 * @returns New ignore list.
 * */
async function remove (host: string): Promise<Ignore> {
  const ignore = await get()
  const newIgnore = ignore.filter(listedHost => listedHost !== host)
  return await set(newIgnore).then(get)
}

/**
 * Clear ignore.
 * @returns Updated ignore list (empty).
 * */
async function clear (): Promise<Ignore> {
  return await set([]).then(get)
}

export const actions = {
  add,
  remove,
  clear,
  fetch: get
}
