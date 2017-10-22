# SNKit
Chrome Developer Tools extension for ServiceNow

## Purpose
SNKit is a devtools project dedicated to enabling quicker debugging of ServiceNow forms and Service Portal pages. The goals of the project are to:

1. Establish a platform where devtools can interact with the ServiceNow page in a more meaningful way.
2. Aid in debugging ServiceNow pages by enabling administrators and developers to manipulate the page without making changes to the instance.
3. Enable faster analysis of ServiceNow pages leading to quicker incident resolution.

## Sidebars
All of the SNKit sidebars can be found in the Elements panel of Chrome devtools.

### ServiceNow Form Fields
All form fields are laid out in alphabetical order giving quick access to vital field details. The ServiceNow Form Fields sidebar appears whenever devtools opens to inspect a form page.

![servicenow_form_fields](https://user-images.githubusercontent.com/22809154/31272220-edfda80c-aad5-11e7-918f-e947ab54bcb1.jpg)

### ServiceNow Variables
The ServiceNow Variables sidebar only displays if there are variables on the form. This may be on a Service Catalog item or within the variable editor on forms.

![servicenow_variables](https://user-images.githubusercontent.com/22809154/31272319-3f1271be-aad6-11e7-8b77-ff2604899cb9.jpg)

### ServiceNow Service Portal Widgets
If you open devtools on a Service Portal page, you will gain access to the Service Portal Widgets sidebar. Here you will see all of the widgets on the page along with their AngularJS scope data.

![service_portal_widgets](https://user-images.githubusercontent.com/22809154/31272378-6f4add44-aad6-11e7-9d71-699b494e967a.jpg)

## Tabs
The SNKit panel allows access to tabular information regarding either the form or Service Portal page being inspected.

### Forms
The Forms tab allows for field and variable manipulation through the first four buttons (some are drop downs with multiple functions) on the left-side menu. Simply select the form or variable that you are interested in and apply the function to it on the left. 

![form_tab](https://user-images.githubusercontent.com/22809154/31866886-95fb10c8-b7d1-11e7-9c1c-ad1362ea354b.jpg)

Underneath the field manipulation functions are four extra functions used for analysis. Client Scripts, UI Policies, and Business Rules of the current table can be searched for any reference of the selected field or variable. Search results will appear in their own tab. The "Evaluate reference in console" function send the complete GlideRecord of the reference to the console to inspect.

![client_scripts_search](https://user-images.githubusercontent.com/22809154/31866922-e93798d8-b7d1-11e7-8943-4db203cd1b8a.jpg)

Quick keyword searches can be run from the top right search bar. Select a search category to search by anything other than the field label.

### Service Portal
The Service Portal tab points the user to the AngularJS scope data for each widget logged in the Service Portal Widgets sidebar. The Widget Controllers panel allows the user to have quick access to the AngularJS controller code for each widget. Here the user can debug and manipulate the widget controller script without actually making any changes to the instance.

![widget_controllers](https://user-images.githubusercontent.com/22809154/31272812-fac4f912-aad7-11e7-9663-7d4c80409b72.jpg)

### Help
The Help tab allows the user to log any observed bugs or issues with SNKit to the dedicated GitHub page for the project.
