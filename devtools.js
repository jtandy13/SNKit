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
    inspectWidget: (widgetClassName) => {
      var inspectScript = `inspect(document.querySelector(".${widgetClassName}"))`
      chrome.devtools.inspectedWindow.eval(inspectScript, {}, function (result, exceptionInfo) {
      });
    },
    highlightWidget: (widgetIdentityObj) => {
      // Create a port for communication with the event page
      var port = chrome.runtime.connect({ name: "devtools-page" });
      port.postMessage({ tabId: snkitUtil.getTabId(), text: "highlightWidget", cmdType: "content_script", 
        data: {idNum: widgetIdentityObj.idNum, identifier: widgetIdentityObj.identifier} });
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
        data: {idNum: widgetIdentityObj.idNum, identifier: widgetIdentityObj.identifier} });
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
    }
  }
})();

var formUtil = (() => {
  return {
    getFieldProperties: () => {
      // Create a port for communication with the event page
      var port = chrome.runtime.connect({name: "devtools-page"});
      return new Promise((resolve, reject) => {
        port.postMessage({ tabId: snkitUtil.getTabId(), text: "getFormProperties", cmdType: "page", data: {} });
        port.onMessage.addListener((data) => {
          if(data.type == "EVENT_PAGE" && data.cmd == "getFormProperties"){
            port.disconnect();
            if(data.content) resolve(data.content);
            else reject();
          }
        });
      });
    },
    clearValue: (fieldName) => {
      // Create a port for communication with the event page
      var port = chrome.runtime.connect({ name: "devtools-page" });
      return new Promise((resolve, reject) => {
        port.postMessage({ tabId: snkitUtil.getTabId(), text: "clearValue", cmdType: "page", data: {fieldName: fieldName} });
        port.onMessage.addListener((data) => {
          if(data.type == "EVENT_PAGE" && data.cmd == "clearValue"){
            port.disconnect();
            if(data.content) resolve(data.content);
            else reject();
          }
        });
      });
    },
    enableDisableField: (fieldName, disable) => {
      // Create a port for communication with the event page
      var port = chrome.runtime.connect({ name: "devtools-page" });
      return new Promise((resolve, reject) => {
        port.postMessage({ tabId: snkitUtil.getTabId(), text: "enableDisableField", cmdType: "page", 
          data: {fieldName: fieldName, disable: disable} });
        port.onMessage.addListener((data) => {
          if(data.type == "EVENT_PAGE" && data.cmd == "enableDisableField"){
            port.disconnect();
            if(data.content) resolve(data.content);
            else reject();
          }
        });
      });
    },
    setRemoveMandatory: (fieldName, mandatory) => {
      // Create a port for communication with the event page
      var port = chrome.runtime.connect({ name: "devtools-page" });
      return new Promise((resolve, reject) => {
        port.postMessage({ tabId: snkitUtil.getTabId(), text: "setRemoveMandatory", cmdType: "page", 
          data: {fieldName: fieldName, mandatory: mandatory} });
        port.onMessage.addListener((data) => {
          if(data.type == "EVENT_PAGE" && data.cmd == "setRemoveMandatory"){
            port.disconnect();
            if(data.content) resolve(data.content);
            else reject();
          }
        });
      });
    },
    showHideField: (fieldName, show) => {
      // Create a port for communication with the event page
      var port = chrome.runtime.connect({ name: "devtools-page" });
      return new Promise((resolve, reject) => {
        port.postMessage({ tabId: snkitUtil.getTabId(), text: "showHideField", cmdType: "page", 
          data: {fieldName: fieldName, show: show} });
        port.onMessage.addListener((data) => {
          if(data.type == "EVENT_PAGE" && data.cmd == "showHideField"){
            port.disconnect();
            if(data.content) resolve(data.content);
            else reject();
          }
        });
      });
    },
    showAllHiddenFields: (fieldDetails) => {
      // Create a port for communication with the event page
      var port = chrome.runtime.connect({name: "devtools-page"});
      return new Promise((resolve, reject) => {
        port.postMessage({ tabId: snkitUtil.getTabId(), text: "showAllHiddenFields", cmdType: "page", data: {fieldDetails: fieldDetails} });
        port.onMessage.addListener((data) => {
          if(data.type == "EVENT_PAGE" && data.cmd == "showAllHiddenFields"){
            port.disconnect();
            if(data.content) resolve(data.content);
            else reject();
          }
        });
      });
    },
    showReference: (fieldName) => {
      // Create a port for communication with the event page
      var port = chrome.runtime.connect({name: "devtools-page"});
      return new Promise((resolve, reject) => {
        port.postMessage({ tabId: snkitUtil.getTabId(), text: "showReference", cmdType: "page", data: {fieldName: fieldName} });
        port.onMessage.addListener((data) => {
          if(data.type == "EVENT_PAGE" && data.cmd == "showReference"){
            port.disconnect();
            if(data.content) resolve(data.content);
            else reject();
          }
        });
      });
    },
    showUiPolicies: (fieldName) => {
      // Create a port for communication with the event page
      var port = chrome.runtime.connect({name: "devtools-page"});
      return new Promise((resolve, reject) => {
        port.postMessage({ tabId: snkitUtil.getTabId(), text: "showUiPolicies", cmdType: "page", data: {fieldName: fieldName} });
        port.onMessage.addListener((data) => {
          if(data.type == "EVENT_PAGE" && data.cmd == "showUiPolicies"){
            port.disconnect();
            if(data.content) resolve(data.content);
            else reject();
          }
        });
      });
    },
    showClientScripts: (fieldName) => {
      // Create a port for communication with the event page
      var port = chrome.runtime.connect({name: "devtools-page"});
      return new Promise((resolve, reject) => {
        port.postMessage({ tabId: snkitUtil.getTabId(), text: "showClientScripts", cmdType: "page", data: {fieldName: fieldName} });
        port.onMessage.addListener((data) => {
          if(data.type == "EVENT_PAGE" && data.cmd == "showClientScripts"){
            port.disconnect();
            if(data.content) resolve(data.content);
            else reject();
          }
        });
      });
    },
    showBusinessRules: (fieldName) => {
      // Create a port for communication with the event page
      var port = chrome.runtime.connect({name: "devtools-page"});
      return new Promise((resolve, reject) => {
        port.postMessage({ tabId: snkitUtil.getTabId(), text: "showBusinessRules", cmdType: "page", data: {fieldName: fieldName} });
        port.onMessage.addListener((data) => {
          if(data.type == "EVENT_PAGE" && data.cmd == "showBusinessRules"){
            port.disconnect();
            if(data.content) resolve(data.content);
            else reject(reason);
          }
        });
      });
    },
  }
})();

var sidebarUtil = (() => {
  var _widgetSidebar;
  var _formSidebar;
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
    renderFormSidebarPanel: () => {
      formUtil.getFieldProperties().then((data) => {
        if (data.fieldDetails.length > 0) {
          chrome.devtools.panels.elements.createSidebarPane(
            "ServiceNow Form Fields",
            (sidebar) => {
              sidebar.setObject(data.fieldDetails, "ServiceNow Form Fields");
              sidebar.onShown.addListener(() => {
                formUtil.getFieldProperties().then((data) => {
                  sidebar.setObject(data.fieldDetails, "ServiceNow Form Fields");
                });
              });
            });
        }
        if (data.variableDetails.length > 0) {
          chrome.devtools.panels.elements.createSidebarPane(
            "ServiceNow Form Variables",
            (sidebar) => {
              sidebar.setObject(data.variableDetails, "ServiceNow Form Variables");
              sidebar.onShown.addListener(() => {
                formUtil.getFieldProperties().then((data) => {
                  sidebar.setObject(data.variableDetails, "ServiceNow Form Variables");
                });
              });
            });
        }
      })
    }
  }
})();

var snkitUtil = (() => {
  return {
    createSidebarPanels: () => {
      // Create or recreate the sidebarPanels
      sidebarUtil.renderWidgetSidebarPanel().then(() => {
        sidebarUtil.renderFormSidebarPanel();
      });
    },
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
    isFormPage: () => {
      // Create a port for communication with the event page
      var port = chrome.runtime.connect({ name: "devtools-page" });
      return new Promise((resolve, reject) => {
        port.postMessage({ tabId: snkitUtil.getTabId(), text: "isFormPage", cmdType: "page", data: {} });
        port.onMessage.addListener((data) => {
          if (data.type == "EVENT_PAGE" && data.cmd == "isFormPage") {
            port.disconnect();
            resolve(data.content);
          }
        });
      });
    },
    isNotReadOnlyMode: () => {
      // Create a port for communication with the event page
      var port = chrome.runtime.connect({ name: "devtools-page" });
      return new Promise((resolve, reject) => {
        port.postMessage({ tabId: snkitUtil.getTabId(), text: "isNotReadOnlyMode", cmdType: "page", data: {} });
        port.onMessage.addListener((data) => {
          if (data.type == "EVENT_PAGE" && data.cmd == "isNotReadOnlyMode") {
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
    }
  }
})();

/**
 * SNKit will only operate if the user does not have the snc_read_only role
 */
snkitUtil.isNotReadOnlyMode().then((answer) => {
  if (answer) {
    snkitUtil.createSidebarPanels();

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

          function renderFieldsAnalysis(data) {
            if (data.length > 0) {
              var fieldHTML = "";
              var targetEl = _spPanelWindow.document.getElementById("fieldsList");

              data.forEach(function (obj) {
                fieldHTML += `
            <div class='panel panel-default fields' id=${obj.fieldName} data-fieldname='${obj.fieldName}' data-label='${obj.label}'
              data-name='${obj.Name ? obj.Name : ""}' data-currentvalue='${obj.currentValue}' data-displayvalue='${obj.displayValue ? obj.displayValue : ""}'
              data-type='${obj.type}' data-reference='${obj.reference}' data-mandatory='${obj.mandatory}' data-tablename='${obj.tableName}'>
            <div class='panel-body propertyKey'>
            <p>Field name: <span class='propertyValue'>${obj.fieldName}</span></p>
            <p>Label: <span class='propertyValue'>${obj.label}</span></p>
            <p>Current value: <span class='propertyValue'>${obj.currentValue}</span></p>`
                if (obj.displayValue)
                  fieldHTML += `<p>Display value: <span class='propertyValue'>${obj.displayValue}</span></p>`
                fieldHTML += `
            <p>Type: <span class='propertyValue'>${obj.type}</span></p>
            <p>Reference: <span class='propertyValue'>${obj.reference}</span></p>
            <p>Table name: <span class='propertyValue'>${obj.tableName}</span></p>
            <p>Mandatory: <span class='propertyValue'>${obj.mandatory}</span></p>
            <p>Scope: <span class='propertyValue'>${obj.scope}</span></p>            
            </div></div>`
              });
              targetEl.innerHTML = fieldHTML;
              var fieldsLabel = _spPanelWindow.document.getElementById("fieldsLabel")
              fieldsLabel.style.display = "block";
              showFormPanelComponents();
            }
          }

          function renderVariablesAnalysis(data) {
            if (data.length > 0) {
              var variableHTML = "";
              var targetEl = _spPanelWindow.document.getElementById("variablesList");

              data.forEach(function (obj) {
                if (obj.variableEditor)
                  variableHTML += `<div class='panel panel-default fields' id=${obj.Name}`
                else
                  variableHTML += `<div class='panel panel-default fields' id=${obj.Name}`
                variableHTML += ` data-name='${obj.Name}' data-fieldname='${obj.fieldName}' data-label='${obj.label}'
              data-currentvalue='${obj.currentValue}' data-displayvalue='${obj.displayValue ? obj.displayValue : ""}'
              data-type='${obj.type}' data-reference='${obj.reference}' data-mandatory='${obj.mandatory}' data-tablename='${obj.tableName}'>
              <div class='panel-body propertyKey'>
              <p>Name: <span class='propertyValue'>${obj.Name}</span></p>
              <p>Field name: <span class='propertyValue'>${obj.fieldName}</span></p>
              <p>Label: <span class='propertyValue'>${obj.label}</span></p>
              <p>Current value: <span class='propertyValue'>${obj.currentValue}</span></p>`
                if (obj.displayValue)
                  variableHTML += `<p>Display value: <span class='propertyValue'>${obj.displayValue}</span></p>`
                variableHTML += `
            <p>Type: <span class='propertyValue'>${obj.type}</span></p>
            <p>Reference: <span class='propertyValue'>${obj.reference}</span></p>
            <p>Table name: <span class='propertyValue'>${obj.tableName}</span></p>
            <p>Mandatory: <span class='propertyValue'>${obj.mandatory}</span></p>
            <p>Scope: <span class='propertyValue'>${obj.scope}</span></p>
            </div></div>`
              });
              targetEl.innerHTML = variableHTML;
              var variablesLabel = _spPanelWindow.document.getElementById("variablesLabel")
              variablesLabel.style.display = "block";
              showFormPanelComponents();
            }
          }

          function showFormPanelComponents() {
            var formPanelComps = _spPanelWindow.document.querySelectorAll("#formFunctionsBtnGroup, #searchForm");
            formPanelComps.forEach((comp) => {
              comp.style.display = "block";
            })
          }

          function hideScriptSearchTabs() {
            var scriptSearchTabs = _spPanelWindow.document.querySelectorAll(".scriptSearchTab");
            scriptSearchTabs.forEach((tab) => {
              tab.style.display = "none";
            })
          }

          function makeFieldsSelectable() {
            var fieldsArray = _spPanelWindow.document.querySelectorAll(".fields");
            fieldsArray.forEach((field) => {
              field.addEventListener("click", (event) => {
                var el = event.target;
                while (el && el.parentNode) {
                  /**
                   * Traverse up to the panel element.
                   * If the panel is already selected then remove the selectedField class.
                   * If this is a newly selected panel, mark the panel as selected and flag it
                   * so that it does not get removed when the previous selected panel is cleared.
                   */
                  if (el.classList.contains("panel-default")) {
                    if (el.classList.contains("selectedField")) {
                      el.classList.remove("selectedField");
                      break;
                    } else {
                      el.classList.add("selectedField");
                      el.classList.add("remainSelected");
                      // If the panel is newly selected, hide any showing script search tabs
                      hideScriptSearchTabs();
                      break;
                    }
                  }
                  el = el.parentNode;
                }
                var selectedFieldsArray = _spPanelWindow.document.querySelectorAll(".selectedField");
                if (selectedFieldsArray.length > 0) {
                  selectedFieldsArray.forEach((field) => {
                    if (field.classList.contains("selectedField") && field.classList.contains("remainSelected")) {
                      field.classList.remove("remainSelected");
                    } else {
                      field.classList.remove("selectedField");
                    }
                  });
                }
              }, false);
            });
          }

          function renderFormFieldsTab() {
            formUtil.getFieldProperties().then((data) => {
              if (data.fieldDetails)
                renderFieldsAnalysis(data.fieldDetails);
              if (data.variableDetails)
                renderVariablesAnalysis(data.variableDetails);
            }).then(() => { makeFieldsSelectable() });
          }

          function getSelectedFieldName() {
            return _spPanelWindow.document.querySelector(".selectedField").id;
          }

          function applyWidgetListeners() {
            var widgetBoxArray = _spPanelWindow.document.querySelectorAll(".widgetBox");
            widgetBoxArray.forEach((widgetBox) => {
              widgetBox.addEventListener("click", (event) => {
                var el = event.target;
                while (el && el.parentNode) {
                  if (el.classList.contains("widgetBox")) {
                    //check if inspect mode is enabled to choose the right function
                    if (_spPanelWindow.document.getElementById("inspectMode").checked) {
                      widgetUtil.inspectWidget(el.classList.item(1));
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
                    widgetUtil.highlightWidget({ idNum: el.classList.item(1), identifier: el.dataset.identifier });
                    break;
                  }
                  el = el.parentNode;
                }
              })
              widgetBox.addEventListener("mouseout", (event) => {
                var el = event.target;
                while (el && el.parentNode) {
                  if (el.classList.contains("widgetBox")) {
                    widgetUtil.removeWidgetHighlight({ idNum: el.classList.item(1), identifier: el.dataset.identifier });
                    break;
                  }
                  el = el.parentNode;
                }
              })
            })
          }

          function renderServicePortalTab() {
            widgetUtil.getWidgetDetails().then((widgets) => {
              if (widgets.length > 0) {
                var widgetHTML = "";
                var targetEl = _spPanelWindow.document.getElementById("widgetsList");

                widgets.forEach((obj, i) => {
                  if (i == 0) {
                    widgetHTML += `
                  <div class="row">
                    <div class="col-md-6 widgetList">
                      <div class="widgetBox ${obj.className}" 
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
                    <div class="widgetBox ${obj.id ? obj.id : obj.className}" 
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
            });
          }

          function applyScriptListeners(scriptClass) {
            var scriptBoxArray = _spPanelWindow.document.querySelectorAll(`.${scriptClass}`);
            scriptBoxArray.forEach((scriptBox) => {
              scriptBox.addEventListener("click", (event) => {
                var url = event.target.dataset.url;
                snkitUtil.openInNewTab(url);
              });
            });
          }

          function renderUiPolicies(selectedFieldName, policies) {
            var uiPoliciesTab = _spPanelWindow.document.getElementById("uiPoliciesSelector");
            uiPoliciesTab.style.display = "block";

            var targetEl = _spPanelWindow.document.getElementById("policiesList");
            var policiesHTML = `<h3><strong><em>UI Policies that apply to field <span style="color: green">${selectedFieldName}</span></em></strong></h3>`;
            policies.forEach((policy) => {
              policiesHTML +=
                `<div class='panel panel-default'>
              <div class='panel-body'>
                <p>"${policy.name}"</p>
                <p><a class='uiPolicyBox' data-url='${policy.url}'>${policy.url}</a></p>
              </div>
            </div>`
            });
            targetEl.innerHTML = policiesHTML;
            applyScriptListeners("uiPolicyBox");
          }

          function renderClientScripts(selectedFieldName, clientScripts) {
            var clientScriptsTab = _spPanelWindow.document.getElementById("clientScriptsSelector");
            clientScriptsTab.style.display = "block";

            var targetEl = _spPanelWindow.document.getElementById("clientScriptsList");
            var clientScriptsHTML = `<h3><strong><em>Client Scripts that refer to field <span style="color: green">${selectedFieldName}</span></em></strong></h3>`;
            clientScripts.forEach((clientScript) => {
              clientScriptsHTML +=
                `<div class='panel panel-default'>
              <div class='panel-body'>
                <p>"${clientScript.name}"</p>
                <p>"${clientScript.type}"</p>
                <p><a class='clientScriptBox' data-url='${clientScript.url}'>${clientScript.url}</a></p>
              </div>
            </div>`
            });
            targetEl.innerHTML = clientScriptsHTML;
            applyScriptListeners("clientScriptBox");
          }

          function renderBusinessRules(selectedFieldName, businessRules) {
            var businessRulesTab = _spPanelWindow.document.getElementById("businessRulesSelector");
            businessRulesTab.style.display = "block";

            var targetEl = _spPanelWindow.document.getElementById("businessRulesList");
            var businessRulesHTML = `<h3><strong><em>Business Rules that refer to field <span style="color: green">${selectedFieldName}</span></em></strong></h3>`;
            businessRules.forEach((businessRule) => {

              businessRulesHTML +=
                `<div class='panel panel-default'>
              <div class='panel-body'>
                <p><strong>"${businessRule.name}"</strong></p>
                <p>When: ${businessRule.when}</p>
                <p>For: ${businessRule.for.toString()}</p>
                <p><a class='businessRuleBox' data-url='${businessRule.url}'>${businessRule.url}</a></p>
              </div>
            </div>`
            });
            targetEl.innerHTML = businessRulesHTML;
            applyScriptListeners("businessRuleBox");
          }

          /**
           * Bootstrap tab changes are difficult to react to without JQuery,
           * so the MutationObserver class will be used instead of addEventListener.
           */
          var spTabObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
              //Once the Service Portal tab becomes active, take action
              if (mutation.target.className == "tab-pane active")
                renderServicePortalTab();
            });
          });

          var ffTabObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
              //Once the Service Portal tab becomes active, take action
              if (mutation.target.className == "tab-pane active")
                renderFormFieldsTab();
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

          var ffTabTargetNode = _spPanelWindow.document.getElementById("formFieldsTab");
          ffTabObserver.observe(ffTabTargetNode, observerConfig);

          /**
           * Since the tabs are rendered when they are shown, we need to set the active tab
           * based on the page context. For now we can use the isServicePortalPage function.
           */
          snkitUtil.isServicePortalPage().then((answer) => {
            if (answer) {
              var spTabTargetNodes = _spPanelWindow.document.querySelectorAll("#servicePortalTab, #spTabListItem");
              spTabTargetNodes.forEach((node) => {
                node.classList.add("active")
              });
            } else {
              var ffTabTargetNodes = _spPanelWindow.document.querySelectorAll("#formFieldsTab, #ffTabListItem");
              ffTabTargetNodes.forEach((node) => {
                node.classList.add("active")
              });
            }
          });

          // add event listeners to the clearValue button
          var clearValueBtn = _spPanelWindow.document.getElementById("clearValueBtn");
          clearValueBtn.addEventListener("click", () => {
            formUtil.clearValue(getSelectedFieldName());
          }, false);

          // add event listeners to the disable field button
          var disableFieldBtn = _spPanelWindow.document.getElementById("disableFieldBtn");
          disableFieldBtn.addEventListener("click", () => {
            formUtil.enableDisableField(getSelectedFieldName(), true);
          }, false);

          // add event listeners to the enable field button
          var enableFieldBtn = _spPanelWindow.document.getElementById("enableFieldBtn");
          enableFieldBtn.addEventListener("click", () => {
            formUtil.enableDisableField(getSelectedFieldName(), false);
          }, false);

          // add event listeners to the set mandatory button
          var setMandatoryBtn = _spPanelWindow.document.getElementById("setMandatoryBtn");
          setMandatoryBtn.addEventListener("click", () => {
            formUtil.setRemoveMandatory(getSelectedFieldName(), true);
          }, false);

          // add event listeners to the remove mandatory button
          var removeMandatoryBtn = _spPanelWindow.document.getElementById("removeMandatoryBtn");
          removeMandatoryBtn.addEventListener("click", () => {
            formUtil.setRemoveMandatory(getSelectedFieldName(), false);
          }, false);

          // add event listeners to the show field button
          var showFieldBtn = _spPanelWindow.document.getElementById("showFieldBtn");
          showFieldBtn.addEventListener("click", () => {
            formUtil.showHideField(getSelectedFieldName(), true);
          }, false);

          // add event listeners to the hide field button
          var hideFieldBtn = _spPanelWindow.document.getElementById("hideFieldBtn");
          hideFieldBtn.addEventListener("click", () => {
            formUtil.showHideField(getSelectedFieldName(), false);
          }, false);

          // add event listeners to the hide field button
          var showAllHiddenFieldsBtn = _spPanelWindow.document.getElementById("showAllHiddenFieldsBtn");
          showAllHiddenFieldsBtn.addEventListener("click", () => {
            var fields = _spPanelWindow.document.querySelectorAll(".fields");
            var fieldDetails = [];
            fields.forEach((field) => {
              var fieldObj = {};
              fieldObj.fieldName = field.dataset.fieldname;
              if (field.dataset.tablename == "variable") fieldObj.name = field.dataset.name;
              fieldDetails.push(fieldObj);
            })
            formUtil.showAllHiddenFields(fieldDetails);
          }, false);

          // add event listeners to the hide field button
          var showReferenceBtn = _spPanelWindow.document.getElementById("showReferenceBtn");
          showReferenceBtn.addEventListener("click", () => {
            formUtil.showReference(getSelectedFieldName());
          }, false);

          // add event listeners to the search UI Policies button
          var showUiPoliciesBtn = _spPanelWindow.document.getElementById("showUiPoliciesBtn");
          showUiPoliciesBtn.addEventListener("click", () => {
            var selectedFieldName = getSelectedFieldName();
            formUtil.showUiPolicies(selectedFieldName).then((policies) => { renderUiPolicies(selectedFieldName, policies) });
          }, false);

          // add event listeners to the search Client Scripts button
          var showClientScriptsBtn = _spPanelWindow.document.getElementById("showClientScriptsBtn");
          showClientScriptsBtn.addEventListener("click", () => {
            var selectedFieldName = getSelectedFieldName();
            formUtil.showClientScripts(selectedFieldName).then((clientScripts) => { renderClientScripts(selectedFieldName, clientScripts) });
          }, false);

          // add event listeners to the search Business Rules button
          var showBusinessRulesBtn = _spPanelWindow.document.getElementById("showBusinessRulesBtn");
          showBusinessRulesBtn.addEventListener("click", () => {
            var selectedFieldName = getSelectedFieldName();
            formUtil.showBusinessRules(selectedFieldName).then((businessRules) => { renderBusinessRules(selectedFieldName, businessRules) });
          }, false);

          // add event listeners to the create issue button
          var createIssueBtn = _spPanelWindow.document.getElementById("createIssue");
          createIssueBtn.addEventListener("click", () => {
            snkitUtil.openInNewTab("https://github.com/jtandy13/SNKit/issues/new");
          }, false);

          // add event listener to the field search button
          var fieldSearchBtn = _spPanelWindow.document.getElementById("fieldSearchBtn");
          fieldSearchBtn.addEventListener('click', () => {
            var searchCategory = _spPanelWindow.document.getElementById("searchCategory").selectedOptions[0].id;
            var searchText = _spPanelWindow.document.getElementById("searchText").value;
            var fieldPanels = _spPanelWindow.document.querySelectorAll(".fields");
            fieldPanels.forEach((fieldPanel) => {
              if (fieldPanel.dataset[searchCategory].toUpperCase().includes(searchText.toUpperCase())) {
                fieldPanel.style.display = "block";
              } else {
                fieldPanel.style.display = "none";
              }
            })
          }, false);

          // handle the enter key when pressed inside the search text input
          var searchText = _spPanelWindow.document.getElementById("searchText");
          searchText.addEventListener("keypress", (event) => {
            var keyCode = event.keyCode || event.which;
            if (keyCode == "13") {
              var searchCategory = _spPanelWindow.document.getElementById("searchCategory").selectedOptions[0].id;
              var searchTextValue = _spPanelWindow.document.getElementById("searchText").value;
              var fieldPanels = _spPanelWindow.document.querySelectorAll(".fields");
              fieldPanels.forEach((fieldPanel) => {
                if (fieldPanel.dataset[searchCategory].toUpperCase().includes(searchTextValue.toUpperCase())) {
                  fieldPanel.style.display = "block";
                } else {
                  fieldPanel.style.display = "none";
                }
              });
            }
          }, false);

        }).catch((e) => {
          console.log(e);
        });
      });
  }
});
