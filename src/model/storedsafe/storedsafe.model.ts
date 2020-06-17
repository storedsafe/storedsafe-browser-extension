/**
 * Simplified interfaces and types representing constructs found in StoredSafe.
 * Only contains the fields relevant to the application. Computed values such
 * as for example permission bits should be computed into boolean fields so
 * the view that depends on the property only gets the relevant information.
 * */

/**
 * Representation of field inside StoredSafe Object.
 * */
interface SSField {
  name: string;
  title: string;
  value?: string;
  isEncrypted: boolean;
  isShowing?: boolean;
  isPassword: boolean;
}

/**
 * Representation of StoredSafe Object.
 * */
interface SSObject {
  id: string;
  templateId: string;
  vaultId: string;
  name: string;
  type: string;
  icon: string;
  isDecrypted: boolean;
  fields: SSField[];
}

/**
 * Representation of StoredSafe Vault.
 * */
interface SSVault {
  id: string;
  name: string;
  canWrite: boolean;
}

/**
 * Representation of field in StoredSafe Template.
 * */
interface SSTemplateField {
  title: string;
  name: string;
  type: string;
  isEncrypted: boolean;
}

/**
 * Representation of StoredSafe Template.
 * */
interface SSTemplate {
  id: string;
  name: string;
  icon: string;
  structure: SSTemplateField[];
}

/**
 * Representation of structure and capabilities of a StoredSafe site.
 * */
interface SSSiteInfo {
  vaults: SSVault[];
  templates: SSTemplate[];
}

/**
 * Available login types.
 * */
type LoginType = 'yubikey' | 'totp';

/**
 * Form fields for logging in via TOTP.
 * */
interface TOTPFields {
  username: string;
  passphrase: string;
  otp: string;
}

/**
 * Form fields for logging in via Yubico OTP.
 * */
interface YubiKeyFields {
  username: string;
  keys: string;
}

/**
 * All form fields submitted when logging in.
 * */
type LoginFields = { loginType: LoginType } & TOTPFields & YubiKeyFields;

