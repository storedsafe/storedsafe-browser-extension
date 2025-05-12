document.addEventListener("DOMContentLoaded", function () {
  const login = document.getElementById("article-login");
  const register = document.getElementById("article-register");
  const loginButton = login.querySelector("button");
  const registerButton = register.querySelector("button");

  function submitHidden(root) {
    const form = document.createElement("form");
    form.style.display = "none";
    form.method = "POST";
    for (const input of root.querySelectorAll("input")) {
      form.appendChild(input);
    }
    document.body.appendChild(form);
    form.addEventListener("submit", submit);
    form.submit();
    form.remove();
  }

  const forms = document.querySelectorAll("form");
  for (let i = 0; i < forms.length; i++) {
    forms[i].addEventListener("submit", submit);
  }

  const submittedValues = document.getElementById("submitted-values");
  function submit(e) {
    e.preventDefault();
    submittedValues.innerHTML =
      "<ul>" +
      [...e.target]
        .filter(
          (node) =>
            node instanceof HTMLInputElement ||
            node instanceof HTMLTextAreaElement
        )
        .map((input) => `<li>${input.name}: ${input.value}</li>`)
        .join("") +
      "</ul>";
  }

  loginButton.addEventListener("click", function () {
    submitHidden(login);
  });
  registerButton.addEventListener("click", function () {
    submitHidden(register);
  });

  // Create dynamic form
  function createDynamicForm(root) {
    const form = document.createElement("form");
    form.classList.add("form");

    const header = document.createElement("h2");
    header.innerHTML = "Dynamic Login";
    form.appendChild(header);

    const username = document.createElement("input");
    username.name = "username";
    username.placeholder = "username";

    const password = document.createElement("input");
    password.name = "password";
    password.type = "password";
    password.placeholder = "password";

    const submit = document.createElement("button");
    submit.innerHTML = "Submit";

    setTimeout(() => root.appendChild(form), 100);
    setTimeout(() => form.appendChild(username), 200);
    setTimeout(() => form.appendChild(password), 300);
    setTimeout(() => form.appendChild(submit), 400);

    return form;
  }

  function dismantleDynamicForm(root) {
    const form = root.querySelector("form");
    const username = form.querySelector("input[name=username]");
    const password = form.querySelector("input[name=password]");
    const submit = form.querySelector("button");

    setTimeout(() => username.remove(), 100);
    setTimeout(() => password.remove(), 200);
    setTimeout(() => submit.remove(), 300);
    setTimeout(() => form.remove(), 400);
  }

  const dynamicFormRoot = document.getElementById("dynamic");
  const toggleDynamic = document.getElementById("toggleDynamic");
  let dynamicForm;
  toggleDynamic.addEventListener("click", () => {
    if (dynamicForm) {
      dismantleDynamicForm(dynamicFormRoot);
      dynamicForm = undefined;
    } else {
      dynamicForm = createDynamicForm(dynamicFormRoot);
    }
  });
});
