function onInstalled(): void {
  browser.runtime.openOptionsPage();
}

browser.runtime.onInstalled.addListener(onInstalled);
