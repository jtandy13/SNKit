# SNKit
Chrome Developer Tools extension for ServiceNow

## Purpose
SNKit is a devtools project dedicated to enabling quicker debugging of ServiceNow forms and Service Portal pages. The goals of the project are to:

1. Establish a platform where devtools can interact with the ServiceNow page in a more meaningful way.
2. Aid in debugging ServiceNow production instances by enabling administrators and developers to manipulate the page without making changes to the instance.
3. Enable faster analysis of ServiceNow pages leading to quicker incident resolution.

## Sidebars
All of the SNKit sidebars can be found in the Elements panel of Chrome devtools.

### ServiceNow Form Fields
All form fields are laid out in alphabetical order giving quick access to vital field details. The ServiceNow Form Fields sidebar appear whenever a devtools opens to inspect a form page.

### ServiceNow Variables
The ServiceNow Variables sidebar only displays if there are variables on the form. This may be on a Service Catalog item or within the variable editor on forms.

### ServiceNow Service Portal Widgets
If you open devtools on a Service Portal page, you will gain access to the Service Portal Widgets sidebar. Here you will see all of the widgets on the page along with their AngularJS scope data.

## Tabs
The SNKit panel allows access to tabular information regarding either the form or Service Portal page being inspected.

### Forms
The Forms tab allows for field and variable manipulation through the first four buttons (some are drop downs with multiple functions) on the left-side menu. Simple select the form or variable that you are interested in and apply the function to it on the left. Underneath the manipulation button are four extra functions used for analysis. Client Scripts, UI Policies, and Business Rules of the table you are using can be searched for any reference of the selected field or variable. Search results will appear in their own tab.

Quick keyword searches can be run from the top right search bar. Select a search category to search by anything other than the field label.

### Service Portal
The Service Portal tab points the user to the AngularJS scope data for each widget logged in the Service Portal Widgets sidebar. The Widget Controllers panel allows the user to have quick access to the AngularJS controller code for each widget. Here the user can debug and manipulate the widget controller script without actually making any changes to a production instance.

### Help
The Help tab allows the user to log any observed bugs or issues with SNKit to the dedicated GitHub page for the project.