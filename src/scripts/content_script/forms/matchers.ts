
/**
 * Matcher for an input field.
 * @param type - Regular expression matching the input type attribute.
 * @param name - Regular expression matching the input name or id attribute.
 * */
interface Matcher {
  type: RegExp
  name: RegExp
}

/**
 * Matcher for forms to determine the type of the form.
 * @param name - Regular expression matching the name or id attribute of the form.
 * @param role - Regular expression matching the role attribute of the form.
 * @param fields - List of matchers for the input fields inside the form.
 * */
interface FormMatcher {
  name?: RegExp
  role?: RegExp
  fields?: Matcher[]
}
