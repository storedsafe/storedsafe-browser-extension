import { Logger, LogLevel } from "../global/logger";
import { scanner, Form, InputType } from "./tasks/scanner";

const logger = new Logger('content')

logger.debug('CONTENT SCRIPT INITIALIZED')

function printForms (forms: Form[]) {
  for (const [form, formType, inputs] of forms) {
    logger.group(formType, LogLevel.DEBUG)
    logger.debug('%o', form)
    for (const [input, inputType] of inputs) {
      if (inputType === InputType.HIDDEN) {
      }
      logger.debug('%s %o', inputType, input)
    }
    logger.groupEnd(LogLevel.DEBUG)
  }
}

scanner(printForms)