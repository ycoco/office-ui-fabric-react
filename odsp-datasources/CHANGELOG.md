# Change Log - @ms/odsp-datasources

This log was last generated on Tue, 03 Jan 2017 22:52:16 GMT and should not be manually modified.

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

