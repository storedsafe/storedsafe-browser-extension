document.addEventListener('DOMContentLoaded', function () {
  const login = document.getElementById('article-login')
  const register = document.getElementById('article-register')
  const loginButton = login.querySelector('button')
  const registerButton = register.querySelector('button')

  function submitHidden (root) {
    const form = document.createElement('form')
    form.style.display = 'none'
    form.method = 'POST'
    for (const input of root.querySelectorAll('input')) {
      form.appendChild(input)
    }
    document.body.appendChild(form)
    form.addEventListener('submit', submit)
    form.submit()
    form.remove()
  }

  const forms = document.querySelectorAll('form')
  for (let i = 0; i < forms.length; i++) {
    forms[i].addEventListener('submit', submit)
  }

  const submittedValues = document.getElementById('submitted-values')
  function submit(e) {
    e.preventDefault()
    submittedValues.innerHTML = '<ul>' + [...e.target]
      .filter(node => node instanceof HTMLInputElement || node instanceof HTMLTextAreaElement)
      .map(input => `<li>${input.name}: ${input.value}</li>`).join('') + '</ul>'
  }

  loginButton.addEventListener('click', function () {
    submitHidden(login)
  })
  registerButton.addEventListener('click', function () {
    submitHidden(register)
  })
})
