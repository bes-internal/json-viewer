const data: Record<string, any> = {}
const filter: chrome.webRequest.RequestFilter = {
  urls: ['<all_urls>'],
  types: ['main_frame'],
}

chrome.webRequest.onSendHeaders.addListener(
  (details) => {
    console.log('onSendHeaders', details, data)
    data[details.tabId] = {
      request: details.requestHeaders,
    }
  },
  filter,
  ['requestHeaders']
)

chrome.webRequest.onHeadersReceived.addListener(
  (details) => {
    console.log('onHeadersReceived', details, data)
    data[details.tabId].response = details.responseHeaders
    // TODO: Merge same key like `Vary`
  },
  filter,
  ['responseHeaders']
)

chrome.webRequest.onErrorOccurred.addListener((details) => {
  console.log('onErrorOccurred', details, data)
  delete data[details.tabId]
}, filter)

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const tabId = sender.tab?.id
  if (!tabId) return

  console.log('onMessage', message, tabId, data)
  switch (message.type) {
    case 'render':
      chrome.tabs.executeScript(tabId, {
        file: 'dist/render.js',
      })
      break
    case 'headers':
      sendResponse(data[tabId])
      delete data[tabId]
      break
    case 'delete':
      delete data[tabId]
      break
  }
})
