var SNKit = (() => {
  return {
    version: "2.0.0",
    getWidgetDetails: (callback) => {
      var details = [];
      var spWidgets = document.querySelectorAll("[widget='widget']");

      spWidgets.forEach((w, i) => {
        var detailObj = {};
        var thisScope = angular.element(spWidgets[i]).scope();
        detailObj.name = thisScope.widget.name;
        detailObj.technicalName = thisScope.widget.id;
        detailObj.id = spWidgets[i].id
        detailObj.className = spWidgets[i].classList.item(0);
        detailObj.identifier = "class"
        detailObj.portalId = thisScope.portal.sys_id;
        detailObj.themeId = thisScope.theme.sys_id;
        detailObj.pageId = thisScope.page.sys_id;
        detailObj.serverTime = thisScope.widget._server_time;
        if(thisScope.theme.header && thisScope.theme.header.sys_id) detailObj.headerId = thisScope.theme.header.sys_id;
        if(thisScope.theme.footer && thisScope.theme.footer.sys_id) detailObj.footerId = thisScope.theme.footer.sys_id;
        details.push(detailObj);
      })
      callback(details);
    },
    getWidgetScopes: (p1, p2) => {
      var _widgetName;
      var _callback;
      /**
       * Allow the user to either enter a string name of the widget, a string name of
       * the widget with a callback, or just a callback.
       */
      if(p1) {
        if(typeof(p1) === "string") {
          _widgetName = p1;
        } else if(typeof(p1) === "function") {
          _callback = p1;
        }
      }
      if(p2) {
        if(typeof(p2) === "function")
          _callback = p2;
      }

      var widgetScopes = [];
      var spWidgets = document.querySelectorAll("[widget='widget']");

      spWidgets.forEach((widget, i) => {
        var thisScope = angular.element(spWidgets[i]).scope();
        widgetScopes.push(thisScope);
      });

      if(_widgetName) {
        if (_callback) {
          var results = widgetScopes.filter((scope) => {
            return scope.widget.name.toUpperCase() == _widgetName.toUpperCase()
          });
          _callback(results);
          return;
        } else {
          return widgetScopes.filter((scope) => {
            return scope.widget.name.toUpperCase() == _widgetName.toUpperCase()
          });
        }
      }
      if(_callback) _callback(widgetScopes);
      else return widgetScopes;
    },
    timeServer: (scope) => {

      return new Promise((resolve, reject) => {
        var timing;
        var start = Date.now();
        //console.log(scope.widget.name + " started @" + Date.now());
        scope.server.refresh().then(() => {
          var end = Date.now();
          //console.log(scope.widget.name + " finished @" + Date.now());
          timing = end - start;

          //record timing in widget scope
          scope.snkit_load_time_ms = timing;

          resolve({timing: timing, name: scope.widget.name});
        });
      });
    },
    // Promises need to run in a synchronous chain, this is not happening yet.
    getServerTimings: (callback) => {
      var scopes = SNKit.getWidgetScopes();
      var timingResults = [];
      var chain = Promise.resolve();
      scopes.forEach((scope, i, a) => {
        chain = chain.then(() => 
          SNKit.timeServer(scope)).then((result) => { 
            timingResults.push(result) 
            // if this is the last element in the array, then send the information back
            if(i == (a.length - 1)){
              callback(timingResults);
            }
          });
      });
    },
    isServicePortalPage: (callback) => {
      callback(window.NOW.hasOwnProperty("sp"));
    },
    getHostName: (callback) => {
      callback(window.location.hostname);
    }
  }
})();

var snkit_api = (() => {
  return {
    widgetsToConsole: () => {
      var widgetScopes = SNKit.getWidgetScopes();
      var names = [];
      var duplicateWidgetCounter = {};
      widgetScopes.forEach((scope) => {
        var scriptableName = `$${scope.widget.name.toLowerCase()}`;
        scriptableName = scriptableName.split(" ").join("_");
        //check for duplicates and tag them with numbers
        if(names.indexOf(scriptableName) !== -1){
          if(duplicateWidgetCounter.hasOwnProperty(scriptableName)){
            duplicateWidgetCounter[scriptableName]++;
            scriptableName = scriptableName + duplicateWidgetCounter[scriptableName];
          } else {
            duplicateWidgetCounter[scriptableName] = 1;
            scriptableName = scriptableName + duplicateWidgetCounter[scriptableName];
          }
        } else {
          names.push(scriptableName);
        }
        snkit_api[scriptableName] = scope;
      });
    },
    getGlideForm: () => {
      snkit_api.g_form = angular.element("sp-variable-layout").scope().getGlideForm();
    },
    getService: (serviceName) => {
      snkit_api[serviceName] = angular.element(document.querySelector("[ng-app]")).injector().get(serviceName);
    }
  }
})();

window.addEventListener("snkitRequest", function(event) {
  var cmd = event.detail.cmd;
  var cmdData = event.detail.cmdData;
  if (cmd === "getWidgetDetails"){
    SNKit.getWidgetDetails((data) => {
      // send the data back to the content script
      window.postMessage({ type: "from_page", text: data, cmd: cmd }, "*");
    });
  } else if (cmd === "isServicePortalPage"){
    SNKit.isServicePortalPage((data) => {
      // send the data back to the content script
      window.postMessage({ type: "from_page", text: data, cmd: cmd }, "*");
    });
  } else if (cmd === "getHostName"){
    SNKit.getHostName((data) => {
      // send the data back to the content script
      window.postMessage({ type: "from_page", text: data, cmd: cmd }, "*");
    });
  } else if (cmd === "getServerTimings"){
    SNKit.getServerTimings((data) => {

      //lets log the performance data into a table in the console
      console.table(data);

      // send the data back to the content script
      window.postMessage({ type: "from_page", text: data, cmd: cmd }, "*");
    });
  } 
}, false);