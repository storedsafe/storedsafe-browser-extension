import type { Message } from "../../global/messages";

// Stop presenting popup after this many seconds
const MAX_DURATION_SECONDS = 30;

/**
 * Helper function to find out whether or not a StoredSafe object already
 * exists with the provided values.
 * @param tabResults Results from auto search, related to current tab.
 * @param url Formatted URL of current tab.
 * @param username Username in the form that started this flow.
 * @returns true if matching results are found.
 */
function matchingObjectExists(
  tabResults: StoredSafeObject[],
  url: string,
  username: string
) {
  /**
   * Check if there is an existing StoredSafe object matching the provided result.
   * @param result Result currently being compared.
   * @returns true if both username and URL match the result
   */
  function matchResult(result: StoredSafeObject): boolean {
    let matchUsername = false;
    let matchURL = false;
    for (const field of result.fields) {
      // Check for username matches
      if (field.name === "username" && field.value === username) {
        matchUsername = true;
      }
      // Check for URL matches
      if ((field.name === "url" || field.name === "host") && field.value === url) {
          matchURL = true;
      }
    }
    return matchUsername && matchURL;
  }

  return tabResults.findIndex(matchResult) !== -1;
}

/**
 * Start flow to save form values to a new StoredSafe object.
 * Sends messages to initialize and populate a popup on the current tab.
 * Will only initialize popup if no matching results are found.
 * @param values Form values pre-formatted to match a StoredSafe template.
 * @param tabId ID of the tab where the popup should appear.
 * @param tabResults Results from auto search, related to current tab.
 */
export function saveFlow(
  values: Record<string, string>,
  tabId: number,
  tabResults: StoredSafeObject[]
): () => void {
  // Start a timer to stop prompting to save after some time
  let timeoutId = window.setTimeout(stop, MAX_DURATION_SECONDS * 1e3);
  if (matchingObjectExists(tabResults, values.url, values.username)) return;

  let savePort: browser.runtime.Port;
  let contentPort: browser.runtime.Port;

  /**
   * Handle incoming messages from save frame.
   * @param message Incoming message from other script.
   */
  function onSaveMessage(message: Message) {
    // Wrap up if iframe is being closed.
    if (message.context === "iframe" && message.action === "close") {
      savePort.disconnect()
      stop();
      if (!!contentPort) {
        contentPort.postMessage(message);
      }
    }
  }

  function onSaveDisconnect(port: browser.runtime.Port) {
    if (port === savePort) {
      savePort.onMessage.removeListener(onSaveMessage);
      savePort.onDisconnect.removeListener(onSaveDisconnect);
    }
    savePort = null;
  }

  function onSaveConnect(port: browser.runtime.Port) {
    savePort = port;
    savePort.postMessage({
      context: "save",
      action: "populate",
      data: values,
    });
    savePort.onMessage.addListener(onSaveMessage);
    savePort.onDisconnect.addListener(onSaveDisconnect);
  }

  function onContentConnect(port: browser.runtime.Port) {
    port.postMessage({
      context: "save",
      action: "open",
    });
  }

  function onConnect(port: browser.runtime.Port) {
    if (port.sender?.tab?.id === tabId) {
      if (port.name === "save") {
        onSaveConnect(port);
      } else if (port.name === "content") {
        onContentConnect(port);
      }
    }
  }

  browser.runtime.onConnect.addListener(onConnect);

  function stop() {
    window.clearTimeout(timeoutId);
    browser.runtime.onConnect.removeListener(onConnect);
  }
}
