import { getMessage, LocalizedMessage } from './i18n'

/**
 * Open a URL in the browser window.
 * @param url URL to visit.
 * // TODO: Real implementation?
 */
export async function goto (url: string): Promise<void> {
  // Force external url to HTTPS if not defined
  if (!url.match(/^\w+:\/\/.*/)) url = `https://${url}`
  window.open(url, url)
  return await Promise.resolve()
}

/* Rule to verify a password by, relative to a policy */
type PasswordRule = (password: string, policyValue: any) => boolean
const passwordRules: Record<string, PasswordRule> = {
  min_length: (password, length: number) => password.length >= length,
  max_length: (password, length: number) => password.length <= length,

  min_lowercase_chars: (password, count: number) => {
    const match = password.match(/[a-z]/g)
    return !!match?.length ? match.length >= count : false
  },
  max_lowercase_chars: (password, count: number) => {
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
  // Ensure password is a string
  password = password ?? ''
  return [
    Object.keys(policy.rules).reduce((acc, rule) => {
      const isRuleMatch = passwordRules[rule](password, policy.rules[rule])
      if (!isRuleMatch)
        errors.push(getMessage(passwordErrors[rule], policy.rules[rule]))
      return acc && isRuleMatch
    }, true),
    errors
  ]
}

export function copyText(text: string): Promise<void> {
  return navigator.clipboard.writeText(text)
}