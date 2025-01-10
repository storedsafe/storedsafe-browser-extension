console.log("[StoredSafe] Background Script Loaded");

browser.tabs.onActivated.addListener((activeInfo) => {
  console.log("Changed tab to %o", activeInfo.tabId);
});

browser.runtime.onMessage.addListener((message, sender, respond) => {
  console.log(message?.msg)
})