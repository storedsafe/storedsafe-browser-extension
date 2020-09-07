import { actions as StoredSafeActions } from '../../../model/storedsafe/StoredSafe'

/**
 * Decrypt result fields and returned fill-friendly version of result.
 * @param result Encrypted StoredSafe result
 */
export async function parseResult (
  result: SSObject
): Promise<Map<string, string>> {
  let isEncrypted = result.fields.reduce(
    (acc, field) => acc || (field.isEncrypted && field.value !== undefined),
    false
  )
  if (isEncrypted) {
    result = await StoredSafeActions.decrypt(result.host, result.id)
  }
  return new Map(result.fields.map(field => [field.name, field.value]))
}
