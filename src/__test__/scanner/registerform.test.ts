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

import RegisterBasic from "./forms/RegisterBasic.svelte";

/**
 * Basic register form with inputs.
 */
test("RegisterBasic = Register", () => {
  const { getByTestId, container } = render(RegisterBasic);

  const inputs = new Map(getInputs(container));

  expect(inputs.size).toBe(4);
  expect(inputs.get(getByTestId("username").element() as HTMLElement)).toBe(
    InputType.USERNAME
  );
  expect(inputs.get(getByTestId("password").element() as HTMLElement)).toBe(
    InputType.PASSWORD
  );
  expect(
    inputs.get(getByTestId("password-retype").element() as HTMLElement)
  ).toBe(InputType.PASSWORD_RETYPE);
  expect(inputs.get(getByTestId("submit").element() as HTMLElement)).toBe(
    InputType.SUBMIT
  );

  const forms = getForms([...inputs]);
  expect(forms.length).toBe(1);
  expect(forms[0][0]).toBe(getByTestId("form").element());
  expect(forms[0][1]).toBe(FormType.REGISTER);
  expect(forms[0][2]).toEqual([...inputs]);
});
