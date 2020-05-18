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
  cardno: {
    types: /text|tel/,
    name: /card/,
  },
  expires: {
    types: /text|tel/,
    name: /exp/,
  },
  cvc: {
    types: /text|tel/,
    name: /sec|code|cvv|cvc/,
  },
};

function isMatch(
  field: string,
  element: HTMLInputElement
): boolean {
  if (matchers[field] === undefined) return false;
  const types = new RegExp(matchers[field].types, 'i');
  const name = new RegExp(matchers[field].name, 'i');
  return (
    types.test(element.type) && ( name.test(element.name) || name.test(element.id))
  );
}

const { forms } = document;

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