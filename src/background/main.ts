import * as browser from "webextension-polyfill";

console.log("[StoredSafe] Background Script Loaded");

browser.tabs.onActivated.addListener((activeInfo) => {
  console.log("Changed tab to %o", activeInfo.tabId);
});
