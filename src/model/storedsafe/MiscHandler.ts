/**
 * Handle StoredSafe requests related to the /utils endpoint or other general
 * site information such as available vaults or templates.
 *
 * All exposed functions should take a function of the type MakeStoredSafeRequest
 * as their first parameter which will expose the handler for the relevant site
 * and handle common errors before returning a promise with just the unparsed data
 * if everything went well.
 *
 * This module should only concern itself with sending requests and parsing incoming
 * data. Error handling and storage modifications should be handled in `StoredSafe.ts`.
 * */
import { MakeStoredSafeRequest } from './StoredSafe'
import {
  StoredSafePasswordData,
  StoredSafeVaultsData,
  StoredSafeTemplateData
} from 'storedsafe'

/**
 * Get the available vaults from the given site.
 * @param request - Request callback function.
 * @returns All available StoredSafe vaults on the host.
 * */
async function getVaults (request: MakeStoredSafeRequest): Promise<SSVault[]> {
  let data: StoredSafeVaultsData
  try {
    data = (await request(
      async handler => await handler.listVaults()
    )) as StoredSafeVaultsData
  } catch (error) {
    // NOTE: If vault list is empty, StoredSafe sends 404
    if (error.response?.data !== undefined) {
      data = error.response?.data as StoredSafeVaultsData
    } else {
      throw error
    }
  }
  return data.VAULTS.map(vault => ({
    id: vault.id,
    name: vault.groupname,
    canWrite: ['2', '4'].includes(vault.status) // Write or Admin
  }))
}

/**
 * Get the available templates from the given site.
 * @param request - Request callback function.
 * @returns All available StoredSafe templates on the host.
 * */
async function getTemplates (
  request: MakeStoredSafeRequest
): Promise<SSTemplate[]> {
  const data = (await request(
    async handler => await handler.listTemplates()
  )) as StoredSafeTemplateData
  const templates: SSTemplate[] = []
  for (const template of data.TEMPLATE) {
    // TODO: Decide whether to allow templates other than Login Info
    if (template.INFO.id !== '20') continue
    templates.push({
      id: template.INFO.id,
      name: template.INFO.name,
      icon: template.INFO.ico,
      structure: Object.keys(template.STRUCTURE).map(fieldName => {
        const field = template.STRUCTURE[fieldName]
        return {
          title: field.translation,
          name: fieldName,
          type: field.type,
          isEncrypted: field.encrypted
        }
      })
    })
  }
  return templates
}

/**
 * Generate a new password.
 * @param request - Request callback function.
 * @param params - Optional parameters for password generation.
 * @returns Generated password.
 * */
async function generatePassword (
  request: MakeStoredSafeRequest,
  params?: {
    type?: 'pronouncable' | 'diceword' | 'opie' | 'secure' | 'pin'
    length?: number
    language?: 'en_US' | 'sv_SE'
    delimeter?: string
    words?: number
    min_char?: number
    max_char?: number
    policyid?: string
  }
): Promise<string> {
  const data = (await request(
    async handler => await handler.generatePassword(params)
  )) as StoredSafePasswordData
  return data.CALLINFO.passphrase
}

export const actions = {
  getVaults,
  getTemplates,
  generatePassword
}
