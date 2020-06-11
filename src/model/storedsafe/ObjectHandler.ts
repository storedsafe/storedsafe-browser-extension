/**
 * Handle StoredSafe requests related to the /object endpoint.
 *
 * All exposed functions should take a function of the type MakeStoredSafeRequest
 * as their first parameter which will expose the handler for the relevant site
 * and handle common errors before returning a promise with just the unparsed data
 * if everything went well.
 *
 * This module should only concern itself with sending requests and parsing incoming
 * data. Error handling and storage modifications should be handled in `StoredSafe.ts`.
 * */
import { MakeStoredSafeRequest } from './StoredSafe';
import { StoredSafeObject, StoredSafeTemplate } from 'storedsafe';

/**
 * Helper function to parse objects and templates returned from a find request.
 * @param ssObject StoredSafe object.
 * @param @ssTemplate StoredSafe template.
 * @param isDecrypted Whether the object has just been decrypted.
 * @returns Parsed representation of object and template info.
 * */
const parseSearchResult = (
  ssObject: StoredSafeObject,
  ssTemplate: StoredSafeTemplate,
  isDecrypted = false
): SSObject => {
  // Extract general object info
  const isFile = ssTemplate.info.file !== undefined;
  const name = isFile ? ssObject.filename : ssObject.objectname;
  const { id, templateid: templateId, groupid: vaultId } = ssObject;
  const { name: type, ico: icon } = ssTemplate.info;
  const fields: SSField[] = [];

  // Extract field info from template
  ssTemplate.structure.forEach((field) => {
    const {
      fieldname: fieldName,
      translation: title,
      encrypted: isEncrypted,
      policy: isPassword,
    } = field;

    // Value may be undefined if the field is encrypted
    const value = (
      isEncrypted
        ? (isDecrypted ? ssObject.crypted[field.fieldname] : undefined)
        : ssObject.public[field.fieldname]
    );

    // Add field to object fields
    fields.push({
      name: fieldName,
      title,
      value,
      isEncrypted,
      isPassword,
    });
  });

  // Compile all parsed information
  return { id, templateId, vaultId, name, type, icon, isDecrypted, fields };
};

/**
 * Find and parse StoredSafe objects matching the provided needle.
 * @param request - Request callback function.
 * @param needle - Search string to match against in StoredSafe.
 * @returns Results matching needle.
 * */
function find(request: MakeStoredSafeRequest, needle: string): Promise<SSObject[]> {
  return request((handler) => handler.find(needle)).then((data) => {
    const results: SSObject[] = [];
    for (let i = 0; i < data.OBJECT.length; i++) {
      const ssObject = data.OBJECT[i];
      const ssTemplate = data.TEMPLATES.find(
        (template) => template.id === ssObject.templateid
      );
      const isFile = ssTemplate.info.file !== undefined;
      if (isFile) continue; // Skip files
      results.push(parseSearchResult(
        ssObject,
        ssTemplate,
      ));
    }
    return results;
  });
}

/**
 * Decrypt StoredSafe object.
 * @param request - Request callback function.
 * @param objectId - ID in StoredSafe of object to decrypt.
 * @returns The decrypted object.
 * */
function decrypt(
  request: MakeStoredSafeRequest,
  objectId: string,
): Promise<SSObject> {
  return request((handler) => handler.decryptObject(objectId)).then((data) => {
    const ssObject = data.OBJECT.find((obj) => obj.id === objectId);
    const ssTemplate = data.TEMPLATES.find((template) => template.id === ssObject.templateid);
    return parseSearchResult(ssObject, ssTemplate, true);
  });
}

/**
 * Add object to StoredSafe.
 * @param request - Request callback function.
 * @param params - Object parameters based on the chosen StoredSafe template.
 * */
function add(request: MakeStoredSafeRequest, params: object): Promise<void> {
  return request((handler) => handler.createObject(params)).then();
}

export const actions = {
  find,
  decrypt,
  add,
};
