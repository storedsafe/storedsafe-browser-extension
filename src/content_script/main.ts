console.log("[StoredSafe] Content Script Loaded")

try {
  browser.runtime.sendMessage({
    msg: "[StoredSafe] Content script loaded"
  })
} catch (e) {
  console.warn("[StoredSafe] No listeners for sendMessage")
}