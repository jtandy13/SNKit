// inject script into page
var injection = document.createElement('script');
injection.src = chrome.runtime.getURL('snkit.js');
(document.head||document.documentElement).appendChild(injection);
injection.onload = () => {
  injection.parentNode.removeChild(injection);
};

//Create a custom DOM event for communication with the page
function sendCmd(cmd, cmdData) {
    var cmdEvent = new CustomEvent('snkitRequest', {detail: { cmd: cmd, cmdData: cmdData } });
    window.dispatchEvent(cmdEvent);
}

function relayResponse(sendResponse) {
  var _response = sendResponse;
  window.addEventListener("message", function handler(event) {
    // immediately remove the event
    event.currentTarget.removeEventListener(event.type, handler);
    // We only accept messages from ourselves
    if (event.source != window)
      return;

    if (event.data.type && (event.data.type == "from_page")) {
      _response( { data: event.data.text, cmd: event.data.cmd });
    }
  }, false);
}
function highlightWidget(widgetIdentityObj) {
  if(widgetIdentityObj.id)
    var target = document.getElementById(widgetIdentityObj.id);
  else
    var target = document.querySelector("." + widgetIdentityObj.class);
  if(target)
    Object.assign(target.style, {animation: "pulse 500ms", boxShadow: "0px 0px 25px #881391"});
}

function removeWidgetHighlight(widgetIdentityObj) {
  if(widgetIdentityObj.id)
    var target = document.getElementById(widgetIdentityObj.id);
  else
    var target = document.querySelector("." + widgetIdentityObj.class);
  if(target)
    Object.assign(target.style, {animation: "", boxShadow: "" });
}

// Make a decision about where the command will be executed;
// either on the page or in the content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type == "EVENT_PAGE" && message.cmdType == "page") {
      sendCmd(message.text, message.data);
      relayResponse(sendResponse);
      // According to chrome API documentation this allows for the
      // message channel to stay open for the async callback sendResponse
      return true;
    } else if (message.type == "EVENT_PAGE" && message.cmdType == "content_script") {
      // create a local variable to persist the data object from the original message
      var data = message.data;
      if(message.text == "highlightWidget"){
        highlightWidget(data);
      } else if(message.text == "removeWidgetHighlight"){
        removeWidgetHighlight(data);
      }
    }
  }
)