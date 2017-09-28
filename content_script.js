// inject script into page
var injection = document.createElement('script');
injection.src = chrome.extension.getURL('snkit.js');
(document.head||document.documentElement).appendChild(injection);
injection.onload = () => {
  injection.parentNode.removeChild(injection);
};

//Create a custom DOM event for communication with the page
function sendCmd(cmd, cmdData) {
    console.log("dispatching message for: "+cmd);
    var cmdEvent = new CustomEvent('myCmdEvent', {detail: { cmd: cmd, cmdData: cmdData } });
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
      console.log("about to respond with: "+ event.data.cmd);
      _response( { data: event.data.text, cmd: event.data.cmd });
    }
  }, false);
}

function highlightWidget(widgetIdentityObj) {
  if(widgetIdentityObj.identifier == "id") 
    var target = document.getElementById(widgetIdentityObj.idNum);
  else
    var target = document.querySelector("." + widgetIdentityObj.idNum);
  Object.assign(target.style, {animation: "pulse 500ms", boxShadow: "0px 0px 25px #881391"});
}

function removeWidgetHighlight(widgetIdentityObj) {
  if(widgetIdentityObj.identifier == "id") 
    var target = document.getElementById(widgetIdentityObj.idNum);
  else
    var target = document.querySelector("." + widgetIdentityObj.idNum);
  Object.assign(target.style, {animation: "", boxShadow: "" });
}

// Make a decision about where the command will be executed;
// either on the page or in the content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("incoming message: ");
    console.log(message);
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
      /*var data = message.data;
      if(message.text == "toggleBorder"){
        toggleBorder(data.classNames);
      }
      if(message.text == "toggleContainerBorder"){
        toggleContainerBorder();
      }
      if(message.text == "toggleRowBorder"){
        toggleRowBorder();
      }
      if(message.text == "toggleColumnBorder"){
        toggleColumnBorder();
      }
      if(message.text == "getScriptInfo"){
        getScriptInfo(sendResponse);
        return true;
      }
      if(message.text == "impersonateUser"){
        impersonateUser(data.userName).then(pageReload());
      }
      if(message.text == "enableAll"){
        enableAll(data.userName);
      }*/
    }
  }
)