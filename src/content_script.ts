// const types = /text|url|password|email/i;
// const ids = /user|name|pass|mail|url|server|site/i;

const matchers: {
  [field: string]: {
    types: RegExp;
    name: RegExp;
  };
} = {
  username: {
    types: /text|email/,
    name: /user|name|mail/,
  },
  password: {
    types: /password/,
    name: /.*/,
  },
};

function isMatch(
  field: string,
  element: HTMLInputElement
): boolean {
  if (matchers[field] === undefined) return false;
  return (
    matchers[field].types.test(element.type)
    && (
      matchers[field].name.test(element.name)
      || matchers[field].name.test(element.id)
    )
  );
}

const { forms } = document;

function onMessage(
  message: {
    type: string;
    data: {
      [field: string]: string;
    };
  }
): void {
  if (message.type === 'fill') {
    for (let i = 0; i < forms.length; i++) {
      for (let j = 0; j < forms[i].length; j++) {
        const element: HTMLInputElement = forms[i][j] as HTMLInputElement;
        Object.keys(message.data).forEach((field) => {
          if (isMatch(field, element)) {
            element.value = message.data[field];
          }
        });
      }
    }
  }
}

browser.runtime.onMessage.addListener(onMessage);
