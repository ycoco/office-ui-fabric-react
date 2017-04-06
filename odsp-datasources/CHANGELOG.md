# Change Log - @ms/odsp-datasources

This log was last generated on Thu, 06 Apr 2017 04:54:37 GMT and should not be manually modified.

## 12.16.1
Thu, 06 Apr 2017 04:54:37 GMT

*Changes not tracked*

## 12.16.0
Wed, 05 Apr 2017 17:30:53 GMT

### Minor changes

- Parse the siteUrl we get from GetValidSiteUrlFromAlias and send back the alias if necessary

## 12.15.2
Tue, 04 Apr 2017 00:17:51 GMT

### Patches

- Remove portfolio site from design package selector

## 12.15.1
Mon, 03 Apr 2017 21:32:43 GMT

### Patches

- Add PermissionMask and WopiHelper to top level exports

## 12.15.0
Fri, 31 Mar 2017 15:32:31 GMT

### Minor changes

- Refactor WebTemplateType and add IDesignPackageAssets

## 12.14.1
Fri, 31 Mar 2017 03:18:17 GMT

### Patches

- Use VSTS npm feed (no real code change)

## 12.14.0
Tue, 28 Mar 2017 21:00:30 GMT

### Minor changes

- Adds new API to check if following feature is disabled. Also removes deprecated methods.

## 12.13.1
Mon, 27 Mar 2017 19:11:43 GMT

### Patches

- rename constant for consitency reasons

## 12.13.0
Fri, 24 Mar 2017 00:01:58 GMT

### Minor changes

- Add Taxonomy related attributes to ISPListField. And ensure SchemaBuilder set it correctly when process server response.

## 12.12.0
Thu, 23 Mar 2017 23:45:38 GMT

### Minor changes

- Add default formula support.

## 12.11.0
Thu, 23 Mar 2017 12:36:14 GMT

### Minor changes

- Support field's clientSideColumnAdapter

## 12.10.0
Mon, 20 Mar 2017 19:20:52 GMT

### Minor changes

- Add top level imports for IField and FieldType interfaces

## 12.9.0
Fri, 17 Mar 2017 23:31:28 GMT

### Minor changes

- Moving some utility classes from odsp-next over to the shared repos

## 12.8.0
Fri, 17 Mar 2017 21:45:54 GMT

### Minor changes

- Add ClientSideComponentProperties

## 12.7.0
Fri, 17 Mar 2017 19:12:45 GMT

### Minor changes

- Add new list data source and interfaces

## 12.6.3
Fri, 17 Mar 2017 18:26:27 GMT

### Patches

-  Enable scenarios without window["_spPageContextInfo"]

## 12.6.2
Fri, 17 Mar 2017 06:14:25 GMT

### Patches

- fix perf telemetry for safari

## 12.6.1
Fri, 17 Mar 2017 05:59:16 GMT

### Patches

- Revert change to unblock odsp-next build

## 12.6.0
Thu, 16 Mar 2017 23:02:04 GMT

### Minor changes

- Expand groups when filtering by the groupBy columns

## 12.5.1
Thu, 16 Mar 2017 22:54:33 GMT

### Patches

- fix group display for calculated DateTime type

## 12.5.0
Thu, 16 Mar 2017 22:05:28 GMT

### Minor changes

- Separate out ChromeOptions from DesignPackage

## 12.4.1
Wed, 15 Mar 2017 20:34:41 GMT

### Patches

- Ensure node mapping INavLink cover all cases

## 12.4.0
Wed, 15 Mar 2017 01:15:20 GMT

### Minor changes

- Move ChromeOptions to odsp-datasources

## 12.3.0
Tue, 14 Mar 2017 22:53:16 GMT

### Minor changes

- add interface for fieldCustomizer

## 12.2.0
Tue, 14 Mar 2017 15:34:16 GMT

### Minor changes

- add client-side fieldCustomizer to list field schema

## 12.1.0
Tue, 14 Mar 2017 01:35:49 GMT

### Minor changes

- Fix calcualted field rendering such that we don't run script (part of the code will be in odsp-next)

## 12.0.1
Tue, 14 Mar 2017 01:01:50 GMT

### Patches

- update isRelativeUrl function

## 12.0.0
Mon, 13 Mar 2017 17:21:49 GMT

### Breaking changes

- Add separate flag for needContentTypes

## 11.8.0
Fri, 10 Mar 2017 05:07:00 GMT

### Minor changes

- Add ID and ContentTypeId to ISPListItemProperties

## 11.7.0
Thu, 09 Mar 2017 01:54:16 GMT

### Minor changes

- Remove suite nav link id for group membership we no longer use

## 11.6.3
Thu, 09 Mar 2017 00:58:11 GMT

### Patches

- Make comparison of group owner name case insensitive

## 11.6.2
Mon, 06 Mar 2017 23:27:21 GMT

### Patches

- Correctly handle blob errors

## 11.6.1
Sun, 05 Mar 2017 05:00:22 GMT

### Patches

- Y

## 11.6.0
Sat, 04 Mar 2017 21:04:10 GMT

### Minor changes

- Support Group delete REST endpoint

## 11.5.1
Sat, 04 Mar 2017 00:31:49 GMT

### Patches

- Clean up Nav nodes mapping function

## 11.5.0
Fri, 03 Mar 2017 22:17:10 GMT

### Minor changes

- Adding sitePagePublishing WebTemplateType, IDesignPackage, and DesignPackageProvider module

## 11.4.0
Sat, 25 Feb 2017 00:07:34 GMT

### Minor changes

- perf instrumentation change to support onepage app

## 11.3.0
Fri, 24 Feb 2017 22:26:21 GMT

### Minor changes

- fix enum to have more entries so that it matches in next

## 11.2.2
Thu, 23 Feb 2017 22:51:28 GMT

### Patches

- Disable key normalization for FileHandlers

## 11.2.1
Wed, 22 Feb 2017 00:19:23 GMT

### Patches

- Return parsed error data even if there is no error or odata.error object

## 11.2.0
Sat, 18 Feb 2017 00:23:25 GMT

### Minor changes

- read the site readOnlyState from context info

## 11.1.3
Sat, 18 Feb 2017 00:09:46 GMT

### Patches

- FileHandlers V1 Back Compatibility

## 11.1.2
Fri, 17 Feb 2017 20:16:05 GMT

### Patches

- attempt to fix datarequestor bug

## 11.1.1
Fri, 17 Feb 2017 00:22:24 GMT

### Patches

- qos error handling

## 11.1.0
Thu, 16 Feb 2017 23:13:52 GMT

### Minor changes

- The data requestor will return the parsed error text even if it cannot find a specific error field

## 11.0.1
Thu, 16 Feb 2017 00:28:47 GMT

### Patches

- Add URl encoding to listUrl when creating X-SP-REQUESTRESOURCES header

## 11.0.0
Wed, 15 Feb 2017 20:53:20 GMT

### Breaking changes

- Change DataManager interface to allow a singleton DataManager serve multiple UI contexts

## 10.19.0
Wed, 15 Feb 2017 19:29:57 GMT

### Minor changes

- Enable noUnusedLocals

## 10.18.1
Tue, 14 Feb 2017 01:00:53 GMT

### Patches

- Put getCurrentUser before add/remove members or owners in the case it doesn't exist.

## 10.18.0
Sun, 12 Feb 2017 05:14:00 GMT

### Minor changes

- Add getCurrentUser() to IGroupsProvider

## 10.17.2
Fri, 10 Feb 2017 23:47:08 GMT

### Patches

- Update Karma configuration

## 10.17.1
Fri, 10 Feb 2017 23:40:45 GMT

### Patches

- Avoid testing Blob directly in DataRequestor

## 10.17.0
Wed, 08 Feb 2017 19:12:40 GMT

### Minor changes

- Make DesignPackageId optional

## 10.16.0
Wed, 08 Feb 2017 17:01:41 GMT

### Minor changes

- Adding DesignPackageId to spPageContextInfo in odsp-datasources

## 10.15.1
Tue, 07 Feb 2017 04:07:09 GMT

### Patches

- Moving public static isRelativeUrl into ViewNavDataSource

## 10.15.0
Sat, 04 Feb 2017 04:46:12 GMT

### Minor changes

- Add serverFieldType attribute to ISPListColumn. And ensure SchemaBuilder set it correctly when process server response.

### Patches

- Change unuseable planner url to planner redirect url in group.

## 10.14.0
Fri, 03 Feb 2017 23:36:48 GMT

### Minor changes

- add new list item field clientSideComponentId

## 10.13.1
Fri, 03 Feb 2017 21:48:17 GMT

### Patches

- Clean up FileHandler form

## 10.13.0
Fri, 03 Feb 2017 21:14:59 GMT

### Minor changes

- Add Interface to support unthrottling gorouping for large list

## 10.12.0
Thu, 02 Feb 2017 23:57:07 GMT

### Minor changes

- Added a blob response to the blob error object

## 10.11.5
Thu, 02 Feb 2017 23:48:41 GMT

### Patches

- Attach FileHandler form to document body

## 10.11.4
Thu, 02 Feb 2017 20:22:33 GMT

### Patches

- Adding the pages node with build chek 
- Clear cache after users added to group.

## 10.11.3
Wed, 01 Feb 2017 01:48:44 GMT

### Patches

- Removing the Pages node that was being added  on the client side. 

## 10.11.2
Wed, 01 Feb 2017 00:19:00 GMT

### Patches

- prevent syncGroupProperties redirect to access denied

## 10.11.1
Tue, 31 Jan 2017 22:31:57 GMT

### Patches

- fix autoredirect on syncGroupProperties

## 10.11.0
Fri, 27 Jan 2017 01:45:54 GMT

### Minor changes

- add new property to post data context for retrieving client-side component manifest information

## 10.10.4
Thu, 26 Jan 2017 17:38:53 GMT

### Patches

- Fixed case in getGroupCreationContext.

## 10.10.3
Wed, 25 Jan 2017 18:41:33 GMT

### Patches

- Fix item datasource to store items in itemstore

## 10.10.2
Tue, 24 Jan 2017 23:08:57 GMT

### Patches

- Hide "Edit (link to edit file)" column"

## 10.10.1
Tue, 24 Jan 2017 02:00:53 GMT

### Patches

- fix site permissions dataSource bug

## 10.10.0
Tue, 24 Jan 2017 00:35:07 GMT

### Minor changes

- Add pinnedToFiltersPane attribute to ISPListColumn. And ensure SchemaBuilder set it correctly when process server response. 

## 10.9.0
Tue, 24 Jan 2017 00:27:51 GMT

### Minor changes

- Handle Blob type in DataRequestor

## 10.8.0
Mon, 23 Jan 2017 21:48:09 GMT

### Minor changes

- sit epermissions dataSource improvements - adding new REST call that gets the site permissions groups only

## 10.7.2
Sun, 22 Jan 2017 17:28:45 GMT

### Patches

- datasources fixes

## 10.7.1
Sat, 21 Jan 2017 00:36:45 GMT

### Patches

- Add a new property for ISPPageContext

## 10.7.0
Fri, 20 Jan 2017 00:32:00 GMT

### Minor changes

- Expose more data on FileHandlerDataSource

## 10.6.0
Wed, 18 Jan 2017 18:19:47 GMT

### Minor changes

- YammerResources for datasources

## 10.5.0
Wed, 18 Jan 2017 00:44:19 GMT

### Minor changes

- Add LocalFileReader

## 10.4.3
Wed, 18 Jan 2017 00:35:03 GMT

### Patches

- Update list call to request MediaServiceFastMetadata field instead of MetaInfo

## 10.4.2
Tue, 17 Jan 2017 18:48:06 GMT

### Patches

- Consider the situation where an API call is made (and the user is already authenticated, but the server returns 403 because the user does not have sufficient permissions to use the API call. In this scenario, we go down a particular code path where a new ServerConnection object is created. However, this new ServerConnection object is not passed in a webServerRelativeUrl via params, and so later it would generate an incorrect Access Denied URL. The fix is to pass in the webServerRelativeUrl in.

## 10.4.1
Fri, 13 Jan 2017 22:27:45 GMT

### Patches

- Remove import of EntityType enum to correct perf issue
- Fix for IItemGroup.

## 10.4.0
Thu, 12 Jan 2017 19:13:39 GMT

### Minor changes

- Request UserType attribute for group members, check for malformed members list

## 10.3.0
Wed, 11 Jan 2017 05:42:20 GMT

### Minor changes

- Add ItemProvider and DataManager for List Web Part

## 10.2.0
Mon, 09 Jan 2017 18:51:57 GMT

### Minor changes

- Added type for GroupCreationContext.

## 10.1.0
Sat, 07 Jan 2017 09:24:28 GMT

### Minor changes

- Adding list utilities moved over from odsp-utilities and odsp-next
- Migrate FileHandler internals from odsp-next
- Add AppendOnly attribute to ISPListColumn

### Patches

- fix logging issue

## 10.0.1
Tue, 03 Jan 2017 22:52:16 GMT

### Patches

- Fixing group building code to support  MMD types

## 10.0.0
Thu, 22 Dec 2016 07:51:50 GMT

### Breaking changes

- TypeScript 2.1

## 9.2.0
Wed, 21 Dec 2016 17:58:50 GMT

### Minor changes

- Add properties to interfaces to support field renderers

## 9.1.6
Tue, 20 Dec 2016 22:23:01 GMT

### Patches

- Changes in GroupProvider.getCachedGroup to pass in the pageContext to the constructor of Group. This change is needed since the the global variable _spPageContext is no longer available.

## 9.1.5
Fri, 16 Dec 2016 22:10:47 GMT

### Patches

- Increment web-library-build dependency to v2

## 9.1.4
Fri, 16 Dec 2016 19:28:49 GMT

### Patches

- Updated the server request format for creating publishing sites

## 9.1.3
Thu, 15 Dec 2016 05:46:44 GMT

### Patches

- Modified interface.

## 9.1.2
Wed, 14 Dec 2016 19:19:53 GMT

### Patches

- datasources fixes

## 9.1.1
Wed, 14 Dec 2016 01:15:14 GMT

### Patches

- Added customized qosName option to add/remove member/owner.

## 9.1.0
Wed, 14 Dec 2016 00:47:21 GMT

### Minor changes

- Add canUserCreateMicrosoftForm field to ISpPageContext

## 9.0.0
Tue, 13 Dec 2016 20:36:53 GMT

### Breaking changes

- Removed abandoned groupwebtemplate parameter for group site creation, and created new publishingsite data source

