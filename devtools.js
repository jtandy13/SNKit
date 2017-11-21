var widgetUtil = (() => {
  return {
    getWidgetProperties: () => {
      var widgetScopes = []; 
      var spWidgets = document.querySelectorAll("[widget='widget']");

      // create Widget class
      class Widget {
        constructor(name, scope) {
          this.name = name;
          this.scope = scope;
        }
      }
      for(var i = 0; i < spWidgets.length; i++){
        var thisScope = angular.element(spWidgets[i]).scope();
        var scopeCopy = {};
        for(var property in thisScope) {
          if(property.charAt(0) !== "$" || property === "$root") {
              scopeCopy[property] = thisScope[property];
          }
        }
        var thisWidget = new Widget(scopeCopy.widget.name, scopeCopy);
        widgetScopes.push(thisWidget);
      };
      widgetScopes.sort((a, b) => {
        const nameA = a.name.toUpperCase();
        const nameB = b.name.toUpperCase();
        let comparison = 0;
        if(nameA > nameB){
          comparison = 1;
        } else if(nameA < nameB){
          comparison = -1;
        }
        return comparison;
      });
      return widgetScopes;
    },
    getWidgetDetails: () => {
      // Create a port for communication with the event page
      var port = chrome.runtime.connect({ name: "devtools-page" });
      return new Promise((resolve, reject) => {
        port.postMessage({ tabId: snkitUtil.getTabId(), text: "getWidgetDetails", cmdType: "page", data: {} });
        port.onMessage.addListener((data) => {
          if(data.type == "EVENT_PAGE" && data.cmd == "getWidgetDetails"){
            port.disconnect();
            if(data.content) resolve(data.content);
            else reject();
          }
        });
      });
    },
    inspectWidget: (widgetIdentityObj) => {
      var inspectScript
      if(widgetIdentityObj.identifier === "class")
        inspectScript = `inspect(document.querySelector(".${widgetIdentityObj.widgetClassName}"))`;
      else
        inspectScript = `inspect(document.getElementById("${widgetIdentityObj.widgetId}"))`;
      chrome.devtools.inspectedWindow.eval(inspectScript, {}, function (result, exceptionInfo) {
      });
    },
    highlightWidget: (widgetIdentityObj) => {
      // Create a port for communication with the event page
      var port = chrome.runtime.connect({ name: "devtools-page" });
      port.postMessage({ tabId: snkitUtil.getTabId(), text: "highlightWidget", cmdType: "content_script", 
        //new
        data: {class: widgetIdentityObj.class, id: widgetIdentityObj.id} });
        //data: {idNum: widgetIdentityObj.idNum, identifier: widgetIdentityObj.identifier} });
      port.onMessage.addListener((data) => {
        if(data.type == "EVENT_PAGE" && data.cmd == "highlightWidget"){
          port.disconnect();
        }
      });
    },
    removeWidgetHighlight: (widgetIdentityObj) => {
      // Create a port for communication with the event page
      var port = chrome.runtime.connect({ name: "devtools-page" });
      port.postMessage({ tabId: snkitUtil.getTabId(), text: "removeWidgetHighlight", cmdType: "content_script", 
        data: {class: widgetIdentityObj.class, id: widgetIdentityObj.id} });
      port.onMessage.addListener((data) => {
        if(data.type == "EVENT_PAGE" && data.cmd == "removeWidgetHighlight"){
          port.disconnect();
        }
      });
    },
    debugController: (widgetIdentityObj) => {
      // construct the script name and open the resource
      var scriptName = "";
      if (widgetIdentityObj.techname) {
        scriptName = widgetIdentityObj.techname + ".js";
      } else {
        scriptName = widgetIdentityObj.idNum + ".js";
      }
      chrome.devtools.panels.openResource(scriptName); 
    },
    getServerTimings: () => {
      // Create a port for communication with the event page
      var port = chrome.runtime.connect({ name: "devtools-page" });
      return new Promise((resolve, reject) => {
        port.postMessage({ tabId: snkitUtil.getTabId(), text: "getServerTimings", cmdType: "page", data: {} });
        port.onMessage.addListener((data) => {
          if(data.type == "EVENT_PAGE" && data.cmd == "getServerTimings"){
            port.disconnect();
            if(data.content) resolve(data.content);
            else reject();
          }
        });
      });
    }
  }
})();

var sidebarUtil = (() => {
  var _widgetSidebar;
  return {
    /**
     * The widget scopes cannot be sourced from querying the page becuase
     * of issues with deep cloning an object that contains functions and circular
     * structures. See Stack Overflow questions below:
     * https://stackoverflow.com/questions/11616630/json-stringify-avoid-typeerror-converting-circular-structure-to-json
     * https://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-deep-clone-an-object-in-javascript?rq=1
     */
    renderWidgetSidebarPanel: () => {
      return new Promise((resolve, reject) => {
        snkitUtil.isServicePortalPage().then((answer) => {
          if (answer) {
            // Create the new sidepanel for the elements pane
            chrome.devtools.panels.elements.createSidebarPane(
              "Service Portal Widget Scopes",
              (sidebar) => {
                //create a reference to the new sidebar to be used later
                _widgetSidebar = sidebar;
                sidebar.setExpression("(" + widgetUtil.getWidgetProperties.toString() + ")()", "Service Portal Widgets");
                sidebar.onShown.addListener(() => {
                  sidebar.setExpression("(" + widgetUtil.getWidgetProperties.toString() + ")()", "Service Portal Widgets");
                });
              });
          }
          resolve();
        })
      })
    },
    emptyWidgetSidebarPanel: () => {
      // If there's no current handle, then there's no sidebar to begin with
      if(_widgetSidebar){
        _widgetSidebar.setObject({}, "Service Portal Widgets");
      } 
    }
  }
})();

var snkitUtil = (() => {
  return {
    openInNewTab: (url) => {
      // Create a port for communication with the event page
      var port = chrome.runtime.connect({ name: "devtools-page" });
      port.postMessage({ tabId: "", text: "openInNewTab", cmdType: "event_page", data: { url: url } });
    },
    isServicePortalPage: () => {
      // Create a port for communication with the event page
      var port = chrome.runtime.connect({ name: "devtools-page" });
      return new Promise((resolve, reject) => {
        port.postMessage({ tabId: snkitUtil.getTabId(), text: "isServicePortalPage", cmdType: "page", data: {} });
        port.onMessage.addListener((data) => {
          if (data.type == "EVENT_PAGE" && data.cmd == "isServicePortalPage") {
            port.disconnect();
            resolve(data.content);
          }
        });
      });
    },
    getTabId: () => {
      var tabId;
      //this loop is to avail tabId being returned as null
      while (!tabId) {
        tabId = chrome.devtools.inspectedWindow.tabId;
      }
      return tabId;
    },
    getHostName: () => {
      // Create a port for communication with the event page
      var port = chrome.runtime.connect({ name: "devtools-page" });
      return new Promise((resolve, reject) => {
        port.postMessage({ tabId: snkitUtil.getTabId(), text: "getHostName", cmdType: "page", data: {} });
        port.onMessage.addListener((data) => {
          if (data.type == "EVENT_PAGE" && data.cmd == "getHostName") {
            port.disconnect();
            resolve(data.content);
          }
        });
      });
    }
  }
})();

chrome.devtools.panels.create("SNKit", "", "snkit.html",
  (spPanel) => {
    // The JavaScript window object of the panel's page can be
    // sourced using the onShown.addListener event
    var show = new Promise((resolve, reject) => {
      spPanel.onShown.addListener((spPanelWindow) => {
        resolve(spPanelWindow);
      });
    });

    show.then((_spPanelWindow) => {

      function applyWidgetListeners() {
        var widgetBoxArray = _spPanelWindow.document.querySelectorAll(".widgetBox");
        widgetBoxArray.forEach((widgetBox) => {
          widgetBox.addEventListener("click", (event) => {
            var el = event.target;
            while (el && el.parentNode) {
              if (el.classList.contains("widgetBox")) {
                //check if inspect mode is enabled to choose the right function
                if (_spPanelWindow.document.getElementById("inspectMode").checked) {
                  widgetUtil.inspectWidget({identifier: el.id ? "id" : "class", widgetClassName: el.classList.item(1), widgetId: el.id});
                } else {
                  widgetUtil.debugController({ idNum: el.classList.item(1), techname: el.dataset.techname });
                }
                break;
              }
              el = el.parentNode;
            }
          })
          widgetBox.addEventListener("mouseover", (event) => {
            var el = event.target;
            while (el && el.parentNode) {
              if (el.classList.contains("widgetBox")) {
                //new
                widgetUtil.highlightWidget({ class: el.classList.item(1), id: el.id ? el.id : null });
                //widgetUtil.highlightWidget({ idNum: el.classList.item(1), identifier: el.dataset.identifier });
                break;
              }
              el = el.parentNode;
            }
          })
          widgetBox.addEventListener("mouseout", (event) => {
            var el = event.target;
            while (el && el.parentNode) {
              if (el.classList.contains("widgetBox")) {
                widgetUtil.removeWidgetHighlight({ class: el.classList.item(1), id: el.id ? el.id : null });
                break;
              }
              el = el.parentNode;
            }
          })
        })
      }

      function renderServicePortalTab(widgets) {
        if (widgets.length > 0) {
          var widgetHTML = "";
          var targetEl = _spPanelWindow.document.getElementById("widgetsList");

          widgets.forEach((obj, i) => {
            if (i == 0) {
              widgetHTML += `
                  <div class="row">
                    <div class="col-md-6 widgetList">
                      <div class="widgetBox ${obj.className}" id="${obj.id}"
                          data-identifier="${obj.identifier}" data-techname="${obj.technicalName}">
                        <em>${obj.name}</em>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <label class="form-check-label">
                        <input type="checkbox" class="form-check-input" id="inspectMode">
                        Inspect mode
                      </label>
                    </div>
                  </div>`
            } else {
              widgetHTML += `
                <div class="row">
                  <div class="col-md-6 widgetList">
                    <div class="widgetBox ${obj.className}" id="${obj.id}"
                        data-identifier="${obj.identifier}" data-techname="${obj.technicalName}">
                      <em>${obj.name}</em>
                    </div>
                  </div>
                  <div class="col-md-6"></div>
                </div>`
            }
          });
          targetEl.innerHTML = widgetHTML;
          applyWidgetListeners();
          var servicePortalContent = _spPanelWindow.document.getElementById("servicePortalContent")
          servicePortalContent.style.display = "block";
        }
      }

      function renderComponentLinks(widgets){
        var _widgets = widgets;
        var componentsLinkHTML = "";
        var targetEl = _spPanelWindow.document.getElementById("conponentLinksList");
        snkitUtil.getHostName().then((hostname) => {
          componentsLinkHTML += `
            <div class="col-md-12 componentList">
              <em><a class="componentLink" data-urlTarget="https://${hostname}/sp_portal.do?sys_id=${_widgets[0].portalId}">Portal</a></em>
            </div>
            <div class="col-md-12 componentList">
              <em><a class="componentLink" data-urlTarget="https://${hostname}/sp_page.do?sys_id=${_widgets[0].pageId}">Page</a></em>
            </div>
            <div class="col-md-12 componentList">
              <em><a class="componentLink" data-urlTarget="https://${hostname}/sp_theme.do?sys_id=${_widgets[0].themeId}">Theme</a></em>
            </div>
            `;
          if(widgets[0].headerId){
            componentsLinkHTML += `
              <div class="col-md-12 componentList">
                <em><a class="componentLink" data-urlTarget="https://${hostname}/sp_header_footer.do?sys_id=${_widgets[0].headerId}">Header</a></em>
              </div>
            `;
          }
          if(widgets[0].footerId){
            componentsLinkHTML += `
              <div class="col-md-12 componentList">
                <em><a class="componentLink" data-urlTarget="https://${hostname}/sp_header_footer.do?sys_id=${_widgets[0].footerId}">Footer</a></em>
              </div>
            `;
          }
          targetEl.innerHTML = componentsLinkHTML;
          applyComponentLinkListeners();
        });
      }

      function applyComponentLinkListeners() {
        var componentLinkArray = _spPanelWindow.document.querySelectorAll(".componentLink");
        componentLinkArray.forEach((cLink) => {
          cLink.addEventListener("click", (event) => {
            snkitUtil.openInNewTab(event.target.dataset.urltarget);
          });
        });
      }

      /**
       * Bootstrap tab changes are difficult to react to without JQuery,
       * so the MutationObserver class will be used instead of addEventListener.
       */
      var spTabObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          //Once the Service Portal tab becomes active, take action
          if (mutation.target.className == "tab-pane active"){
            widgetUtil.getWidgetDetails().then((widgets) => {
              renderServicePortalTab(widgets);
              renderComponentLinks(widgets);
            });
          }
        });
      });

      var observerConfig = {
        attributes: true,
        childList: false,
        characterData: false,
        attributeOldValue: true
      };

      var spTabTargetNode = _spPanelWindow.document.getElementById("servicePortalTab");
      spTabObserver.observe(spTabTargetNode, observerConfig);

      // add event listeners to the service portal checkbox
      var servicePortalModeCheckbox = _spPanelWindow.document.getElementById("servicePortalMode");
      servicePortalModeCheckbox.addEventListener("change", (e) => {
        if (e.target.checked) {
          // Create the new data for Service Portal mode
          sidebarUtil.renderWidgetSidebarPanel();
          var spTabTargetNodes = _spPanelWindow.document.querySelector("#spTabListItem");
          spTabTargetNodes.style.display = "block";
        }
      }, false);

      /**
       * The basic premise of the performance timing is to call Date.now();, call the promise, 
       * in the then function call Date.now() again and log the difference.
       */

      // add event listener to the performance chart button
      var performanceChartBtn = _spPanelWindow.document.getElementById("performanceChartBtn");
      var perCh;
      performanceChartBtn.addEventListener("click", () => {
        var ctx = _spPanelWindow.document.getElementById("performanceChart").getContext("2d");
        var perCharTabListItem = _spPanelWindow.document.querySelector("#perCharTabListItem");
        perCharTabListItem.style.display = "none";
        widgetUtil.getServerTimings().then((results) => {
          if(perCh) {
            perCh.destroy();
            perCharTabListItem.style.display = "none";
            console.log("perCh exists and was destroyed");
          }
          var serverTimes = [];
          var widgetNames = [];
          results.sort((a, b) => {return b.timing - a.timing});
          var topTenWidgets = results.slice(0, (results.length >= 10 ? 10 : results.length));
          topTenWidgets.forEach((widget) => {
            serverTimes.push(widget.timing);
            widgetNames.push(widget.name);
          });
          var config = {
            type: "doughnut",
            data: {
              datasets: [{
                data: serverTimes,
                backgroundColor: ["#a8e6cf","#dcedc1","#ffd3b6","#ffaaa5","#ff8b94","#bfb5b2","#83adb5","#c7bbc9","#2e4045","#5e3c58"],
              }],
              labels: widgetNames
            },
            options: {
              responsive: true,
              legend: {
                position: "bottom"
              },
              title: {
                display: true,
                text: "Longest Running Server Scripts"
              }
            }
          };
          var _perCh = new Chart(ctx, config);
          // keep a reference to the chart so that it can be removed if necessary
          perCh = _perCh;
          // Once the chart is created, show the performance chart tab
          perCharTabListItem.style.display = "block";
        });
      });

      // add event listeners to the create issue button
      var createIssueBtn = _spPanelWindow.document.getElementById("createIssue");
      createIssueBtn.addEventListener("click", () => {
        snkitUtil.openInNewTab("https://github.com/jtandy13/SNKit/issues/new");
      }, false);
    }).catch((e) => {
      console.log(e);
    });
  });