# Change Log - @ms/odsp-shared-react

This log was last generated on Fri, 10 Mar 2017 20:15:44 GMT and should not be manually modified.

## 15.0.1
Fri, 10 Mar 2017 20:15:44 GMT

### Patches

- Adds a new optional parameter to PeoplePicker.

## 15.0.0
Fri, 10 Mar 2017 16:02:59 GMT

### Breaking changes

- Bumping office-ui-fabric-react to 2.0.2.

## 14.6.1
Thu, 09 Mar 2017 20:03:59 GMT

### Patches

- Fix Horizontal child node in contextMenu onClick

## 14.6.0
Tue, 07 Mar 2017 23:13:37 GMT

### Minor changes

- fix site icon flashing

## 14.5.0
Mon, 06 Mar 2017 18:56:28 GMT

### Minor changes

- Update min and max size of document card in CardList to ensure we will render 4 cards per row in large breakpoint. Add prop in CardList to use compact layout regardless the viewport breakpoint. And update CardList example page.

## 14.4.0
Mon, 06 Mar 2017 08:42:35 GMT

### Minor changes

- Added a new flex container in CompositeHeader.tsx, which is split in two parts with room for the site header and a searchbox or other actions.

## 14.3.1
Sun, 05 Mar 2017 05:00:22 GMT

### Patches

- HorizontalNav node url shown in status, Navigate to node.url if no onClick defined

## 14.3.0
Sat, 04 Mar 2017 21:04:10 GMT

### Minor changes

- Enable deletion of groups through the Site Information panel

## 14.2.0
Sat, 04 Mar 2017 20:50:37 GMT

### Minor changes

- site permissions polish bugs

## 14.1.3
Fri, 03 Mar 2017 22:52:34 GMT

### Patches

- Added null check for list creation panel TextField.

## 14.1.2
Wed, 01 Mar 2017 03:26:18 GMT

### Patches

- Ensure refresh nav after edit operation, regression

## 14.1.1
Wed, 01 Mar 2017 03:18:50 GMT

### Patches

- Add EditnavCallout dropdown list default option

## 14.1.0
Mon, 27 Feb 2017 23:42:17 GMT

### Minor changes

- site permissions - adding unit test

## 14.0.9
Fri, 24 Feb 2017 22:33:09 GMT

### Patches

- PeoplePicker: Small css changes so that the x appears properly"

## 14.0.8
Thu, 23 Feb 2017 21:23:33 GMT

### Patches

- ImagePreview: prevent forceShowLoading from causing preview to vanish

## 14.0.7
Thu, 23 Feb 2017 08:49:34 GMT

### Patches

- Ensure group object is sync to the property handle event of group property updated.

## 14.0.6
Wed, 22 Feb 2017 21:34:01 GMT

### Patches

- fix site permissions panel

## 14.0.5
Wed, 22 Feb 2017 21:02:22 GMT

### Patches

- fixing persona spacing

## 14.0.4
Sat, 18 Feb 2017 03:21:08 GMT

### Patches

- Fix horizontalNav resize issue

## 14.0.3
Sat, 18 Feb 2017 02:48:27 GMT

### Patches

- HorizontalResize messed up

## 14.0.2
Sat, 18 Feb 2017 02:26:26 GMT

### Patches

- fix tslint

## 14.0.1
Fri, 17 Feb 2017 20:31:44 GMT

### Patches

- CompositeHeader: Increase specificity of button styles to maintain overwrite of Fabric's, due to their increased specificity

## 14.0.0
Thu, 16 Feb 2017 18:58:11 GMT

### Breaking changes

- HorizontalNav change & StateManage change so header can render whatever either topNav/quicklaun

## 13.4.0
Wed, 15 Feb 2017 23:08:05 GMT

### Minor changes

- Change engagement logging strings in site permissions and group membership

## 13.3.4
Wed, 15 Feb 2017 20:53:20 GMT

*Changes not tracked*

## 13.3.3
Wed, 15 Feb 2017 20:07:34 GMT

### Patches

- Fixed SiteHeader StateManager member update bug.

## 13.3.2
Wed, 15 Feb 2017 19:29:57 GMT

### Patches

- Enable noUnusedLocals

## 13.3.1
Tue, 14 Feb 2017 01:00:53 GMT

### Patches

- StateManager join/leave group code refactoring to avoid nested promises, added more error handling and corner cases handling.

## 13.3.0
Mon, 13 Feb 2017 22:17:55 GMT

### Minor changes

- site permissions - adding link to add members panel in teh ppl picker view

## 13.2.0
Sun, 12 Feb 2017 05:14:00 GMT

### Minor changes

- Add check for current user to fix corner case

## 13.1.8
Sun, 12 Feb 2017 03:06:31 GMT

### Patches

- Fix EditNav link element may not have unique element id

## 13.1.7
Sat, 11 Feb 2017 03:31:48 GMT

### Patches

- Temporarily revert fix to call GetGroupImage

## 13.1.6
Fri, 10 Feb 2017 23:47:08 GMT

### Patches

- Update Karma configuration

## 13.1.5
Thu, 09 Feb 2017 19:00:33 GMT

### Patches

- Made join leave unit tests more precise, and fixed sinon.stub bug.

## 13.1.4
Thu, 09 Feb 2017 18:12:20 GMT

### Patches

- Remove use of AcronymAndColorDataSource from group membership

## 13.1.3
Thu, 09 Feb 2017 06:11:47 GMT

### Patches

- No longer relies on acronymservice for Facepile personas 

## 13.1.2
Wed, 08 Feb 2017 03:59:28 GMT

### Patches

- Fix regression: left-right padding in horizontal nav in composite header.

## 13.1.1
Wed, 08 Feb 2017 02:59:43 GMT

### Patches

- Fix regressions in button spacing

## 13.1.0
Wed, 08 Feb 2017 00:27:27 GMT

### Minor changes

- Add usage guidelines link to site settings panel
- Button: Fixed issues with the office-ui-fabric-react repo, also bumped version

## 13.0.0
Tue, 07 Feb 2017 04:07:09 GMT

### Breaking changes

- Bumping to latest version of office-ui-fabric-react

### Minor changes

- EditNav support adding Office365 services link to navigation, adding new properties to IEditNavStateManagerParameter and IEditNavCallout.props

### Patches

- Composite Header: Fix alignment issues exposed after integration of fabric 1.5.x.

## 12.2.1
Sat, 04 Feb 2017 04:46:12 GMT

### Patches

- Added planner to group card

## 12.2.0
Fri, 03 Feb 2017 23:36:48 GMT

### Minor changes

- Add confirmation dialogs for owner removing or demoting themselves

## 12.1.1
Thu, 02 Feb 2017 23:32:41 GMT

### Patches

- Fix Site Header not using the group's pictureUrl

## 12.1.0
Wed, 01 Feb 2017 01:33:29 GMT

### Minor changes

- Created a peoplepicker item with menu for use in permissions panel and  group membership panel

## 12.0.1
Tue, 31 Jan 2017 08:07:12 GMT

### Patches

- site permissions polish

## 12.0.0
Mon, 30 Jan 2017 21:26:15 GMT

### Breaking changes

- Consume the latest office-ui-fabric-react

## 11.8.0
Fri, 27 Jan 2017 20:26:26 GMT

### Minor changes

- Navigate away from private group when owner removes self

## 11.7.0
Thu, 26 Jan 2017 02:07:04 GMT

### Minor changes

- Only show Add Members button for owners or public groups

### Patches

- Fixed the css of usageguideline link in sp home.

## 11.6.6
Wed, 25 Jan 2017 22:39:37 GMT

### Patches

- Fixed the usageguideline link disappear bug.

## 11.6.5
Wed, 25 Jan 2017 00:01:29 GMT

### Patches

- Fixed intermittent usage link disappear bug.

## 11.6.4
Tue, 24 Jan 2017 23:25:24 GMT

### Patches

- fix css for site permissions invite button

## 11.6.3
Tue, 24 Jan 2017 19:37:20 GMT

### Patches

- Remove panel margin workaround

## 11.6.2
Tue, 24 Jan 2017 01:10:46 GMT

### Patches

- "site permissions filter out the spgroups from the ppl picker suggetions"

## 11.6.1
Mon, 23 Jan 2017 22:49:10 GMT

### Patches

- Limit the usageguildline link to site classification only.

## 11.6.0
Sat, 21 Jan 2017 01:05:33 GMT

### Minor changes

- Merge in recent fixes from odsp-next

### Patches

- Changing linkId for a FwdLink

## 11.5.1
Wed, 18 Jan 2017 00:44:19 GMT

### Patches

- Fix bug in ImagePreview that occurs if you select a file to upload, cancel, then select a file on the internet.

## 11.5.0
Sat, 14 Jan 2017 01:56:48 GMT

### Minor changes

- Add ImagePreview

## 11.4.3
Sat, 14 Jan 2017 01:05:03 GMT

### Patches

- site permissions update labels

## 11.4.2
Fri, 13 Jan 2017 22:27:45 GMT

### Patches

- Remove imports of EntityType enum to correct perf issue

## 11.4.1
Thu, 12 Jan 2017 20:55:51 GMT

### Patches

- Fixed group conversation for non-member and also not guest user.

## 11.4.0
Thu, 12 Jan 2017 19:13:39 GMT

### Minor changes

- Display guests properly in group membership panel

## 11.3.4
Thu, 12 Jan 2017 00:36:47 GMT

### Patches

- patch

## 11.3.3
Wed, 11 Jan 2017 19:34:29 GMT

### Patches

- patch

## 11.3.2
Wed, 11 Jan 2017 06:09:02 GMT

### Patches

- check query string from location.search

## 11.3.1
Wed, 11 Jan 2017 01:22:10 GMT

### Patches

- Fixed perf issue caused by GroupSite import.

## 11.3.0
Wed, 11 Jan 2017 00:32:56 GMT

### Minor changes

- Visual polish for group membership panel

## 11.2.0
Mon, 09 Jan 2017 18:51:57 GMT

### Minor changes

- Added usageUrl and added type for GroupCreationContext.

## 11.1.1
Sat, 07 Jan 2017 09:24:28 GMT

*Changes not tracked*

## 11.1.0
Thu, 29 Dec 2016 22:14:36 GMT

### Minor changes

- Add unit tests for follow button and associated fixes

## 11.0.0
Thu, 22 Dec 2016 07:51:50 GMT

### Breaking changes

- TypeScript 2.1

## 10.6.1
Wed, 21 Dec 2016 21:47:24 GMT

### Patches

- Added keyboard event and put initial focus to list creation panel initial focus.

## 10.6.0
Wed, 21 Dec 2016 17:58:50 GMT

### Minor changes

- Bring over field renderers from odsp-next

## 10.5.0
Fri, 16 Dec 2016 22:10:47 GMT

### Minor changes

- Hide join for private group

### Patches

- Increment web-library-build dependency to v2

## 10.4.1
Thu, 15 Dec 2016 22:36:01 GMT

### Patches

- Fix hover border color of DocumentCard in CardList and fix button focus/active color in TipTile to not use theme color. 

## 10.4.0
Thu, 15 Dec 2016 05:46:44 GMT

### Minor changes

- Indicate when a group member's status is currently updating

### Patches

- Added customized qosName for join/leave group.

## 10.3.1
Tue, 13 Dec 2016 20:36:53 GMT

*Changes not tracked*

## 10.3.0
Tue, 13 Dec 2016 02:29:13 GMT

### Minor changes

- Accessibility fixes in group membership panel
- Add engagement logging to group membership management

