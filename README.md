# SNKit
Chrome Developer Tools extension for ServiceNow

## Purpose
SNKit is a devtools project dedicated to enabling quicker debugging of Service Portal pages. The goals of the project are to:

1. Establish a platform where devtools can interact with the ServiceNow page in a more meaningful way.
2. Aid in debugging ServiceNow pages by enabling administrators and developers to manipulate the page without making changes to the instance.
3. Enable faster analysis of ServiceNow pages leading to quicker incident resolution.

## Enabling SNKit
To enable SNKit from devtools, open the SNKit panel at the top of the devtools window. From the controls tab, check the "Enable SNKit" checkbox.

## ServiceNow Service Portal Widgets sidebar panel
Once you've enabled SNKit, you'll have access to view all of the widget scope objects within the Service Portal Widgets sidebar panel. You can find the panel in the Elements tab. 

![service_portal_widgets](https://user-images.githubusercontent.com/22809154/31272378-6f4add44-aad6-11e7-9d71-699b494e967a.jpg)

## Service Portal Tab
### Widget Controllers panel
The Service Portal tab points the user to the AngularJS scope data for each widget logged in the Service Portal Widgets sidebar. The Widget Controllers panel allows the user to have quick access to the AngularJS controller code for each widget. Here the user can debug and manipulate the widget controller script entirely from within devtools.

![widget_controllers](https://user-images.githubusercontent.com/22809154/31272812-fac4f912-aad7-11e7-9663-7d4c80409b72.jpg)

### Service Portal Components panel
The Service Portal Components panel provides the user with quick links to the components used to build the currently viewed portal. All links open in a new browser tab.

### Run a performance chart to check widget load times
Pressing the "Display Performance Chart" will reload all of the widgets on the page while keeping track of the load times. Once all widgets have reloaded, the Performance Chart tab will display a graph showing you which widgets are taking the most time to load. Times are listed in milliseconds.

![performance_chart](https://user-images.githubusercontent.com/22809154/33367415-a1dc6688-d542-11e7-8617-42fdd18f4aa4.png)

## SNKit console API
The SNKit console API allows you to make changes to the widget AngularJS scopes and run client controller functions directly from the console.

### snkit_api.widgetsToConsole()
To create references in the console to all of the widget scopes on the page, from the JavaScript console run:

```javascript
snkit_api.widgetsToConsole()
```

This will create a reference to the AngularJS scope for every widget on the page and attach it to the snkit_api object. All widget scope objects begin with the "$" symbol.

You will then be able to change scope data as needed:

```javascript
snkit_api.$ticket_conversations.data.canAttach = false;
snkit_api.$ticket_conversations.$apply();
```

Rerunning the server script from the console:
```javascript
snkit_api.$sc_shopping_cart.c.server.refresh()
```

### snkit_api.getService(String serviceName)
The getService function gives you the ability to test and/or demonstrate any AngularJS service from the browser JavaScript console. The function takes one paramter "serviceName" which is the name of the AngularJS Service that you need to access. ServiceNow's "spUtil" and "spModal" services can also be accessed.

Examples:

Testing the "spUtil" service from the console:
```javascript
snkit_api.getService('spModal');
snkit_api.spModal.prompt('Isn\'t SNKit great?')
  .then(function(response){
    console.log(response);
  });
```

Testing the AngularJS "$location" service from the console:
```javascript
snkit_api.getService('$location');
ssnkit_api.$location.url('/sp?id=index');
```

### snkit_api.getGlideForm()
To gain access to the g_form object and all of its functions, run the following command in the console:

```javascript
snkit_api.getGlideForm()
```

If you are on a Service Portal page that displays a form, you can then call the g_form object in the following way:

```javascript
snkit_api.g_form
```

Please see the documentation for the g_form object in Service Portal ![here](https://docs.servicenow.com/bundle/jakarta-servicenow-platform/page/build/service-portal/concept/unsupported_client_scripts.html#d1072115e130)

Example usage of the g_form object. 

Saving the form:

```javascript
snkit_api.g_form.save();
```

List all the field names on the form:

```javascript
snkit_api.g_form.getFieldNames();
```

## Refreshing SNKit data
If you leave devtools open, you may need to refresh the data that you see in SNKit. To do this, just exit the tab or panel you are currently and return to that same tab or panel. SNKit is set to refresh everytime the panels are viewed.

## Adding SNKit to Chrome
Instructions can be found [here](https://github.com/jtandy13/SNKit/wiki/Adding-SNKit-to-Chrome).

## Help
The Help tab allows the user to log any observed bugs or issues with SNKit to the dedicated GitHub page for the project.
