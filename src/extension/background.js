console.log("Hello background");

browser.runtime.onInstalled.addListener(function() {
  browser.tabs.create({ url: '/index.html#welcome' });
});
