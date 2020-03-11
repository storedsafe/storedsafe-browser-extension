let types = /text|url|password|email/i;
let ids = /user|name|pass|mail|url|server|site/i;

let forms = document.forms;

for(let i = 0; i < forms.length; i++) {
  for(let j = 0; j < forms[i].length; j++) {
    let element = forms[i][j];
    if (types.test(element.type) && (ids.test(element.id) || ids.test(element.name))) {
      console.log(element);
    }
  }
}
