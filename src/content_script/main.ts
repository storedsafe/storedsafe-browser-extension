import { Logger } from "../global/logger";

Logger.Init().then(async () => {
  const logger = new Logger("content_script");
  logger.log("Content Script Loaded");

  try {
    browser.runtime.sendMessage({
      msg: "Content script loaded",
    });
  } catch (e) {
    logger.warn("No listeners for sendMessage");
  }
});
