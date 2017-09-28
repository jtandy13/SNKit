function alphaSortDataObject(propName, dataObj) {
  return new Promise((resolve, reject) => {
    dataObj.sort((a, b) =>{
      const nameA = a[propName].toUpperCase();
      const nameB = b[propName].toUpperCase();
      let comparison = 0;
      if(nameA > nameB){
        comparison = 1;
      } else if(nameA < nameB){
        comparison = -1;
      }
      return comparison;
    })
    console.log("resolved");
    resolve(dataObj)
  })
}

function getParentTable() {
  var parentTable;
  return new Promise((resolve, reject) => {
    var parentTableSysId;
    var targetWin = getTargetWindow();
    var gr = new targetWin.GlideRecord("sys_db_object");
    gr.addQuery("name", targetWin.g_form.tableName);
    gr.query((gr) => {
      gr.next();
      parentTableSysId = gr.super_class;
      var gr = new targetWin.GlideRecord("sys_db_object");
      gr.addQuery("sys_id", parentTableSysId);
      gr.query((gr) => {
          gr.next();
          var name = gr.name;
          resolve(gr.name);
      });
    });
  })
}

function getStandardFormProperties(targetWin, callback) {
  var parentTable;
  getParentTable().then((name) => {
    parentTable = name;
    var fieldDetails = [];
    var fields = targetWin.g_form.elements;
    fields.forEach((field, i) => {
      var detailObj = {};
      detailObj.fieldName = fields[i].fieldName;
      detailObj.isInherited = fields[i].isInherited;
      detailObj.mandatory = fields[i].mandatory;
      detailObj.reference = fields[i].reference;
      detailObj.scope = fields[i].scope;
      if(fields[i].isInherited) {
        detailObj.tableName = parentTable;
      } else {
        detailObj.tableName = fields[i].tableName;
      }
      detailObj.type = fields[i].type;
      detailObj.currentValue = targetWin.g_form.getValue(detailObj.fieldName);
      fieldDetails.push(detailObj);
    });
    alphaSortDataObject("fieldName", fieldDetails)
      .then(callback({fieldDetails: fieldDetails}));
  });
}

function getCatItemProperties(targetWin, callback) {
  var fieldDetails = [];
  var variableDetails = [];
  var fields = [];
  var variables = [];
  var formElements = targetWin.g_form.elements;
  var nameMapClone = targetWin.g_form.nameMap;
  var hasVariableEditor = targetWin.g_form.prefixHandlers.variables ? true : false;
  //separate the fields and variables into separate arrays
  formElements.forEach((elem, i) => {
    if (elem.tableName == "variable" && !elem.fieldName.startsWith("ni.")){
      variables.push(elem);
    } else {
      fields.push(elem);
    }
  });
  //collect the variable properties
  variables.forEach((variable, i) => {
    var varObj = {};
    varObj.fieldName = variables[i].fieldName;
    for(let i = 0; i < nameMapClone.length; i++) {
      if(varObj.fieldName == nameMapClone[i].realName){
        varObj.Name = nameMapClone[i].prettyName;
        varObj.label = nameMapClone[i].label;
        break;
      }
    }
    varObj.mandatory = variables[i].mandatory;
    varObj.reference = variables[i].reference;
    varObj.scope = variables[i].scope;
    varObj.tableName = variables[i].tableName;
    varObj.type = variables[i].type;
    //if this is a reference field, then we need to get the display value as well
    if(varObj.reference != "null" && hasVariableEditor)
      varObj.displayValue = targetWin.g_form.getDisplayBox("ni.VE" + varObj.fieldName).value;
    else if (varObj.reference != "null")
      varObj.displayValue = targetWin.g_form.getDisplayBox(varObj.fieldName).value;
    /**
     * Check if the variable is part of a variable editor.
     * If not, the value can be obtained using the fieldName
     */
    if(hasVariableEditor)
      varObj.currentValue = targetWin.g_form.getValue("ni.VE" + varObj.fieldName);
    else
      varObj.currentValue = targetWin.g_form.getValue(varObj.fieldName);
    variableDetails.push(varObj);
  });
  //collect the field properties
  var parentTable;
  getParentTable().then((name) => {
    parentTable = name;
    fields.forEach((field, i) => {
      var fieldDetailObj = {};
      fieldDetailObj.fieldName = fields[i].fieldName;
      fieldDetailObj.isInherited = fields[i].isInherited;
      fieldDetailObj.mandatory = fields[i].mandatory;
      fieldDetailObj.reference = fields[i].reference;
      fieldDetailObj.scope = fields[i].scope;
      if(fields[i].isInherited) {
        fieldDetailObj.tableName = parentTable;
      } else {
        fieldDetailObj.tableName = fields[i].tableName;
      }
      if (fieldDetailObj.reference != "null")
        fieldDetailObj.displayValue = targetWin.g_form.getDisplayBox(fieldDetailObj.fieldName).value;
      fieldDetailObj.type = fields[i].type;
      fieldDetailObj.currentValue = targetWin.g_form.getValue(fieldDetailObj.fieldName);
      fieldDetails.push(fieldDetailObj);
    });
    alphaSortDataObject("fieldName", fieldDetails)
      .then(alphaSortDataObject("Name", variableDetails))
      .then(callback({fieldDetails: fieldDetails, variableDetails: variableDetails}));
  /*alphaSortDataObject("label", fieldDetails)
    .then(callback(fieldDetails));*/
  });
}
function getFormProperties(callback) {
  var fieldDetails = [];
  var targetWin = getTargetWindow();

  //if the nameMap property is populated, then there are variables
  try {
    if(targetWin.g_form.nameMap.length > 0){
      getCatItemProperties(targetWin, (data) => { 
        fieldDetails = data;
        callback(fieldDetails);
      });
    } else {
      getStandardFormProperties(targetWin, (data) => {
        fieldDetails = data; 
        callback(fieldDetails);
      });
    }
  } catch(e) {
    return;
  }
}

function clearValue(fieldName, callback) {
  var targetWin = getTargetWindow();
  targetWin.g_form.clearValue(fieldName);
  callback();
}

function enableDisableField(fieldName, disable, callback) {
  var targetWin = getTargetWindow();
  targetWin.g_form.setDisabled(fieldName, disable);
  callback();
}

function setRemoveMandatory(fieldName, mandatory, callback) {
  var targetWin = getTargetWindow();
  targetWin.g_form.setMandatory(fieldName, mandatory);
  callback();
}

function showHideField(fieldName, show, callback) {
  var targetWin = getTargetWindow();
  targetWin.g_form.setDisplay(fieldName, show);
  callback();
}

function showAllHiddenFields(callback) {
  var targetWin = getTargetWindow();
  var tableName = targetWin.g_form.tableName;
  targetWin.g_form.elements.forEach((elem) => {
    var topFieldElement = targetWin.document.getElementById(`element.${tableName}.${elem.fieldName}`);
    if(topFieldElement.style.display == "none"){
      console.log(topFieldElement);
      targetWin.g_form.setDisplay(elem.fieldName, true);
    }
  })
  callback();
}

function showReference(fieldName, callback) {
  var targetWin = getTargetWindow();
  targetWin.g_form.getReference(fieldName, (ref) => {
    console.info("%cReference record:", "color:green; font-size:large;");
    console.groupCollapsed(fieldName);
    ref.rows[0].forEach((fieldObj) => {
      console.log(`%c${fieldObj.name}%c: %c${fieldObj.value}`, "color:#881391;", "color:black;", "color:#c41a16");
    })
    console.groupEnd();
  })
  callback();
}

function getTargetWindow() {
  var targetWin;
  if(window.g_form) {
    targetWin = window;
    return targetWin;
  } else if(document.getElementById('gsft_main')){
    targetWin = document.getElementById('gsft_main').contentWindow
    return targetWin;
  } else {
    return;
  }
}

function getWidgetDetails(callback) {
  var details = [];
  var spWidgets = document.querySelectorAll("[widget='widget']");

  spWidgets.forEach((w, i) => {
    var detailObj = {};
    var thisScope = angular.element(spWidgets[i]).scope();
    detailObj.name = thisScope.widget.name;
    detailObj.technicalName = thisScope.widget.id;
    if(spWidgets[i].id){
      detailObj.id = spWidgets[i].id;
      detailObj.identifier = "id"
    } else {
      detailObj.className = spWidgets[i].classList.item(0);
      detailObj.identifier = "class"
    }
    details.push(detailObj);
  })
  //TODO: alphsort details object
  callback(details);
}

function showUiPolicies(fieldName, callback) {
  var targetWindow = getTargetWindow()
  var uiPolicyArray = targetWindow.g_ui_policy;
  var targetPolicies = [];
  uiPolicyArray.forEach((policy) => {
    policy.actions.forEach((action) => {
      if (action.name == fieldName){
        var policyDetailObj = {};
        policyDetailObj.name = policy.short_description;
        policyDetailObj.url = `https://${targetWindow.location.hostname}/${policy.table}.do?sys_id=${policy.sys_id}`;
        targetPolicies.push(policyDetailObj);
      }
    })
  })
  callback(targetPolicies);
}
//TODO: convert to client script collection. Gather client script type as well
function showClientScripts(fieldName, callback) {
  var targetWindow = getTargetWindow()
  var clientScriptsObj = targetWindow.g_event_handler_ids;
  var targetClientScripts = [];
  var promises = [];
    for (var prop in clientScriptsObj) {
      var gr = new targetWindow.GlideRecord("sys_script_client");
      gr.addQuery("sys_id", clientScriptsObj[prop]);
      promises.push(new Promise((resolve, reject) => {
        gr.query(function (rec) {
          rec.next();
          if (rec.script.search(fieldName) != -1) {
            var scriptDetailObj = {};
            scriptDetailObj.name = rec.sys_name;
            scriptDetailObj.type = rec.type;
            scriptDetailObj.url = `https://${targetWindow.location.hostname}/sys_script_client.do?sys_id=${rec.sys_id}`;
            targetClientScripts.push(scriptDetailObj);
          }
          resolve();
        });
      }));
    }
  Promise.all(promises).then(() => {callback(targetClientScripts)});
  /*console.log(targetClientScripts);
  callback(targetClientScripts);*/
}

window.addEventListener("myCmdEvent", function(event) {
  var cmd = event.detail.cmd;
  var cmdData = event.detail.cmdData;
  if (cmd === "getFormProperties"){
    getFormProperties((data) => {
      // send the data back to the content script
      window.postMessage({ type: "from_page", text: data, cmd: cmd }, "*");
    });
    //TODO: too much repetition!
  } else if (cmd === "clearValue"){
    clearValue(cmdData.fieldName, () => {
      window.postMessage({ type: "from_page", text: "completed", cmd: cmd }, "*");
    })
  } else if (cmd === "enableDisableField"){
    enableDisableField(cmdData.fieldName, cmdData.disable, () => {
      window.postMessage({ type: "from_page", text: "completed", cmd: cmd }, "*");
    })
  } else if (cmd === "setRemoveMandatory"){
    setRemoveMandatory(cmdData.fieldName, cmdData.mandatory, () => {
      window.postMessage({ type: "from_page", text: "completed", cmd: cmd }, "*");
    })
  } else if (cmd === "showHideField"){
    showHideField(cmdData.fieldName, cmdData.show, () => {
      window.postMessage({ type: "from_page", text: "completed", cmd: cmd }, "*");
    })
  } else if (cmd === "showAllHiddenFields"){
    showAllHiddenFields(() => {
      window.postMessage({ type: "from_page", text: "completed", cmd: cmd }, "*");
    })
  } else if (cmd === "showReference"){
    showReference(cmdData.fieldName, () => {
      window.postMessage({ type: "from_page", text: "completed", cmd: cmd }, "*");
    })
  } else if (cmd === "getWidgetDetails"){
    getWidgetDetails((data) => {
      // send the data back to the content script
      window.postMessage({ type: "from_page", text: data, cmd: cmd }, "*");
    });
  } else if (cmd === "showUiPolicies"){
    showUiPolicies(cmdData.fieldName, (data) => {
      // send the data back to the content script
      window.postMessage({ type: "from_page", text: data, cmd: cmd }, "*");
    });
  } else if (cmd === "showClientScripts"){
    showClientScripts(cmdData.fieldName, (data) => {
      // send the data back to the content script
      window.postMessage({ type: "from_page", text: data, cmd: cmd }, "*");
    });
  }
   /*else if (cmd === "getFields") {
        getFields(function(data) {
            // send the data back to the content script
            window.postMessage(
                { 
                    type: "from_page", 
                    text: data, 
                    cmd: cmd 
                }, "*");
        });
    } else if (cmd === "enableDisableField") {
        enableDisableField(cmdData.fieldNames, cmdData.disable, function() {
            // send the confirmation back to the content script
            window.postMessage(
                { 
                    type: "from_page", 
                    text: "completed", 
                    cmd: cmd 
                }, "*");
        });
    } else if (cmd === "setRemoveMandatory") {
        setRemoveMandatory(cmdData.fieldNames, cmdData.mandatory, function() {
            // send the confirmation back to the content script
            window.postMessage(
                { 
                    type: "from_page", 
                    text: "completed", 
                    cmd: cmd 
                }, "*");
        });
    } else if (cmd === "showHideField") {
        showHideField(cmdData.fieldNames, cmdData.show, function() {
            // send the confirmation back to the content script
            window.postMessage(
                { 
                    type: "from_page", 
                    text: "completed", 
                    cmd: cmd 
                }, "*");
        });
    } else if (cmd === "getCurrentUserName") {
        getCurrentUserName(function(data) {
            // send the confirmation back to the content script
            window.postMessage(
                { 
                    type: "from_page", 
                    text: data, 
                    cmd: cmd 
                }, "*");
        });
    }*/
}, false);