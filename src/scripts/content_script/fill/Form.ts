/**
 * Represents a form or form-like element with the information necessary
 * to choose the most suitable way to interact with the form.
 */
class Form {
  form: HTMLElement
  type: FormType = FormType.Unknown
  inputs: FormInput[]

  constructor(form: HTMLFormElement) {
    this.form = form
    this.identifyForm()
  }

  private identifyForm() {
    this.parseInputs()
  }

  private parseInputs() {
  }
}

class FormInput {

}