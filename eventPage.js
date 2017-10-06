// Event page -- eventPage.js
chrome.runtime.onConnect.addListener(function(port) {
  // Store the incoming port as a local variable
  var thisPort = port;
  // Routing system to catch multiple port connections
  if (thisPort.name == "content-script"){
      
  } else if (thisPort.name == "devtools-page") {
    thisPort.onMessage.addListener(function(message) {
      Object.keys(message).map((e) => console.log(`key=${e}  value=${message[e]}`));
      if (message.cmdType == "event_page") {
        if (message.text == "openInNewTab") {
          chrome.tabs.create({ url: message.data.url });
        }
      } else {
        chrome.tabs.sendMessage(message.tabId,
          { type: "EVENT_PAGE", text: message.text, cmdType: message.cmdType, data: message.data },
          {},
          function (response) {
            console.log(response);
            // Relay to devtools only when a response exists
            if (response) {
              thisPort.postMessage({ type: "EVENT_PAGE", content: response.data, cmd: response.cmd });
            }
          });
      }
      // If the command is for the content script then we don't wait for a response
      if (message.cmdType == "content_script" || message.cmdType == "event_page")
        thisPort.disconnect();
    });
  }
});