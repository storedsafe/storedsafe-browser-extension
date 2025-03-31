import { Logger } from "../global/logger";
import { scanner } from "./tasks/scanner";

Logger.Init().then(async () => {
  const logger = new Logger("content_script");
  logger.log("Content Script Loaded");

  // Alert the background script the content script is loaded
  try {
    browser.runtime.sendMessage({
      msg: "Content script loaded",
    });
  } catch (e) {
    logger.warn("No listeners for sendMessage");
  }

  const stop = scanner((forms) => {
    logger.log("Forms: %o", forms)
  })
});
