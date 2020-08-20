import { FormValues } from './PageScanner'
export type FormFilter = (form: HTMLFormElement | HTMLElement, formValues: FormValues) => boolean

export const formFilters: Record<string, FormFilter> = {
  hasSubmit: (form, { submitElements }) => submitElements.length > 0,
  notHidden: (form, { inputElements }) =>
    !inputElements.reduce(
      (isHidden, inputElement) => isHidden && inputElement.type === 'hidden',
      true
    ),
  singleSubmit: (form, { submitElements }) => submitElements.length === 1
}
