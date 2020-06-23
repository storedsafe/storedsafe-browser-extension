/**
 * Abstraction layer for browser storage API to handle persisting sites where
 * the extension should not offer to save login information.
 * - get/set functions handle all storage interaction.
 * - actions object provides the public interface for the model.
 * */

const userStorage = browser.storage.sync

/**
 * Get blacklisted sites from user storage.
 * @returns List of blacklisted sites.
 * */
async function get (): Promise<Blacklist> {
  return await userStorage
    .get('blacklist')
    .then(({ blacklist }) => (blacklist === undefined ? [] : blacklist))
}

/**
 * Commit new blacklist to user storage.
 * @param blacklist - New blacklist.
 * */
async function set (blacklist: Blacklist): Promise<void> {
  return await userStorage.set({ blacklist })
}

/**
 * Add new host to blacklist.
 * @param host - New blacklist entry.
 * @returns New blacklist.
 * */
async function add (host: string): Promise<Blacklist> {
  return await get().then(blacklist => {
    if (blacklist.includes(host)) {
      return blacklist
    }
    const newBlacklist = [...blacklist]
    newBlacklist.push(host)
    return set(newBlacklist).then(get)
  })
}
/**
 * Remove host from blacklist.
 * @param host - Host to remove.
 * @returns New blacklist.
 * */
async function remove (host: string): Promise<Blacklist> {
  return await get().then(async blacklist => {
    const newBlacklist = blacklist.filter(listedHost => listedHost !== host)
    return await set(newBlacklist).then(get)
  })
}

export const actions = {
  add,
  remove,
  fetch: get
}
