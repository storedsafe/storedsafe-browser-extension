import StoredSafe, {
  StoredSafeObjectData,
  StoredSafeObject as ResponseObject,
  StoredSafeTemplate as ResponseTemplate
} from 'storedsafe'
import {
  StoredSafeBaseError,
  StoredSafeDecryptError,
  StoredSafeEditError,
  StoredSafeNetworkError,
  StoredSafeParseObjectError,
  StoredSafeSearchError
} from '../errors'

/**
 * Parse a single StoredSafe object into a format which is easier to work with
 * for the browser extension.
 * @param host StoredSafe host name where the object came from.
 * @param obj The StoredSafe object to be parsed.
 * @param template Template describing the structure of the StoredSafe object.
 * @param isDecrypted True if the object hsa been decrypted.
 */
function parseResult (
  host: string,
  obj: ResponseObject,
  template: ResponseTemplate,
  isDecrypted: boolean = false
): StoredSafeObject {
  // Parse individual fields within object.
  const fields: StoredSafeField[] = template.structure.map(
    ({
      fieldname: name,
      translation: title,
      encrypted: isEncrypted,
      policy: isPassword,
      type
    }) => {
      const value = isEncrypted
        ? isDecrypted
          ? obj.crypted[name]
          : undefined
        : obj.public[name]
      return {
        name,
        title,
        value,
        isEncrypted,
        isPassword,
        type
      }
    }
  )

  // The parsed version of the StoredSafe object.
  return {
    host,
    id: obj.id,
    templateId: obj.templateid,
    vaultId: obj.groupid,
    name: obj.objectname,
    type: template.info.name,
    icon: template.info.ico,
    isDecrypted,
    fields
  }
}

/**
 * Parse results from a find request.
 * @param host StoredSafe host name where the results came from.
 * @param data data returned by the find request.
 */
function parseResults (
  host: string,
  data: StoredSafeObjectData
): StoredSafeObject[] {
  return data.OBJECT.map(obj => {
    const template = data.TEMPLATES.find(({ id }) => id === obj.templateid)
    return parseResult(host, obj, template)
  })
}

/**
 * Search for objects in StoredSafe.
 * @param host StoredSafe host name.
 * @param token Token associated with session for `host`.
 * @param needle Search string to be matched against.
 */
export async function search (
  host: string,
  token: string,
  needle: string
): Promise<StoredSafeObject[]> {
  const api = new StoredSafe({ host, token })
  try {
    const response = await api.find(needle)
    if (response.status !== 200) {
      throw new StoredSafeSearchError(response.status)
    }
    try {
      return parseResults(host, response.data)
    } catch (error) {
      throw new StoredSafeParseObjectError()
    }
  } catch (error) {
    if (error instanceof StoredSafeBaseError) throw error
    throw new StoredSafeNetworkError(error, error.status)
  }
}

/**
 * Decrypt a StoredSafe object.
 * @param host StoredSafe host name.
 * @param token Token associated with session for `host`.
 * @param obj Object to be decrypted.
 */
export async function decryptObject (
  host: string,
  token: string,
  obj: StoredSafeObject
): Promise<StoredSafeObject> {
  const api = new StoredSafe({ host, token })
  try {
    const response = await api.decryptObject(obj.id)
    if (response.status !== 200) {
      throw new StoredSafeDecryptError(response.status)
    }
    try {
      const obj = response.data.OBJECT[0]
      const template = response.data.TEMPLATES.find(
        ({ id }) => id === obj.templateid
      )
      return parseResult(host, obj, template, true)
    } catch (error) {
      throw new StoredSafeParseObjectError()
    }
  } catch (error) {
    if (error instanceof StoredSafeBaseError) throw error
    throw new StoredSafeNetworkError(error, error.status)
  }
}

/**
 * Edit a StoredSafe object.
 * @param host StoredSafe host name.
 * @param token Token associated with session for `host`.
 * @param obj Object to be edited.
 * @param values New values for StoredSafe object.
 */
export async function editObject (
  host: string,
  token: string,
  obj: StoredSafeObject,
  values: Record<string, string>
): Promise<StoredSafeObject> {
  const api = new StoredSafe({ host, token })
  try {
    const response = await api.editObject(obj.id, values)
    if (response.status !== 200) {
      throw new StoredSafeEditError(response.status)
    }
  } catch (error) {
    if (error instanceof StoredSafeBaseError) throw error
    throw new StoredSafeNetworkError(error, error.status)
  }
  obj.fields.forEach(field => {
    if (!!values[field.name]) field.value = values[field.name]
  })
  return obj
}

/**
 * Delete a StoredSafe object.
 * @param host StoredSafe host name.
 * @param token Token associated with session for `host`.
 * @param obj Object to be deleted.
 */
export async function deleteObject (
  host: string,
  token: string,
  obj: StoredSafeObject
): Promise<StoredSafeObject> {
  const api = new StoredSafe({ host, token })
  try {
    const response = await api.deleteObject(obj.id)
    if (response.status !== 200) {
      throw new StoredSafeEditError(response.status)
    }
  } catch (error) {
    if (error instanceof StoredSafeBaseError) throw error
    throw new StoredSafeNetworkError(error, error.status)
  }
  return obj
}
