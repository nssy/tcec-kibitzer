// Add a listener so background knows when a tab has changed.
// You need 'tabs' persmission, that's why we added it to manifest file.
chrome.tabs.onUpdated.addListener(showIntercomAction);

function showIntercomAction(tabId, changeInfo, tab) {
  if (tab.url.indexOf('intercom.io') > -1) {
    // Show icon for page action in the current tab.
    chrome.pageAction.show(tabId);
  }
};