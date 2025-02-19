import { Logger } from "../global/logger";
import { settings } from "../global/storage";

async function getLogger() {
  await Logger.Init()
  return new Logger("background")
}

getLogger().then(logger => {
  logger.log("Background script loaded.")
})

browser.tabs.onActivated.addListener(async (activeInfo) => {
  const logger = await getLogger();
  logger.log("Changed tab to %o", activeInfo.tabId);
});

browser.runtime.onMessage.addListener(async (message, sender, respond) => {
  const logger = await getLogger();
  logger.log("Incoming message: %o", message?.msg);
});

browser.runtime.onConnect.addListener(async (port) => {
  const logger = await getLogger();
  logger.log("Connected to %o", port.name)
})

function onSettingsChanged(newSettings: Map<string, Setting>) {
  console.log(newSettings);
}

// browser.storage.onChanged.addListener(settings.onChanged(onSettingsChanged));
