import StoredSafe, {
  StoredSafeObjectData,
  StoredSafeObject as ResponseObject,
  StoredSafeTemplate as ResponseTemplate,
  StoredSafeVaultsData,
  StoredSafeTemplateData,
  StoredSafePoliciesData
} from 'storedsafe'
import {
  StoredSafeAddObjectError,
  StoredSafeBaseError,
  StoredSafeDecryptError,
  StoredSafeEditError,
  StoredSafeGetPoliciesError,
  StoredSafeGetTemplatesError,
  StoredSafeGetVaultsError,
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
      opt,
      type,
      placeholder,
      options,
      options_default
    }) => {
      const pwgen = type === 'text-passwdgen'
      const fieldType = pwgen ? 'text' : type
      const value = isEncrypted
        ? isDecrypted
          ? obj.crypted[name]
          : undefined
        : obj.public[name]
      return {
        name,
        title,
        type: fieldType,
        isEncrypted,
        required: !opt,
        value,
        isPassword,
        pwgen,
        placeholder,
        options,
        options_default
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
    icon: template.info.ico.replace(/^ico_/, ''),
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
  const objects: StoredSafeObject[] = []
  for (const obj of data.OBJECT) {
    const template = data.TEMPLATES.find(({ id }) => id === obj.templateid)
    // Skip objects with files
    if (!!obj.fileinfo) continue
    // Skip folders (2)
    if (template.info.id === '2') continue
    objects.push(parseResult(host, obj, template))
  }
  return objects
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
  if (needle.length === 0) return []
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

function parseVaults (data: StoredSafeVaultsData): StoredSafeVault[] {
  return data.VAULTS.map(vault => ({
    id: vault.id,
    name: vault.groupname,
    permissions: Number(vault.status),
    policyId: vault.policy
  }))
}

/**
 * Get a list of all vaults on the host.
 * @param host StoredSafe host name.
 * @param token Token associated with session for `host`.
 */
export async function getVaults (host: string, token: string) {
  const api = new StoredSafe({ host, token })
  try {
    const response = await api.listVaults()
    if (response.status !== 200) {
      throw new StoredSafeGetVaultsError(response.status)
    }
    return parseVaults(response.data)
  } catch (error) {
    if (error instanceof StoredSafeBaseError) throw error
    throw new StoredSafeNetworkError(error, error.status)
  }
}

function parseTemplates (data: StoredSafeTemplateData): StoredSafeTemplate[] {
  const templates = data.TEMPLATE.filter(template => {
    // Filter out file-type objects
    if (Object.keys(template.STRUCTURE).includes('file1')) return false
    // Filter out folders
    if (template.INFO.id === '2') return false
    return true
  })
  return templates.map(template => ({
    id: template.INFO.id,
    name: template.INFO.name,
    icon: template.INFO.ico.replace(/^ico_/, ''),
    structure: Object.keys(template.STRUCTURE).map(field => {
      const pwgen = template.STRUCTURE[field].type === 'text-passwdgen'
      let fieldType: string = template.STRUCTURE[field].type
      if (pwgen) fieldType = 'text'
      return {
        name: field,
        title: template.STRUCTURE[field].translation,
        type: fieldType,
        isEncrypted: template.STRUCTURE[field].encrypted,
        required: !template.STRUCTURE[field].opt,
        options: template.STRUCTURE[field].options,
        options_default: template.STRUCTURE[field].options_default,
        placeholder: template.STRUCTURE[field].placeholder,
        pwgen
      }
    })
  }))
}

/**
 * Get a list of all templates on the host.
 * @param host StoredSafe host name.
 * @param token Token associated with session for `host`.
 */
export async function getTemplates (host: string, token: string) {
  const api = new StoredSafe({ host, token })
  try {
    const response = await api.listTemplates()
    if (response.status !== 200) {
      throw new StoredSafeGetTemplatesError(response.status)
    }
    return parseTemplates(response.data)
  } catch (error) {
    if (error instanceof StoredSafeBaseError) throw error
    throw new StoredSafeNetworkError(error, error.status)
  }
}

function parsePolicies (
  data: StoredSafePoliciesData
): StoredSafePasswordPolicy[] {
  return data.CALLINFO.policies
}

/**
 * Get a list of all password policies on the host.
 * @param host StoredSafe host name.
 * @param token Token associated with session for `host`.
 */
export async function getPolicies (host: string, token: string) {
  const api = new StoredSafe({ host, token })
  try {
    const response = await api.passwordPolicies()
    if (response.status !== 200) {
      throw new StoredSafeGetPoliciesError(response.status)
    }
    return parsePolicies(response.data)
  } catch (error) {
    if (error instanceof StoredSafeBaseError) throw error
    throw new StoredSafeNetworkError(error, error.status)
  }
}

/**
 * Add an object to StoredSafe.
 * @param host StoredSafe host name.
 * @param token Token associated with session for `host`.
 * @param params Object data.
 * @see https://developer.storedsafe.com/objects/create_object.html
 */
export async function addObject (host: string, token: string, params: object) {
  const api = new StoredSafe({ host, token })
  try {
    const response = await api.createObject(params)
    if (response.status !== 200) {
      throw new StoredSafeAddObjectError(response.status)
    }
  } catch (error) {
    if (error instanceof StoredSafeBaseError) throw error
    throw new StoredSafeNetworkError(error, error.status)
  }
}
