import { getMessage, LocalizedMessage } from './i18n'

/**
 * Open a URL in the browser window.
 * @param url URL to visit.
 */
export async function goto (url: string): Promise<void> {
  // TODO: Real implementation
  console.log('GOTO %s', url)
  if (url !== 'error') {
    window.open(url)
    return await Promise.resolve()
  } else {
    throw new Error(`Unable to open URL: ${url}`)
  }
}

/**
 * Generate a password with StoredSafe.
 * @param host Host where the password should be generated.
 * @param properties Password generation parameters.
 */
export async function generatePassword (
  host: string,
  properties: {
    type?: 'pronouncable' | 'diceword' | 'opie' | 'secure' | 'pin'
    length?: number
    language?: 'en_US' | 'sv_SE'
    delimiter?: 'dash' | 'space' | 'default'
    words?: number
    min_char?: number
    max_char?: number
    policyid?: string
  }
): Promise<string> {
  // TODO: Real implementation
  console.log('PWGEN %s %o', host, properties)
  if (host !== 'error') {
    const chars = 'abcdefg1234567@!;_-'.split('')
    const pw: string = [...new Array(16).keys()].map(() => Math.floor(Math.random() * chars.length)).join('')
    return Promise.resolve(pw)
  } else {
    throw new Error(`Unable to generate password.`)
  }
}

/* Rule to verify a password by, relative to a policy */
type PasswordRule = (password: string, policyValue: any) => boolean
const passwordRules: Record<string, PasswordRule> = {
  min_length: (password, length: number) => password.length >= length,
  max_length: (password, length: number) => password.length <= length,

  min_lowercase_char: (password, count: number) => {
    const match = password.match(/[a-z]/g)
    return !!match?.length ? match.length >= count : false
  },
  max_lowercase_char: (password, count: number) => {
    const match = password.match(/[a-z]/g)
    return !!match?.length ? match.length <= count : true
  },

  min_uppercase_chars: (password, count: number) => {
    const match = password.match(/[A-Z]/g)
    return !!match?.length ? match.length >= count : false
  },
  max_uppercase_chars: (password, count: number) => {
    const match = password.match(/[A-Z]/g)
    return !!match?.length ? match.length <= count : true
  },

  disallow_numeric_chars: (password, disallow) =>
    !disallow && !!password.match(/[0-9]/g),
  disallow_numeric_first: (password, disallow) =>
    !disallow && !!password.match(/^[0-9]/g),
  disallow_numeric_last: (password, disallow) =>
    !disallow && !!password.match(/[0-9]$/g),

  min_numeric_chars: (password, count: number) => {
    const match = password.match(/[0-9]/g)
    return !!match?.length ? match.length >= count : false
  },
  max_numeric_chars: (password, count: number) => {
    const match = password.match(/[0-9]/g)
    return !!match?.length ? match.length <= count : true
  },

  disallow_nonalphanumeric_chars: (password, disallow) =>
    !disallow && !!password.match(/[\W]/g),
  disallow_nonalphanumeric_first: (password, disallow) =>
    !disallow && !!password.match(/^[\W]/g),
  disallow_nonalphanumeric_last: (password, disallow) =>
    !disallow && !!password.match(/[\W]$/g),

  min_nonalphanumeric_chars: (password, count: number) => {
    const match = password.match(/[\W]/g)
    return !!match?.length ? match.length >= count : false
  },
  max_nonalphanumeric_chars: (password, count: number) => {
    const match = password.match(/[\W]/g)
    return !!match?.length ? match.length <= count : true
  }
}

const passwordErrors: Record<string, LocalizedMessage> = {
  min_length: LocalizedMessage.PASSWORD_MIN_LENGTH_ERROR,
  max_length: LocalizedMessage.PASSWORD_MAX_LENGTH_ERROR,
  min_lowercase_chars: LocalizedMessage.PASSWORD_MIN_LOWERCASE_CHARS_ERROR,
  max_lowercase_chars: LocalizedMessage.PASSWORD_MAX_LOWERCASE_CHARS_ERROR,
  min_uppercase_chars: LocalizedMessage.PASSWORD_MIN_UPPERCASE_CHARS_ERROR,
  max_uppercase_chars: LocalizedMessage.PASSWORD_MAX_UPPERCASE_CHARS_ERROR,
  disallow_numeric_chars:
    LocalizedMessage.PASSWORD_DISALLOW_NUMERIC_CHARS_ERROR,
  disallow_numeric_first:
    LocalizedMessage.PASSWORD_DISALLOW_NUMERIC_FIRST_ERROR,
  disallow_numeric_last: LocalizedMessage.PASSWORD_DISALLOW_NUMERIC_LAST_ERROR,
  min_numeric_chars: LocalizedMessage.PASSWORD_MIN_NUMERIC_CHARS_ERROR,
  max_numeric_chars: LocalizedMessage.PASSWORD_MAX_NUMERIC_CHARS_ERROR,
  disallow_nonalphanumeric_chars:
    LocalizedMessage.PASSWORD_DISALLOW_NONALPHANUMERIC_CHARS_ERROR,
  disallow_nonalphanumeric_first:
    LocalizedMessage.PASSWORD_DISALLOW_NONALPHANUMERIC_FIRST_ERROR,
  disallow_nonalphanumeric_last:
    LocalizedMessage.PASSWORD_DISALLOW_NONALPHANUMERIC_LAST_ERROR,
  min_nonalphanumeric_chars:
    LocalizedMessage.PASSWORD_MIN_NONALPHANUMERIC_CHARS_ERROR,
  max_nonalphanumeric_chars:
    LocalizedMessage.PASSWORD_MAX_NONALPHANUMERIC_CHARS_ERROR
}

export function isPolicyMatch (
  password: string,
  policy: StoredSafePasswordPolicy
): [boolean, string[]] {
  const errors: string[] = []
  return [
    Object.keys(policy).reduce((acc, rule) => {
      const isRuleMatch = passwordRules[rule](password, policy[rule])
      if (!isRuleMatch)
        errors.push(getMessage(passwordErrors[rule], policy[rule]))
      return acc && isRuleMatch
    }, true),
    errors
  ]
}
