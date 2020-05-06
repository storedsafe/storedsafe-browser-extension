const types = /text|url|password|email/i;
const ids = /user|name|pass|mail|url|server|site/i;

const { forms } = document;

for (let i = 0; i < forms.length; i++) {
  let track = false;
  for (let j = 0; j < forms[i].length; j++) {
    const element: HTMLInputElement = forms[i][j] as HTMLInputElement;
    if (types.test(element.type)
      && (ids.test(element.id) || ids.test(element.name))) {
      track = true;
      element.value = 'STOREDSAFE';
    }
  }
}

