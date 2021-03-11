import '@testing-library/jest-dom'
import { render, fireEvent } from '@testing-library/svelte'
import { InputType, FormType } from '../../content_script/tasks/scanner/constants'
import { getInputs, Input } from '../../content_script/tasks/scanner/inputs'
import { getForms } from '../../content_script/tasks/scanner/forms'

import LoginBasic from './forms/LoginBasic.svelte';
import LoginLabels from './forms/LoginLabels.svelte';
import LoginDiv from './forms/LoginDiv.svelte';
import LoginPhone from './forms/LoginPhone.svelte';
import LoginTiered from './forms/LoginTiered.svelte';

/**
 * Basic login form with inputs.
 */
test('LoginBasic = Login', () => {
  const { getByTestId, container } = render(LoginBasic);

  const inputs = new Map(getInputs(container))

  expect(inputs.size).toBe(3)
  expect(inputs.get(getByTestId('username'))).toBe(InputType.USERNAME)
  expect(inputs.get(getByTestId('password'))).toBe(InputType.PASSWORD)
  expect(inputs.get(getByTestId('submit'))).toBe(InputType.SUBMIT)

  const forms = getForms([...inputs])
  expect(forms.length).toBe(1)
  expect(forms[0][0]).toBe(getByTestId('form'))
  expect(forms[0][1]).toBe(FormType.LOGIN)
  expect(forms[0][2]).toEqual([...inputs])
})

/**
 * Login form with labels around inputs.
 */
test('LoginLabels = Login', () => {
  const { getByTestId, container } = render(LoginLabels);

  const inputs = new Map(getInputs(container))

  expect(inputs.size).toBe(3)
  expect(inputs.get(getByTestId('username'))).toBe(InputType.USERNAME)
  expect(inputs.get(getByTestId('password'))).toBe(InputType.PASSWORD)
  expect(inputs.get(getByTestId('submit'))).toBe(InputType.SUBMIT)

  const forms = getForms([...inputs])
  expect(forms.length).toBe(1)
  expect(forms[0][0]).toBe(getByTestId('form'))
  expect(forms[0][1]).toBe(FormType.LOGIN)
  expect(forms[0][2]).toEqual([...inputs])
})

/**
 * Login form with labels around inputs.
 */
test('LoginDiv = Login', () => {
  const { getByTestId, container } = render(LoginDiv);

  const inputs = new Map(getInputs(container))

  expect(inputs.size).toBe(3)
  expect(inputs.get(getByTestId('username'))).toBe(InputType.USERNAME)
  expect(inputs.get(getByTestId('password'))).toBe(InputType.PASSWORD)
  expect(inputs.get(getByTestId('submit'))).toBe(InputType.SUBMIT)

  const forms = getForms([...inputs])
  expect(forms.length).toBe(1)
  expect(forms[0][0]).toBe(getByTestId('div'))
  expect(forms[0][1]).toBe(FormType.LOGIN)
  expect(forms[0][2]).toEqual([...inputs])
})

/**
 * Phone for username = Unknown
 */
test('LoginPhone = Unknown', () => {
  const { getByTestId, container } = render(LoginPhone);

  const inputs = new Map(getInputs(container))

  expect(inputs.size).toBe(3)
  expect(inputs.get(getByTestId('phone'))).toBe(InputType.UNKNOWN)
  expect(inputs.get(getByTestId('password'))).toBe(InputType.PASSWORD)
  expect(inputs.get(getByTestId('submit'))).toBe(InputType.SUBMIT)

  const forms = getForms([...inputs])
  expect(forms.length).toBe(1)
  expect(forms[0][0]).toBe(getByTestId('form'))
  expect(forms[0][1]).toBe(FormType.UNKNOWN)
  expect(forms[0][2]).toEqual([...inputs])
})

/**
 * Login form with labels around inputs.
 */
test('LoginLabels = Login', () => {
  const { getByTestId, container } = render(LoginTiered);

  const inputs = new Map(getInputs(container))

  expect(inputs.size).toBe(3)
  expect(inputs.get(getByTestId('username'))).toBe(InputType.USERNAME)
  expect(inputs.get(getByTestId('password'))).toBe(InputType.PASSWORD)
  expect(inputs.get(getByTestId('submit'))).toBe(InputType.SUBMIT)

  const forms = getForms([...inputs])
  expect(forms.length).toBe(1)
  expect(forms[0][0]).toBe(getByTestId('form'))
  expect(forms[0][1]).toBe(FormType.LOGIN)
  expect(forms[0][2]).toEqual([...inputs])
})
