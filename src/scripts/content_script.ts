// const types = /text|url|password|email/i;
// const ids = /user|name|pass|mail|url|server|site/i;

// browser.runtime.sendMessage({
  // type: 'tabSearch',
// });

enum FormType {
  Login = 'login',
  Card = 'card',
  Search = 'search',
  ContactInfo = 'contactinfo',
  NewsLetter = 'newsletter',
  Register = 'register',
  Unknown = 'unknown',
}

interface Matcher {
  type: RegExp;
  name: RegExp;
}

interface FormMatcher {
  name: RegExp;
  fields: Matcher[];
}

/**
 * Keys should match field names in StoredSafe, form inputs should only be filled
 * with the corresponding StoredSafe data if both type and name (name or id attribute)
 * get a match.
 * */
const matchers: Map<string, Matcher> = new Map([
  ['username', {
    type: /text|email/,
    name: /user|name|mail/,
  }],
  ['password', {
    type: /password/,
    name: /.*/,
  }],
  ['cardno', {
    type: /text|tel/,
    name: /card/,
  }],
  ['expires', {
    type: /text|tel/,
    name: /exp/,
  }],
  ['cvc', {
    type: /text|tel/,
    name: /sec|code|cvv|cvc/,
  }],
]);

/**
 * Matching the form name is considered a definite match and should return the form type,
 * not matching a name means the fields fallback should be checked.
 * If using the fields fallback, the form should only be considered a match if all fields
 * matchers find a match.
 * The formMatchers will be checked in order of appearance and the first match if any will
 * be used, meaning more generic matchers should be placed further down in the list.
 * */
const formMatchers: Map<FormType, FormMatcher> = new Map([
  [FormType.Search, {
    name: /search/,
    fields: [{
      type: /text|search/,
      name: /search/,
    }],
  }],
  [FormType.Register, {
    name: /reg|signup/,
    fields: [{
      type: /password/,
      name: /re/,
    }],
  }],
  [FormType.Login, {
    name: /login/,
    fields: [
      matchers.get('username'),
      matchers.get('password'),
    ],
  }],
  [FormType.NewsLetter, {
    name: /news|letter/,
    fields: [],
  }],
]);

function isMatch(
  field: string,
  element: HTMLInputElement
): boolean {
  if (matchers.get(field) === undefined) return false;
  const types = new RegExp(matchers.get(field).type, 'i');
  const name = new RegExp(matchers.get(field).name, 'i');
  return (
    types.test(element.type) && ( name.test(element.name) || name.test(element.id))
  );
}

function getFormType(form: HTMLFormElement): FormType {
  for(const [formType, formTypeMatchers] of formMatchers) {

    // Check for form name or id match
    const name = new RegExp(formTypeMatchers.name, 'i');
    if (name.test(form.id) || name.test(form.name)) {
      return formType;
    }

    // Check for fields match
    let match = formTypeMatchers.fields.length === 0 ? false : true;
    for(let i = 0; i < formTypeMatchers.fields.length; i++) {
      const fieldName = new RegExp(formTypeMatchers.fields[i].name, 'i');
      const fieldType = new RegExp(formTypeMatchers.fields[i].type, 'i');
      let fieldMatch = false;
      for(let j = 0; j < form.length; j++) {
        const element = form[j];
        if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement) {
          if (fieldType.test(element.type) && (fieldName.test(element.id) || fieldName.test(element.name))) {
            fieldMatch = true;
          }
        }
      }
      // Overall match only if all fields find a matching element.
      match = match && fieldMatch;
    }
    if (match) return formType;
  }
  return FormType.Unknown;
}

const { forms } = document;

for(let i = 0; i < forms.length; i++) {
  console.log(getFormType(forms[i]), forms[i]);
}

interface Message {
  type: string;
  data: {
    [field: string]: string;
  };
}

function onMessage(
  message: Message,
): void {
  if (message.type === 'fill') {
    for (let i = 0; i < forms.length; i++) {
      let filled = false;
      for (let j = 0; j < forms[i].length; j++) {
        const element: HTMLInputElement = forms[i][j] as HTMLInputElement;
        Object.keys(message.data).forEach((field) => {
          if (isMatch(field, element)) {
            filled = true;
            element.value = message.data[field];
          }
        });
      }
      if (filled) {
        forms[i].submit();
      }
    }
  }
}

browser.runtime.onMessage.addListener(onMessage);
