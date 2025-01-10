/**
 * @jest-environment jsdom
 */
import { test, expect, vi } from "vitest";
import { render } from "vitest-browser-svelte";
import {
  InputType,
  FormType,
} from "../../content_script/tasks/scanner/constants";
import { getInputs } from "../../content_script/tasks/scanner/inputs";
import { getForms } from "../../content_script/tasks/scanner/forms";

import StorytelLogin from "./forms/sites/StorytelLogin.svelte";
import AppleLogin from "./forms/sites/AppleLogin.svelte";

const USERNAME_ID = "test-001";
const PASSWORD_ID = "test-002";
const SUBMIT_ID = "test-003";
const FORM_ID = "test-004";

/**
 * Storytel login form (TODO)
 */
test("storytel", () => {
  const { getByTestId, container } = render(StorytelLogin);

  const inputs = new Map(getInputs(container));

  expect(inputs.size).toBe(6);
  expect(inputs.get(getByTestId(USERNAME_ID).element() as HTMLElement)).toBe(
    InputType.USERNAME
  );
  expect(inputs.get(getByTestId(PASSWORD_ID).element() as HTMLElement)).toBe(
    InputType.PASSWORD
  );
  expect(inputs.get(getByTestId(SUBMIT_ID).element() as HTMLElement)).toBe(
    InputType.SUBMIT
  );

  const forms = getForms([...inputs]);
  expect(forms.length).toBe(1);
  expect(forms[0][0]).toBe(getByTestId(FORM_ID).element());
  expect(forms[0][1]).toBe(FormType.LOGIN);
  expect(forms[0][2].sort()).toEqual(
    [...inputs].filter((input) => input[1] !== InputType.MAYBE_SUBMIT).sort()
  );
});

/**
 * Apple login form
 */
test("apple", () => {
  const { getByTestId, container } = render(AppleLogin);

  const inputs = new Map(getInputs(container));

  expect(inputs.size).toBe(3);
  expect(inputs.get(getByTestId(USERNAME_ID).element() as HTMLElement)).toBe(
    InputType.USERNAME
  );
  expect(inputs.get(getByTestId(PASSWORD_ID).element() as HTMLElement)).toBe(
    InputType.PASSWORD
  );
  expect(inputs.get(getByTestId(SUBMIT_ID).element() as HTMLElement)).toBe(
    InputType.SUBMIT
  );

  const forms = getForms([...inputs]);
  expect(forms.length).toBe(1);
  expect(forms[0][0]).toBe(getByTestId(FORM_ID).element());
  expect(forms[0][1]).toBe(FormType.LOGIN);
  expect(forms[0][2]).toEqual([...inputs]);
});
