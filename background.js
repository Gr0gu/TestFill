/**
 * DevFill Background Service Worker (Manifest V3)
 */

chrome.runtime.onInstalled.addListener(() => {
  // Register Context Menu actions
  try {
    chrome.contextMenus.create({
      id: "devfill-fill-form",
      title: "Fill Form with Test Data (DevFill)",
      contexts: ["editable", "page", "selection"]
    });

    chrome.contextMenus.create({
      id: "devfill-fill-focused",
      title: "Fill Focused Input Only",
      contexts: ["editable"]
    });
  } catch (e) {
    console.error("[DevFill] Context menu creation error:", e);
  }
});

// Handle Context Menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!tab?.id) return;

  if (info.menuItemId === "devfill-fill-form") {
    chrome.tabs.sendMessage(tab.id, { type: "DEVFILL_FILL_FORM", target: "active_form" });
  } else if (info.menuItemId === "devfill-fill-focused") {
    chrome.tabs.sendMessage(tab.id, { type: "DEVFILL_FILL_FORM", target: "focused_element" });
  }
});

// Handle keyboard command shortcuts
chrome.commands.onCommand.addListener((command, tab) => {
  if (command === "fill-form" && tab?.id) {
    chrome.tabs.sendMessage(tab.id, { type: "DEVFILL_FILL_FORM", target: "active_form" });
  }
});
