# Change Log - @ms/odsp-datasources

This log was last generated on Fri, 20 Jan 2017 00:32:00 GMT and should not be manually modified.

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

